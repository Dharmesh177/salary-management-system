import { createEmployeeRepository } from '../repositories/employeeRepository.js';
import { createLookupRepository } from '../repositories/lookupRepository.js';
import { createEmployeeService } from '../services/employeeService.js';
import { parseEmployeeListQuery } from '../validators/employeeListQuery.js';
import { parseEmployeePayload } from '../validators/employeePayload.js';

function getEmployeeService(req) {
  const db = req.app.locals.db;
  const repository = createEmployeeRepository(db);
  const lookupRepository = createLookupRepository(db);
  return createEmployeeService(repository, lookupRepository);
}

export async function listEmployees(req, res, next) {
  try {
    const service = getEmployeeService(req);
    const result = await service.listEmployees(parseEmployeeListQuery(req.query), req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEmployee(req, res, next) {
  try {
    const service = getEmployeeService(req);
    const employee = await service.getEmployeeById(req.params.id, req.user);
    res.json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const service = getEmployeeService(req);
    const payload = parseEmployeePayload(req.body);
    const employee = await service.createEmployee(payload, req.user);
    res.status(201).json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const service = getEmployeeService(req);
    const payload = parseEmployeePayload(req.body);
    const employee = await service.updateEmployee(req.params.id, payload, req.user);
    res.json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const service = getEmployeeService(req);
    await service.deleteEmployee(req.params.id, req.user);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
