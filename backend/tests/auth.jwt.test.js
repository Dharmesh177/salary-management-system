import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import {
  authHeader,
  createAuthenticatedTestDb,
  TEST_PASSWORD,
  TEST_REGISTRATION_SECRET,
} from './helpers/authFixtures.js';

const JWT_SECRET = 'test-jwt-secret';

describe('auth JWT validation', () => {
  let db;
  let app;

  before(async () => {
    db = await createAuthenticatedTestDb();
    app = createApp({
      db,
      corsOrigin: 'http://localhost:5173',
      jwtSecret: JWT_SECRET,
      registrationSecret: TEST_REGISTRATION_SECRET,
    });
  });

  after(() => {
    db.close();
  });

  it('returns 401 for a tampered JWT', async () => {
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'hr@example.com', password: TEST_PASSWORD });

    const token = login.body.data.token;
    const tamperedToken = `${token.slice(0, -1)}x`;

    const response = await request(app)
      .get('/api/v1/employees')
      .set(authHeader(tamperedToken));

    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'UNAUTHORIZED');
  });

  it('returns 401 for an expired JWT', async () => {
    const expiredToken = jwt.sign({ sub: 1 }, JWT_SECRET, { expiresIn: '-1s' });

    const response = await request(app)
      .get('/api/v1/employees')
      .set(authHeader(expiredToken));

    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'UNAUTHORIZED');
  });

  it('returns 401 for a JWT signed with the wrong secret', async () => {
    const wrongSecretToken = jwt.sign({ sub: 1 }, 'wrong-secret', { expiresIn: '1h' });

    const response = await request(app)
      .get('/api/v1/employees')
      .set(authHeader(wrongSecretToken));

    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'UNAUTHORIZED');
  });
});
