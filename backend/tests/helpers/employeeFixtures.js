import { createTestDb } from './testDb.js';

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
    salaryRecords = [
      {
        employee_id: 1,
        base_salary: 1000000,
        bonus: 100000,
        incentives: 50000,
        effective_from: '2024-01-01',
        effective_to: null,
      },
    ],
  } = overrides;

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
        country_id, department_id, designation_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        employee.employee_code,
        employee.first_name,
        employee.last_name,
        employee.email,
        employee.country_id,
        employee.department_id,
        employee.designation_id,
      ],
    );
  }

  for (const record of salaryRecords) {
    await db.execute(
      `INSERT INTO salary_records (
        employee_id, base_salary, bonus, incentives,
        effective_from, effective_to, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        record.employee_id,
        record.base_salary,
        record.bonus ?? 0,
        record.incentives ?? 0,
        record.effective_from,
        record.effective_to ?? null,
      ],
    );
  }
}

export async function createSeededTestDb(overrides = {}) {
  const db = await createTestDb();
  await seedEmployeeDirectory(db, overrides);
  return db;
}
