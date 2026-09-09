const STORAGE_KEY = 'auth_token';

export function getAccessToken() {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setAccessToken(token) {
  if (token) {
    sessionStorage.setItem(STORAGE_KEY, token);
    return;
  }

  sessionStorage.removeItem(STORAGE_KEY);
}

export function clearAccessToken() {
  sessionStorage.removeItem(STORAGE_KEY);
}
