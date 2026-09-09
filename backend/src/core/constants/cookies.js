export const AUTH_COOKIE_NAME = 'auth_token';

export function getAuthCookieOptions({ secure }) {
  return {
    httpOnly: true,
    secure,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  };
}
