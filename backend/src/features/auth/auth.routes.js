import { Router } from 'express';
import { getSession, login, logout, register } from './auth.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/logout', logout);
authRouter.get('/session', authenticate, getSession);
