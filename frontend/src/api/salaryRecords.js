import { fetchJson, sendJson } from './http.js';

export async function fetchSalaryRecords(employeeId) {
  const body = await fetchJson(`/api/v1/employees/${employeeId}/salary-records`);
  return body.data;
}

export async function createSalaryRecord(employeeId, payload) {
  const body = await sendJson(
    'POST',
    `/api/v1/employees/${employeeId}/salary-records`,
    payload,
  );
  return body.data;
}
