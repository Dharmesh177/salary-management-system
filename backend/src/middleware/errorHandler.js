import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  const status = err.status ?? 500;
  const code = err.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');
  const message = status === 500 ? 'Internal server error' : err.message;

  if (status === 500) {
    logger.error('unhandled application error', {
      requestId: req.requestId,
      code,
      error: err.message,
      stack: err.stack,
    });
  }

  res.status(status).json({ code, message });
}
