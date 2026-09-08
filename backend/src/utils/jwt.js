import jwt from 'jsonwebtoken';
import { TOKEN_EXPIRY } from '../constants/auth.js';

export function signAccessToken(payload, jwtSecret) {
  return jwt.sign(payload, jwtSecret, { expiresIn: TOKEN_EXPIRY });
}

export function verifyAccessToken(token, jwtSecret) {
  return jwt.verify(token, jwtSecret);
}
