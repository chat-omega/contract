/**
 * Textarea Component
 * Multi-line text input with character count and resize options
 */

import { forwardRef, useState, useEffect } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type TextareaResize = 'none' | 'vertical' | 'both';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: TextareaResize;
  showCharCount?: boolean;
  fullWidth?: boolean;
}

const resizeStyles: Record<TextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  both: 'resize',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      resize = 'vertical',
      showCharCount = false,
      fullWidth = true,
      className,
      disabled,
      id,
      maxLength,
      value,
      onChange,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
      if (showCharCount && value !== undefined) {
        setCharCount(String(value).length);
      }
    }, [value, showCharCount]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharCount) {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          rows={rows}
          className={cn(
            // Base styles
            'block w-full rounded-lg border',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60',
            'placeholder:text-gray-400',
            'px-4 py-2 text-base',
            // Variant styles
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
            // Resize styles
            resizeStyles[resize],
            // Custom className
            className
          )}
          {...props}
        />

        {/* Character count and helper/error text container */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {/* Error message */}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            {/* Helper text */}
            {helperText && !error && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>

          {/* Character count */}
          {showCharCount && (
            <p className="text-sm text-gray-500 whitespace-nowrap">
              {charCount}
              {maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
