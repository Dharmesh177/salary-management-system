export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? 500;
  const code = err.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');
  const message = status === 500 ? 'Internal server error' : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ code, message });
}
