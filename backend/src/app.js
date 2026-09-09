import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServices } from './core/bootstrap/createServices.js';
import { errorHandler } from './core/middleware/errorHandler.js';
import { notFound } from './core/middleware/notFound.js';
import { requestContext } from './core/middleware/requestContext.js';
import { apiRouter } from './core/routes/index.js';

export function createApp({ db, corsOrigin, jwtSecret, registrationSecret }) {
  const app = express();

  app.locals.db = db;
  app.locals.jwtSecret = jwtSecret;
  app.locals.registrationSecret = registrationSecret;
  app.locals.services = createServices(db, { jwtSecret, registrationSecret });

  app.use(requestContext);
  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/v1', apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
