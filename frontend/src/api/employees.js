const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function parseJsonResponse(response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body.message ?? 'Request failed');
    error.code = body.code;
    error.status = response.status;
    throw error;
  }

  return body;
}

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

async function sendJson(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  return parseJsonResponse(response);
}

export async function fetchEmployees(params = {}) {
  const response = await fetch(`${baseUrl}/api/v1/employees${buildQuery(params)}`);
  return parseJsonResponse(response);
}

export async function fetchEmployee(id) {
  const response = await fetch(`${baseUrl}/api/v1/employees/${id}`);
  const body = await parseJsonResponse(response);
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
    fetch(`${baseUrl}/api/v1/countries`).then(parseJsonResponse),
    fetch(`${baseUrl}/api/v1/departments`).then(parseJsonResponse),
    fetch(`${baseUrl}/api/v1/designations`).then(parseJsonResponse),
  ]);

  return {
    countries: countries.data,
    departments: departments.data,
    designations: designations.data,
  };
}
