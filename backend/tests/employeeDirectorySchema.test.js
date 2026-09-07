import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createTestDb } from './helpers/testDb.js';

describe('employee directory schema', () => {
  let db;

  before(async () => {
    db = await createTestDb();
  });

  after(() => {
    db.close();
  });

  it('applies the employee directory migration', async () => {
    const rows = await db.query('SELECT id FROM schema_migrations ORDER BY id');
    assert.ok(rows.some((row) => row.id === '002_employee_directory.sql'));
  });

  it('creates lookup and employee tables with foreign keys', async () => {
    const tables = await db.query(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    );
    const tableNames = tables.map((row) => row.name);

    assert.deepEqual(tableNames, [
      'countries',
      'departments',
      'designations',
      'employees',
      'salary_records',
      'schema_migrations',
    ]);
  });

  it('enforces employee references to lookup tables', async () => {
    await db.execute(
      "INSERT INTO countries (id, code, name) VALUES (1, 'IN', 'India')",
    );
    await db.execute("INSERT INTO departments (id, name) VALUES (1, 'Engineering')");
    await db.execute("INSERT INTO designations (id, name) VALUES (1, 'Software Engineer')");

    await assert.rejects(async () => {
      await db.execute(
        `INSERT INTO employees (
          employee_code, first_name, last_name, email,
          country_id, department_id, designation_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        ['EMP001', 'Ada', 'Lovelace', 'ada@example.com', 99, 1, 1],
      );
    });
  });
});
