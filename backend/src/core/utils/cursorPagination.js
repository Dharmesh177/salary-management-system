export function encodeEmployeeCursor(row) {
  const payload = {
    id: row.id,
    lastName: row.last_name ?? row.lastName,
    firstName: row.first_name ?? row.firstName,
    employeeCode: row.employee_code ?? row.employeeCode,
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeEmployeeCursor(cursor) {
  if (!cursor) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString());
    if (!parsed?.id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
