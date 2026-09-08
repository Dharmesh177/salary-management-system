import { createEmployeeRepository } from '../repositories/employeeRepository.js';
import { createEmployeeSalaryRepository } from '../repositories/employeeSalaryRepository.js';
import { createEmployeeSalaryService } from '../services/employeeSalaryService.js';
import { parseEmployeeSalaryPayload } from '../validators/employeeSalaryPayload.js';

function getEmployeeSalaryService(req) {
  const db = req.app.locals.db;
  const employeeRepository = createEmployeeRepository(db);
  const employeeSalaryRepository = createEmployeeSalaryRepository(db);
  return createEmployeeSalaryService(employeeRepository, employeeSalaryRepository);
}

export async function getEmployeeSalary(req, res, next) {
  try {
    const service = getEmployeeSalaryService(req);
    const salary = await service.getEmployeeSalary(req.params.id);
    res.json({ data: salary });
  } catch (error) {
    next(error);
  }
}

export async function upsertEmployeeSalary(req, res, next) {
  try {
    const service = getEmployeeSalaryService(req);
    const payload = parseEmployeeSalaryPayload(req.body);
    const salary = await service.upsertEmployeeSalary(req.params.id, payload);
    res.json({ data: salary });
  } catch (error) {
    next(error);
  }
}
