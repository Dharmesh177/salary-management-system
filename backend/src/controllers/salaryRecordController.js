import { createSalaryRecordRepository } from '../repositories/salaryRecordRepository.js';
import { createSalaryRecordService } from '../services/salaryRecordService.js';
import { parseSalaryRecordPayload } from '../validators/salaryRecordPayload.js';

function getSalaryRecordService(req) {
  const repository = createSalaryRecordRepository(req.app.locals.db);
  return createSalaryRecordService(repository);
}

export async function listSalaryRecords(req, res, next) {
  try {
    const service = getSalaryRecordService(req);
    const result = await service.listSalaryRecords(req.params.employeeId, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSalaryRecord(req, res, next) {
  try {
    const service = getSalaryRecordService(req);
    const record = await service.getSalaryRecord(
      req.params.employeeId,
      req.params.salaryRecordId,
      req.user,
    );
    res.json({ data: record });
  } catch (error) {
    next(error);
  }
}

export async function createSalaryRecord(req, res, next) {
  try {
    const service = getSalaryRecordService(req);
    const payload = parseSalaryRecordPayload(req.body);
    const record = await service.createSalaryRecord(req.params.employeeId, payload, req.user);
    res.status(201).json({ data: record });
  } catch (error) {
    next(error);
  }
}
