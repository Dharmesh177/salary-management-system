export async function getDashboardAnalytics(req, res, next) {
  try {
    const data = await req.app.locals.services.dashboard.getAnalytics();
    res.json({ data });
  } catch (error) {
    next(error);
  }
}
