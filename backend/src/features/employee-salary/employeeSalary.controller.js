import { parseEmployeeSalaryPayload } from './employeeSalary.validator.js';

export async function getEmployeeSalary(req, res, next) {
  try {
    const salary = await req.app.locals.services.employeeSalary.getEmployeeSalary(req.params.id);
    res.json({ data: salary });
  } catch (error) {
    next(error);
  }
}

export async function upsertEmployeeSalary(req, res, next) {
  try {
    const payload = parseEmployeeSalaryPayload(req.body);
    const salary = await req.app.locals.services.employeeSalary.upsertEmployeeSalary(
      req.params.id,
      payload,
    );
    res.json({ data: salary });
  } catch (error) {
    next(error);
  }
}
