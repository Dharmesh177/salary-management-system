import { fetchJson, sendJson } from './http.js';

export async function fetchEmployeeSalary(employeeId) {
  const body = await fetchJson(`/api/v1/employees/${employeeId}/salary`);
  return body.data;
}

export async function upsertEmployeeSalary(employeeId, payload) {
  const body = await sendJson('PUT', `/api/v1/employees/${employeeId}/salary`, payload);
  return body.data;
}
