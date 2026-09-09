import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { authHeader, createAuthenticatedTestDb, TEST_JWT_SECRET, TEST_REGISTRATION_SECRET, TEST_PASSWORD } from './helpers/authFixtures.js';

function createMockLlmClient() {
  return {
    async generateSql() {
      return {
        sql: 'SELECT COUNT(*) AS employee_count FROM employees LIMIT 10',
        explanation: 'Count all employees',
      };
    },
    async correctSql() {
      return {
        sql: 'SELECT COUNT(*) AS employee_count FROM employees LIMIT 10',
        explanation: 'Corrected employee count',
      };
    },
    async generateAnswer() {
      return { answer: 'There are 2 employees in the database.' };
    },
  };
}

describe('POST /api/v1/analytics-chat/ask', () => {
  let db;
  let app;
  let hrToken;

  before(async () => {
    db = await createAuthenticatedTestDb();
    app = createApp({
      db,
      corsOrigin: 'http://localhost:5173',
      jwtSecret: TEST_JWT_SECRET,
      registrationSecret: TEST_REGISTRATION_SECRET,
      llmClientOverride: createMockLlmClient(),
    });

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'hr@example.com', password: TEST_PASSWORD });

    hrToken = login.body.data.token;
  });

  after(() => {
    db.close();
  });

  it('requires authentication', async () => {
    const response = await request(app)
      .post('/api/v1/analytics-chat/ask')
      .send({ question: 'How many employees?' });

    assert.equal(response.status, 401);
  });

  it('returns a grounded analytics answer for authenticated users', async () => {
    const response = await request(app)
      .post('/api/v1/analytics-chat/ask')
      .set(authHeader(hrToken))
      .send({ question: 'How many employees do we have?' });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.answer, 'There are 2 employees in the database.');
    assert.match(response.body.data.sql, /SELECT COUNT/i);
    assert.equal(response.body.data.recordCount, 1);
  });

  it('validates the question payload', async () => {
    const response = await request(app)
      .post('/api/v1/analytics-chat/ask')
      .set(authHeader(hrToken))
      .send({ question: '   ' });

    assert.equal(response.status, 400);
    assert.equal(response.body.code, 'ANALYTICS_CHAT_VALIDATION_ERROR');
  });

  it('returns 503 when LLM is not configured', async () => {
    const unconfiguredApp = createApp({
      db,
      corsOrigin: 'http://localhost:5173',
      jwtSecret: TEST_JWT_SECRET,
      registrationSecret: TEST_REGISTRATION_SECRET,
    });

    const response = await request(unconfiguredApp)
      .post('/api/v1/analytics-chat/ask')
      .set(authHeader(hrToken))
      .send({ question: 'How many employees?' });

    assert.equal(response.status, 503);
    assert.equal(response.body.code, 'LLM_NOT_CONFIGURED');
  });
});
