import { Router } from 'express';
import { getCurrentUser, login } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/me', authenticate, getCurrentUser);
