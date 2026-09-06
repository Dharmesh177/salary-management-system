import { createDb } from '../../src/db/client.js';
import { migrate } from '../../src/db/migrate.js';

export async function createTestDb() {
  const db = createDb({ filename: ':memory:' });
  await migrate(db);
  return db;
}
