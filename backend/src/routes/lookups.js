import { Router } from 'express';
import {
  listCountries,
  listDepartments,
  listDesignations,
} from '../controllers/lookupController.js';
import { authenticate } from '../middleware/authenticate.js';

export const countriesRouter = Router();
countriesRouter.get('/', authenticate, listCountries);

export const departmentsRouter = Router();
departmentsRouter.get('/', authenticate, listDepartments);

export const designationsRouter = Router();
designationsRouter.get('/', authenticate, listDesignations);
