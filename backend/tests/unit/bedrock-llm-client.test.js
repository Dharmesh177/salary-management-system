import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createLlmClient } from '../../src/features/analytics-chat/llm-client.js';

function createMockBedrockClient(responses) {
  let callCount = 0;

  return {
    async send() {
      const response = responses[Math.min(callCount, responses.length - 1)];
      callCount += 1;

      if (response instanceof Error) {
        throw response;
      }

      return response;
    },
    get callCount() {
      return callCount;
    },
  };
}

describe('Bedrock LLM client', () => {
  it('returns null when Bedrock is not configured', () => {
    assert.equal(createLlmClient({ region: '', modelId: '' }), null);
    assert.equal(createLlmClient({ region: 'us-east-1', modelId: '' }), null);
  });

  it('generates SQL from a Bedrock Converse response', async () => {
    const bedrockClient = createMockBedrockClient([
      {
        output: {
          message: {
            content: [
              {
                text: '{"sql":"SELECT COUNT(*) AS employee_count FROM employees LIMIT 10","explanation":"Count employees"}',
              },
            ],
          },
        },
      },
    ]);

    const client = createLlmClient({
      region: 'us-east-1',
      modelId: 'amazon.nova-lite-v1:0',
      bedrockClient,
    });

    const result = await client.generateSql('How many employees?');

    assert.match(result.sql, /SELECT COUNT/i);
    assert.equal(result.explanation, 'Count employees');
    assert.equal(bedrockClient.callCount, 1);
  });

  it('maps Bedrock failures to analytics LLM errors', async () => {
    const bedrockClient = createMockBedrockClient([
      Object.assign(new Error('Model access denied'), { name: 'AccessDeniedException' }),
    ]);

    const client = createLlmClient({
      region: 'us-east-1',
      modelId: 'amazon.nova-lite-v1:0',
      bedrockClient,
    });

    await assert.rejects(
      () => client.generateSql('How many employees?'),
      (error) => {
        assert.equal(error.code, 'ANALYTICS_LLM_FAILED');
        assert.match(error.message, /Model access denied/i);
        return true;
      },
    );
  });
});
