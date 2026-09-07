import { describe, expect, it } from 'vitest';
import { DEFAULT_EMPLOYEE_FORM } from './constants.js';
import { hasValidationErrors, validateEmployeeForm } from './validation.js';

describe('validateEmployeeForm', () => {
  it('returns errors for empty required fields', () => {
    const errors = validateEmployeeForm(DEFAULT_EMPLOYEE_FORM);

    expect(hasValidationErrors(errors)).toBe(true);
    expect(errors.employeeCode).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.countryId).toBeTruthy();
  });

  it('returns no errors for a valid form', () => {
    const errors = validateEmployeeForm({
      employeeCode: 'EMP010',
      firstName: 'Tim',
      lastName: 'Berners-Lee',
      email: 'tim@acme.example',
      countryId: '1',
      departmentId: '1',
      designationId: '1',
    });

    expect(hasValidationErrors(errors)).toBe(false);
  });

  it('rejects an invalid email address', () => {
    const errors = validateEmployeeForm({
      ...DEFAULT_EMPLOYEE_FORM,
      employeeCode: 'EMP010',
      firstName: 'Tim',
      lastName: 'Berners-Lee',
      email: 'not-an-email',
      countryId: '1',
      departmentId: '1',
      designationId: '1',
    });

    expect(errors.email).toBeTruthy();
  });
});
