export const EMPLOYEE_SALARY_ROUTES = {
  edit: (employeeId) => `/employees/${employeeId}/salary/edit`,
};

export const SUPPORTED_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'JPY'];

export const DEFAULT_EMPLOYEE_SALARY_FORM = {
  baseSalary: '',
  bonus: '0',
  incentives: '0',
  currencyCode: 'INR',
};
