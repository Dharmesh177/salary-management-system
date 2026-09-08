import { createAuthRepository } from '../repositories/authRepository.js';
import { createAuthService } from '../services/authService.js';
import { parseLoginPayload, parseRegisterPayload } from '../validators/authPayload.js';
import { config } from '../config/env.js';

function getAuthService(req) {
  const db = req.app.locals.db;
  const jwtSecret = req.app.locals.jwtSecret ?? config.jwtSecret;
  const registrationSecret = req.app.locals.registrationSecret ?? config.registrationSecret;
  const repository = createAuthRepository(db);
  return createAuthService(repository, jwtSecret, registrationSecret);
}

export async function login(req, res, next) {
  try {
    const service = getAuthService(req);
    const payload = parseLoginPayload(req.body);
    const result = await service.login(payload);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const service = getAuthService(req);
    const payload = parseRegisterPayload(req.body);
    const user = await service.register(payload);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function getSession(req, res, next) {
  try {
    res.json({ data: req.user });
  } catch (error) {
    next(error);
  }
}
