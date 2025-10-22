import { describe, it, expect } from 'vitest';
import { allPortfolios } from './generated_portfolio_data';

describe('Portfolio Data', () => {
  it('should have megadelta capital as the first portfolio (default)', () => {
    expect(allPortfolios.length).toBeGreaterThan(0);
    expect(allPortfolios[0].id).toBe('megadelta-capital');
    expect(allPortfolios[0].name).toBe('MegaDelta Capital');
  });

  it('should have DST Global in the portfolio list but not as default', () => {
    const dstPortfolio = allPortfolios.find(p => p.id === 'dst-global');
    expect(dstPortfolio).toBeDefined();
    expect(dstPortfolio?.name).toBe('DST Global');
    // DST should not be the first portfolio
    expect(allPortfolios[0].id).not.toBe('dst-global');
  });

  it('should have all expected portfolios', () => {
    expect(allPortfolios.length).toBeGreaterThanOrEqual(6);
    const portfolioIds = allPortfolios.map(p => p.id);
    expect(portfolioIds).toContain('megadelta-capital');
    expect(portfolioIds).toContain('dst-global');
    expect(portfolioIds).toContain('raptor-group');
    expect(portfolioIds).toContain('edelweiss-alternatives');
    expect(portfolioIds).toContain('mcrock-capital');
    expect(portfolioIds).toContain('three-sixty-one-asset-management');
  });
});
