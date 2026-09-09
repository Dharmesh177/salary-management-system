import { parseEmployeeListQuery } from '../validators/employeeListQuery.js';
import { parseEmployeePayload } from '../validators/employeePayload.js';

export async function listEmployees(req, res, next) {
  try {
    const result = await req.app.locals.services.employee.listEmployees(
      parseEmployeeListQuery(req.query),
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEmployee(req, res, next) {
  try {
    const employee = await req.app.locals.services.employee.getEmployeeById(req.params.id);
    res.json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const payload = parseEmployeePayload(req.body);
    const employee = await req.app.locals.services.employee.createEmployee(payload);
    res.status(201).json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const payload = parseEmployeePayload(req.body);
    const employee = await req.app.locals.services.employee.updateEmployee(req.params.id, payload);
    res.json({ data: employee });
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    await req.app.locals.services.employee.deleteEmployee(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
