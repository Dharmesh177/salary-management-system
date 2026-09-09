export function createAppError(definition, extras = {}) {
  const error = new Error(extras.message ?? definition.message);
  error.status = definition.status;
  error.code = definition.code;

  if (extras.details) {
    error.details = extras.details;
  }

  return error;
}
