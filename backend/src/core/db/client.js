import { DatabaseSync } from 'node:sqlite';

/**
 * SQLite-backed database client using Node's built-in `node:sqlite`.
 *
 * Repositories and services should depend on this async query interface, not on
 * DatabaseSync. A later PostgreSQL adapter can implement the same methods
 * without changing business logic (all methods are async for that reason).
 *
 * Native addons such as better-sqlite3 were avoided so install works without
 * a C++ toolchain, including on newer Node versions that lack prebuilds.
 */
export function createDb({ filename }) {
  const sqlite = new DatabaseSync(filename, { timeout: 5000 });

  sqlite.exec('PRAGMA journal_mode = WAL');
  sqlite.exec('PRAGMA foreign_keys = ON');

  return {
    async query(sql, params = []) {
      return sqlite.prepare(sql).all(...params);
    },

    async queryOne(sql, params = []) {
      return sqlite.prepare(sql).get(...params) ?? null;
    },

    async execute(sql, params = []) {
      return sqlite.prepare(sql).run(...params);
    },

    async exec(sql) {
      sqlite.exec(sql);
    },

    async transaction(fn) {
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        const result = await fn();
        sqlite.exec('COMMIT');
        return result;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },

    async ping() {
      sqlite.prepare('SELECT 1 AS ok').get();
      return true;
    },

    close() {
      sqlite.close();
    },
  };
}
