import { EMPLOYEE_ERRORS } from '../constants/employee.js';
import { buildPaginationMeta, normalizePagination } from '../utils/pagination.js';
import { toEmployeeDetail, toEmployeeListItem } from '../mappers/employeeMapper.js';
import {
  buildEmployeeSearchWhereClause,
  countEmployeesQuery,
  createEmployeeQuery,
  deleteEmployeeQuery,
  findCurrentSalaryQuery,
  findEmployeeByCodeQuery,
  findEmployeeByEmailQuery,
  findEmployeeByIdQuery,
  listEmployeesQuery,
  updateEmployeeQuery,
} from './queries/employeeQueries.js';

function isUniqueConstraintError(error) {
  return error?.code === 'ERR_SQLITE_CONSTRAINT' || String(error?.message).includes('UNIQUE');
}

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
