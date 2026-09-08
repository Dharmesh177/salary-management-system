import { ROLES } from './constants.js';
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

  return { errors, payload: { email, password } };
}

export function validateRegisterForm(values) {
  const errors = {};
  const email = String(values.email ?? '').trim();
  const password = String(values.password ?? '');
  const registrationSecret = String(values.registrationSecret ?? '').trim();
  const role = String(values.role ?? '').trim();
  const employeeId = Number(values.employeeId);

  if (!registrationSecret) {
    errors.registrationSecret = AUTH_MESSAGES.validation.registrationSecretRequired;
  }

  if (!email) {
    errors.email = AUTH_MESSAGES.validation.emailRequired;
  }

  if (!password) {
    errors.password = AUTH_MESSAGES.validation.passwordRequired;
  }

  if (!values.employeeId) {
    errors.employeeId = AUTH_MESSAGES.validation.employeeIdRequired;
  } else if (!Number.isInteger(employeeId) || employeeId <= 0) {
    errors.employeeId = AUTH_MESSAGES.validation.employeeIdInvalid;
  }

  if (!role || ![ROLES.HR_MANAGER, ROLES.EMPLOYEE].includes(role)) {
    errors.role = AUTH_MESSAGES.validation.roleRequired;
  }

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null };
  }

  return {
    errors,
    payload: {
      email,
      password,
      registrationSecret,
      employeeId,
      role,
    },
  };
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
