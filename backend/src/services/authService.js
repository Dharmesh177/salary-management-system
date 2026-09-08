import bcrypt from 'bcryptjs';
import { AUTH_ERRORS } from '../constants/auth.js';
import { signAccessToken, verifyAccessToken } from '../utils/jwt.js';

function createAuthError(definition) {
  const error = new Error(definition.message);
  error.status = definition.status;
  error.code = definition.code;
  return error;
}

function mapAuthUser(user, roles, permissions) {
  return {
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
    roles,
    permissions,
  };
}

export function createAuthService(authRepository, jwtSecret) {
  async function loadUserContext(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user || !user.isActive) {
      throw createAuthError(AUTH_ERRORS.UNAUTHORIZED);
    }

    const [roles, permissions] = await Promise.all([
      authRepository.listRolesForUser(userId),
      authRepository.listPermissionsForUser(userId),
    ]);

    return mapAuthUser(user, roles, permissions);
  }

  return {
    async login({ email, password }) {
      const user = await authRepository.findUserByEmail(email);

      if (!user) {
        throw createAuthError(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      if (!user.isActive) {
        throw createAuthError(AUTH_ERRORS.USER_INACTIVE);
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        throw createAuthError(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      const [roles, permissions] = await Promise.all([
        authRepository.listRolesForUser(user.id),
        authRepository.listPermissionsForUser(user.id),
      ]);

      const authUser = mapAuthUser(user, roles, permissions);
      const token = signAccessToken({ sub: user.id }, jwtSecret);

      return { token, user: authUser };
    },

    async getCurrentUser(userId) {
      return loadUserContext(userId);
    },

    async authenticateToken(token) {
      const payload = verifyAccessToken(token, jwtSecret);
      return loadUserContext(payload.sub);
    },
  };
}
