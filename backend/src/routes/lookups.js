import { Router } from 'express';
import {
  listCountries,
  listDepartments,
  listDesignations,
} from '../controllers/lookupController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';

export const countriesRouter = Router();
countriesRouter.get('/', authenticate, requirePermission('employee:create'), listCountries);

export const departmentsRouter = Router();
departmentsRouter.get('/', authenticate, requirePermission('employee:create'), listDepartments);

export const designationsRouter = Router();
designationsRouter.get('/', authenticate, requirePermission('employee:create'), listDesignations);
