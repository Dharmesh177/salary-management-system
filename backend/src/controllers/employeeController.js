import { createEmployeeRepository } from '../repositories/employeeRepository.js';
import { createEmployeeService } from '../services/employeeService.js';
import { parseEmployeeListQuery } from '../validators/employeeListQuery.js';

function getEmployeeService(req) {
  const repository = createEmployeeRepository(req.app.locals.db);
  return createEmployeeService(repository);
}

export async function listEmployees(req, res, next) {
  try {
    const service = getEmployeeService(req);
    const result = await service.listEmployees(parseEmployeeListQuery(req.query));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEmployee(req, res, next) {
  try {
    const service = getEmployeeService(req);
    const employee = await service.getEmployeeById(req.params.id);
    res.json({ data: employee });
  } catch (error) {
    next(error);
  }
}
