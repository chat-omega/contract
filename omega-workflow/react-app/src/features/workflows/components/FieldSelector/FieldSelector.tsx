/**
 * FieldSelector Component
 * Main 2-panel layout for field selection
 * Left: Fields in this Workflow (groups)
 * Right: Field Search (available fields with pagination)
 * Matches the old vanilla JavaScript design
 */

import React from 'react';
import { FieldSearch } from './FieldSearch';
import { FieldList } from './FieldList';
import { SelectedFields } from './SelectedFields';
import { useFieldSelection } from '../../hooks/useFieldSelection';
import type { Field } from '@/types';

export interface FieldSelectorProps {
  selectedFields: Field[];
  onFieldsChange: (fields: Field[]) => void;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({
  selectedFields: initialSelectedFields,
  onFieldsChange,
}) => {
  // Use field selection hook
  const fieldSelection = useFieldSelection(initialSelectedFields);

  // Sync selected fields with parent
  React.useEffect(() => {
    onFieldsChange(fieldSelection.selectedFields);
  }, [fieldSelection.selectedFields, onFieldsChange]);

  /**
   * Handle add field - auto-creates group from field category
   */
  const handleAddField = (field: Field, groupName: string) => {
    // Auto-create group if it doesn't exist and add field
    fieldSelection.addFieldToGroup(field, groupName);
  };

  return (
    <div
      className="flex flex-col lg:flex-row gap-6 max-w-[1200px] mx-auto"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      {/* Left Panel - Fields in this Workflow */}
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
        style={{ flex: '0 0 400px' }}
      >
        <div className="p-4 flex flex-col h-full">
          <SelectedFields
            fieldGroups={fieldSelection.fieldGroups}
            onRemoveField={fieldSelection.removeFieldFromGroup}
            onRenameGroup={fieldSelection.renameGroup}
            onDeleteGroup={fieldSelection.deleteGroup}
            totalFieldsCount={fieldSelection.getTotalFieldsCount()}
          />
        </div>
      </div>

      {/* Right Panel - Field Search */}
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col"
        style={{ flex: 1 }}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Header with Search */}
          <div className="mb-6 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Field Search
            </h3>
            <FieldSearch
              value={fieldSelection.searchQuery}
              onChange={fieldSelection.setSearchQuery}
              resultCount={fieldSelection.totalFields}
              isLoading={fieldSelection.isLoading}
            />
          </div>

          {/* Field List with Pagination */}
          <div className="flex-1 min-h-0">
            <FieldList
              fields={fieldSelection.availableFields}
              onAddField={handleAddField}
              page={fieldSelection.page}
              totalPages={fieldSelection.totalPages}
              totalFields={fieldSelection.totalFields}
              onPageChange={fieldSelection.goToPage}
              limit={fieldSelection.limit}
              onLimitChange={fieldSelection.setItemsPerPage}
              isLoading={fieldSelection.isLoading}
              error={fieldSelection.error}
              existingGroups={Object.keys(fieldSelection.fieldGroups)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldSelector;
