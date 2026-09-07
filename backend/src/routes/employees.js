import { Router } from 'express';
import { getEmployee, listEmployees } from '../controllers/employeeController.js';

export const employeesRouter = Router();

employeesRouter.get('/', listEmployees);
employeesRouter.get('/:id', getEmployee);
