export function parseEmployeeListQuery(query) {
  return {
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    countryId: query.countryId,
    departmentId: query.departmentId,
    designationId: query.designationId,
  };
}
