import { EMPLOYEE_ERRORS } from '../constants/employee.js';
import { isValidIsoDate } from '../utils/date.js';

function createValidationError(details) {
  const error = new Error(EMPLOYEE_ERRORS.VALIDATION.message);
  error.status = EMPLOYEE_ERRORS.VALIDATION.status;
  error.code = EMPLOYEE_ERRORS.VALIDATION.code;
  error.details = details;
  return error;
}

function normalizeString(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

function parseLookupId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parseEmployeePayload(body) {
  const payload = {
    employeeCode: normalizeString(body.employeeCode),
    firstName: normalizeString(body.firstName),
    lastName: normalizeString(body.lastName),
    email: normalizeString(body.email),
    countryId: parseLookupId(body.countryId),
    departmentId: parseLookupId(body.departmentId),
    designationId: parseLookupId(body.designationId),
    joiningDate: normalizeString(body.joiningDate),
  };

  const details = [];

  if (!payload.employeeCode) {
    details.push('employeeCode is required');
  }
  if (!payload.firstName) {
    details.push('firstName is required');
  }
  if (!payload.lastName) {
    details.push('lastName is required');
  }
  if (!payload.email) {
    details.push('email is required');
  } else if (!isValidEmail(payload.email)) {
    details.push('email is invalid');
  }
  if (!payload.countryId) {
    details.push('countryId is required');
  }
  if (!payload.departmentId) {
    details.push('departmentId is required');
  }
  if (!payload.designationId) {
    details.push('designationId is required');
  }
  if (!payload.joiningDate) {
    details.push('joiningDate is required');
  } else if (!isValidIsoDate(payload.joiningDate)) {
    details.push('joiningDate is invalid');
  }

  if (details.length > 0) {
    throw createValidationError(details);
  }

  return payload;
}
