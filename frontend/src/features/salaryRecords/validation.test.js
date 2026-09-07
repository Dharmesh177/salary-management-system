import { describe, expect, it } from 'vitest';
import { DEFAULT_SALARY_RECORD_FORM } from './constants.js';
import { hasValidationErrors, validateSalaryRecordForm } from './validation.js';

describe('validateSalaryRecordForm', () => {
  it('returns errors for missing required fields', () => {
    const { errors } = validateSalaryRecordForm(DEFAULT_SALARY_RECORD_FORM);

    expect(hasValidationErrors(errors)).toBe(true);
    expect(errors.baseSalary).toBeTruthy();
    expect(errors.effectiveFrom).toBeTruthy();
  });

  it('returns a payload for valid values', () => {
    const { errors, payload } = validateSalaryRecordForm({
      baseSalary: '1200000',
      bonus: '100000',
      incentives: '50000',
      effectiveFrom: '2024-07-01',
    });

    expect(hasValidationErrors(errors)).toBe(false);
    expect(payload).toEqual({
      baseSalary: 1200000,
      bonus: 100000,
      incentives: 50000,
      effectiveFrom: '2024-07-01',
    });
  });
});
