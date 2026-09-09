import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const repoRoot = path.join(backendRoot, '..');

dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(backendRoot, '.env') });

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isDevelopment = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';
const requireSecrets = process.env.REQUIRE_SECRETS === 'true' || isProduction;

function requiredSecret(name, devFallback) {
  const value = process.env[name];
  if (value) {
    return value;
  }

  if (requireSecrets) {
    throw new Error(`${name} must be set`);
  }

  return devFallback;
}

function requiredCorsOrigin() {
  const value = process.env.CORS_ORIGIN;
  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error('CORS_ORIGIN must be set in production');
  }

  return 'http://localhost:5173';
}

function resolveSqlitePath() {
  const configured = process.env.SQLITE_PATH;
  if (!configured) {
    return path.join(backendRoot, 'data', 'salary.db');
  }
  return path.isAbsolute(configured) ? configured : path.join(backendRoot, configured);
}

export const config = {
  nodeEnv,
  isDevelopment,
  isProduction,
  port: Number(process.env.PORT ?? 3001),
  sqlitePath: resolveSqlitePath(),
  jwtSecret: requiredSecret('JWT_SECRET', 'dev-only-change-me'),
  registrationSecret: requiredSecret('REGISTRATION_SECRET', 'dev-registration-secret'),
  corsOrigin: requiredCorsOrigin(),
  devLoginEmail: process.env.DEV_LOGIN_EMAIL ?? 'mary.jackson@acme.example',
  devLoginPassword: process.env.DEV_LOGIN_PASSWORD ?? 'password123',
  llmApiKey: process.env.LLM_API_KEY ?? '',
};
