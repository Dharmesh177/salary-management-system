import { AUTH_ERRORS, ROLES } from '../constants/auth.js';

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

export function parseRegisterPayload(body) {
  const email = String(body?.email ?? '').trim().toLowerCase();
  const password = String(body?.password ?? '');
  const registrationSecret = String(body?.registrationSecret ?? '').trim();
  const role = String(body?.role ?? '').trim();
  const employeeId = Number(body?.employeeId);

  if (!email || !password || !registrationSecret || !role || !Number.isInteger(employeeId) || employeeId <= 0) {
    const error = new Error(AUTH_ERRORS.REGISTRATION_VALIDATION_ERROR.message);
    error.status = AUTH_ERRORS.REGISTRATION_VALIDATION_ERROR.status;
    error.code = AUTH_ERRORS.REGISTRATION_VALIDATION_ERROR.code;
    throw error;
  }

  if (![ROLES.HR_MANAGER, ROLES.EMPLOYEE].includes(role)) {
    const error = new Error(AUTH_ERRORS.REGISTRATION_VALIDATION_ERROR.message);
    error.status = AUTH_ERRORS.REGISTRATION_VALIDATION_ERROR.status;
    error.code = AUTH_ERRORS.REGISTRATION_VALIDATION_ERROR.code;
    throw error;
  }

  return { email, password, registrationSecret, role, employeeId };
}
