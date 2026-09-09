import { Router } from 'express';
import { authenticate } from '../../core/middleware/authenticate.js';
import { getEmployeeSalary, upsertEmployeeSalary } from './employeeSalary.controller.js';

export const employeeSalaryRouter = Router();

employeeSalaryRouter.use(authenticate);

employeeSalaryRouter.get('/:id/salary', getEmployeeSalary);
employeeSalaryRouter.put('/:id/salary', upsertEmployeeSalary);
