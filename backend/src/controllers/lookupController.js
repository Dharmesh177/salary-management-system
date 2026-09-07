import { createLookupRepository } from '../repositories/lookupRepository.js';
import { createLookupService } from '../services/lookupService.js';

function getLookupService(req) {
  const repository = createLookupRepository(req.app.locals.db);
  return createLookupService(repository);
}

export async function listCountries(req, res, next) {
  try {
    const service = getLookupService(req);
    const data = await service.listCountries();
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listDepartments(req, res, next) {
  try {
    const service = getLookupService(req);
    const data = await service.listDepartments();
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listDesignations(req, res, next) {
  try {
    const service = getLookupService(req);
    const data = await service.listDesignations();
    res.json({ data });
  } catch (error) {
    next(error);
  }
}
