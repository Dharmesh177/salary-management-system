import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { authHeader, createAuthedTestApp } from './helpers/authFixtures.js';

describe('GET /api/v1/employees/:id', () => {
  let db;
  let app;
  let hrToken;

  before(async () => {
    ({ db, app, hrToken } = await createAuthedTestApp());
  });

  after(() => {
    db.close();
  });

  it('returns employee details with current compensation', async () => {
    const response = await request(app)
      .get('/api/v1/employees/1')
      .set(authHeader(hrToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.employeeCode, 'EMP001');
    assert.equal(response.body.data.currentCompensation.currency, 'INR');
    assert.equal(response.body.data.currentCompensation.baseSalary, 1000000);
    assert.equal(response.body.data.currentCompensation.totalAmount, 1150000);
  });

  it('returns 404 when the employee does not exist', async () => {
    const response = await request(app)
      .get('/api/v1/employees/999')
      .set(authHeader(hrToken));

    assert.equal(response.status, 404);
    assert.equal(response.body.code, 'EMPLOYEE_NOT_FOUND');
  });
});
