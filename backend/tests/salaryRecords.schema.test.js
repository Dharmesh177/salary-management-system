import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createTestDb } from './helpers/testDb.js';
import { seedEmployeeDirectory } from './helpers/employeeFixtures.js';

describe('salary records schema', () => {
  let db;

  before(async () => {
    db = await createTestDb();
    await seedEmployeeDirectory(db, { salaryRecords: [] });
  });

  after(() => {
    db.close();
  });

  it('applies the salary records management migration', async () => {
    const rows = await db.query('SELECT id FROM schema_migrations ORDER BY id');
    assert.ok(rows.some((row) => row.id === '003_salary_records_management.sql'));
  });

  it('allows only one current salary record per employee', async () => {
    await db.execute(
      `INSERT INTO salary_records (
        employee_id, base_salary, bonus, incentives,
        effective_from, effective_to, created_at, updated_at
      ) VALUES (1, 1000000, 0, 0, '2024-01-01', NULL, datetime('now'), datetime('now'))`,
    );

    await assert.rejects(async () => {
      await db.execute(
        `INSERT INTO salary_records (
          employee_id, base_salary, bonus, incentives,
          effective_from, effective_to, created_at, updated_at
        ) VALUES (1, 1200000, 0, 0, '2024-07-01', NULL, datetime('now'), datetime('now'))`,
      );
    });
  });
});
