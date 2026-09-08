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

describe('auth login API', () => {
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
          {
            employee_code: 'EMP003',
            first_name: 'Inactive',
            last_name: 'User',
            email: 'inactive.person@example.com',
            country_id: 1,
            department_id: 1,
            designation_id: 1,
          },
        ],
      },
      {
        users: [
          {
            employee_id: 1,
            email: 'hr@example.com',
            password: TEST_PASSWORD,
            is_active: 1,
          },
          {
            employee_id: 2,
            email: 'employee@example.com',
            password: TEST_PASSWORD,
            is_active: 1,
          },
          {
            employee_id: 3,
            email: 'inactive@example.com',
            password: TEST_PASSWORD,
            is_active: 0,
          },
        ],
      },
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

  it('returns a token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'hr@example.com', password: TEST_PASSWORD });

    assert.equal(response.status, 200);
    assert.ok(response.body.data.token);
    assert.equal(response.body.data.user.email, 'hr@example.com');
  });

  it('returns 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'hr@example.com', password: 'wrong-password' });

    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'INVALID_CREDENTIALS');
  });

  it('returns 401 for inactive users', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'inactive@example.com', password: TEST_PASSWORD });

    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'USER_INACTIVE');
  });

  it('returns the authenticated session profile', async () => {
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'hr@example.com', password: TEST_PASSWORD });

    const response = await request(app)
      .get('/api/v1/auth/session')
      .set(authHeader(loginResponse.body.data.token));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.email, 'hr@example.com');
  });

  it('returns 401 without a token on session endpoint', async () => {
    const response = await request(app).get('/api/v1/auth/session');

    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'UNAUTHORIZED');
  });
});
