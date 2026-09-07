import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createSeededTestDb } from './helpers/employeeFixtures.js';

describe('GET /api/v1/employees', () => {
  let db;
  let app;

  before(async () => {
    db = await createSeededTestDb();
    app = createApp({ db, corsOrigin: 'http://localhost:5173' });
  });

  after(() => {
    db.close();
  });

  it('returns a paginated list of employees', async () => {
    const response = await request(app).get('/api/v1/employees?page=1&pageSize=1');

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.pagination.page, 1);
    assert.equal(response.body.pagination.pageSize, 1);
    assert.equal(response.body.pagination.total, 2);
    assert.equal(response.body.pagination.totalPages, 2);
    assert.equal(response.body.data[0].employeeCode, 'EMP002');
    assert.equal(response.body.data[0].country.name, 'India');
    assert.equal(response.body.data[0].department.name, 'Engineering');
    assert.equal(response.body.data[0].designation.name, 'Software Engineer');
  });
});
