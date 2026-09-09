import bcrypt from 'bcryptjs';
import { AUTH_ERRORS } from './auth.constants.js';
import { createAppError } from '../../core/utils/createAppError.js';
import { signAccessToken, verifyAccessToken } from './auth.jwt.js';

function mapAuthUser(user) {
  return {
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
  };
}

export function createAuthService(authRepository, jwtSecret, registrationSecret) {
  async function loadUserContext(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user || !user.isActive) {
      throw createAppError(AUTH_ERRORS.UNAUTHORIZED);
    }

    return mapAuthUser(user);
  }

  return {
    async login({ email, password }) {
      const user = await authRepository.findUserByEmail(email);

      if (!user) {
        throw createAppError(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      if (!user.isActive) {
        throw createAppError(AUTH_ERRORS.USER_INACTIVE);
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        throw createAppError(AUTH_ERRORS.INVALID_CREDENTIALS);
      }

      const authUser = mapAuthUser(user);
      const token = signAccessToken({ sub: user.id }, jwtSecret);

      return { token, user: authUser };
    },

    async register({ email, password, employeeId, registrationSecret: providedSecret }) {
      if (providedSecret !== registrationSecret) {
        throw createAppError(AUTH_ERRORS.REGISTRATION_FORBIDDEN);
      }

      const employeeExists = await authRepository.employeeExists(employeeId);
      if (!employeeExists) {
        throw createAppError(AUTH_ERRORS.EMPLOYEE_NOT_FOUND);
      }

      const [existingEmailUser, existingEmployeeUser] = await Promise.all([
        authRepository.findUserByEmail(email),
        authRepository.findUserByEmployeeId(employeeId),
      ]);

      if (existingEmailUser || existingEmployeeUser) {
        throw createAppError(AUTH_ERRORS.USER_ALREADY_EXISTS);
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = await authRepository.createUser({
        employeeId,
        email,
        passwordHash,
      });

      return loadUserContext(userId);
    },

    async getSession(userId) {
      return loadUserContext(userId);
    },

    async authenticateToken(token) {
      const payload = verifyAccessToken(token, jwtSecret);
      return loadUserContext(payload.sub);
    },
  };
}
