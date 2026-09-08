import bcrypt from 'bcryptjs';

const countries = [
  { id: 1, code: 'IN', name: 'India' },
  { id: 2, code: 'US', name: 'United States' },
  { id: 3, code: 'GB', name: 'United Kingdom' },
  { id: 4, code: 'DE', name: 'Germany' },
  { id: 5, code: 'SG', name: 'Singapore' },
];

const departments = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Finance' },
  { id: 3, name: 'Human Resources' },
  { id: 4, name: 'Operations' },
  { id: 5, name: 'Sales' },
];

const designations = [
  { id: 1, name: 'Software Engineer' },
  { id: 2, name: 'Senior Software Engineer' },
  { id: 3, name: 'Finance Analyst' },
  { id: 4, name: 'HR Manager' },
  { id: 5, name: 'Engineering Manager' },
  { id: 6, name: 'Sales Executive' },
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
  {
    employee_code: 'EMP006',
    first_name: 'Dennis',
    last_name: 'Ritchie',
    email: 'dennis.ritchie@acme.example',
    country_id: 2,
    department_id: 1,
    designation_id: 5,
    base_salary: 2400000,
    bonus: 300000,
    incentives: 120000,
    effective_from: '2023-09-01',
  },
  {
    employee_code: 'EMP007',
    first_name: 'Barbara',
    last_name: 'Liskov',
    email: 'barbara.liskov@acme.example',
    country_id: 2,
    department_id: 1,
    designation_id: 2,
    base_salary: 2100000,
    bonus: 220000,
    incentives: 90000,
    effective_from: '2024-03-15',
  },
  {
    employee_code: 'EMP008',
    first_name: 'Linus',
    last_name: 'Torvalds',
    email: 'linus.torvalds@acme.example',
    country_id: 4,
    department_id: 1,
    designation_id: 1,
    base_salary: 1700000,
    bonus: 140000,
    incentives: 60000,
    effective_from: '2024-05-01',
  },
  {
    employee_code: 'EMP009',
    first_name: 'Radia',
    last_name: 'Perlman',
    email: 'radia.perlman@acme.example',
    country_id: 5,
    department_id: 1,
    designation_id: 2,
    base_salary: 1950000,
    bonus: 180000,
    incentives: 85000,
    effective_from: '2024-07-01',
  },
  {
    employee_code: 'EMP010',
    first_name: 'Satya',
    last_name: 'Nadella',
    email: 'satya.nadella@acme.example',
    country_id: 1,
    department_id: 4,
    designation_id: 5,
    base_salary: 2800000,
    bonus: 350000,
    incentives: 150000,
    effective_from: '2023-12-01',
  },
  {
    employee_code: 'EMP011',
    first_name: 'Indra',
    last_name: 'Nooyi',
    email: 'indra.nooyi@acme.example',
    country_id: 1,
    department_id: 2,
    designation_id: 3,
    base_salary: 2000000,
    bonus: 240000,
    incentives: 110000,
    effective_from: '2024-01-01',
  },
  {
    employee_code: 'EMP012',
    first_name: 'Sheryl',
    last_name: 'Sandberg',
    email: 'sheryl.sandberg@acme.example',
    country_id: 2,
    department_id: 5,
    designation_id: 6,
    base_salary: 1750000,
    bonus: 260000,
    incentives: 130000,
    effective_from: '2024-08-01',
  },
  {
    employee_code: 'EMP013',
    first_name: 'Narayana',
    last_name: 'Murthy',
    email: 'narayana.murthy@acme.example',
    country_id: 1,
    department_id: 4,
    designation_id: 5,
    base_salary: 2500000,
    bonus: 280000,
    incentives: 100000,
    effective_from: '2023-10-15',
  },
  {
    employee_code: 'EMP014',
    first_name: 'James',
    last_name: 'Gosling',
    email: 'james.gosling@acme.example',
    country_id: 3,
    department_id: 1,
    designation_id: 2,
    base_salary: 1850000,
    bonus: 170000,
    incentives: 75000,
    effective_from: '2024-02-20',
  },
  {
    employee_code: 'EMP015',
    first_name: 'Tim',
    last_name: 'Berners-Lee',
    email: 'tim.berners-lee@acme.example',
    country_id: 3,
    department_id: 1,
    designation_id: 1,
    base_salary: 1650000,
    bonus: 130000,
    incentives: 55000,
    effective_from: '2024-09-01',
  },
  {
    employee_code: 'EMP016',
    first_name: 'Arundhati',
    last_name: 'Bhattacharya',
    email: 'arundhati.bhattacharya@acme.example',
    country_id: 1,
    department_id: 3,
    designation_id: 4,
    base_salary: 1550000,
    bonus: 145000,
    incentives: 65000,
    effective_from: '2024-04-10',
  },
  {
    employee_code: 'EMP017',
    first_name: 'Marc',
    last_name: 'Andreessen',
    email: 'marc.andreessen@acme.example',
    country_id: 2,
    department_id: 5,
    designation_id: 6,
    base_salary: 1900000,
    bonus: 275000,
    incentives: 140000,
    effective_from: '2024-06-15',
  },
  {
    employee_code: 'EMP018',
    first_name: 'Shantanu',
    last_name: 'Narayen',
    email: 'shantanu.narayen@acme.example',
    country_id: 5,
    department_id: 4,
    designation_id: 5,
    base_salary: 2300000,
    bonus: 290000,
    incentives: 115000,
    effective_from: '2024-03-01',
  },
  {
    employee_code: 'EMP019',
    first_name: 'Whitney',
    last_name: 'Wolfe',
    email: 'whitney.wolfe@acme.example',
    country_id: 2,
    department_id: 5,
    designation_id: 6,
    base_salary: 1680000,
    bonus: 210000,
    incentives: 95000,
    effective_from: '2024-10-01',
  },
  {
    employee_code: 'EMP020',
    first_name: 'Vint',
    last_name: 'Cerf',
    email: 'vint.cerf@acme.example',
    country_id: 4,
    department_id: 1,
    designation_id: 5,
    base_salary: 2250000,
    bonus: 265000,
    incentives: 105000,
    effective_from: '2023-08-01',
  },
];

const COUNTRY_CURRENCY = {
  1: 'INR',
  2: 'USD',
  3: 'GBP',
  4: 'EUR',
  5: 'USD',
};

async function seedLookups(db) {
  for (const country of countries) {
    await db.execute(
      'INSERT OR IGNORE INTO countries (id, code, name) VALUES (?, ?, ?)',
      [country.id, country.code, country.name],
    );
  }

  for (const department of departments) {
    await db.execute('INSERT OR IGNORE INTO departments (id, name) VALUES (?, ?)', [
      department.id,
      department.name,
    ]);
  }

  for (const designation of designations) {
    await db.execute('INSERT OR IGNORE INTO designations (id, name) VALUES (?, ?)', [
      designation.id,
      designation.name,
    ]);
  }
}

async function insertEmployeeIfMissing(db, employee) {
  const existing = await db.queryOne(
    'SELECT id FROM employees WHERE employee_code = ?',
    [employee.employee_code],
  );

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
      employee.employee_code,
      employee.first_name,
      employee.last_name,
      employee.email,
      employee.country_id,
      employee.department_id,
      employee.designation_id,
      employee.effective_from ?? '2024-01-01',
    ],
  );

  await db.execute(
    `INSERT INTO employee_salaries (
      employee_id, base_salary, bonus, incentives, currency_code, updated_at
    ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [
      result.lastInsertRowid,
      employee.base_salary,
      employee.bonus,
      employee.incentives,
      COUNTRY_CURRENCY[employee.country_id] ?? 'USD',
    ],
  );

  return true;
}

const DEV_AUTH_PASSWORD = 'password123';

const devAuthUsers = ['mary.jackson@acme.example'];

async function seedAuthUsersIfMissing(db) {
  let insertedCount = 0;

  for (const email of devAuthUsers) {
    const existingUser = await db.queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      continue;
    }

    const employee = await db.queryOne('SELECT id FROM employees WHERE email = ?', [email]);
    if (!employee) {
      continue;
    }

    const passwordHash = await bcrypt.hash(DEV_AUTH_PASSWORD, 10);
    await db.execute(
      `INSERT INTO users (
        employee_id, email, password_hash, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`,
      [employee.id, email, passwordHash],
    );

    insertedCount += 1;
  }

  return insertedCount;
}

export async function seedDevData(db) {
  let insertedCount = 0;
  let authUserCount = 0;

  await db.transaction(async () => {
    await seedLookups(db);

    for (const employee of employees) {
      const inserted = await insertEmployeeIfMissing(db, employee);
      if (inserted) {
        insertedCount += 1;
      }
    }

    authUserCount = await seedAuthUsersIfMissing(db);
  });

  const totalRow = await db.queryOne('SELECT COUNT(*) AS count FROM employees');

  return {
    inserted: insertedCount > 0 || authUserCount > 0,
    insertedCount,
    authUserCount,
    employeeCount: totalRow?.count ?? 0,
  };
}
