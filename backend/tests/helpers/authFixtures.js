import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createTestDb } from './testDb.js';
import { seedEmployeeDirectory } from './employeeFixtures.js';
import { createApp } from '../../src/app.js';

export const TEST_PASSWORD = 'password123';
export const TEST_JWT_SECRET = 'test-jwt-secret';

export const ROLES = {
  HR_MANAGER: 'HR_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export async function seedAuthData(db, overrides = {}) {
  const {
    users = [
      {
        employee_id: 1,
        email: 'hr@example.com',
        password: TEST_PASSWORD,
        role: ROLES.HR_MANAGER,
        is_active: 1,
      },
      {
        employee_id: 2,
        email: 'employee@example.com',
        password: TEST_PASSWORD,
        role: ROLES.EMPLOYEE,
        is_active: 1,
      },
    ],
  } = overrides;

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const result = await db.execute(
      `INSERT INTO users (
        employee_id, email, password_hash, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [user.employee_id, user.email, passwordHash, user.is_active ? 1 : 0],
    );

    const role = await db.queryOne('SELECT id FROM roles WHERE name = ?', [user.role]);
    await db.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [
      result.lastInsertRowid,
      role.id,
    ]);
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
  });

  const hrLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'hr@example.com', password: TEST_PASSWORD });

  const employeeLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'employee@example.com', password: TEST_PASSWORD });

  return {
    db,
    app,
    hrToken: hrLogin.body.data.token,
    employeeToken: employeeLogin.body.data.token,
  };
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

