import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateAnalyticsSql } from '../../src/features/analytics-chat/sql-validator.js';

describe('validateAnalyticsSql', () => {
  it('accepts a safe SELECT query on approved tables', () => {
    const result = validateAnalyticsSql(`
      SELECT COUNT(*) AS employee_count
      FROM employees
      LIMIT 100
    `);

    assert.equal(result.valid, true);
    assert.match(result.sql, /LIMIT 100/);
  });

  it('appends a row limit when LIMIT is missing', () => {
    const result = validateAnalyticsSql('SELECT id FROM employees');

    assert.equal(result.valid, true);
    assert.match(result.sql, /LIMIT 500$/);
  });

  it('rejects non-SELECT statements', () => {
    const result = validateAnalyticsSql('DELETE FROM employees');

    assert.equal(result.valid, false);
    assert.match(result.reason, /SELECT/i);
  });

  it('rejects dangerous keywords', () => {
    const cases = [
      'SELECT * FROM employees; DROP TABLE employees',
      'SELECT * FROM employees WHERE id = 1; UPDATE employees SET email = "x"',
      'PRAGMA table_info(employees)',
    ];

    for (const sql of cases) {
      const result = validateAnalyticsSql(sql);
      assert.equal(result.valid, false);
    }
  });

  it('rejects unapproved tables', () => {
    const result = validateAnalyticsSql('SELECT * FROM users LIMIT 10');

    assert.equal(result.valid, false);
    assert.match(result.reason, /unapproved tables/i);
  });

  it('rejects LIMIT values above the configured maximum', () => {
    const result = validateAnalyticsSql('SELECT id FROM employees LIMIT 1000');

    assert.equal(result.valid, false);
    assert.match(result.reason, /LIMIT cannot exceed/i);
  });
});
