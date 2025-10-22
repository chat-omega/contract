import request from 'supertest';
import app from '../app';

describe('Targets API Tests', () => {
  describe('GET /api/targets', () => {
    it('should return paginated targets with 200 status', async () => {
      const response = await request(app).get('/api/targets');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return pagination metadata', async () => {
      const response = await request(app).get('/api/targets');

      const { pagination } = response.body;
      expect(pagination).toHaveProperty('page');
      expect(pagination).toHaveProperty('limit');
      expect(pagination).toHaveProperty('total');
      expect(pagination).toHaveProperty('totalPages');
    });

    it('should support pagination parameters', async () => {
      const response = await request(app).get('/api/targets?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should filter by search query', async () => {
      const response = await request(app).get('/api/targets?search=tech');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      // Should return filtered results
    });

    it('should filter by sector', async () => {
      const response = await request(app).get('/api/targets?sector=Technology');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should filter by minStrategicFit', async () => {
      const response = await request(app).get('/api/targets?minStrategicFit=70');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      // All targets should have strategicFit >= 70
      response.body.data.forEach((target: any) => {
        if (target.strategicFit) {
          expect(target.strategicFit).toBeGreaterThanOrEqual(70);
        }
      });
    });

    it('should support sorting', async () => {
      const response = await request(app).get('/api/targets?sortBy=name&sortOrder=asc');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/targets/:id', () => {
    let targetId: string;

    beforeAll(async () => {
      // Get a valid target ID
      const response = await request(app).get('/api/targets');
      if (response.body.data.length > 0) {
        targetId = response.body.data[0].id;
      }
    });

    it('should return target by valid ID', async () => {
      if (!targetId) {
        console.warn('No target ID available for testing');
        return;
      }

      const response = await request(app).get(`/api/targets/${targetId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', targetId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('sector');
    });

    it('should return 404 for invalid target ID', async () => {
      const response = await request(app).get('/api/targets/invalid-target-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Target not found');
    });
  });
});
