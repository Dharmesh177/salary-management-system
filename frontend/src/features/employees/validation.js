import { SUPPORTED_CURRENCIES } from '../employeeSalary/constants.js';
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

export function validateEmployeeForm(values, { includeCompensation = false } = {}) {
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

  if (includeCompensation) {
    const baseSalary = values.baseSalary === '' ? NaN : Number(values.baseSalary);
    const bonus = values.bonus === '' ? 0 : Number(values.bonus);
    const incentives = values.incentives === '' ? 0 : Number(values.incentives);
    const currencyCode = String(values.currencyCode ?? '').trim().toUpperCase();

    if (!Number.isFinite(baseSalary) || baseSalary < 0) {
      errors.baseSalary = EMPLOYEE_MESSAGES.validation.baseSalaryInvalid;
    }

    if (!Number.isFinite(bonus) || bonus < 0) {
      errors.bonus = EMPLOYEE_MESSAGES.validation.bonusInvalid;
    }

    if (!Number.isFinite(incentives) || incentives < 0) {
      errors.incentives = EMPLOYEE_MESSAGES.validation.incentivesInvalid;
    }

    if (!currencyCode || !SUPPORTED_CURRENCIES.includes(currencyCode)) {
      errors.currencyCode = EMPLOYEE_MESSAGES.validation.currencyRequired;
    }
  }

  return errors;
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function buildSalaryPayload(values) {
  return {
    baseSalary: Number(values.baseSalary),
    bonus: values.bonus === '' ? 0 : Number(values.bonus),
    incentives: values.incentives === '' ? 0 : Number(values.incentives),
    currencyCode: String(values.currencyCode).trim().toUpperCase(),
  };
}
