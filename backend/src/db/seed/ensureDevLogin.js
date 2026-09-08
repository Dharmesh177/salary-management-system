import bcrypt from 'bcryptjs';

export const DEV_LOGIN_EMAIL = 'mary.jackson@acme.example';
export const DEV_LOGIN_PASSWORD = 'password123';

const DEV_LOGIN_EMPLOYEE = {
  employeeCode: 'EMP-HR-001',
  firstName: 'Mary',
  lastName: 'Jackson',
  email: DEV_LOGIN_EMAIL,
  countryId: 1,
  departmentId: 3,
  designationId: 4,
  joiningDate: '2024-02-01',
  baseSalary: 1_600_000,
  bonus: 150_000,
  incentives: 70_000,
  currencyCode: 'INR',
};

async function insertDevEmployeeIfMissing(db) {
  const existing = await db.queryOne('SELECT id FROM employees WHERE email = ?', [
    DEV_LOGIN_EMPLOYEE.email,
  ]);

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
      DEV_LOGIN_EMPLOYEE.email,
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

async function insertDevUserIfMissing(db) {
  const existingUser = await db.queryOne('SELECT id FROM users WHERE email = ?', [
    DEV_LOGIN_EMAIL,
  ]);

  if (existingUser) {
    return false;
  }

  const employee = await db.queryOne('SELECT id FROM employees WHERE email = ?', [
    DEV_LOGIN_EMAIL,
  ]);

  if (!employee) {
    return false;
  }

  const passwordHash = await bcrypt.hash(DEV_LOGIN_PASSWORD, 10);
  await db.execute(
    `INSERT INTO users (
      employee_id, email, password_hash, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`,
    [employee.id, DEV_LOGIN_EMAIL, passwordHash],
  );

  return true;
}

/**
 * Ensures the documented dev login account exists (employee + salary + user).
 */
export async function ensureDevLoginUser(db) {
  let employeeInserted = false;
  let userInserted = false;

  await db.transaction(async () => {
    employeeInserted = await insertDevEmployeeIfMissing(db);
    userInserted = await insertDevUserIfMissing(db);
  });

  return {
    employeeInserted,
    userInserted,
  };
}
