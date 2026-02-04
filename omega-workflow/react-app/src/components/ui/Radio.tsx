/**
 * Radio Component
 * Radio button input with group support using Headless UI
 */

import { RadioGroup as HeadlessRadioGroup } from '@headlessui/react';
import { cn } from '@/utils/cn';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  className,
  orientation = 'vertical',
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <HeadlessRadioGroup value={value} onChange={onChange} disabled={disabled}>
        <div
          className={cn(
            'gap-3',
            orientation === 'vertical' ? 'flex flex-col' : 'flex flex-wrap'
          )}
        >
          {options.map((option) => (
            <HeadlessRadioGroup.Option
              key={option.value}
              value={option.value}
              disabled={option.disabled || disabled}
              className={({ active, checked }) =>
                cn(
                  'relative flex cursor-pointer rounded-lg border px-4 py-3 focus:outline-none',
                  'transition-colors duration-200',
                  active && 'ring-2 ring-primary-500 ring-offset-2',
                  checked
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 bg-white hover:border-gray-400',
                  (option.disabled || disabled) &&
                    'cursor-not-allowed opacity-60'
                )
              }
            >
              {({ checked }) => (
                <div className="flex w-full items-start">
                  <div className="flex items-center h-5">
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                        'transition-colors duration-200',
                        checked
                          ? 'border-primary-600 bg-white'
                          : 'border-gray-300 bg-white'
                      )}
                    >
                      {checked && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <HeadlessRadioGroup.Label
                      as="span"
                      className={cn(
                        'block text-sm font-medium',
                        checked ? 'text-primary-900' : 'text-gray-900'
                      )}
                    >
                      {option.label}
                    </HeadlessRadioGroup.Label>
                    {option.description && (
                      <HeadlessRadioGroup.Description
                        as="span"
                        className={cn(
                          'block text-sm mt-0.5',
                          checked ? 'text-primary-700' : 'text-gray-500'
                        )}
                      >
                        {option.description}
                      </HeadlessRadioGroup.Description>
                    )}
                  </div>
                </div>
              )}
            </HeadlessRadioGroup.Option>
          ))}
        </div>
      </HeadlessRadioGroup>

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
};

// Individual Radio component for cases where you don't need a group
export interface RadioProps {
  label?: string;
  description?: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  description,
  value,
  checked,
  onChange,
  disabled = false,
  name,
  className,
}) => {
  const radioId = `radio-${value}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          type="radio"
          id={radioId}
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="sr-only"
        />
        <label
          htmlFor={radioId}
          className={cn(
            'h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer',
            'transition-colors duration-200',
            'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2',
            disabled && 'cursor-not-allowed opacity-60',
            checked ? 'border-primary-600 bg-white' : 'border-gray-300 bg-white'
          )}
        >
          {checked && <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
        </label>
      </div>

      {(label || description) && (
        <div className="ml-3 flex-1">
          {label && (
            <label
              htmlFor={radioId}
              className={cn(
                'block text-sm font-medium cursor-pointer',
                disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
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
    </div>
  );
};

export default RadioGroup;
