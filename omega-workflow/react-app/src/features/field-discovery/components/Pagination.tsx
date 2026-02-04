/**
 * Pagination Component
 * Pagination controls with items per page dropdown
 */

import React from 'react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
      {/* Items per page dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="items-per-page" className="text-sm text-gray-700">
          Show:
        </label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
            onPageChange(1); // Reset to page 1 when changing items per page
          }}
          className="rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-700">
        Page <span className="font-medium">{currentPage}</span> of{' '}
        <span className="font-medium">{totalPages}</span>
        {' '}({totalItems} total fields)
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
