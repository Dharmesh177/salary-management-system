import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createTestDb } from './helpers/testDb.js';

describe('database foundation', () => {
  let db;

  before(async () => {
    db = await createTestDb();
  });

  after(() => {
    db.close();
  });

  it('applies checked-in migrations to an isolated database', async () => {
    const rows = await db.query('SELECT id FROM schema_migrations ORDER BY id');
    assert.ok(rows.some((row) => row.id === '001_placeholder.sql'));
  });

  it('runs a transaction that can roll back', async () => {
    await db.exec('CREATE TABLE smoke (id INTEGER PRIMARY KEY, name TEXT NOT NULL)');

    await assert.rejects(async () => {
      await db.transaction(async () => {
        await db.execute('INSERT INTO smoke (name) VALUES (?)', ['kept']);
        throw new Error('force rollback');
      });
    });

    const rows = await db.query('SELECT * FROM smoke');
    assert.equal(rows.length, 0);
  });
});
