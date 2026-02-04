/**
 * MetricChart Component
 * Displays a line chart for credit metrics (POD, Spread)
 */

import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { cn } from '@/utils/cn';

interface MetricChartProps {
  title: string;
  value: string;
  subtitle: string;
  change: string;
  timeSeries: {
    labels: string[];
    values: number[];
  };
  color?: 'red' | 'indigo' | 'green' | 'orange';
}

export const MetricChart: React.FC<MetricChartProps> = ({
  title,
  value,
  subtitle,
  change,
  timeSeries,
  color = 'indigo',
}) => {
  // Determine if change is positive or negative
  const isPositiveChange = change.startsWith('+');
  const isNegativeChange = change.startsWith('-');

  // Color configurations
  const colorConfig = {
    red: {
      line: '#ef4444',
      fill: 'rgba(239, 68, 68, 0.1)',
      gradient: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0)'],
    },
    indigo: {
      line: '#6366f1',
      fill: 'rgba(99, 102, 241, 0.1)',
      gradient: ['rgba(99, 102, 241, 0.3)', 'rgba(99, 102, 241, 0)'],
    },
    green: {
      line: '#22c55e',
      fill: 'rgba(34, 197, 94, 0.1)',
      gradient: ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0)'],
    },
    orange: {
      line: '#f97316',
      fill: 'rgba(249, 115, 22, 0.1)',
      gradient: ['rgba(249, 115, 22, 0.3)', 'rgba(249, 115, 22, 0)'],
    },
  };

  const colors = colorConfig[color];

  // Format data for recharts
  const chartData = timeSeries.labels.map((label, index) => ({
    name: label,
    value: timeSeries.values[index],
  }));

  return (
    <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
      {/* Header */}
      <h4 className="text-sm font-medium text-[#757575] mb-2">{title}</h4>

      {/* Value and Change */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-2xl font-bold text-[#212121]">{value}</span>
        <span
          className={cn(
            'text-sm font-medium',
            isPositiveChange && 'text-red-500',
            isNegativeChange && 'text-green-500',
            !isPositiveChange && !isNegativeChange && 'text-gray-500'
          )}
        >
          {change}
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-[#757575] mb-4">{subtitle}</p>

      {/* Chart */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.gradient[0]} />
                <stop offset="95%" stopColor={colors.gradient[1]} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#757575' }}
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#757575' }}
              axisLine={{ stroke: '#e0e0e0' }}
              tickLine={false}
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, title]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.line}
              strokeWidth={2}
              fill={`url(#gradient-${color})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricChart;
