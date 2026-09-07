import { buildPaginationMeta, normalizePagination } from '../utils/pagination.js';
import { toEmployeeDetail, toEmployeeListItem } from '../mappers/employeeMapper.js';
import {
  buildEmployeeSearchWhereClause,
  countEmployeesQuery,
  findCurrentSalaryQuery,
  findEmployeeByIdQuery,
  listEmployeesQuery,
} from './queries/employeeQueries.js';

export function createEmployeeRepository(db) {
  return {
    async listEmployees(filters) {
      const { page, pageSize, offset } = normalizePagination(filters);
      const { whereSql, params } = buildEmployeeSearchWhereClause(filters);

      const countRow = await db.queryOne(countEmployeesQuery(whereSql), params);
      const total = countRow?.total ?? 0;

      const rows = await db.query(listEmployeesQuery(whereSql), [...params, pageSize, offset]);

      return {
        data: rows.map(toEmployeeListItem),
        pagination: buildPaginationMeta({ page, pageSize, total }),
      };
    },

    async findEmployeeById(id) {
      const row = await db.queryOne(findEmployeeByIdQuery(), [id]);
      if (!row) {
        return null;
      }

      const salaryRow = await db.queryOne(findCurrentSalaryQuery(), [id]);
      return toEmployeeDetail(row, salaryRow);
    },
  };
}
