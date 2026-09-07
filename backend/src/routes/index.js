import { Router } from 'express';
import { healthRouter } from './health.js';
import { employeesRouter } from './employees.js';
import { countriesRouter, departmentsRouter, designationsRouter } from './lookups.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/countries', countriesRouter);
apiRouter.use('/departments', departmentsRouter);
apiRouter.use('/designations', designationsRouter);
