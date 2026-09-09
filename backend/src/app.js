import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRouter } from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestContext } from './middleware/requestContext.js';
import { createServices } from './services/createServices.js';

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
