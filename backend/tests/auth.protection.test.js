import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import {
  authHeader,
  createAuthenticatedTestDb,
  TEST_PASSWORD,
  TEST_REGISTRATION_SECRET,
} from './helpers/authFixtures.js';

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
      registrationSecret: TEST_REGISTRATION_SECRET,
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

  it('returns 401 for unauthenticated requests', async () => {
    const response = await request(app).get('/api/v1/employees');
    assert.equal(response.status, 401);
  });

  it('allows HR managers to list employees', async () => {
    const response = await request(app)
      .get('/api/v1/employees')
      .set(authHeader(hrToken));
    assert.equal(response.status, 200);
  });

  it('forbids employees from listing the directory', async () => {
    const response = await request(app)
      .get('/api/v1/employees')
      .set(authHeader(employeeToken));
    assert.equal(response.status, 403);
  });

  it('forbids employees from accessing another employee profile', async () => {
    const response = await request(app)
      .get('/api/v1/employees/1')
      .set(authHeader(employeeToken));
    assert.equal(response.status, 403);
  });

  it('allows employees to access their own salary history', async () => {
    const response = await request(app)
      .get('/api/v1/employees/2/salary-records')
      .set(authHeader(employeeToken));
    assert.equal(response.status, 200);
  });
});
