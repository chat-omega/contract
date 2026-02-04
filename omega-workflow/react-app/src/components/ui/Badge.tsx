/**
 * Badge Component
 * Small label/tag component
 */

import { cn } from '@/utils/cn';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger';

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'secondary',
  className,
  children,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
