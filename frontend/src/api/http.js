const TOKEN_STORAGE_KEY = 'auth_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getAuthHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export async function parseJsonResponse(response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body.message ?? 'Request failed');
    error.code = body.code;
    error.status = response.status;
    throw error;
  }

  return body;
}

export async function sendJson(method, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  return parseJsonResponse(response);
}

export async function fetchJson(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: getAuthHeaders(),
  });

  return parseJsonResponse(response);
}
