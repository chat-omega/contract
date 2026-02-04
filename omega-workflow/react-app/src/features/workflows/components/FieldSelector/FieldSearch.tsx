/**
 * FieldSearch Component
 * Search input for filtering fields - custom implementation to avoid overlap
 */

import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface FieldSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  isLoading: boolean;
}

export const FieldSearch: React.FC<FieldSearchProps> = ({
  value,
  onChange,
  resultCount,
  isLoading,
}) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Search by name, desc, or ID"
        />
      </div>

      {value && (
        <p className="text-xs text-gray-500">
          {isLoading ? (
            'Searching...'
          ) : (
            <>
              Found <span className="font-medium text-gray-900">{resultCount}</span>{' '}
              {resultCount === 1 ? 'field' : 'fields'}
            </>
          )}
        </p>
      )}
    </div>
  );
};

export default FieldSearch;
