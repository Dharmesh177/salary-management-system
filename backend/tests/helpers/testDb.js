import { createDb } from '../../src/core/db/client.js';
import { migrate } from '../../src/core/db/migrate.js';

export async function createTestDb() {
  const db = createDb({ filename: ':memory:' });
  await migrate(db);
  return db;
}
