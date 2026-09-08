import { describe, expect, it } from 'vitest';
import { DEFAULT_LOGIN_FORM } from './constants.js';
import { hasValidationErrors, validateLoginForm } from './validation.js';

describe('auth validation', () => {
  it('requires login credentials', () => {
    const { errors } = validateLoginForm(DEFAULT_LOGIN_FORM);
    expect(hasValidationErrors(errors)).toBe(true);
  });

  it('accepts valid login credentials', () => {
    const { errors, payload } = validateLoginForm({
      email: 'hr@example.com',
      password: 'password123',
    });

    expect(hasValidationErrors(errors)).toBe(false);
    expect(payload.email).toBe('hr@example.com');
  });
});
