import { EMPLOYEE_MESSAGES } from './messages.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateEmployeeForm(values) {
  const errors = {};

  if (!values.employeeCode.trim()) {
    errors.employeeCode = EMPLOYEE_MESSAGES.validation.employeeCodeRequired;
  }
  if (!values.firstName.trim()) {
    errors.firstName = EMPLOYEE_MESSAGES.validation.firstNameRequired;
  }
  if (!values.lastName.trim()) {
    errors.lastName = EMPLOYEE_MESSAGES.validation.lastNameRequired;
  }
  if (!values.email.trim()) {
    errors.email = EMPLOYEE_MESSAGES.validation.emailRequired;
  } else if (!isValidEmail(values.email.trim())) {
    errors.email = EMPLOYEE_MESSAGES.validation.emailInvalid;
  }
  if (!values.countryId) {
    errors.countryId = EMPLOYEE_MESSAGES.validation.countryRequired;
  }
  if (!values.departmentId) {
    errors.departmentId = EMPLOYEE_MESSAGES.validation.departmentRequired;
  }
  if (!values.designationId) {
    errors.designationId = EMPLOYEE_MESSAGES.validation.designationRequired;
  }
  if (!values.joiningDate) {
    errors.joiningDate = EMPLOYEE_MESSAGES.validation.joiningDateRequired;
  } else if (!isValidIsoDate(values.joiningDate)) {
    errors.joiningDate = EMPLOYEE_MESSAGES.validation.joiningDateInvalid;
  }

  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
