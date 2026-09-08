import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import {
  authHeader,
  createAuthenticatedTestDb,
  TEST_PASSWORD,
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
            role: 'HR_MANAGER',
            is_active: 1,
          },
          {
            employee_id: 2,
            email: 'employee@example.com',
            password: TEST_PASSWORD,
            role: 'EMPLOYEE',
            is_active: 1,
          },
          {
            employee_id: 3,
            email: 'inactive@example.com',
            password: TEST_PASSWORD,
            role: 'EMPLOYEE',
            is_active: 0,
          },
        ],
      },
    );
    app = createApp({
      db,
      corsOrigin: 'http://localhost:5173',
      jwtSecret: 'test-jwt-secret',
    });
  });

  after(() => {
    db.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns a token and user profile for valid HR manager credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'hr@example.com', password: TEST_PASSWORD });

      assert.equal(response.status, 200);
      assert.ok(response.body.data.token);
      assert.equal(response.body.data.user.email, 'hr@example.com');
      assert.equal(response.body.data.user.employeeId, 1);
      assert.ok(response.body.data.user.roles.includes('HR_MANAGER'));
      assert.ok(response.body.data.user.permissions.includes('employee:read'));
      assert.ok(response.body.data.user.permissions.includes('salary:create'));
    });

    it('returns a token and user profile for valid employee credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'employee@example.com', password: TEST_PASSWORD });

      assert.equal(response.status, 200);
      assert.ok(response.body.data.token);
      assert.equal(response.body.data.user.employeeId, 2);
      assert.ok(response.body.data.user.roles.includes('EMPLOYEE'));
      assert.ok(response.body.data.user.permissions.includes('salary:read'));
      assert.equal(response.body.data.user.permissions.includes('salary:create'), false);
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
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns the authenticated user profile', async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'hr@example.com', password: TEST_PASSWORD });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set(authHeader(loginResponse.body.data.token));

      assert.equal(response.status, 200);
      assert.equal(response.body.data.email, 'hr@example.com');
      assert.ok(response.body.data.roles.includes('HR_MANAGER'));
    });

    it('returns 401 without a token', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      assert.equal(response.status, 401);
      assert.equal(response.body.code, 'UNAUTHORIZED');
    });
  });
});
