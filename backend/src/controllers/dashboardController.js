import { createDashboardRepository } from '../repositories/dashboardRepository.js';
import { createDashboardService } from '../services/dashboardService.js';

function getDashboardService(req) {
  const repository = createDashboardRepository(req.app.locals.db);
  return createDashboardService(repository);
}

export async function getDashboardAnalytics(req, res, next) {
  try {
    const service = getDashboardService(req);
    const data = await service.getAnalytics();
    res.json({ data });
  } catch (error) {
    next(error);
  }
}
