import { AUTH_ERRORS } from '../../features/auth/auth.constants.js';
import { AUTH_COOKIE_NAME } from '../../core/constants/cookies.js';
import { createAppError } from '../../core/utils/createAppError.js';
import { getCookie } from '../../core/utils/cookies.js';

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length).trim();
}

function getAccessToken(req) {
  return getBearerToken(req) ?? getCookie(req, AUTH_COOKIE_NAME);
}

export function authenticate(req, res, next) {
  const token = getAccessToken(req);

  if (!token) {
    return next(createAppError(AUTH_ERRORS.UNAUTHORIZED));
  }

  req.app.locals.services.auth
    .authenticateToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(() => {
      next(createAppError(AUTH_ERRORS.UNAUTHORIZED));
    });
}
