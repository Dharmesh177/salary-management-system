import { describe, expect, it } from 'vitest';
import { DEFAULT_EMPLOYEE_SALARY_FORM } from './constants.js';
import { hasValidationErrors, validateEmployeeSalaryForm } from './validation.js';

describe('validateEmployeeSalaryForm', () => {
  it('requires base salary and currency', () => {
    const { errors } = validateEmployeeSalaryForm(DEFAULT_EMPLOYEE_SALARY_FORM);
    expect(hasValidationErrors(errors)).toBe(true);
  });

  it('accepts valid salary values', () => {
    const { errors, payload } = validateEmployeeSalaryForm({
      baseSalary: '1000000',
      bonus: '100000',
      incentives: '50000',
      currencyCode: 'INR',
    });

    expect(hasValidationErrors(errors)).toBe(false);
    expect(payload).toEqual({
      baseSalary: 1000000,
      bonus: 100000,
      incentives: 50000,
      currencyCode: 'INR',
    });
  });
});
