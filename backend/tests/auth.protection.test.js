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
  let authToken;

  before(async () => {
    db = await createAuthenticatedTestDb();
    app = createApp({
      db,
      corsOrigin: 'http://localhost:5173',
      jwtSecret: 'test-jwt-secret',
      registrationSecret: TEST_REGISTRATION_SECRET,
    });

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'hr@example.com', password: TEST_PASSWORD });
    authToken = login.body.data.token;
  });

  after(() => {
    db.close();
  });

  it('returns 401 for unauthenticated requests', async () => {
    const response = await request(app).get('/api/v1/employees');
    assert.equal(response.status, 401);
  });

  it('allows authenticated users to list employees', async () => {
    const response = await request(app)
      .get('/api/v1/employees')
      .set(authHeader(authToken));
    assert.equal(response.status, 200);
  });

  it('allows authenticated users to access employee profiles', async () => {
    const response = await request(app)
      .get('/api/v1/employees/1')
      .set(authHeader(authToken));
    assert.equal(response.status, 200);
  });
});
