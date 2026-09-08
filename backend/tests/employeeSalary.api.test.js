import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { authHeader, createAuthedTestApp } from './helpers/authFixtures.js';

const validSalaryPayload = {
  baseSalary: 1200000,
  bonus: 150000,
  incentives: 50000,
  currencyCode: 'INR',
};

describe('employee salary API', () => {
  let db;
  let app;
  let authToken;

  before(async () => {
    ({ db, app, authToken } = await createAuthedTestApp({
      employeeSalaries: [
        {
          employee_id: 1,
          base_salary: 1000000,
          bonus: 100000,
          incentives: 50000,
          currency_code: 'INR',
        },
      ],
    }));
  });

  after(() => {
    db.close();
  });

  describe('GET /api/v1/employees/:employeeId/salary', () => {
    it('returns the current salary snapshot', async () => {
      const response = await request(app)
        .get('/api/v1/employees/1/salary')
        .set(authHeader(authToken));

      assert.equal(response.status, 200);
      assert.equal(response.body.data.baseSalary, 1000000);
      assert.equal(response.body.data.currencyCode, 'INR');
      assert.equal(response.body.data.totalAmount, 1150000);
    });

    it('returns 404 when salary does not exist', async () => {
      const response = await request(app)
        .get('/api/v1/employees/2/salary')
        .set(authHeader(authToken));

      assert.equal(response.status, 404);
      assert.equal(response.body.code, 'EMPLOYEE_SALARY_NOT_FOUND');
    });

    it('returns 404 when the employee does not exist', async () => {
      const response = await request(app)
        .get('/api/v1/employees/999/salary')
        .set(authHeader(authToken));

      assert.equal(response.status, 404);
      assert.equal(response.body.code, 'EMPLOYEE_NOT_FOUND');
    });
  });

  describe('PUT /api/v1/employees/:employeeId/salary', () => {
    it('creates a salary snapshot for an employee without one', async () => {
      const response = await request(app)
        .put('/api/v1/employees/2/salary')
        .set(authHeader(authToken))
        .send(validSalaryPayload);

      assert.equal(response.status, 200);
      assert.equal(response.body.data.employeeId, 2);
      assert.equal(response.body.data.baseSalary, 1200000);
      assert.equal(response.body.data.currencyCode, 'INR');
    });

    it('updates an existing salary snapshot', async () => {
      const response = await request(app)
        .put('/api/v1/employees/1/salary')
        .set(authHeader(authToken))
        .send({
          ...validSalaryPayload,
          baseSalary: 1300000,
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.data.baseSalary, 1300000);
      assert.equal(response.body.data.totalAmount, 1500000);
    });

    it('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .put('/api/v1/employees/2/salary')
        .set(authHeader(authToken))
        .send({ bonus: 10000 });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, 'EMPLOYEE_SALARY_VALIDATION_ERROR');
    });

    it('returns 400 for unsupported currency codes', async () => {
      const response = await request(app)
        .put('/api/v1/employees/2/salary')
        .set(authHeader(authToken))
        .send({
          ...validSalaryPayload,
          currencyCode: 'SGD',
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, 'EMPLOYEE_SALARY_VALIDATION_ERROR');
    });

    it('returns 404 when the employee does not exist', async () => {
      const response = await request(app)
        .put('/api/v1/employees/999/salary')
        .set(authHeader(authToken))
        .send(validSalaryPayload);

      assert.equal(response.status, 404);
      assert.equal(response.body.code, 'EMPLOYEE_NOT_FOUND');
    });
  });
});
