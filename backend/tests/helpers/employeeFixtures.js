import { createTestDb } from './testDb.js';

const DEFAULT_EXCHANGE_RATES = [
  { currency_code: 'USD', rate_to_usd: 1.0, effective_date: '2024-01-01' },
  { currency_code: 'INR', rate_to_usd: 0.012, effective_date: '2024-01-01' },
  { currency_code: 'EUR', rate_to_usd: 1.08, effective_date: '2024-01-01' },
  { currency_code: 'GBP', rate_to_usd: 1.27, effective_date: '2024-01-01' },
  { currency_code: 'AUD', rate_to_usd: 0.66, effective_date: '2024-01-01' },
  { currency_code: 'JPY', rate_to_usd: 0.0067, effective_date: '2024-01-01' },
];

export async function seedEmployeeDirectory(db, overrides = {}) {
  const {
    countries = [{ id: 1, code: 'IN', name: 'India' }],
    departments = [{ id: 1, name: 'Engineering' }],
    designations = [{ id: 1, name: 'Software Engineer' }],
    employees = [
      {
        employee_code: 'EMP001',
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        country_id: 1,
        department_id: 1,
        designation_id: 1,
      },
      {
        employee_code: 'EMP002',
        first_name: 'Grace',
        last_name: 'Hopper',
        email: 'grace@example.com',
        country_id: 1,
        department_id: 1,
        designation_id: 1,
      },
    ],
    employeeSalaries = [
      {
        employee_id: 1,
        base_salary: 1000000,
        bonus: 100000,
        incentives: 50000,
        currency_code: 'INR',
      },
    ],
    exchangeRates = DEFAULT_EXCHANGE_RATES,
  } = overrides;

  for (const rate of exchangeRates) {
    await db.execute(
      'INSERT OR IGNORE INTO exchange_rates (currency_code, rate_to_usd, effective_date) VALUES (?, ?, ?)',
      [rate.currency_code, rate.rate_to_usd, rate.effective_date],
    );
  }

  for (const country of countries) {
    await db.execute('INSERT INTO countries (id, code, name) VALUES (?, ?, ?)', [
      country.id,
      country.code,
      country.name,
    ]);
  }

  for (const department of departments) {
    await db.execute('INSERT INTO departments (id, name) VALUES (?, ?)', [
      department.id,
      department.name,
    ]);
  }

  for (const designation of designations) {
    await db.execute('INSERT INTO designations (id, name) VALUES (?, ?)', [
      designation.id,
      designation.name,
    ]);
  }

  for (const employee of employees) {
    await db.execute(
      `INSERT INTO employees (
        employee_code, first_name, last_name, email,
        country_id, department_id, designation_id, joining_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        employee.employee_code,
        employee.first_name,
        employee.last_name,
        employee.email,
        employee.country_id,
        employee.department_id,
        employee.designation_id,
        employee.joining_date ?? '2024-01-01',
      ],
    );
  }

  for (const salary of employeeSalaries) {
    await db.execute(
      `INSERT INTO employee_salaries (
        employee_id, base_salary, bonus, incentives, currency_code, updated_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [
        salary.employee_id,
        salary.base_salary,
        salary.bonus ?? 0,
        salary.incentives ?? 0,
        salary.currency_code,
      ],
    );
  }
}

export async function createSeededTestDb(overrides = {}) {
  const db = await createTestDb();
  await seedEmployeeDirectory(db, overrides);
  return db;
}
