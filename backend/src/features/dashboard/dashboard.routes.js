import { Router } from 'express';
import { getDashboardAnalytics } from './dashboard.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get('/analytics', getDashboardAnalytics);
