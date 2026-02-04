/**
 * DocumentsFilterPanel Component
 * Collapsible filter panel for documents with search and multiple filter types
 */

import { useMemo } from 'react';
import { Input, Button } from '@components/ui';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';
import { debounce } from '@/utils/debounce';
import type { Document, Workflow } from '@/types';

export interface FilterState {
  searchQuery: string;
  documentType: string | null;
  workflowId: number | null;
  uploadedBy: string | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface DocumentsFilterPanelProps {
  isOpen: boolean;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClear: () => void;
  documents: Document[];
  workflows: Workflow[];
}

export const DocumentsFilterPanel: React.FC<DocumentsFilterPanelProps> = ({
  isOpen,
  filters,
  onFilterChange,
  onClear,
  documents,
  workflows,
}) => {
  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        onFilterChange({ ...filters, searchQuery: value });
      }, 300),
    [filters, onFilterChange]
  );

  // Extract unique uploaders from documents
  const uniqueUploaders = useMemo(() => {
    const uploaders = documents
      .map((d) => d.uploadedBy)
      .filter(Boolean) as string[];
    return [...new Set(uploaders)].sort();
  }, [documents]);

  // Extract unique document types
  const documentTypes = useMemo(() => {
    return [...new Set(documents.map((d) => d.doc_type))].sort();
  }, [documents]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.documentType) count++;
    if (filters.workflowId) count++;
    if (filters.uploadedBy) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  return (
    <div
      className={cn(
        'bg-white rounded shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden',
        isOpen ? 'max-h-96 opacity-100 p-4' : 'max-h-0 opacity-0 p-0'
      )}
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <Input
            placeholder="Search documents by name, filename, or type..."
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
            defaultValue={filters.searchQuery}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Document Type Filter */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-1">
              Document Type
            </label>
            <select
              value={filters.documentType || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  documentType: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-[#ff9800]"
            >
              <option value="">All Types</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Workflow Filter */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-1">
              Workflow
            </label>
            <select
              value={filters.workflowId || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  workflowId: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-[#ff9800]"
            >
              <option value="">All Workflows</option>
              {workflows.map((wf) => (
                <option key={wf.id} value={wf.id}>
                  {wf.name}
                </option>
              ))}
            </select>
          </div>

          {/* Uploaded By Filter */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-1">
              Uploaded By
            </label>
            <select
              value={filters.uploadedBy || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  uploadedBy: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-[#e0e0e0] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-[#ff9800]"
            >
              <option value="">All Users</option>
              {uniqueUploaders.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-[#424242] mb-1">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={
                  filters.dateRange.start
                    ? filters.dateRange.start.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      start: e.target.value ? new Date(e.target.value) : null,
                    },
                  })
                }
                className="flex-1 px-2 py-2 border border-[#e0e0e0] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-[#ff9800]"
              />
              <input
                type="date"
                value={
                  filters.dateRange.end
                    ? filters.dateRange.end.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      end: e.target.value ? new Date(e.target.value) : null,
                    },
                  })
                }
                className="flex-1 px-2 py-2 border border-[#e0e0e0] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-[#ff9800]"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-[#757575]">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}{' '}
              active
            </span>
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsFilterPanel;
