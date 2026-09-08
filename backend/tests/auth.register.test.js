import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import {
  createAuthenticatedTestDb,
  TEST_PASSWORD,
  TEST_REGISTRATION_SECRET,
} from './helpers/authFixtures.js';

describe('auth register API', () => {
  let db;
  let app;

  before(async () => {
    db = await createAuthenticatedTestDb(
      {
        employees: [
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
      },
      { users: [] },
    );
    app = createApp({
      db,
      corsOrigin: 'http://localhost:5173',
      jwtSecret: 'test-jwt-secret',
      registrationSecret: TEST_REGISTRATION_SECRET,
    });
  });

  after(() => {
    db.close();
  });

  it('creates a user when registration secret is valid', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'new.hr@example.com',
        password: TEST_PASSWORD,
        employeeId: 1,
        role: 'HR_MANAGER',
        registrationSecret: TEST_REGISTRATION_SECRET,
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.email, 'new.hr@example.com');
    assert.equal(response.body.data.roles.includes('HR_MANAGER'), true);
  });

  it('returns 403 when registration secret is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'blocked@example.com',
        password: TEST_PASSWORD,
        employeeId: 2,
        role: 'EMPLOYEE',
        registrationSecret: 'wrong-secret',
      });

    assert.equal(response.status, 403);
    assert.equal(response.body.code, 'REGISTRATION_FORBIDDEN');
  });
});
