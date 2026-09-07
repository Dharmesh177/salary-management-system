import { Router } from 'express';
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from '../controllers/employeeController.js';
import { salaryRecordsRouter } from './salaryRecords.js';

export const employeesRouter = Router();

employeesRouter.get('/', listEmployees);
employeesRouter.post('/', createEmployee);
employeesRouter.use('/:employeeId/salary-records', salaryRecordsRouter);
employeesRouter.get('/:id', getEmployee);
employeesRouter.put('/:id', updateEmployee);
employeesRouter.delete('/:id', deleteEmployee);
