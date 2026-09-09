export async function getHealth(req, res, next) {
  try {
    await req.app.locals.db.ping();
    res.json({
      status: 'ok',
      database: 'reachable',
    });
  } catch (error) {
    next(error);
  }
}
