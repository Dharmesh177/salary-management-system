import bcrypt from 'bcryptjs';
import { config } from '../../config/env.js';

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

/**
 * Ensures the documented dev login account exists (employee + salary + user).
 * Credentials come from DEV_LOGIN_EMAIL / DEV_LOGIN_PASSWORD env vars.
 */
export async function ensureDevLoginUser(db) {
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
