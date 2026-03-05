import request from 'supertest';
import app from '../../app';
import { pool } from '../../config/database';
import { cleanDatabase } from '../setup/test-db';

describe('API Integration Tests', () => {
  // Gunakan data unik agar tidak bentrok dengan sisa test sebelumnya
  const testUser = {
    email: `int_${Date.now()}@test.com`,
    username: `intuser_${Date.now()}`,
    password: 'password123'
  };

  let accessToken: string;
  let userId: string;

  // Cukup bersihkan sekali di awal rangkaian test API ini
  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      userId = res.body.data.user.id;
      accessToken = res.body.data.accessToken;
    });

    it('should not register duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      // Update token untuk test selanjutnya
      accessToken = res.body.data.accessToken;
    });

    it('should get current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testUser.email);
    });
  });

  describe('Story Endpoints', () => {
    let storyId: string;

    it('should create a new story', async () => {
      const res = await request(app)
        .post('/api/v1/stories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Integration Story',
          content: 'Content of the story',
          status: 'draft'
        });

      expect(res.status).toBe(201);
      storyId = res.body.data.id;
    });

    it('should update story', async () => {
      const res = await request(app)
        .put(`/api/v1/stories/${storyId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Title'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
    });

    it('should delete story', async () => {
      const res = await request(app)
        .delete(`/api/v1/stories/${storyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
    });
  });
});