import request from 'supertest';
import app from '../app';

describe('Portfolio API Tests', () => {
  describe('GET /api/portfolio', () => {
    it('should return portfolio data with 200 status', async () => {
      const response = await request(app).get('/api/portfolio');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('companies');
    });

    it('should return proper response structure', async () => {
      const response = await request(app).get('/api/portfolio');

      const { data } = response.body;
      expect(Array.isArray(data.companies)).toBe(true);
      expect(data.companies.length).toBeGreaterThan(0);

      // Check company structure
      const company = data.companies[0];
      expect(company).toHaveProperty('id');
      expect(company).toHaveProperty('name');
      expect(company).toHaveProperty('sector');
      expect(company).toHaveProperty('location');
      expect(company).toHaveProperty('valuation');
    });
  });

  describe('GET /api/portfolio/:id', () => {
    it('should return portfolio by valid ID', async () => {
      // First get the portfolio to get a valid ID
      const portfolioResponse = await request(app).get('/api/portfolio');
      const portfolioId = portfolioResponse.body.data.id;

      const response = await request(app).get(`/api/portfolio/${portfolioId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(portfolioId);
    });

    it('should return 404 for invalid portfolio ID', async () => {
      const response = await request(app).get('/api/portfolio/invalid-id-123');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Portfolio not found');
    });
  });
});
