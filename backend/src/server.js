import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { createApp } from './app.js';
import { config } from './core/config/env.js';
import { createDb } from './core/db/client.js';
import { migrate } from './core/db/migrate.js';
import { logger } from './core/utils/logger.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const sqlitePath = path.resolve(config.sqlitePath);
mkdirSync(path.dirname(sqlitePath), { recursive: true });

const db = createDb({ filename: sqlitePath });
await migrate(db);

const app = createApp({
  db,
  corsOrigin: config.corsOrigin,
  jwtSecret: config.jwtSecret,
  registrationSecret: config.registrationSecret,
  bedrockOptions: {
    region: config.bedrockRegion,
    modelId: config.bedrockModelId,
    timeoutMs: config.bedrockTimeoutMs,
  },
});

const server = app.listen(config.port, () => {
  logger.info('API listening', { port: config.port, nodeEnv: config.nodeEnv });
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  logger.info('shutdown started', { signal });

  const forceExitTimer = setTimeout(() => {
    logger.error('shutdown timed out; forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  server.close((closeError) => {
    if (closeError) {
      logger.error('server close failed', { error: closeError.message });
    }

    try {
      db.close();
    } catch (closeDbError) {
      logger.error('database close failed', { error: closeDbError.message });
    }

    clearTimeout(forceExitTimer);
    logger.info('shutdown complete');
    process.exit(closeError ? 1 : 0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
