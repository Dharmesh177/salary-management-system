import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { authHeader, createAuthedTestApp } from './helpers/authFixtures.js';

describe('GET /api/v1/employees search and filters', () => {
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
          first_name: 'Alan',
          last_name: 'Turing',
          email: 'alan@example.com',
          country_id: 2,
          department_id: 2,
          designation_id: 2,
        },
      ],
    }));
  });

  after(() => {
    db.close();
  });

  it('searches by employee code', async () => {
    const response = await request(app)
      .get('/api/v1/employees?search=EMP003')
      .set(authHeader(hrToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].employeeCode, 'EMP003');
  });

  it('searches by employee name', async () => {
    const response = await request(app)
      .get('/api/v1/employees?search=grace')
      .set(authHeader(hrToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].firstName, 'Grace');
  });

  it('filters by country, department, and designation', async () => {
    const response = await request(app)
      .get('/api/v1/employees?countryId=2&departmentId=2&designationId=2')
      .set(authHeader(hrToken));

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].employeeCode, 'EMP003');
  });
});
