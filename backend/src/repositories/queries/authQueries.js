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
  findRoleByName: `
    SELECT id
    FROM roles
    WHERE name = ?
  `,
  listRolesForUser: `
    SELECT r.name
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = ?
    ORDER BY r.name
  `,
  listPermissionsForUser: `
    SELECT DISTINCT p.name
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = ?
    ORDER BY p.name
  `,
  insertUser: `
    INSERT INTO users (
      employee_id, email, password_hash, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
  `,
  insertUserRole: `
    INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)
  `,
};
