import { Router } from 'express';
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from '../controllers/employeeController.js';
import {
  getEmployeeSalary,
  upsertEmployeeSalary,
} from '../controllers/employeeSalaryController.js';
import { authenticate } from '../middleware/authenticate.js';

export const employeesRouter = Router();

employeesRouter.use(authenticate);

employeesRouter.get('/', listEmployees);
employeesRouter.post('/', createEmployee);
employeesRouter.get('/:id/salary', getEmployeeSalary);
employeesRouter.put('/:id/salary', upsertEmployeeSalary);
employeesRouter.get('/:id', getEmployee);
employeesRouter.put('/:id', updateEmployee);
employeesRouter.delete('/:id', deleteEmployee);
