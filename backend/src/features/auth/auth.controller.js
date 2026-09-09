import { config } from '../../core/config/env.js';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '../../core/constants/cookies.js';
import { parseLoginPayload, parseRegisterPayload } from './auth.validator.js';
import { clearCookie, serializeCookie } from '../../core/utils/cookies.js';

function setAuthCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions({ secure: config.isProduction })),
  );
}

export async function login(req, res, next) {
  try {
    const payload = parseLoginPayload(req.body);
    const result = await req.app.locals.services.auth.login(payload);
    setAuthCookie(res, result.token);
    res.json({ data: { user: result.user, token: result.token } });
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const payload = parseRegisterPayload(req.body);
    const user = await req.app.locals.services.auth.register(payload);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req, res) {
  res.setHeader(
    'Set-Cookie',
    clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions({ secure: config.isProduction })),
  );
  res.status(204).send();
}

export async function getSession(req, res, next) {
  try {
    res.json({ data: req.user });
  } catch (error) {
    next(error);
  }
}
