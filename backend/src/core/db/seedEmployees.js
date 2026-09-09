import { Faker, en } from '@faker-js/faker';
import {
  DEFAULT_EMPLOYEE_COUNT,
  DEFAULT_RANDOM_SEED,
  EMAIL_DOMAIN,
  EMPLOYEE_CODE_PREFIX,
  SALARY_BANDS,
  DESIGNATION_SALARY_MULTIPLIERS,
  SEED_LOOKUPS,
} from './seed/employeeSeedConfig.js';

const BATCH_SIZE = 250;

function pickWeighted(items, randomValue) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let threshold = randomValue * totalWeight;

  for (const item of items) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

function pickDesignation(departmentId, randomValue) {
  const options = SEED_LOOKUPS.designations.filter((designation) =>
    designation.departmentIds.includes(departmentId),
  );

  return pickWeighted(options, randomValue);
}

function randomBetween(min, max, randomValue) {
  return min + randomValue * (max - min);
}

function roundSalary(amount, currency) {
  const step = currency === 'INR' ? 1_000 : 100;
  return Math.round(amount / step) * step;
}

function formatEmployeeCode(sequence) {
  return `${EMPLOYEE_CODE_PREFIX}${String(sequence).padStart(5, '0')}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

function buildEmail(firstName, lastName, employeeCode) {
  const localPart = `${slugify(firstName)}.${slugify(lastName)}.${employeeCode.toLowerCase()}`;
  return `${localPart}@${EMAIL_DOMAIN}`;
}

function generateSalary(country, departmentId, designationId, randomValues) {
  const band = SALARY_BANDS[country.id][departmentId];
  const designationMultiplier = DESIGNATION_SALARY_MULTIPLIERS[designationId] ?? 1;
  const baseSalary = roundSalary(
    randomBetween(band.baseMin, band.baseMax, randomValues[0]) * designationMultiplier,
    country.currency,
  );
  const bonus = roundSalary(
    baseSalary * randomBetween(band.bonusRatio[0], band.bonusRatio[1], randomValues[1]),
    country.currency,
  );
  const incentives = roundSalary(
    baseSalary * randomBetween(band.incentiveRatio[0], band.incentiveRatio[1], randomValues[2]),
    country.currency,
  );

  return {
    baseSalary,
    bonus,
    incentives,
    currencyCode: country.currency,
  };
}

export function createEmployeeSeedGenerator({ randomSeed = DEFAULT_RANDOM_SEED } = {}) {
  const faker = new Faker({ locale: [en] });
  faker.seed(randomSeed);

  return function generateEmployee(sequence) {
    const country = pickWeighted(SEED_LOOKUPS.countries, faker.number.float({ min: 0, max: 1 }));
    const department = pickWeighted(SEED_LOOKUPS.departments, faker.number.float({ min: 0, max: 1 }));
    const designation = pickDesignation(
      department.id,
      faker.number.float({ min: 0, max: 1 }),
    );
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const employeeCode = formatEmployeeCode(sequence);
    const joiningDate = faker.date
      .between({ from: '2015-01-01', to: '2025-08-01' })
      .toISOString()
      .slice(0, 10);
    const salary = generateSalary(country, department.id, designation.id, [
      faker.number.float({ min: 0, max: 1 }),
      faker.number.float({ min: 0, max: 1 }),
      faker.number.float({ min: 0, max: 1 }),
    ]);

    return {
      employeeCode,
      firstName,
      lastName,
      email: buildEmail(firstName, lastName, employeeCode),
      countryId: country.id,
      departmentId: department.id,
      designationId: designation.id,
      joiningDate,
      ...salary,
    };
  };
}

async function seedLookups(db) {
  for (const country of SEED_LOOKUPS.countries) {
    await db.execute(
      'INSERT OR IGNORE INTO countries (id, code, name) VALUES (?, ?, ?)',
      [country.id, country.code, country.name],
    );
  }

  for (const department of SEED_LOOKUPS.departments) {
    await db.execute('INSERT OR IGNORE INTO departments (id, name) VALUES (?, ?)', [
      department.id,
      department.name,
    ]);
  }

  for (const designation of SEED_LOOKUPS.designations) {
    await db.execute('INSERT OR IGNORE INTO designations (id, name) VALUES (?, ?)', [
      designation.id,
      designation.name,
    ]);
  }
}

async function getNextEmployeeSequence(db) {
  const row = await db.queryOne(`
    SELECT MAX(CAST(SUBSTR(employee_code, 4) AS INTEGER)) AS max_sequence
    FROM employees
    WHERE employee_code GLOB 'EMP[0-9]*'
  `);

  return (row?.max_sequence ?? 0) + 1;
}

async function clearEmployeeData(db) {
  await db.exec('DELETE FROM users');
  await db.exec('DELETE FROM employees');
}

async function insertEmployeeWithSalary(db, employee) {
  const result = await db.execute(
    `INSERT INTO employees (
      employee_code, first_name, last_name, email,
      country_id, department_id, designation_id, joining_date,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [
      employee.employeeCode,
      employee.firstName,
      employee.lastName,
      employee.email,
      employee.countryId,
      employee.departmentId,
      employee.designationId,
      employee.joiningDate,
    ],
  );

  await db.execute(
    `INSERT INTO employee_salaries (
      employee_id, base_salary, bonus, incentives, currency_code, updated_at
    ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [
      result.lastInsertRowid,
      employee.baseSalary,
      employee.bonus,
      employee.incentives,
      employee.currencyCode,
    ],
  );
}

async function insertEmployeesInBatches(db, employees) {
  for (let index = 0; index < employees.length; index += BATCH_SIZE) {
    const batch = employees.slice(index, index + BATCH_SIZE);

    for (const employee of batch) {
      await insertEmployeeWithSalary(db, employee);
    }
  }
}


export async function seedEmployees(
  db,
  {
    count = DEFAULT_EMPLOYEE_COUNT,
    replace = false,
    randomSeed = DEFAULT_RANDOM_SEED,
  } = {},
) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('count must be a positive integer');
  }

  const generateEmployee = createEmployeeSeedGenerator({ randomSeed });
  let insertedCount = 0;
  let clearedCount = 0;
  let startSequence = 1;

  await db.transaction(async () => {
    await seedLookups(db);

    if (replace) {
      const existingRow = await db.queryOne('SELECT COUNT(*) AS count FROM employees');
      clearedCount = existingRow?.count ?? 0;
      await clearEmployeeData(db);
      startSequence = 1;
    } else {
      startSequence = await getNextEmployeeSequence(db);
    }

    const employees = [];
    for (let index = 0; index < count; index += 1) {
      employees.push(generateEmployee(startSequence + index));
    }

    await insertEmployeesInBatches(db, employees);
    insertedCount = employees.length;
  });

  const totalRow = await db.queryOne('SELECT COUNT(*) AS count FROM employees');

  return {
    insertedCount,
    clearedCount,
    employeeCount: totalRow?.count ?? 0,
    randomSeed,
    replace,
  };
}
