import { assertPermission } from '../utils/accessControl.js';

export function requirePermission(permission) {
  return (req, _res, next) => {
    try {
      assertPermission(req.user, permission);
      next();
    } catch (error) {
      next(error);
    }
  };
}
