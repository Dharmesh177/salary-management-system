export const EMPLOYEE_SALARY_ERRORS = {
  NOT_FOUND: {
    message: 'Employee salary not found',
    status: 404,
    code: 'EMPLOYEE_SALARY_NOT_FOUND',
  },
  VALIDATION: {
    message: 'Validation failed',
    status: 400,
    code: 'EMPLOYEE_SALARY_VALIDATION_ERROR',
  },
  INVALID_CURRENCY: {
    message: 'Invalid currency code',
    status: 400,
    code: 'INVALID_CURRENCY_CODE',
  },
};

export const SUPPORTED_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'JPY'];
