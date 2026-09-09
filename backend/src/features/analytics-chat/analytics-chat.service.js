import { createAppError } from '../../core/utils/createAppError.js';
import { ANALYTICS_CHAT_ERRORS, ANALYTICS_CHAT_LIMITS } from './analytics-chat.constants.js';

function isQueryExecutionError(error) {
  return error?.code === 'ANALYTICS_QUERY_FAILED';
}

export function createAnalyticsChatService({ llmClient, executeAnalyticsQueryTool }) {
  async function runQueryWithCorrection(question, initialSql, initialExplanation) {
    let sql = initialSql;
    let explanation = initialExplanation;
    let lastError = null;

    for (
      let attempt = 0;
      attempt <= ANALYTICS_CHAT_LIMITS.maxSqlCorrectionAttempts;
      attempt += 1
    ) {
      try {
        const queryResult = await executeAnalyticsQueryTool.execute(sql);
        return { sql, explanation, queryResult };
      } catch (error) {
        lastError = error;

        if (!isQueryExecutionError(error) || attempt === ANALYTICS_CHAT_LIMITS.maxSqlCorrectionAttempts) {
          throw error;
        }

        const corrected = await llmClient.correctSql({
          question,
          previousSql: sql,
          dbError: error.message,
        });

        sql = corrected.sql;
        explanation = corrected.explanation;
      }
    }

    throw lastError;
  }

  return {
    async askQuestion(question) {
      if (!llmClient) {
        throw createAppError(ANALYTICS_CHAT_ERRORS.LLM_NOT_CONFIGURED);
      }

      const trimmedQuestion = question.trim();
      if (!trimmedQuestion) {
        throw createAppError(ANALYTICS_CHAT_ERRORS.VALIDATION_ERROR);
      }

      if (trimmedQuestion.length > ANALYTICS_CHAT_LIMITS.maxQuestionLength) {
        throw createAppError(ANALYTICS_CHAT_ERRORS.VALIDATION_ERROR, {
          message: `Question cannot exceed ${ANALYTICS_CHAT_LIMITS.maxQuestionLength} characters`,
        });
      }

      const generated = await llmClient.generateSql(trimmedQuestion);
      const { sql, explanation, queryResult } = await runQueryWithCorrection(
        trimmedQuestion,
        generated.sql,
        generated.explanation,
      );

      const answerPayload = await llmClient.generateAnswer({
        question: trimmedQuestion,
        sql,
        explanation,
        queryResult,
      });

      return {
        answer: answerPayload.answer,
        sql,
        explanation,
        recordCount: queryResult.rowCount,
      };
    },
  };
}
