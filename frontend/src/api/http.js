const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function getAuthHeaders() {
  return {};
}

export async function parseJsonResponse(response) {
  const body = await response.json().catch(() => ({}));

  if (response.status === 401 && unauthorizedHandler) {
    unauthorizedHandler();
  }

  if (!response.ok) {
    const error = new Error(body.message ?? 'Request failed');
    error.code = body.code;
    error.status = response.status;
    throw error;
  }

  return body;
}

async function request(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && unauthorizedHandler) {
    unauthorizedHandler();
  }

  if (response.status === 204) {
    return null;
  }

  return parseJsonResponse(response);
}

export async function sendJson(method, path, body) {
  return request(method, path, body);
}

export async function fetchJson(path) {
  return request('GET', path);
}
