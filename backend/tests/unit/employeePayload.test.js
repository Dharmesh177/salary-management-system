import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseEmployeePayload } from '../../src/features/employees/employee.validator.js';

const validPayload = {
  employeeCode: 'EMP010',
  firstName: 'Tim',
  lastName: 'Berners-Lee',
  email: 'tim@acme.example',
  countryId: 1,
  departmentId: 1,
  designationId: 1,
  joiningDate: '2024-09-01',
};

describe('parseEmployeePayload', () => {
  it('returns a normalized payload for valid input', () => {
    const result = parseEmployeePayload(validPayload);

    assert.deepEqual(result, validPayload);
  });

  it('throws a validation error with details for missing fields', () => {
    assert.throws(
      () => parseEmployeePayload({ firstName: 'Missing' }),
      (error) => {
        assert.equal(error.code, 'EMPLOYEE_VALIDATION_ERROR');
        assert.ok(error.details.includes('employeeCode is required'));
        assert.ok(error.details.includes('email is required'));
        return true;
      },
    );
  });

  it('rejects invalid email and joining date formats', () => {
    assert.throws(
      () =>
        parseEmployeePayload({
          ...validPayload,
          email: 'not-an-email',
          joiningDate: '09/01/2024',
        }),
      (error) => {
        assert.ok(error.details.includes('email is invalid'));
        assert.ok(error.details.includes('joiningDate is invalid'));
        return true;
      },
    );
  });
});
