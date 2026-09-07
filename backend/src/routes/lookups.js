import { Router } from 'express';
import {
  listCountries,
  listDepartments,
  listDesignations,
} from '../controllers/lookupController.js';

export const countriesRouter = Router();
countriesRouter.get('/', listCountries);

export const departmentsRouter = Router();
departmentsRouter.get('/', listDepartments);

export const designationsRouter = Router();
designationsRouter.get('/', listDesignations);
