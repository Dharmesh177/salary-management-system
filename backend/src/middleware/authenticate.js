import { AUTH_ERRORS } from '../constants/auth.js';
import { createAuthRepository } from '../repositories/authRepository.js';
import { createAuthService } from '../services/authService.js';
import { config } from '../config/env.js';

function createAuthError(definition) {
  const error = new Error(definition.message);
  error.status = definition.status;
  error.code = definition.code;
  return error;
}

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length).trim();
}

export function authenticate(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return next(createAuthError(AUTH_ERRORS.UNAUTHORIZED));
  }

  const db = req.app.locals.db;
  const jwtSecret = req.app.locals.jwtSecret ?? config.jwtSecret;
  const service = createAuthService(createAuthRepository(db), jwtSecret);

  service
    .authenticateToken(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(() => {
      next(createAuthError(AUTH_ERRORS.UNAUTHORIZED));
    });
}
