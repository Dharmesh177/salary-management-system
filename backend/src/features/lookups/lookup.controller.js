export async function listCountries(req, res, next) {
  try {
    const data = await req.app.locals.services.lookup.listCountries();
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listDepartments(req, res, next) {
  try {
    const data = await req.app.locals.services.lookup.listDepartments();
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listDesignations(req, res, next) {
  try {
    const data = await req.app.locals.services.lookup.listDesignations();
    res.json({ data });
  } catch (error) {
    next(error);
  }
}
