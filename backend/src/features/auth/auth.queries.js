export const authQueries = {
  findUserByEmail: `
    SELECT
      u.id,
      u.employee_id,
      u.email,
      u.password_hash,
      u.is_active
    FROM users u
    WHERE u.email = ?
  `,
  findUserById: `
    SELECT
      u.id,
      u.employee_id,
      u.email,
      u.is_active
    FROM users u
    WHERE u.id = ?
  `,
  findUserByEmployeeId: `
    SELECT id
    FROM users
    WHERE employee_id = ?
  `,
  findEmployeeById: `
    SELECT id
    FROM employees
    WHERE id = ?
  `,
  insertUser: `
    INSERT INTO users (
      employee_id, email, password_hash, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
  `,
};
