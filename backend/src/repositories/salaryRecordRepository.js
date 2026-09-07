import { toSalaryRecord } from '../mappers/salaryRecordMapper.js';
import {
  closeCurrentSalaryRecordQuery,
  employeeExistsQuery,
  findCurrentSalaryRecordQuery,
  findSalaryRecordByIdQuery,
  insertSalaryRecordQuery,
  listSalaryRecordsByEmployeeQuery,
} from './queries/salaryRecordQueries.js';

export function createSalaryRecordRepository(db) {
  return {
    async employeeExists(employeeId) {
      const row = await db.queryOne(employeeExistsQuery(), [employeeId]);
      return Boolean(row);
    },

    async listByEmployeeId(employeeId) {
      const rows = await db.query(listSalaryRecordsByEmployeeQuery(), [employeeId]);
      return rows.map(toSalaryRecord);
    },

    async findById(employeeId, salaryRecordId) {
      const row = await db.queryOne(findSalaryRecordByIdQuery(), [salaryRecordId, employeeId]);
      return row ? toSalaryRecord(row) : null;
    },

    async findCurrentByEmployeeId(employeeId) {
      const row = await db.queryOne(findCurrentSalaryRecordQuery(), [employeeId]);
      return row ? toSalaryRecord(row) : null;
    },

    async createSalaryRecord(employeeId, payload, effectiveToForCurrent) {
      return db.transaction(async () => {
        if (effectiveToForCurrent) {
          await db.execute(closeCurrentSalaryRecordQuery(), [effectiveToForCurrent, employeeId]);
        }

        const result = await db.execute(insertSalaryRecordQuery(), [
          employeeId,
          payload.baseSalary,
          payload.bonus,
          payload.incentives,
          payload.effectiveFrom,
        ]);

        const row = await db.queryOne(findSalaryRecordByIdQuery(), [
          result.lastInsertRowid,
          employeeId,
        ]);

        return toSalaryRecord(row);
      });
    },
  };
}
