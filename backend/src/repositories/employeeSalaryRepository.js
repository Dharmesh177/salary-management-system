import { employeeSalaryQueries } from './queries/employeeSalaryQueries.js';

function mapSalary(row) {
  if (!row) {
    return null;
  }

  const baseSalary = Number(row.base_salary);
  const bonus = Number(row.bonus);
  const incentives = Number(row.incentives);

  return {
    id: row.id,
    employeeId: row.employee_id,
    baseSalary,
    bonus,
    incentives,
    currencyCode: row.currency_code,
    totalAmount: baseSalary + bonus + incentives,
    updatedAt: row.updated_at,
  };
}

export function createEmployeeSalaryRepository(db) {
  return {
    async findByEmployeeId(employeeId) {
      const row = await db.queryOne(employeeSalaryQueries.findByEmployeeId, [employeeId]);
      return mapSalary(row);
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
