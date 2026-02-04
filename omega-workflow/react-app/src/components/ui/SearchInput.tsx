/**
 * SearchInput Component
 * Search input with debouncing, clear button, and loading state
 */

import { forwardRef, useState, useEffect, useRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  isLoading?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  showClearButton?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onSearch,
      debounceMs = 300,
      isLoading = false,
      label,
      error,
      helperText,
      fullWidth = true,
      showClearButton = true,
      className,
      disabled,
      placeholder = 'Search...',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `search-${Math.random().toString(36).substr(2, 9)}`;
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce logic
    useEffect(() => {
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer
      timerRef.current = setTimeout(() => {
        setDebouncedValue(value);
      }, debounceMs);

      // Cleanup
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, [value, debounceMs]);

    // Call onSearch when debounced value changes
    useEffect(() => {
      if (onSearch && debouncedValue !== undefined) {
        onSearch(debouncedValue);
      }
    }, [debouncedValue, onSearch]);

    const handleClear = () => {
      onChange('');
      if (onSearch) {
        onSearch('');
      }
    };

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon
              className={cn(
                'h-5 w-5',
                isLoading ? 'text-primary-500' : 'text-gray-400'
              )}
            />
          </div>

          {/* Input */}
          <input
            ref={ref}
            type="text"
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              // Base styles
              'block w-full rounded-lg border pl-10',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60',
              'placeholder:text-gray-400',
              'px-4 py-2 text-base',
              // Variant styles
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
              // Right padding for clear/loading button
              (showClearButton && value) || isLoading ? 'pr-10' : 'pr-4'
            )}
            {...props}
          />

          {/* Clear button or loading spinner */}
          {((showClearButton && value && !isLoading) || isLoading) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-primary-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled}
                  className={cn(
                    'text-gray-400 hover:text-gray-600 focus:outline-none',
                    'focus:ring-2 focus:ring-primary-500 rounded',
                    'disabled:cursor-not-allowed'
                  )}
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>

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
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
