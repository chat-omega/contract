// Currency formatting utilities for financial dashboard
export function formatCurrency(
  amount: number | string,
  currency: string = 'EUR',
  locale: string = 'en-US'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '—';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

// Format large numbers with K, M, B suffixes
export function formatCompactNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) return '—';

  if (numValue >= 1e9) {
    return `${(numValue / 1e9).toFixed(1)}B`;
  }
  if (numValue >= 1e6) {
    return `${(numValue / 1e6).toFixed(1)}M`;
  }
  if (numValue >= 1e3) {
    return `${(numValue / 1e3).toFixed(1)}K`;
  }
  
  return numValue.toString();
}

// Format percentage values
export function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

// Format revenue strings like "€15M ARR" to numbers
export function parseRevenue(revenueString: string): number {
  if (!revenueString) return 0;
  
  const match = revenueString.match(/([€$£])?([\d.]+)([KMB])?/);
  if (!match) return 0;
  
  const [, , numberPart, suffix] = match;
  let value = parseFloat(numberPart);
  
  switch (suffix) {
    case 'K':
      value *= 1e3;
      break;
    case 'M':
      value *= 1e6;
      break;
    case 'B':
      value *= 1e9;
      break;
  }
  
  return value;
}

// Format employee count
export function formatEmployeeCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k employees`;
  }
  return `${count} employees`;
}

// Get metric trend indicator
export function getMetricTrend(current: number, previous: number): {
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
  isPositive: boolean;
} {
  if (previous === 0) {
    return { percentage: 0, direction: 'neutral', isPositive: true };
  }
  
  const percentage = ((current - previous) / previous) * 100;
  const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
  const isPositive = percentage >= 0;
  
  return { percentage: Math.abs(percentage), direction, isPositive };
}