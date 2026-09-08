import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createTestDb } from './helpers/testDb.js';
import { seedEmployeeDirectory } from './helpers/employeeFixtures.js';

describe('auth schema', () => {
  let db;

  before(async () => {
    db = await createTestDb();
    await seedEmployeeDirectory(db, { salaryRecords: [] });
  });

  after(() => {
    db.close();
  });

  it('applies the auth RBAC migration', async () => {
    const rows = await db.query('SELECT id FROM schema_migrations ORDER BY id');
    assert.ok(rows.some((row) => row.id === '004_auth_rbac.sql'));
  });

  it('creates users, roles, permissions, and junction tables', async () => {
    const tables = await db.query(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('users', 'roles', 'permissions', 'user_roles', 'role_permissions') ORDER BY name",
    );

    assert.deepEqual(
      tables.map((row) => row.name),
      ['permissions', 'role_permissions', 'roles', 'user_roles', 'users'],
    );
  });

  it('enforces one user account per employee', async () => {
    await db.execute(
      `INSERT INTO users (
        employee_id, email, password_hash, is_active, created_at, updated_at
      ) VALUES (1, 'hr@example.com', 'hash', 1, datetime('now'), datetime('now'))`,
    );

    await assert.rejects(async () => {
      await db.execute(
        `INSERT INTO users (
          employee_id, email, password_hash, is_active, created_at, updated_at
        ) VALUES (1, 'duplicate@example.com', 'hash', 1, datetime('now'), datetime('now'))`,
      );
    });
  });
});
