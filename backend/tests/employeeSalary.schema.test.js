import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createTestDb } from './helpers/testDb.js';
import { seedEmployeeDirectory } from './helpers/employeeFixtures.js';

describe('employee salary schema', () => {
  let db;

  before(async () => {
    db = await createTestDb();
    await seedEmployeeDirectory(db, { employeeSalaries: [] });
  });

  after(() => {
    db.close();
  });

  it('applies the MVP scope update migration', async () => {
    const rows = await db.query('SELECT id FROM schema_migrations ORDER BY id');
    assert.ok(rows.some((row) => row.id === '005_mvp_scope_update.sql'));
  });

  it('allows only one salary row per employee', async () => {
    await db.execute(
      `INSERT INTO employee_salaries (
        employee_id, base_salary, bonus, incentives, currency_code, updated_at
      ) VALUES (1, 1000000, 0, 0, 'INR', datetime('now'))`,
    );

    await assert.rejects(async () => {
      await db.execute(
        `INSERT INTO employee_salaries (
          employee_id, base_salary, bonus, incentives, currency_code, updated_at
        ) VALUES (1, 1200000, 0, 0, 'INR', datetime('now'))`,
      );
    });
  });
});
