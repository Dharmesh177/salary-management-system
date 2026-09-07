import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { createDb } from './client.js';
import { migrate } from './migrate.js';
import { seedDevData } from './seedDev.js';
import { config } from '../config/env.js';

const sqlitePath = path.resolve(config.sqlitePath);
mkdirSync(path.dirname(sqlitePath), { recursive: true });

const db = createDb({ filename: sqlitePath });
await migrate(db);

const result = await seedDevData(db);
db.close();

if (result.inserted) {
  console.log(`Dev seed applied: ${result.employeeCount} employees in ${sqlitePath}`);
} else {
  console.log(`Dev seed skipped: database already has ${result.employeeCount} employees`);
}
