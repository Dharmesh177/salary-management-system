import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { authHeader, createAuthedTestApp } from './helpers/authFixtures.js';

const dashboardCountries = [
  { id: 1, code: 'IN', name: 'India' },
  { id: 2, code: 'US', name: 'United States' },
];

const dashboardDepartments = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Sales' },
];

const dashboardEmployees = [
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
    department_id: 2,
    designation_id: 1,
  },
  {
    employee_code: 'EMP003',
    first_name: 'Tim',
    last_name: 'Berners-Lee',
    email: 'tim@example.com',
    country_id: 2,
    department_id: 1,
    designation_id: 1,
  },
];

const dashboardSalaries = [
  {
    employee_id: 1,
    base_salary: 1000000,
    bonus: 100000,
    incentives: 50000,
    currency_code: 'INR',
  },
  {
    employee_id: 2,
    base_salary: 500000,
    bonus: 0,
    incentives: 0,
    currency_code: 'INR',
  },
  {
    employee_id: 3,
    base_salary: 100000,
    bonus: 10000,
    incentives: 0,
    currency_code: 'USD',
  },
];

describe('GET /api/v1/dashboard/analytics', () => {
  let db;
  let app;
  let hrToken;

  before(async () => {
    ({ db, app, hrToken } = await createAuthedTestApp({
      countries: dashboardCountries,
      departments: dashboardDepartments,
      employees: dashboardEmployees,
      employeeSalaries: dashboardSalaries,
    }));
  });

  after(() => {
    db.close();
  });

  it('returns 401 without authentication', async () => {
    const response = await request(app).get('/api/v1/dashboard/analytics');

    assert.equal(response.status, 401);
  });

  it('returns aggregated dashboard analytics', async () => {
    const response = await request(app)
      .get('/api/v1/dashboard/analytics')
      .set(authHeader(hrToken));

    assert.equal(response.status, 200);

    const { data } = response.body;

    assert.equal(data.kpis.totalEmployees, 3);
    assert.equal(data.kpis.countryCount, 2);
    assert.equal(data.kpis.departmentCount, 2);
    assert.equal(data.kpis.totalCompensationUsd, '129800.00');
    assert.equal(data.kpis.averageCompensationUsd, '43266.67');
    assert.equal(data.kpis.totalEmployeesLabel, 'Total employees');
    assert.equal(data.kpis.totalCompensationUsdLabel, 'Total compensation (USD)');
    assert.equal(data.kpis.averageCompensationUsdLabel, 'Average compensation (USD)');
    assert.equal(data.kpis.countryCountLabel, 'Countries');
    assert.equal(data.kpis.departmentCountLabel, 'Departments');

    assert.equal(data.chartSections.length, 4);
    assert.deepEqual(
      data.chartSections.map((section) => ({
        id: section.id,
        title: section.title,
        chartType: section.chartType,
        labelKey: section.labelKey,
        valueKey: section.valueKey,
        valueFormat: section.valueFormat,
      })),
      [
        {
          id: 'employeeDistributionByCountry',
          title: 'Employee distribution by country',
          chartType: 'donut',
          labelKey: 'countryName',
          valueKey: 'employeeCount',
          valueFormat: 'number',
        },
        {
          id: 'employeeDistributionByDepartment',
          title: 'Employee distribution by department',
          chartType: 'donut',
          labelKey: 'departmentName',
          valueKey: 'employeeCount',
          valueFormat: 'number',
        },
        {
          id: 'averageCompensationByCountry',
          title: 'Average compensation by country (USD)',
          chartType: 'bar',
          labelKey: 'countryName',
          valueKey: 'averageCompensationUsd',
          valueFormat: 'currency',
        },
        {
          id: 'averageCompensationByDepartment',
          title: 'Average compensation by department (USD)',
          chartType: 'bar',
          labelKey: 'departmentName',
          valueKey: 'averageCompensationUsd',
          valueFormat: 'currency',
        },
      ],
    );

    assert.deepEqual(
      data.employeeDistributionByCountry.map((item) => ({
        countryName: item.countryName,
        employeeCount: item.employeeCount,
      })),
      [
        { countryName: 'India', employeeCount: 2 },
        { countryName: 'United States', employeeCount: 1 },
      ],
    );

    assert.deepEqual(
      data.employeeDistributionByDepartment.map((item) => ({
        departmentName: item.departmentName,
        employeeCount: item.employeeCount,
      })),
      [
        { departmentName: 'Engineering', employeeCount: 2 },
        { departmentName: 'Sales', employeeCount: 1 },
      ],
    );

    assert.deepEqual(
      data.averageCompensationByCountry.map((item) => ({
        countryName: item.countryName,
        averageCompensationUsd: item.averageCompensationUsd,
        employeeCount: item.employeeCount,
      })),
      [
        { countryName: 'India', averageCompensationUsd: '9900.00', employeeCount: 2 },
        { countryName: 'United States', averageCompensationUsd: '110000.00', employeeCount: 1 },
      ],
    );

    assert.deepEqual(
      data.averageCompensationByDepartment.map((item) => ({
        departmentName: item.departmentName,
        averageCompensationUsd: item.averageCompensationUsd,
        employeeCount: item.employeeCount,
      })),
      [
        { departmentName: 'Engineering', averageCompensationUsd: '61900.00', employeeCount: 2 },
        { departmentName: 'Sales', averageCompensationUsd: '6000.00', employeeCount: 1 },
      ],
    );
  });

  it('returns zero compensation KPIs when no salary records exist', async () => {
    const { db: emptySalaryDb, app: emptySalaryApp, hrToken: emptySalaryToken } =
      await createAuthedTestApp({
        countries: dashboardCountries,
        departments: dashboardDepartments,
        employees: dashboardEmployees,
        employeeSalaries: [],
      });

    const response = await request(emptySalaryApp)
      .get('/api/v1/dashboard/analytics')
      .set(authHeader(emptySalaryToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.kpis.totalEmployees, 3);
    assert.equal(response.body.data.kpis.totalCompensationUsd, '0.00');
    assert.equal(response.body.data.kpis.averageCompensationUsd, '0.00');

    emptySalaryDb.close();
  });

  it('returns 422 when a salary currency has no exchange rate', async () => {
    const { db: missingFxDb, app: missingFxApp, hrToken: missingFxToken } =
      await createAuthedTestApp({
        countries: dashboardCountries,
        departments: dashboardDepartments,
        employees: [dashboardEmployees[0]],
        employeeSalaries: [],
        exchangeRates: [
          { currency_code: 'USD', rate_to_usd: 1.0, effective_date: '2024-01-01' },
        ],
      });

    await missingFxDb.exec('PRAGMA foreign_keys = OFF');
    await missingFxDb.execute(
      `INSERT INTO employee_salaries (
        employee_id, base_salary, bonus, incentives, currency_code, updated_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [1, 1000, 0, 0, 'CHF'],
    );
    await missingFxDb.exec('PRAGMA foreign_keys = ON');

    const response = await request(missingFxApp)
      .get('/api/v1/dashboard/analytics')
      .set(authHeader(missingFxToken));

    assert.equal(response.status, 422);
    assert.equal(response.body.code, 'MISSING_EXCHANGE_RATE');

    missingFxDb.close();
  });
});
