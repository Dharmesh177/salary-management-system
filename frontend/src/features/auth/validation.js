import { AUTH_MESSAGES } from './messages.js';

export function validateLoginForm(values) {
  const errors = {};
  const email = String(values.email ?? '').trim();
  const password = String(values.password ?? '');

  if (!email) {
    errors.email = AUTH_MESSAGES.validation.emailRequired;
  }

  if (!password) {
    errors.password = AUTH_MESSAGES.validation.passwordRequired;
  }

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null };
  }

  return {
    errors,
    payload: { email, password },
  };
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
