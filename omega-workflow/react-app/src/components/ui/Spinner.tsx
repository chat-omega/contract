/**
 * Spinner Component
 * Loading spinner with different sizes
 */

import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'border-primary-600',
  className,
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-gray-200',
          `border-t-${color}`,
          sizeStyles[size]
        )}
        style={{ borderTopColor: color.startsWith('#') ? color : undefined }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Full page loading overlay
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
        <Spinner size="xl" />
        {message && <p className="text-gray-700 font-medium">{message}</p>}
      </div>
    </div>
  );
};

export default Spinner;
