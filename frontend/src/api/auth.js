import { sendJson, fetchJson } from './http.js';

export async function login({ email, password }) {
  const body = await sendJson('POST', '/api/v1/auth/login', { email, password });
  return body.data;
}

export async function fetchCurrentUser() {
  const body = await fetchJson('/api/v1/auth/me');
  return body.data;
}
