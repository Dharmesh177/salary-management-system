import { createAuthRepository } from '../repositories/authRepository.js';
import { createAuthService } from '../services/authService.js';
import { parseLoginPayload } from '../validators/loginPayload.js';
import { config } from '../config/env.js';

function getAuthService(req) {
  const db = req.app.locals.db;
  const jwtSecret = req.app.locals.jwtSecret ?? config.jwtSecret;
  const repository = createAuthRepository(db);
  return createAuthService(repository, jwtSecret);
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

export async function getCurrentUser(req, res, next) {
  try {
    res.json({ data: req.user });
  } catch (error) {
    next(error);
  }
}
