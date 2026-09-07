export const EMPLOYEE_PAGE_SIZE = 20;

export const EMPLOYEE_ROUTES = {
  directory: '/employees',
  detail: (id) => `/employees/${id}`,
};

export const DEFAULT_EMPLOYEE_FILTERS = {
  search: '',
  countryId: '',
  departmentId: '',
  designationId: '',
};

export const FILTER_OPTION_LABELS = {
  country: 'All countries',
  department: 'All departments',
  designation: 'All designations',
};

export const EMPLOYEE_TABLE_COLUMNS = [
  'Employee ID',
  'Name',
  'Email',
  'Country',
  'Department',
  'Designation',
];
