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

export async function fetchEmployees(params = {}) {
  const response = await fetch(`${baseUrl}/api/v1/employees${buildQuery(params)}`);
  return parseJsonResponse(response);
}

export async function fetchEmployee(id) {
  const response = await fetch(`${baseUrl}/api/v1/employees/${id}`);
  const body = await parseJsonResponse(response);
  return body.data;
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
