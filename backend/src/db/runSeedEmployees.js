import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { createDb } from './client.js';
import { migrate } from './migrate.js';
import { DEFAULT_EMPLOYEE_COUNT } from './seed/employeeSeedConfig.js';
import { ensureDevLoginUser } from './seed/ensureDevLogin.js';
import { seedEmployees } from './seedEmployees.js';
import { config } from '../config/env.js';

function parseArgs(argv) {
  const options = {
    replace: false,
    count: DEFAULT_EMPLOYEE_COUNT,
    randomSeed: undefined,
    withDevLogin: true,
    skipIfPopulated: false,
  };

  for (const arg of argv) {
    if (arg === '--replace') {
      options.replace = true;
      continue;
    }

    if (arg === '--no-dev-login') {
      options.withDevLogin = false;
      continue;
    }

    if (arg === '--skip-if-populated') {
      options.skipIfPopulated = true;
      continue;
    }

    if (arg.startsWith('--count=')) {
      options.count = Number.parseInt(arg.slice('--count='.length), 10);
      continue;
    }

    if (arg.startsWith('--seed=')) {
      options.randomSeed = Number.parseInt(arg.slice('--seed='.length), 10);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isInteger(options.count) || options.count <= 0) {
    throw new Error('--count must be a positive integer');
  }

  if (options.randomSeed !== undefined && !Number.isInteger(options.randomSeed)) {
    throw new Error('--seed must be an integer');
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));

if (config.isProduction && options.replace) {
  throw new Error('Refusing to run employee seed with --replace in production');
}

if (config.isProduction) {
  options.withDevLogin = false;
}

const sqlitePath = path.resolve(config.sqlitePath);
mkdirSync(path.dirname(sqlitePath), { recursive: true });

const db = createDb({ filename: sqlitePath });
await migrate(db);

const startedAt = Date.now();
let result = {
  insertedCount: 0,
  clearedCount: 0,
  employeeCount: 0,
};

const existingCountRow = await db.queryOne('SELECT COUNT(*) AS count FROM employees');
const existingEmployeeCount = existingCountRow?.count ?? 0;
const shouldSeedEmployees =
  !options.skipIfPopulated || existingEmployeeCount === 0 || options.replace;

if (shouldSeedEmployees) {
  result = await seedEmployees(db, {
    count: options.count,
    replace: options.replace,
    randomSeed: options.randomSeed,
  });
}

let devLoginNote = '';
let finalEmployeeCount = result.employeeCount || existingEmployeeCount;
if (options.withDevLogin) {
  const devLoginResult = await ensureDevLoginUser(db);
  const totalRow = await db.queryOne('SELECT COUNT(*) AS count FROM employees');
  finalEmployeeCount = totalRow?.count ?? finalEmployeeCount;

  if (devLoginResult.employeeInserted || devLoginResult.userInserted) {
    const parts = [];
    if (devLoginResult.employeeInserted) {
      parts.push('dev employee');
    }
    if (devLoginResult.userInserted) {
      parts.push('dev login user');
    }
    devLoginNote = ` Ensured ${parts.join(' and ')}.`;
  }
}

db.close();

const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
const clearedNote = result.clearedCount > 0 ? ` Cleared ${result.clearedCount} existing employees.` : '';
const skippedNote =
  !shouldSeedEmployees ? ' Skipped employee generation (database already populated).' : '';

console.log(
  `Employee seed complete: inserted ${result.insertedCount} generated employees (${finalEmployeeCount} total).${clearedNote}${skippedNote}${devLoginNote} Database: ${sqlitePath}. Elapsed: ${elapsedSeconds}s.`,
);
