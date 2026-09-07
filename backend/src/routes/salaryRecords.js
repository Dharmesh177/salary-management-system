import { Router } from 'express';
import {
  createSalaryRecord,
  getSalaryRecord,
  listSalaryRecords,
} from '../controllers/salaryRecordController.js';

export const salaryRecordsRouter = Router({ mergeParams: true });

salaryRecordsRouter.get('/', listSalaryRecords);
salaryRecordsRouter.post('/', createSalaryRecord);
salaryRecordsRouter.get('/:salaryRecordId', getSalaryRecord);
