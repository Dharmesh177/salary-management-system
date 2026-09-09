import { fetchJson, parseJsonResponse, sendJson } from './http.js';

function buildQuery(params) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function fetchEmployees(params = {}) {
  return fetchJson(`/api/v1/employees${buildQuery(params)}`);
}

export async function fetchEmployee(id) {
  const body = await fetchJson(`/api/v1/employees/${id}`);
  return body.data;
}

export async function createEmployee(payload) {
  const body = await sendJson('POST', '/api/v1/employees', payload);
  return body.data;
}

export async function updateEmployee(id, payload) {
  const body = await sendJson('PUT', `/api/v1/employees/${id}`, payload);
  return body.data;
}

export async function deleteEmployee(id) {
  await sendJson('DELETE', `/api/v1/employees/${id}`);
}

export async function fetchLookups() {
  const [countries, departments, designations] = await Promise.all([
    fetchJson('/api/v1/countries'),
    fetchJson('/api/v1/departments'),
    fetchJson('/api/v1/designations'),
  ]);

  return {
    countries: countries.data,
    departments: departments.data,
    designations: designations.data,
  };
}

export { parseJsonResponse };
