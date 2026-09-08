import { SUPPORTED_CURRENCIES } from './constants.js';
import { EMPLOYEE_SALARY_MESSAGES } from './messages.js';

export function validateEmployeeSalaryForm(values) {
  const errors = {};
  const baseSalary = values.baseSalary === '' ? NaN : Number(values.baseSalary);
  const bonus = values.bonus === '' ? 0 : Number(values.bonus);
  const incentives = values.incentives === '' ? 0 : Number(values.incentives);
  const currencyCode = String(values.currencyCode ?? '').trim().toUpperCase();

  if (!Number.isFinite(baseSalary) || baseSalary < 0) {
    errors.baseSalary = EMPLOYEE_SALARY_MESSAGES.validation.baseSalaryInvalid;
  }

  if (!Number.isFinite(bonus) || bonus < 0) {
    errors.bonus = EMPLOYEE_SALARY_MESSAGES.validation.bonusInvalid;
  }

  if (!Number.isFinite(incentives) || incentives < 0) {
    errors.incentives = EMPLOYEE_SALARY_MESSAGES.validation.incentivesInvalid;
  }

  if (!currencyCode || !SUPPORTED_CURRENCIES.includes(currencyCode)) {
    errors.currencyCode = EMPLOYEE_SALARY_MESSAGES.validation.currencyRequired;
  }

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null };
  }

  return {
    errors,
    payload: {
      baseSalary,
      bonus,
      incentives,
      currencyCode,
    },
  };
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
