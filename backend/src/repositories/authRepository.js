import { toAuthUser } from './mappers/auth.js';
import { authQueries } from './queries/authQueries.js';

export function createAuthRepository(db) {
  return {
    async findUserByEmail(email) {
      const row = await db.queryOne(authQueries.findUserByEmail, [email]);
      return toAuthUser(row);
    },

    async findUserById(id) {
      const row = await db.queryOne(authQueries.findUserById, [id]);
      return toAuthUser(row);
    },

    async findUserByEmployeeId(employeeId) {
      return db.queryOne(authQueries.findUserByEmployeeId, [employeeId]);
    },

    async employeeExists(employeeId) {
      const row = await db.queryOne(authQueries.findEmployeeById, [employeeId]);
      return Boolean(row);
    },

    async createUser({ employeeId, email, passwordHash }) {
      const result = await db.execute(authQueries.insertUser, [
        employeeId,
        email,
        passwordHash,
      ]);

      return result.lastInsertRowid;
    },
  };
}
