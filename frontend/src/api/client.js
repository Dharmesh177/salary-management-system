const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export async function apiGet(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body.message ?? 'Request failed');
    error.code = body.code;
    error.status = response.status;
    throw error;
  }

  return body;
}
