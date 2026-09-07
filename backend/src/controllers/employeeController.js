import { createEmployeeRepository } from '../repositories/employeeRepository.js';
import { createEmployeeService } from '../services/employeeService.js';

function getEmployeeService(req) {
  const repository = createEmployeeRepository(req.app.locals.db);
  return createEmployeeService(repository);
}

export async function listEmployees(req, res, next) {
  try {
    const service = getEmployeeService(req);
    const result = await service.listEmployees({
      page: req.query.page,
      pageSize: req.query.pageSize,
      search: req.query.search,
      countryId: req.query.countryId,
      departmentId: req.query.departmentId,
      designationId: req.query.designationId,
    });

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
