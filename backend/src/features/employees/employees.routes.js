import { Router } from 'express';
import { authenticate } from '../../core/middleware/authenticate.js';
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from './employee.controller.js';

export const employeesRouter = Router();

employeesRouter.use(authenticate);

employeesRouter.get('/', listEmployees);
employeesRouter.post('/', createEmployee);
employeesRouter.get('/:id', getEmployee);
employeesRouter.put('/:id', updateEmployee);
employeesRouter.delete('/:id', deleteEmployee);
