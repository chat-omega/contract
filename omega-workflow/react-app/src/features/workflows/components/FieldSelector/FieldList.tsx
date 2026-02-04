/**
 * FieldList Component
 * Grid of field cards with pagination controls ABOVE the list
 * Matches the old vanilla JavaScript design
 */

import React from 'react';
import { FieldCard } from './FieldCard';
import { Button } from '@/components/ui/Button';
import type { Field } from '@/types';
import { ITEMS_PER_PAGE_OPTIONS } from '../../hooks/useFieldSelection';

export interface FieldListProps {
  fields: Field[];
  onAddField: (field: Field, groupName: string) => void;
  page: number;
  totalPages: number;
  totalFields: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  isLoading: boolean;
  error: string | null;
  existingGroups: string[];
}

export const FieldList: React.FC<FieldListProps> = ({
  fields,
  onAddField,
  page,
  totalPages,
  totalFields,
  onPageChange,
  limit,
  onLimitChange,
  isLoading,
  error,
  existingGroups,
}) => {
  /**
   * Calculate pagination range
   */
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalFields);

  /**
   * Loading skeleton - single column wide tiles
   */
  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-5/6 mb-3" />
          <div className="flex gap-2">
            <div className="h-5 bg-gray-200 rounded w-16" />
            <div className="h-5 bg-gray-200 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * Empty state
   */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No fields found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search
        </p>
      </div>
    </div>
  );

  /**
   * Error state
   */
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading fields</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <Button
          variant="primary"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  // Show error state
  if (error) {
    return <ErrorState />;
  }

  // Show loading state
  if (isLoading && fields.length === 0) {
    return <LoadingSkeleton />;
  }

  // Show empty state
  if (!isLoading && fields.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Pagination Controls - ABOVE THE LIST */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        {/* Left: Rows per page */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Rows per page:</label>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Pagination info */}
        <div className="text-sm text-gray-700">
          {startIndex}–{endIndex} of {totalFields}
        </div>

        {/* Right: Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1 || isLoading}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
            {page}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>

      {/* Fields list - single column, wide tiles stacked vertically */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              existingGroups={existingGroups}
              onAddToGroup={onAddField}
            />
          ))}
        </div>

        {/* Loading overlay for pagination */}
        {isLoading && fields.length > 0 && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldList;
