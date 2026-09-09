import { EMPLOYEE_ERRORS } from './employee.constants.js';
import { DEFAULT_EMPLOYEE_SORT } from './employeeList.constants.js';
import {
  buildPaginationMeta,
  normalizePagination,
} from '../../core/utils/pagination.js';
import { decodeEmployeeCursor, encodeEmployeeCursor } from '../../core/utils/cursorPagination.js';
import { toEmployeeDetail, toEmployeeListItem } from './employee.mapper.js';
import {
  buildEmployeeOrderBy,
  buildEmployeeSearchWhereClause,
  buildKeysetClause,
  countEmployeesQuery,
  createEmployeeQuery,
  deleteEmployeeQuery,
  findCurrentSalaryQuery,
  findEmployeeByCodeQuery,
  findEmployeeByEmailQuery,
  findEmployeeByIdQuery,
  listEmployeesQuery,
  updateEmployeeQuery,
} from './employee.queries.js';

function isUniqueConstraintError(error) {
  return error?.code === 'ERR_SQLITE_CONSTRAINT' || String(error?.message).includes('UNIQUE');
}

function canUseKeysetPagination(filters) {
  return (
    filters.sortBy === DEFAULT_EMPLOYEE_SORT.sortBy &&
    filters.sortOrder === DEFAULT_EMPLOYEE_SORT.sortOrder
  );
}

export function createEmployeeRepository(db) {
  return {
    async listEmployees(filters) {
      const { page, pageSize, offset } = normalizePagination(filters);
      const { whereSql, params } = buildEmployeeSearchWhereClause(filters);
      const cursor = decodeEmployeeCursor(filters.cursor);
      const useKeyset = Boolean(cursor) && canUseKeysetPagination(filters);
      const keyset = useKeyset ? buildKeysetClause(filters.sortOrder, cursor) : { clause: '', params: [] };

      const combinedWhere = whereSql
        ? `${whereSql}${keyset.clause}`
        : keyset.clause
          ? `WHERE 1=1${keyset.clause}`
          : '';
      const queryParams = [...params, ...keyset.params];

      const countRow = await db.queryOne(countEmployeesQuery(combinedWhere), queryParams);
      const total = countRow?.total ?? 0;

      const listParams = useKeyset
        ? [...queryParams, pageSize]
        : [...queryParams, pageSize, offset];

      const rows = await db.query(
        listEmployeesQuery(combinedWhere, buildEmployeeOrderBy(filters), { useOffset: !useKeyset }),
        listParams,
      );

      const items = rows.map(toEmployeeListItem);
      const hasMore = items.length === pageSize && items.length < total;
      const nextCursor =
        hasMore && items.length > 0 ? encodeEmployeeCursor(rows[rows.length - 1]) : null;

      return {
        data: items,
        pagination: buildPaginationMeta({
          page,
          pageSize,
          total,
          nextCursor,
        }),
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

    async findEmployeeIdByCode(employeeCode) {
      const row = await db.queryOne(findEmployeeByCodeQuery(), [employeeCode]);
      return row?.id ?? null;
    },

    async findEmployeeIdByEmail(email) {
      const row = await db.queryOne(findEmployeeByEmailQuery(), [email]);
      return row?.id ?? null;
    },

    async createEmployee(payload) {
      try {
        const result = await db.execute(createEmployeeQuery(), [
          payload.employeeCode,
          payload.firstName,
          payload.lastName,
          payload.email,
          payload.countryId,
          payload.departmentId,
          payload.designationId,
          payload.joiningDate,
        ]);

        return result.lastInsertRowid;
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          const duplicateError = new Error(EMPLOYEE_ERRORS.DUPLICATE.message);
          duplicateError.status = EMPLOYEE_ERRORS.DUPLICATE.status;
          duplicateError.code = EMPLOYEE_ERRORS.DUPLICATE.code;
          throw duplicateError;
        }
        throw error;
      }
    },

    async updateEmployee(id, payload) {
      try {
        const result = await db.execute(updateEmployeeQuery(), [
          payload.employeeCode,
          payload.firstName,
          payload.lastName,
          payload.email,
          payload.countryId,
          payload.departmentId,
          payload.designationId,
          payload.joiningDate,
          id,
        ]);

        return result.changes > 0;
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          const duplicateError = new Error(EMPLOYEE_ERRORS.DUPLICATE.message);
          duplicateError.status = EMPLOYEE_ERRORS.DUPLICATE.status;
          duplicateError.code = EMPLOYEE_ERRORS.DUPLICATE.code;
          throw duplicateError;
        }
        throw error;
      }
    },

    async deleteEmployee(id) {
      const result = await db.execute(deleteEmployeeQuery(), [id]);
      return result.changes > 0;
    },
  };
}
