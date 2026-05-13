import request from 'supertest';

process.env.DB_TYPE = 'postgres';
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT || '5433';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_NAME = 'preventiva_db_test';
process.env.NODE_ENV = 'test';

import { initializeDatabase, AppDataSource } from '../src/database';
import app from '../src/server';
import { seedBase } from './helpers/seed';

let token: string;

beforeAll(async () => {
  await initializeDatabase();
  await AppDataSource.dropDatabase();
  await AppDataSource.synchronize();
  ({ gestorToken: token } = await seedBase());
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

describe('Dashboard', () => {
  test('GET /dashboard/metricas', async () => {
    const res = await request(app).get('/app/dashboard/metricas').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('atrasadas');
  });

  test('GET /dashboard/atrasadas', async () => {
    const res = await request(app).get('/app/dashboard/atrasadas').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /dashboard/disponibilidade', async () => {
    const res = await request(app).get('/app/dashboard/disponibilidade').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('GET /dashboard/top-tecnicos', async () => {
    const res = await request(app).get('/app/dashboard/top-tecnicos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /dashboard/top-equipamentos', async () => {
    const res = await request(app).get('/app/dashboard/top-equipamentos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});


