import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { createAppError } from '../../core/utils/createAppError.js';
import { ANALYTICS_CHAT_ERRORS, ANALYTICS_CHAT_LIMITS } from './analytics-chat.constants.js';
import {
  buildAnswerGenerationPrompt,
  buildSqlCorrectionPrompt,
  buildSqlGenerationPrompt,
} from './analytics-schema.context.js';
import {
  parseAnswerGenerationResponse,
  parseSqlGenerationResponse,
} from './llm-response.parser.js';

function createTimeoutSignal(timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

function mapBedrockError(error) {
  if (error.name === 'AbortError') {
    return createAppError(ANALYTICS_CHAT_ERRORS.LLM_TIMEOUT);
  }

  if (error.status && error.code) {
    return error;
  }

  const awsMessage = error.message ?? ANALYTICS_CHAT_ERRORS.LLM_FAILED.message;
  return createAppError(ANALYTICS_CHAT_ERRORS.LLM_FAILED, {
    message: awsMessage,
  });
}

export function createLlmClient({
  region,
  modelId,
  timeoutMs = ANALYTICS_CHAT_LIMITS.defaultLlmTimeoutMs,
  bedrockClient,
}) {
  if (!region || !modelId) {
    return null;
  }

  const client = bedrockClient ?? new BedrockRuntimeClient({ region });

  async function completeChat(prompt) {
    const timeout = createTimeoutSignal(timeoutMs);

    try {
      const command = new ConverseCommand({
        modelId,
        system: [{ text: 'You are a precise analytics assistant. Follow instructions exactly.' }],
        messages: [
          {
            role: 'user',
            content: [{ text: prompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: 2048,
          temperature: 0,
        },
      });

      const response = await client.send(command, { abortSignal: timeout.signal });
      const content = response.output?.message?.content?.find((block) => block.text)?.text;

      if (!content) {
        throw createAppError(ANALYTICS_CHAT_ERRORS.LLM_FAILED, {
          message: 'Bedrock response did not include text content',
        });
      }

      return content;
    } catch (error) {
      throw mapBedrockError(error);
    } finally {
      timeout.clear();
    }
  }

  return {
    async generateSql(question) {
      const content = await completeChat(buildSqlGenerationPrompt(question));
      return parseSqlGenerationResponse(content);
    },

    async correctSql({ question, previousSql, dbError }) {
      const content = await completeChat(
        buildSqlCorrectionPrompt({ question, previousSql, dbError }),
      );
      return parseSqlGenerationResponse(content);
    },

    async generateAnswer({ question, sql, explanation, queryResult }) {
      const content = await completeChat(
        buildAnswerGenerationPrompt({ question, sql, explanation, queryResult }),
      );
      return parseAnswerGenerationResponse(content);
    },
  };
}
