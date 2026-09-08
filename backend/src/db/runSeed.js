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
  const historicalNote =
    result.historicalSalaryCount > 0
      ? `, added ${result.historicalSalaryCount} historical salary records`
      : '';
  const authNote =
    result.authUserCount > 0 ? `, added ${result.authUserCount} auth users` : '';
  console.log(
    `Dev seed applied: added ${result.insertedCount} employees${historicalNote}${authNote} (${result.employeeCount} total) in ${sqlitePath}`,
  );
} else {
  console.log(`Dev seed skipped: all seed employees already exist (${result.employeeCount} total)`);
}
