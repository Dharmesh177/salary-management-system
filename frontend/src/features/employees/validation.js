import { EMPLOYEE_MESSAGES } from './messages.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
