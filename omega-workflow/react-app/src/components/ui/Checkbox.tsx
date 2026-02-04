/**
 * Checkbox Component
 * Checkbox input with label, description, and indeterminate state support
 */

import { forwardRef, useEffect, useRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { CheckIcon, MinusIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      indeterminate = false,
      error,
      className,
      disabled,
      checked,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const internalRef = useRef<HTMLInputElement>(null);
    const checkboxRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;

    // Handle indeterminate state
    useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate, checkboxRef]);

    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex items-center h-5">
          <div className="relative">
            <input
              ref={checkboxRef}
              type="checkbox"
              id={checkboxId}
              disabled={disabled}
              checked={checked}
              className={cn(
                'peer h-5 w-5 rounded border appearance-none cursor-pointer',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
                'disabled:cursor-not-allowed disabled:opacity-60',
                error
                  ? 'border-red-500'
                  : checked || indeterminate
                  ? 'bg-primary-600 border-primary-600'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              )}
              {...props}
            />
            {/* Custom checkmark icon */}
            {(checked || indeterminate) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {indeterminate ? (
                  <MinusIcon className="h-3.5 w-3.5 text-white" />
                ) : (
                  <CheckIcon className="h-3.5 w-3.5 text-white" />
                )}
              </div>
            )}
          </div>
        </div>

        {(label || description) && (
          <div className="ml-3 flex-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'block text-sm font-medium',
                  disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        )}

        {error && !description && (
          <p className="ml-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
