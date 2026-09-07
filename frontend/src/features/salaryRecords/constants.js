export const SALARY_RECORD_ROUTES = {
  new: (employeeId) => `/employees/${employeeId}/salary-records/new`,
};

export const DEFAULT_SALARY_RECORD_FORM = {
  baseSalary: '',
  bonus: '0',
  incentives: '0',
  effectiveFrom: '',
};

export const SALARY_HISTORY_COLUMNS = [
  'Effective from',
  'Effective to',
  'Base salary',
  'Bonus',
  'Incentives',
  'Total',
  'Status',
];
