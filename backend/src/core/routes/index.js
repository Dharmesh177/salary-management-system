import { Router } from 'express';
import { analyticsChatRouter } from '../../features/analytics-chat/analytics-chat.routes.js';
import { authRouter } from '../../features/auth/auth.routes.js';
import { dashboardRouter } from '../../features/dashboard/dashboard.routes.js';
import { employeeSalaryRouter } from '../../features/employee-salary/employeeSalary.routes.js';
import { employeesRouter } from '../../features/employees/employees.routes.js';
import { healthRouter } from '../../features/health/health.routes.js';
import {
  countriesRouter,
  departmentsRouter,
  designationsRouter,
} from '../../features/lookups/lookups.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/analytics-chat', analyticsChatRouter);
apiRouter.use('/employees', employeesRouter);
apiRouter.use('/employees', employeeSalaryRouter);
apiRouter.use('/countries', countriesRouter);
apiRouter.use('/departments', departmentsRouter);
apiRouter.use('/designations', designationsRouter);
