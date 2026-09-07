import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createSeededTestDb } from './helpers/employeeFixtures.js';

const validSalaryPayload = {
  baseSalary: 1200000,
  bonus: 150000,
  incentives: 50000,
  effectiveFrom: '2024-07-01',
};

describe('salary records API', () => {
  let db;
  let app;

  before(async () => {
    db = await createSeededTestDb({
      salaryRecords: [
        {
          employee_id: 1,
          base_salary: 1000000,
          bonus: 100000,
          incentives: 50000,
          effective_from: '2024-01-01',
          effective_to: null,
        },
      ],
    });
    app = createApp({ db, corsOrigin: 'http://localhost:5173' });
  });

  after(() => {
    db.close();
  });

  describe('GET /api/v1/employees/:employeeId/salary-records', () => {
    it('returns salary history ordered by effective date descending', async () => {
      const response = await request(app).get('/api/v1/employees/1/salary-records');

      assert.equal(response.status, 200);
      assert.equal(response.body.data.length, 1);
      assert.equal(response.body.data[0].baseSalary, 1000000);
      assert.equal(response.body.data[0].currency, 'INR');
      assert.equal(response.body.data[0].isCurrent, true);
    });

    it('returns 404 when the employee does not exist', async () => {
      const response = await request(app).get('/api/v1/employees/999/salary-records');

      assert.equal(response.status, 404);
      assert.equal(response.body.code, 'EMPLOYEE_NOT_FOUND');
    });
  });

  describe('GET /api/v1/employees/:employeeId/salary-records/:salaryRecordId', () => {
    it('returns a single salary record', async () => {
      const response = await request(app).get('/api/v1/employees/1/salary-records/1');

      assert.equal(response.status, 200);
      assert.equal(response.body.data.id, 1);
      assert.equal(response.body.data.totalAmount, 1150000);
      assert.equal(response.body.data.effectiveFrom, '2024-01-01');
    });

    it('returns 404 when the salary record does not exist', async () => {
      const response = await request(app).get('/api/v1/employees/1/salary-records/999');

      assert.equal(response.status, 404);
      assert.equal(response.body.code, 'SALARY_RECORD_NOT_FOUND');
    });
  });

  describe('POST /api/v1/employees/:employeeId/salary-records', () => {
    it('creates the first salary record for an employee without history', async () => {
      const response = await request(app)
        .post('/api/v1/employees/2/salary-records')
        .send(validSalaryPayload);

      assert.equal(response.status, 201);
      assert.equal(response.body.data.employeeId, 2);
      assert.equal(response.body.data.baseSalary, 1200000);
      assert.equal(response.body.data.isCurrent, true);
      assert.equal(response.body.data.effectiveTo, null);
    });

    it('creates a new salary record and closes the previous current record', async () => {
      const response = await request(app)
        .post('/api/v1/employees/1/salary-records')
        .send(validSalaryPayload);

      assert.equal(response.status, 201);
      assert.equal(response.body.data.isCurrent, true);
      assert.equal(response.body.data.effectiveFrom, '2024-07-01');

      const historyResponse = await request(app).get('/api/v1/employees/1/salary-records');
      assert.equal(historyResponse.body.data.length, 2);
      assert.equal(historyResponse.body.data[0].effectiveFrom, '2024-07-01');
      assert.equal(historyResponse.body.data[1].effectiveTo, '2024-06-30');
      assert.equal(historyResponse.body.data[1].isCurrent, false);
    });

    it('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/employees/2/salary-records')
        .send({ bonus: 10000 });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, 'SALARY_RECORD_VALIDATION_ERROR');
    });

    it('returns 400 when effectiveFrom is not after the current record', async () => {
      const response = await request(app)
        .post('/api/v1/employees/1/salary-records')
        .send({
          ...validSalaryPayload,
          effectiveFrom: '2024-01-01',
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, 'SALARY_RECORD_INVALID_EFFECTIVE_DATE');
    });

    it('returns 404 when the employee does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/employees/999/salary-records')
        .send(validSalaryPayload);

      assert.equal(response.status, 404);
      assert.equal(response.body.code, 'EMPLOYEE_NOT_FOUND');
    });
  });
});
