import { AUTH_ERRORS } from '../constants/auth.js';

export function parseLoginPayload(body) {
  const email = String(body?.email ?? '').trim().toLowerCase();
  const password = String(body?.password ?? '');

  if (!email || !password) {
    const error = new Error(AUTH_ERRORS.VALIDATION_ERROR.message);
    error.status = AUTH_ERRORS.VALIDATION_ERROR.status;
    error.code = AUTH_ERRORS.VALIDATION_ERROR.code;
    throw error;
  }

  return { email, password };
}
