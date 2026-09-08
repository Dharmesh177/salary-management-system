import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import {
  authHeader,
  createAuthenticatedTestDb,
  TEST_PASSWORD,
} from './helpers/authFixtures.js';

const validSalaryPayload = {
  baseSalary: 1200000,
  bonus: 150000,
  incentives: 50000,
  effectiveFrom: '2024-07-01',
};

describe('auth protection', () => {
  let db;
  let app;
  let hrToken;
  let employeeToken;

  before(async () => {
    db = await createAuthenticatedTestDb({
      salaryRecords: [
        {
          employee_id: 1,
          base_salary: 1000000,
          bonus: 100000,
          incentives: 50000,
          effective_from: '2024-01-01',
          effective_to: null,
        },
        {
          employee_id: 2,
          base_salary: 900000,
          bonus: 50000,
          incentives: 25000,
          effective_from: '2024-01-01',
          effective_to: null,
        },
      ],
    });
    app = createApp({
      db,
      corsOrigin: 'http://localhost:5173',
      jwtSecret: 'test-jwt-secret',
    });

    const hrLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'hr@example.com', password: TEST_PASSWORD });
    hrToken = hrLogin.body.data.token;

    const employeeLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee@example.com', password: TEST_PASSWORD });
    employeeToken = employeeLogin.body.data.token;
  });

  after(() => {
    db.close();
  });

  it('returns 401 for unauthenticated employee list requests', async () => {
    const response = await request(app).get('/api/v1/employees');

    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'UNAUTHORIZED');
  });

  it('allows HR managers to list employees', async () => {
    const response = await request(app)
      .get('/api/v1/employees')
      .set(authHeader(hrToken));

    assert.equal(response.status, 200);
    assert.ok(response.body.data.length > 0);
  });

  it('forbids employees from listing the employee directory', async () => {
    const response = await request(app)
      .get('/api/v1/employees')
      .set(authHeader(employeeToken));

    assert.equal(response.status, 403);
    assert.equal(response.body.code, 'FORBIDDEN');
  });

  it('allows employees to read their own profile', async () => {
    const response = await request(app)
      .get('/api/v1/employees/2')
      .set(authHeader(employeeToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, 2);
  });

  it('forbids employees from reading another employee profile', async () => {
    const response = await request(app)
      .get('/api/v1/employees/1')
      .set(authHeader(employeeToken));

    assert.equal(response.status, 403);
    assert.equal(response.body.code, 'FORBIDDEN');
  });

  it('allows employees to read their own salary history', async () => {
    const response = await request(app)
      .get('/api/v1/employees/2/salary-records')
      .set(authHeader(employeeToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
  });

  it('forbids employees from reading another employee salary history', async () => {
    const response = await request(app)
      .get('/api/v1/employees/1/salary-records')
      .set(authHeader(employeeToken));

    assert.equal(response.status, 403);
    assert.equal(response.body.code, 'FORBIDDEN');
  });

  it('forbids employees from creating salary records', async () => {
    const response = await request(app)
      .post('/api/v1/employees/2/salary-records')
      .set(authHeader(employeeToken))
      .send(validSalaryPayload);

    assert.equal(response.status, 403);
    assert.equal(response.body.code, 'FORBIDDEN');
  });

  it('allows HR managers to create salary records', async () => {
    const response = await request(app)
      .post('/api/v1/employees/2/salary-records')
      .set(authHeader(hrToken))
      .send(validSalaryPayload);

    assert.equal(response.status, 201);
    assert.equal(response.body.data.employeeId, 2);
  });

  it('forbids employees from creating employees', async () => {
    const response = await request(app)
      .post('/api/v1/employees')
      .set(authHeader(employeeToken))
      .send({
        employeeCode: 'EMP999',
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
        countryId: 1,
        departmentId: 1,
        designationId: 1,
      });

    assert.equal(response.status, 403);
    assert.equal(response.body.code, 'FORBIDDEN');
  });
});
