import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createTestDb } from './testDb.js';
import { seedEmployeeDirectory } from './employeeFixtures.js';
import { createApp } from '../../src/app.js';

export const TEST_PASSWORD = 'password123';
export const TEST_JWT_SECRET = 'test-jwt-secret';
export const TEST_REGISTRATION_SECRET = 'test-registration-secret';

export async function seedAuthData(db, overrides = {}) {
  const {
    users = [
      {
        employee_id: 1,
        email: 'hr@example.com',
        password: TEST_PASSWORD,
        is_active: 1,
      },
    ],
  } = overrides;

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await db.execute(
      `INSERT INTO users (
        employee_id, email, password_hash, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [user.employee_id, user.email, passwordHash, user.is_active ? 1 : 0],
    );
  }
}

export async function createAuthenticatedTestDb(employeeOverrides = {}, authOverrides = {}) {
  const db = await createTestDb();
  await seedEmployeeDirectory(db, employeeOverrides);
  await seedAuthData(db, authOverrides);
  return db;
}

export async function createAuthedTestApp(employeeOverrides = {}, authOverrides = {}) {
  const db = await createAuthenticatedTestDb(employeeOverrides, authOverrides);
  const app = createApp({
    db,
    corsOrigin: 'http://localhost:5173',
    jwtSecret: TEST_JWT_SECRET,
    registrationSecret: TEST_REGISTRATION_SECRET,
  });

  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'hr@example.com', password: TEST_PASSWORD });

  return {
    db,
    app,
    authToken: login.body.data.token,
    hrToken: login.body.data.token,
  };
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}
