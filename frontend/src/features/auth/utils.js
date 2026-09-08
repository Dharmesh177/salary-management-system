import { ROLES } from './constants.js';

export function isHrManager(user) {
  return user?.roles?.includes(ROLES.HR_MANAGER) ?? false;
}

export function getDefaultRouteForUser(user) {
  if (isHrManager(user)) {
    return '/employees';
  }

  return `/employees/${user.employeeId}`;
}
