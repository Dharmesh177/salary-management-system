export const EMPLOYEE_PAGE_SIZE = 20;

export const EMPLOYEE_ROUTES = {
  directory: '/employees',
  new: '/employees/new',
  detail: (id) => `/employees/${id}`,
  edit: (id) => `/employees/${id}/edit`,
};

export const DEFAULT_EMPLOYEE_FORM = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  countryId: '',
  departmentId: '',
  designationId: '',
  joiningDate: '',
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
  'Joining date',
  'Country',
  'Department',
  'Designation',
];
