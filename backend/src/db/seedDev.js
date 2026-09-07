const countries = [
  { id: 1, code: 'IN', name: 'India' },
  { id: 2, code: 'US', name: 'United States' },
  { id: 3, code: 'GB', name: 'United Kingdom' },
];

const departments = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Finance' },
  { id: 3, name: 'Human Resources' },
];

const designations = [
  { id: 1, name: 'Software Engineer' },
  { id: 2, name: 'Senior Software Engineer' },
  { id: 3, name: 'Finance Analyst' },
  { id: 4, name: 'HR Manager' },
];

const employees = [
  {
    employee_code: 'EMP001',
    first_name: 'Ada',
    last_name: 'Lovelace',
    email: 'ada.lovelace@acme.example',
    country_id: 1,
    department_id: 1,
    designation_id: 2,
    base_salary: 1800000,
    bonus: 200000,
    incentives: 100000,
    effective_from: '2024-04-01',
  },
  {
    employee_code: 'EMP002',
    first_name: 'Grace',
    last_name: 'Hopper',
    email: 'grace.hopper@acme.example',
    country_id: 2,
    department_id: 1,
    designation_id: 2,
    base_salary: 2200000,
    bonus: 250000,
    incentives: 150000,
    effective_from: '2024-01-15',
  },
  {
    employee_code: 'EMP003',
    first_name: 'Alan',
    last_name: 'Turing',
    email: 'alan.turing@acme.example',
    country_id: 3,
    department_id: 1,
    designation_id: 1,
    base_salary: 1500000,
    bonus: 100000,
    incentives: 50000,
    effective_from: '2023-11-01',
  },
  {
    employee_code: 'EMP004',
    first_name: 'Katherine',
    last_name: 'Johnson',
    email: 'katherine.johnson@acme.example',
    country_id: 2,
    department_id: 2,
    designation_id: 3,
    base_salary: 1300000,
    bonus: 120000,
    incentives: 80000,
    effective_from: '2024-06-01',
  },
  {
    employee_code: 'EMP005',
    first_name: 'Mary',
    last_name: 'Jackson',
    email: 'mary.jackson@acme.example',
    country_id: 1,
    department_id: 3,
    designation_id: 4,
    base_salary: 1600000,
    bonus: 150000,
    incentives: 70000,
    effective_from: '2024-02-01',
  },
];

export async function seedDevData(db) {
  const existing = await db.queryOne('SELECT COUNT(*) AS count FROM employees');
  if ((existing?.count ?? 0) > 0) {
    return { inserted: false, employeeCount: existing.count };
  }

  await db.transaction(async () => {
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
      const result = await db.execute(
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

      await db.execute(
        `INSERT INTO salary_records (
          employee_id, base_salary, bonus, incentives,
          effective_from, effective_to, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NULL, datetime('now'), datetime('now'))`,
        [
          result.lastInsertRowid,
          employee.base_salary,
          employee.bonus,
          employee.incentives,
          employee.effective_from,
        ],
      );
    }
  });

  return { inserted: true, employeeCount: employees.length };
}
