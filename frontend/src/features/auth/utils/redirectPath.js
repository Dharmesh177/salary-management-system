export function sanitizeRedirectPath(path) {
  if (typeof path !== 'string') {
    return null;
  }

  if (!path.startsWith('/') || path.startsWith('//')) {
    return null;
  }

  return path;
}
