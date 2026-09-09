import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAnalyticsChatService } from '../../src/features/analytics-chat/analytics-chat.service.js';

function createMockLlmClient(overrides = {}) {
  return {
    generateSql: overrides.generateSql ?? (async () => ({
      sql: 'SELECT COUNT(*) AS employee_count FROM employees LIMIT 10',
      explanation: 'Count employees',
    })),
    correctSql: overrides.correctSql ?? (async () => ({
      sql: 'SELECT COUNT(*) AS employee_count FROM employees LIMIT 10',
      explanation: 'Corrected count',
    })),
    generateAnswer: overrides.generateAnswer ?? (async () => ({
      answer: 'There are 2 employees.',
    })),
  };
}

function createMockTool(overrides = {}) {
  return {
    execute:
      overrides.execute ??
      (async () => ({
        columns: ['employee_count'],
        rows: [{ employee_count: 2 }],
        rowCount: 1,
      })),
  };
}

describe('analytics chat service', () => {
  it('returns a grounded answer with SQL metadata', async () => {
    const service = createAnalyticsChatService({
      llmClient: createMockLlmClient(),
      executeAnalyticsQueryTool: createMockTool(),
    });

    const result = await service.askQuestion('How many employees do we have?');

    assert.equal(result.answer, 'There are 2 employees.');
    assert.match(result.sql, /SELECT COUNT/i);
    assert.equal(result.recordCount, 1);
  });

  it('rejects empty questions', async () => {
    const service = createAnalyticsChatService({
      llmClient: createMockLlmClient(),
      executeAnalyticsQueryTool: createMockTool(),
    });

    await assert.rejects(
      () => service.askQuestion('   '),
      (error) => {
        assert.equal(error.code, 'ANALYTICS_CHAT_VALIDATION_ERROR');
        return true;
      },
    );
  });

  it('returns 503 when LLM is not configured', async () => {
    const service = createAnalyticsChatService({
      llmClient: null,
      executeAnalyticsQueryTool: createMockTool(),
    });

    await assert.rejects(
      () => service.askQuestion('How many employees?'),
      (error) => {
        assert.equal(error.code, 'LLM_NOT_CONFIGURED');
        return true;
      },
    );
  });

  it('retries SQL correction once after a database execution error', async () => {
    let executeCalls = 0;
    let correctCalls = 0;

    const service = createAnalyticsChatService({
      llmClient: createMockLlmClient({
        correctSql: async () => {
          correctCalls += 1;
          return {
            sql: 'SELECT COUNT(*) AS employee_count FROM employees LIMIT 10',
            explanation: 'Fixed query',
          };
        },
      }),
      executeAnalyticsQueryTool: createMockTool({
        execute: async () => {
          executeCalls += 1;
          if (executeCalls === 1) {
            const error = new Error('no such column: missing_column');
            error.code = 'ANALYTICS_QUERY_FAILED';
            throw error;
          }

          return {
            columns: ['employee_count'],
            rows: [{ employee_count: 2 }],
            rowCount: 1,
          };
        },
      }),
    });

    const result = await service.askQuestion('How many employees?');

    assert.equal(correctCalls, 1);
    assert.equal(executeCalls, 2);
    assert.equal(result.answer, 'There are 2 employees.');
  });

  it('handles empty query results in the final answer flow', async () => {
    const service = createAnalyticsChatService({
      llmClient: createMockLlmClient({
        generateAnswer: async () => ({ answer: 'No matching employees were found in the database.' }),
      }),
      executeAnalyticsQueryTool: createMockTool({
        execute: async () => ({ columns: [], rows: [], rowCount: 0 }),
      }),
    });

    const result = await service.askQuestion('How many employees in Antarctica?');

    assert.match(result.answer, /No matching employees/i);
    assert.equal(result.recordCount, 0);
  });
});
