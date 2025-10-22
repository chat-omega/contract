import request from 'supertest';
import app from '../app';

describe('Synergy API Tests', () => {
  describe('GET /api/synergy/categories', () => {
    it('should return all synergy categories with 200 status', async () => {
      const response = await request(app).get('/api/synergy/categories');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return categories with proper structure', async () => {
      const response = await request(app).get('/api/synergy/categories');

      expect(response.body.data.length).toBeGreaterThan(0);
      const category = response.body.data[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
      expect(category).toHaveProperty('targets');
      expect(Array.isArray(category.targets)).toBe(true);
    });
  });

  describe('GET /api/synergy/categories/:id', () => {
    let categoryId: string;

    beforeAll(async () => {
      // Get a valid category ID
      const response = await request(app).get('/api/synergy/categories');
      if (response.body.data.length > 0) {
        categoryId = response.body.data[0].id;
      }
    });

    it('should return synergy category by valid ID', async () => {
      if (!categoryId) {
        console.warn('No category ID available for testing');
        return;
      }

      const response = await request(app).get(`/api/synergy/categories/${categoryId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', categoryId);
    });

    it('should return 404 for invalid category ID', async () => {
      const response = await request(app).get('/api/synergy/categories/invalid-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Synergy category not found');
    });
  });

  describe('GET /api/synergy/categories/:id/targets', () => {
    let categoryId: string;

    beforeAll(async () => {
      // Get a valid category ID
      const response = await request(app).get('/api/synergy/categories');
      if (response.body.data.length > 0) {
        categoryId = response.body.data[0].id;
      }
    });

    it('should return targets for a valid category', async () => {
      if (!categoryId) {
        console.warn('No category ID available for testing');
        return;
      }

      const response = await request(app).get(`/api/synergy/categories/${categoryId}/targets`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support filtering and pagination for category targets', async () => {
      if (!categoryId) {
        console.warn('No category ID available for testing');
        return;
      }

      const response = await request(app).get(
        `/api/synergy/categories/${categoryId}/targets?page=1&limit=5`
      );

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should support search filtering for category targets', async () => {
      if (!categoryId) {
        console.warn('No category ID available for testing');
        return;
      }

      const response = await request(app).get(
        `/api/synergy/categories/${categoryId}/targets?search=tech`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 for invalid category ID', async () => {
      const response = await request(app).get('/api/synergy/categories/invalid-id/targets');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Synergy category not found');
    });
  });

  describe('GET /api/synergy/analysis/:targetId', () => {
    let targetId: string;

    beforeAll(async () => {
      // Get a valid target ID from synergy categories
      const response = await request(app).get('/api/synergy/categories');
      if (response.body.data.length > 0 && response.body.data[0].targets.length > 0) {
        targetId = response.body.data[0].targets[0].id;
      }
    });

    it('should return analysis for a valid target', async () => {
      if (!targetId) {
        console.warn('No target ID available for testing');
        return;
      }

      const response = await request(app).get(`/api/synergy/analysis/${targetId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('targetId');
      expect(response.body.data).toHaveProperty('synergies');
      expect(response.body.data).toHaveProperty('strategicFit');
    });

    it('should return 404 for invalid target ID', async () => {
      const response = await request(app).get('/api/synergy/analysis/invalid-target-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Target not found');
    });
  });
});
