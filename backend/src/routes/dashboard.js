import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authenticate.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get('/analytics', getDashboardAnalytics);
