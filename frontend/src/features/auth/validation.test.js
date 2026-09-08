import { describe, expect, it } from 'vitest';
import { DEFAULT_LOGIN_FORM } from './constants.js';
import { hasValidationErrors, validateLoginForm } from './validation.js';

describe('validateLoginForm', () => {
  it('returns errors for missing fields', () => {
    const { errors } = validateLoginForm(DEFAULT_LOGIN_FORM);

    expect(hasValidationErrors(errors)).toBe(true);
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
  });

  it('returns a payload for valid values', () => {
    const { errors, payload } = validateLoginForm({
      email: 'hr@example.com',
      password: 'password123',
    });

    expect(hasValidationErrors(errors)).toBe(false);
    expect(payload).toEqual({
      email: 'hr@example.com',
      password: 'password123',
    });
  });
});
