import bcrypt from 'bcryptjs';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { config } from '../config/env.js';
import { createDb } from './client.js';
import { migrate } from './migrate.js';
import { DEFAULT_EMPLOYEE_COUNT, seedEmployees } from './seedEmployees.js';

const DEV_LOGIN_EMPLOYEE = {
  employeeCode: 'EMP-HR-001',
  firstName: 'Mary',
  lastName: 'Jackson',
  countryId: 1,
  departmentId: 3,
  designationId: 4,
  joiningDate: '2024-02-01',
  baseSalary: 1_600_000,
  bonus: 150_000,
  incentives: 70_000,
  currencyCode: 'INR',
};

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

async function insertDevEmployeeIfMissing(db, email) {
  const existing = await db.queryOne('SELECT id FROM employees WHERE email = ?', [email]);

  if (existing) {
    return false;
  }

  const result = await db.execute(
    `INSERT INTO employees (
      employee_code, first_name, last_name, email,
      country_id, department_id, designation_id, joining_date,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [
      DEV_LOGIN_EMPLOYEE.employeeCode,
      DEV_LOGIN_EMPLOYEE.firstName,
      DEV_LOGIN_EMPLOYEE.lastName,
      email,
      DEV_LOGIN_EMPLOYEE.countryId,
      DEV_LOGIN_EMPLOYEE.departmentId,
      DEV_LOGIN_EMPLOYEE.designationId,
      DEV_LOGIN_EMPLOYEE.joiningDate,
    ],
  );

  await db.execute(
    `INSERT INTO employee_salaries (
      employee_id, base_salary, bonus, incentives, currency_code, updated_at
    ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [
      result.lastInsertRowid,
      DEV_LOGIN_EMPLOYEE.baseSalary,
      DEV_LOGIN_EMPLOYEE.bonus,
      DEV_LOGIN_EMPLOYEE.incentives,
      DEV_LOGIN_EMPLOYEE.currencyCode,
    ],
  );

  return true;
}

async function insertDevUserIfMissing(db, email, password) {
  const existingUser = await db.queryOne('SELECT id FROM users WHERE email = ?', [email]);

  if (existingUser) {
    return false;
  }

  const employee = await db.queryOne('SELECT id FROM employees WHERE email = ?', [email]);

  if (!employee) {
    return false;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.execute(
    `INSERT INTO users (
      employee_id, email, password_hash, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`,
    [employee.id, email, passwordHash],
  );

  return true;
}

async function ensureDevLoginUser(db) {
  if (config.isProduction) {
    return { employeeInserted: false, userInserted: false };
  }

  const email = config.devLoginEmail;
  const password = config.devLoginPassword;
  let employeeInserted = false;
  let userInserted = false;

  await db.transaction(async () => {
    employeeInserted = await insertDevEmployeeIfMissing(db, email);
    userInserted = await insertDevUserIfMissing(db, email, password);
  });

  return {
    employeeInserted,
    userInserted,
  };
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
