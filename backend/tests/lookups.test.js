import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createSeededTestDb } from './helpers/employeeFixtures.js';

describe('lookup endpoints', () => {
  let db;
  let app;

  before(async () => {
    db = await createSeededTestDb({
      countries: [
        { id: 1, code: 'IN', name: 'India' },
        { id: 2, code: 'US', name: 'United States' },
      ],
      departments: [
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Finance' },
      ],
      designations: [
        { id: 1, name: 'Software Engineer' },
        { id: 2, name: 'Accountant' },
      ],
    });
    app = createApp({ db, corsOrigin: 'http://localhost:5173' });
  });

  after(() => {
    db.close();
  });

  it('lists countries for filter dropdowns', async () => {
    const response = await request(app).get('/api/v1/countries');

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.data[0].name, 'India');
  });

  it('lists departments for filter dropdowns', async () => {
    const response = await request(app).get('/api/v1/departments');

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.data[0].name, 'Engineering');
  });

  it('lists designations for filter dropdowns', async () => {
    const response = await request(app).get('/api/v1/designations');

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.data[0].name, 'Accountant');
  });
});
