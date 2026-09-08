import { authQueries } from './queries/authQueries.js';

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    employeeId: row.employee_id,
    email: row.email,
    passwordHash: row.password_hash,
    isActive: Boolean(row.is_active),
  };
}

export function createAuthRepository(db) {
  return {
    async findUserByEmail(email) {
      const row = await db.queryOne(authQueries.findUserByEmail, [email]);
      return mapUser(row);
    },

    async findUserById(id) {
      const row = await db.queryOne(authQueries.findUserById, [id]);
      return mapUser(row);
    },

    async listRolesForUser(userId) {
      const rows = await db.query(authQueries.listRolesForUser, [userId]);
      return rows.map((row) => row.name);
    },

    async listPermissionsForUser(userId) {
      const rows = await db.query(authQueries.listPermissionsForUser, [userId]);
      return rows.map((row) => row.name);
    },
  };
}
