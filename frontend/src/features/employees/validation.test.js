import { describe, expect, it } from 'vitest';
import { DEFAULT_EMPLOYEE_FORM } from './constants.js';
import { hasValidationErrors, validateEmployeeForm } from './validation.js';

const validEmployee = {
  employeeCode: 'EMP010',
  firstName: 'Tim',
  lastName: 'Berners-Lee',
  email: 'tim@acme.example',
  countryId: '1',
  departmentId: '1',
  designationId: '1',
  joiningDate: '2024-09-01',
  baseSalary: '1000000',
  bonus: '0',
  incentives: '0',
  currencyCode: 'INR',
};

describe('validateEmployeeForm', () => {
  it('returns errors for empty required fields', () => {
    const errors = validateEmployeeForm(DEFAULT_EMPLOYEE_FORM);

    expect(hasValidationErrors(errors)).toBe(true);
    expect(errors.employeeCode).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.countryId).toBeTruthy();
    expect(errors.joiningDate).toBeTruthy();
  });

  it('returns no errors for a valid form', () => {
    const errors = validateEmployeeForm(validEmployee);

    expect(hasValidationErrors(errors)).toBe(false);
  });

  it('validates compensation fields on create', () => {
    const errors = validateEmployeeForm(
      { ...validEmployee, baseSalary: '' },
      { includeCompensation: true },
    );

    expect(errors.baseSalary).toBeTruthy();
  });

  it('rejects an invalid email address', () => {
    const errors = validateEmployeeForm({
      ...validEmployee,
      email: 'not-an-email',
    });

    expect(errors.email).toBeTruthy();
  });
});
