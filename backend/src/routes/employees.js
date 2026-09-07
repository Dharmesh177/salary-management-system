import { Router } from 'express';
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from '../controllers/employeeController.js';

export const employeesRouter = Router();

employeesRouter.get('/', listEmployees);
employeesRouter.post('/', createEmployee);
employeesRouter.get('/:id', getEmployee);
employeesRouter.put('/:id', updateEmployee);
employeesRouter.delete('/:id', deleteEmployee);
