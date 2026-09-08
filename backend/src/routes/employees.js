import { Router } from 'express';
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from '../controllers/employeeController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/requirePermission.js';
import { salaryRecordsRouter } from './salaryRecords.js';

export const employeesRouter = Router();

employeesRouter.use(authenticate);

employeesRouter.get('/', requirePermission('employee:read'), listEmployees);
employeesRouter.post('/', requirePermission('employee:create'), createEmployee);
employeesRouter.use('/:employeeId/salary-records', salaryRecordsRouter);
employeesRouter.get('/:id', requirePermission('employee:read'), getEmployee);
employeesRouter.put('/:id', requirePermission('employee:update'), updateEmployee);
employeesRouter.delete('/:id', requirePermission('employee:delete'), deleteEmployee);
