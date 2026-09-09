import { toSalarySnapshot } from './salary.mapper.js';
import { employeeSalaryQueries } from './employeeSalary.queries.js';

export function createEmployeeSalaryRepository(db) {
  return {
    async findByEmployeeId(employeeId) {
      const row = await db.queryOne(employeeSalaryQueries.findByEmployeeId, [employeeId]);
      return toSalarySnapshot(row);
    },

    async currencyExists(currencyCode) {
      const row = await db.queryOne(employeeSalaryQueries.currencyExists, [currencyCode]);
      return Boolean(row);
    },

    async upsertSalary(employeeId, payload) {
      await db.execute(employeeSalaryQueries.upsertSalary, [
        employeeId,
        payload.baseSalary,
        payload.bonus,
        payload.incentives,
        payload.currencyCode,
      ]);

      return this.findByEmployeeId(employeeId);
    },
  };
}
