import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createExecuteAnalyticsQueryTool } from '../../src/features/analytics-chat/execute-analytics-query.tool.js';
import { createAnalyticsChatRepository } from '../../src/features/analytics-chat/analytics-chat.repository.js';
import { createTestDb } from '../helpers/testDb.js';
import { seedEmployeeDirectory } from '../helpers/employeeFixtures.js';

describe('execute_analytics_query tool', () => {
  let db;
  let tool;

  before(async () => {
    db = await createTestDb();
    await seedEmployeeDirectory(db);
    tool = createExecuteAnalyticsQueryTool(createAnalyticsChatRepository(db));
  });

  after(() => {
    db.close();
  });

  it('executes validated SQL and returns structured rows', async () => {
    const result = await tool.execute(`
      SELECT COUNT(*) AS employee_count
      FROM employees
      LIMIT 10
    `);

    assert.equal(result.rowCount, 1);
    assert.deepEqual(result.columns, ['employee_count']);
    assert.equal(result.rows[0].employee_count, 2);
  });

  it('rejects dangerous SQL before hitting the database', async () => {
    await assert.rejects(
      () => tool.execute('DELETE FROM employees'),
      (error) => {
        assert.equal(error.code, 'ANALYTICS_SQL_INVALID');
        return true;
      },
    );
  });

  it('returns a safe query error for invalid SQL execution', async () => {
    await assert.rejects(
      () => tool.execute('SELECT missing_column FROM employees LIMIT 10'),
      (error) => {
        assert.equal(error.code, 'ANALYTICS_QUERY_FAILED');
        return true;
      },
    );
  });
});
