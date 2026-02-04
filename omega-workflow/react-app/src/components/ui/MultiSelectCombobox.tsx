/**
 * MultiSelectCombobox Component
 * A searchable multi-select dropdown with fuzzy search and custom value support
 */

import React, { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  XMarkIcon,
  PlusIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { fuzzySearch } from '@/utils/fuzzySearch';
import { cn } from '@/utils/cn';

export interface MultiSelectComboboxProps {
  label?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select items...',
  allowCustom = false,
  error,
  helperText,
  disabled = false,
  className,
}) => {
  const [query, setQuery] = useState('');

  // Filter options using fuzzy search
  const filteredOptions = query === ''
    ? options
    : fuzzySearch(options, query);

  // Check if custom value can be added
  const canAddCustom =
    allowCustom &&
    query.trim() !== '' &&
    !options.includes(query.trim()) &&
    !value.includes(query.trim()) &&
    filteredOptions.length === 0;

  // Handle selection - Combobox with multiple=true passes the full array
  const handleChange = (newValue: string[]) => {
    onChange(newValue);
    setQuery(''); // Clear search after selection
  };

  // Handle removing a selected item
  const handleRemove = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <Combobox value={value} onChange={handleChange} disabled={disabled} multiple>
        {({ open }) => (
          <div className="relative">
            {/* Search Input - Entire bar is clickable */}
            <Combobox.Button as="div" className="relative cursor-pointer">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>

              <Combobox.Input
                className={cn(
                  'w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm cursor-pointer',
                  'focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0',
                  'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                )}
                onChange={(event) => {
                  event.stopPropagation();
                  setQuery(event.target.value);
                }}
                onFocus={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                onBlur={() => setQuery('')}
                placeholder={placeholder}
                displayValue={() => query || ''}
                disabled={disabled}
              />

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 z-10">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </div>
            </Combobox.Button>

            {/* Selected Items as Badges */}
            {value.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {value.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800"
                  >
                    {item}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full hover:bg-primary-200 focus:bg-primary-200 focus:outline-none"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown Options */}
            <Transition
              as={Fragment}
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {filteredOptions.length === 0 && !canAddCustom && query !== '' ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                    No results found.
                  </div>
                ) : filteredOptions.length === 0 && query === '' ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-500">
                    Type to search...
                  </div>
                ) : (
                  <>
                    {filteredOptions.map((option) => {
                      const isSelected = value.includes(option);
                      return (
                        <Combobox.Option
                          key={option}
                          value={option}
                          className={({ active }) =>
                            cn(
                              'relative cursor-pointer select-none py-2.5 pl-10 pr-4',
                              active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                            )
                          }
                        >
                          {() => (
                            <>
                              {isSelected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                                  <CheckIcon className="h-5 w-5" />
                                </span>
                              )}
                              <span
                                className={cn(
                                  'block truncate',
                                  isSelected ? 'font-semibold' : 'font-normal'
                                )}
                              >
                                {option}
                              </span>
                            </>
                          )}
                        </Combobox.Option>
                      );
                    })}

                    {/* Add Custom Option */}
                    {canAddCustom && (
                      <>
                        <div className="border-t border-gray-200 my-1" />
                        <Combobox.Option
                          value={query.trim()}
                          className={({ active }) =>
                            cn(
                              'relative cursor-pointer select-none py-2.5 pl-10 pr-4',
                              active ? 'bg-green-50 text-green-900' : 'text-gray-900'
                            )
                          }
                        >
                          {() => (
                            <>
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                <PlusIcon className="h-5 w-5" />
                              </span>
                              <span className="block truncate">
                                Add "{query.trim()}" as custom type
                              </span>
                            </>
                          )}
                        </Combobox.Option>
                      </>
                    )}
                  </>
                )}
              </Combobox.Options>
            </Transition>
          </div>
        )}
      </Combobox>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p
          className={cn(
            'mt-1.5 text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}
        >
          {error || helperText}
        </p>
      )}

      {/* Empty State Hint */}
      {value.length === 0 && !error && !helperText && (
        <p className="mt-1.5 text-sm text-gray-500">
          💡 Click the search box to select or add items
        </p>
      )}
    </div>
  );
};
