import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = path.join(backendRoot, '..');

dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(backendRoot, '.env') });

function requiredInProduction(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (process.env.NODE_ENV === 'production' && !process.env[name]) {
    throw new Error(`${name} must be set in production`);
  }
  return value;
}

function resolveSqlitePath() {
  const configured = process.env.SQLITE_PATH;
  if (!configured) {
    return path.join(backendRoot, 'data', 'salary.db');
  }
  return path.isAbsolute(configured) ? configured : path.join(backendRoot, configured);
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  sqlitePath: resolveSqlitePath(),
  jwtSecret: requiredInProduction('JWT_SECRET', 'dev-only-change-me'),
  registrationSecret: requiredInProduction('REGISTRATION_SECRET', 'dev-registration-secret'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  llmApiKey: process.env.LLM_API_KEY ?? '',
};
