export function parseEmployeeId(id) {
  const employeeId = Number.parseInt(id, 10);
  if (!Number.isFinite(employeeId) || employeeId <= 0) {
    return null;
  }
  return employeeId;
}
