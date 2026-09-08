import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import request from 'supertest';
import { authHeader, createAuthedTestApp } from './helpers/authFixtures.js';

const validPayload = {
  employeeCode: 'EMP010',
  firstName: 'Tim',
  lastName: 'Berners-Lee',
  email: 'tim.berners-lee@acme.example',
  countryId: 1,
  departmentId: 1,
  designationId: 1,
  joiningDate: '2024-09-01',
};

describe('employee CUD API', () => {
  let db;
  let app;
  let hrToken;

  before(async () => {
    ({ db, app, hrToken } = await createAuthedTestApp());
  });

  after(() => {
    db.close();
  });

  describe('POST /api/v1/employees', () => {
    it('creates an employee and returns 201', async () => {
      const response = await request(app)
        .post('/api/v1/employees')
        .set(authHeader(hrToken))
        .send(validPayload);

      assert.equal(response.status, 201);
      assert.equal(response.body.data.employeeCode, 'EMP010');
      assert.equal(response.body.data.email, 'tim.berners-lee@acme.example');
      assert.equal(response.body.data.country.name, 'India');
    });

    it('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/employees')
        .set(authHeader(hrToken))
        .send({
          firstName: 'Missing',
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, 'EMPLOYEE_VALIDATION_ERROR');
    });

    it('returns 409 when employee code already exists', async () => {
      const response = await request(app)
        .post('/api/v1/employees')
        .set(authHeader(hrToken))
        .send({
          ...validPayload,
          employeeCode: 'EMP001',
          email: 'unique.email@acme.example',
        });

      assert.equal(response.status, 409);
      assert.equal(response.body.code, 'EMPLOYEE_DUPLICATE');
    });

    it('returns 400 when lookup ids are invalid', async () => {
      const response = await request(app)
        .post('/api/v1/employees')
        .set(authHeader(hrToken))
        .send({
          ...validPayload,
          employeeCode: 'EMP011',
          email: 'emp011@acme.example',
          countryId: 999,
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.code, 'INVALID_EMPLOYEE_LOOKUP');
    });
  });

  describe('PUT /api/v1/employees/:id', () => {
    it('updates an employee and returns 200', async () => {
      const response = await request(app)
        .put('/api/v1/employees/2')
        .set(authHeader(hrToken))
        .send({
          ...validPayload,
          employeeCode: 'EMP002',
          firstName: 'Grace',
          lastName: 'Hopper',
          email: 'grace.hopper@acme.example',
          designationId: 1,
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.data.firstName, 'Grace');
      assert.equal(response.body.data.lastName, 'Hopper');
    });

    it('returns 404 when the employee does not exist', async () => {
      const response = await request(app)
        .put('/api/v1/employees/999')
        .set(authHeader(hrToken))
        .send(validPayload);

      assert.equal(response.status, 404);
      assert.equal(response.body.code, 'EMPLOYEE_NOT_FOUND');
    });

    it('returns 409 when email belongs to another employee', async () => {
      const response = await request(app)
        .put('/api/v1/employees/2')
        .set(authHeader(hrToken))
        .send({
          ...validPayload,
          employeeCode: 'EMP002',
          email: 'ada@example.com',
        });

      assert.equal(response.status, 409);
      assert.equal(response.body.code, 'EMPLOYEE_DUPLICATE');
    });
  });

  describe('DELETE /api/v1/employees/:id', () => {
    it('deletes an employee and cascades salary data', async () => {
      const createResponse = await request(app)
        .post('/api/v1/employees')
        .set(authHeader(hrToken))
        .send({
          ...validPayload,
          employeeCode: 'EMP099',
          email: 'delete.me@acme.example',
        });

      const employeeId = createResponse.body.data.id;
      await request(app)
        .put(`/api/v1/employees/${employeeId}/salary`)
        .set(authHeader(hrToken))
        .send({
          baseSalary: 1000000,
          bonus: 0,
          incentives: 0,
          currencyCode: 'INR',
        });

      const response = await request(app)
        .delete(`/api/v1/employees/${employeeId}`)
        .set(authHeader(hrToken));

      assert.equal(response.status, 204);

      const getResponse = await request(app)
        .get(`/api/v1/employees/${employeeId}`)
        .set(authHeader(hrToken));
      assert.equal(getResponse.status, 404);
    });

    it('deletes an employee with an existing salary snapshot', async () => {
      await request(app)
        .put('/api/v1/employees/2/salary')
        .set(authHeader(hrToken))
        .send({
          baseSalary: 900000,
          bonus: 50000,
          incentives: 25000,
          currencyCode: 'INR',
        });

      const response = await request(app)
        .delete('/api/v1/employees/2')
        .set(authHeader(hrToken));

      assert.equal(response.status, 204);
    });

    it('returns 404 when the employee does not exist', async () => {
      const response = await request(app)
        .delete('/api/v1/employees/999')
        .set(authHeader(hrToken));

      assert.equal(response.status, 404);
      assert.equal(response.body.code, 'EMPLOYEE_NOT_FOUND');
    });
  });
});
