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
};
