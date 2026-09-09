import { DEFAULT_EMPLOYEE_SORT, EMPLOYEE_SORT_FIELDS } from './employeeList.constants.js';

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseEmployeeListQuery(query) {
  const sortBy = String(query.sortBy ?? DEFAULT_EMPLOYEE_SORT.sortBy);
  const sortOrder = String(query.sortOrder ?? DEFAULT_EMPLOYEE_SORT.sortOrder).toLowerCase();

  return {
    page: query.page,
    pageSize: query.pageSize,
    cursor: query.cursor ? String(query.cursor) : null,
    search: query.search,
    countryId: parsePositiveInt(query.countryId),
    departmentId: parsePositiveInt(query.departmentId),
    designationId: parsePositiveInt(query.designationId),
    sortBy: EMPLOYEE_SORT_FIELDS[sortBy] ? sortBy : DEFAULT_EMPLOYEE_SORT.sortBy,
    sortOrder: sortOrder === 'desc' ? 'desc' : 'asc',
  };
}
