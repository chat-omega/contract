import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCompactNumber,
  formatPercentage,
  parseRevenue,
  formatEmployeeCount,
  getMetricTrend,
} from './formatters';

describe('formatters utilities', () => {
  describe('formatCurrency', () => {
    it('should format number as currency', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should handle string numbers', () => {
      const result = formatCurrency('2500');
      expect(result).toContain('2');
      expect(result).toContain('500');
    });

    it('should return placeholder for invalid input', () => {
      const result = formatCurrency('invalid');
      expect(result).toBe('—');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format billions', () => {
      expect(formatCompactNumber(2500000000)).toBe('2.5B');
    });

    it('should format millions', () => {
      expect(formatCompactNumber(5600000)).toBe('5.6M');
    });

    it('should format thousands', () => {
      expect(formatCompactNumber(7800)).toBe('7.8K');
    });

    it('should handle numbers below 1000', () => {
      expect(formatCompactNumber(500)).toBe('500');
    });

    it('should handle string input', () => {
      expect(formatCompactNumber('1500000')).toBe('1.5M');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      expect(formatPercentage(15.67)).toBe('15.7%');
    });

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(15.67, 2)).toBe('15.67%');
    });

    it('should handle NaN', () => {
      expect(formatPercentage(NaN)).toBe('—');
    });
  });

  describe('parseRevenue', () => {
    it('should parse millions', () => {
      expect(parseRevenue('€15M ARR')).toBe(15000000);
    });

    it('should parse billions', () => {
      expect(parseRevenue('$2.5B')).toBe(2500000000);
    });

    it('should parse thousands', () => {
      expect(parseRevenue('€750K')).toBe(750000);
    });

    it('should handle plain numbers', () => {
      expect(parseRevenue('1500')).toBe(1500);
    });

    it('should return 0 for empty string', () => {
      expect(parseRevenue('')).toBe(0);
    });
  });

  describe('formatEmployeeCount', () => {
    it('should format large employee counts', () => {
      expect(formatEmployeeCount(2500)).toBe('2.5k employees');
    });

    it('should format small employee counts', () => {
      expect(formatEmployeeCount(250)).toBe('250 employees');
    });
  });

  describe('getMetricTrend', () => {
    it('should calculate positive trend', () => {
      const trend = getMetricTrend(120, 100);
      expect(trend.percentage).toBe(20);
      expect(trend.direction).toBe('up');
      expect(trend.isPositive).toBe(true);
    });

    it('should calculate negative trend', () => {
      const trend = getMetricTrend(80, 100);
      expect(trend.percentage).toBe(20);
      expect(trend.direction).toBe('down');
      expect(trend.isPositive).toBe(false);
    });

    it('should handle zero previous value', () => {
      const trend = getMetricTrend(100, 0);
      expect(trend.percentage).toBe(0);
      expect(trend.direction).toBe('neutral');
      expect(trend.isPositive).toBe(true);
    });

    it('should handle equal values', () => {
      const trend = getMetricTrend(100, 100);
      expect(trend.percentage).toBe(0);
      expect(trend.direction).toBe('neutral');
      expect(trend.isPositive).toBe(true);
    });
  });
});
