import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { createDb } from './db/client.js';
import { migrate } from './db/migrate.js';

const sqlitePath = path.resolve(config.sqlitePath);
mkdirSync(path.dirname(sqlitePath), { recursive: true });

const db = createDb({ filename: sqlitePath });
await migrate(db);

const app = createApp({ db, corsOrigin: config.corsOrigin });

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
