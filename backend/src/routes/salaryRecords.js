import { Router } from 'express';
import {
  createSalaryRecord,
  getSalaryRecord,
  listSalaryRecords,
} from '../controllers/salaryRecordController.js';
import { requirePermission } from '../middleware/requirePermission.js';

export const salaryRecordsRouter = Router({ mergeParams: true });

salaryRecordsRouter.get('/', requirePermission('salary:read'), listSalaryRecords);
salaryRecordsRouter.post('/', requirePermission('salary:create'), createSalaryRecord);
salaryRecordsRouter.get('/:salaryRecordId', requirePermission('salary:read'), getSalaryRecord);
