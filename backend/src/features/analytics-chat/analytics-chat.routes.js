import { Router } from 'express';
import { authenticate } from '../../core/middleware/authenticate.js';
import { askAnalyticsQuestion } from './analytics-chat.controller.js';

export const analyticsChatRouter = Router();

analyticsChatRouter.use(authenticate);
analyticsChatRouter.post('/ask', askAnalyticsQuestion);
