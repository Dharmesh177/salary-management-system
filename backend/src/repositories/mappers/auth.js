export function toAuthUser(row) {
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
