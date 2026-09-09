import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { createDb } from './client.js';
import { migrate } from './migrate.js';
import { config } from '../config/env.js';

const sqlitePath = path.resolve(config.sqlitePath);
mkdirSync(path.dirname(sqlitePath), { recursive: true });

const db = createDb({ filename: sqlitePath });
await migrate(db);
db.close();

console.log(`Migrations applied for ${sqlitePath}`);
