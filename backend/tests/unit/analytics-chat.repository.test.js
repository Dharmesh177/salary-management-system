import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createAnalyticsChatRepository } from '../../src/features/analytics-chat/analytics-chat.repository.js';
import { USD_COMPENSATION_EXPRESSION } from '../../src/features/analytics-chat/analytics-schema.context.js';
import { createTestDb } from '../helpers/testDb.js';
import { seedEmployeeDirectory } from '../helpers/employeeFixtures.js';

describe('analytics chat repository', () => {
  let db;
  let repository;

  before(async () => {
    db = await createTestDb();
    await seedEmployeeDirectory(db);
    repository = createAnalyticsChatRepository(db);
  });

  after(() => {
    db.close();
  });

  it('computes average USD compensation for engineers in India', async () => {
    const result = await repository.executeReadQuery(`
      SELECT AVG(${USD_COMPENSATION_EXPRESSION}) AS average_compensation_usd
      FROM employees e
      INNER JOIN countries c ON c.id = e.country_id
      INNER JOIN departments d ON d.id = e.department_id
      INNER JOIN employee_salaries es ON es.employee_id = e.id
      INNER JOIN exchange_rates er ON er.currency_code = es.currency_code
      WHERE c.name = 'India' AND d.name = 'Engineering'
      LIMIT 10
    `);

    assert.equal(result.rowCount, 1);
    assert.equal(result.rows[0].average_compensation_usd, 13800);
  });

  it('returns empty rows for queries with no matches', async () => {
    const result = await repository.executeReadQuery(`
      SELECT e.id
      FROM employees e
      WHERE e.first_name = 'DoesNotExist'
      LIMIT 10
    `);

    assert.equal(result.rowCount, 0);
    assert.deepEqual(result.columns, []);
  });
});
