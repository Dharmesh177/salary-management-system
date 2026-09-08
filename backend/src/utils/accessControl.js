import { AUTH_ERRORS, ROLES } from '../constants/auth.js';

function createAuthError(definition) {
  const error = new Error(definition.message);
  error.status = definition.status;
  error.code = definition.code;
  return error;
}

export function isHrManager(user) {
  return user?.roles?.includes(ROLES.HR_MANAGER) ?? false;
}

export function hasPermission(user, permission) {
  return user?.permissions?.includes(permission) ?? false;
}

export function assertPermission(user, permission) {
  if (!hasPermission(user, permission)) {
    throw createAuthError(AUTH_ERRORS.FORBIDDEN);
  }
}

export function assertEmployeeAccess(user, employeeId) {
  if (isHrManager(user)) {
    return;
  }

  if (user.employeeId === employeeId) {
    return;
  }

  throw createAuthError(AUTH_ERRORS.FORBIDDEN);
}

export function assertHrManager(user) {
  if (!isHrManager(user)) {
    throw createAuthError(AUTH_ERRORS.FORBIDDEN);
  }
}
