export const EMPLOYEE_PAGE_SIZE = 10;

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
  baseSalary: '',
  bonus: '0',
  incentives: '0',
  currencyCode: 'INR',
};

export const DEFAULT_EMPLOYEE_FILTERS = {
  search: '',
  countryId: '',
  departmentId: '',
  designationId: '',
};

export const DEFAULT_EMPLOYEE_SORT = {
  sortBy: 'lastName',
  sortOrder: 'asc',
};

export const FILTER_OPTION_LABELS = {
  country: 'All countries',
  department: 'All departments',
  designation: 'All designations',
};

export const EMPLOYEE_TABLE_COLUMNS = [
  { label: 'Employee ID', sortKey: 'employeeCode' },
  { label: 'Name', sortKey: 'lastName' },
  { label: 'Email', sortKey: 'email' },
  { label: 'Joining date', sortKey: 'joiningDate' },
  { label: 'Country', sortKey: 'country' },
  { label: 'Department', sortKey: 'department' },
  { label: 'Designation', sortKey: 'designation' },
];
