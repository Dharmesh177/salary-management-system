import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { authHeader, createAuthedTestApp } from './helpers/authFixtures.js';

describe('lookup endpoints', () => {
  let db;
  let app;
  let hrToken;

  before(async () => {
    ({ db, app, hrToken } = await createAuthedTestApp({
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
    }));
  });

  after(() => {
    db.close();
  });

  it('lists countries for filter dropdowns', async () => {
    const response = await request(app)
      .get('/api/v1/countries')
      .set(authHeader(hrToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.data[0].name, 'India');
  });

  it('lists departments for filter dropdowns', async () => {
    const response = await request(app)
      .get('/api/v1/departments')
      .set(authHeader(hrToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.data[0].name, 'Engineering');
  });

  it('lists designations for filter dropdowns', async () => {
    const response = await request(app)
      .get('/api/v1/designations')
      .set(authHeader(hrToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.data[0].name, 'Accountant');
  });
});
