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

export async function fetchSalaryRecords(employeeId) {
  const body = await parseJsonResponse(
    await fetch(`${baseUrl}/api/v1/employees/${employeeId}/salary-records`),
  );
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
