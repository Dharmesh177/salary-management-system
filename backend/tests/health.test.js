import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createTestDb } from './helpers/testDb.js';

describe('GET /api/v1/health', () => {
  let db;
  let app;

  before(async () => {
    db = await createTestDb();
    app = createApp({ db, corsOrigin: 'http://localhost:5173' });
  });

  after(() => {
    db.close();
  });

  it('returns ok when the database is reachable', async () => {
    const response = await request(app).get('/api/v1/health');

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'ok');
    assert.equal(response.body.database, 'reachable');
  });
});
