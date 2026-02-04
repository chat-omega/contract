/**
 * SelectedFields Component
 * Panel showing field groups with fields as inline button chips
 * Matches the vanilla JavaScript design exactly - no expand/collapse, all fields visible
 */

import React, { useState } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';
import type { FieldGroup } from '../../hooks/useFieldSelection';
import type { Field } from '@/types';
import { FieldGroupDialog } from './FieldGroupDialog';

export interface SelectedFieldsProps {
  fieldGroups: FieldGroup;
  onRemoveField: (fieldId: string, groupName: string) => void;
  onRenameGroup: (oldName: string, newName: string) => void;
  onDeleteGroup: (groupName: string) => void;
  totalFieldsCount: number;
}

export const SelectedFields: React.FC<SelectedFieldsProps> = ({
  fieldGroups,
  onRemoveField,
  onRenameGroup,
  onDeleteGroup,
  totalFieldsCount,
}) => {
  const [editingGroup, setEditingGroup] = useState<string | null>(null);

  /**
   * Handle rename group
   */
  const handleRenameGroup = (newName: string) => {
    console.log('Renaming group from', editingGroup, 'to', newName);
    if (editingGroup) {
      onRenameGroup(editingGroup, newName);
      setEditingGroup(null);
    }
  };

  /**
   * Handle edit group click
   */
  const handleEditClick = (e: React.MouseEvent, groupName: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit button clicked for group:', groupName);
    setEditingGroup(groupName);
  };

  /**
   * Handle delete group
   */
  const handleDeleteClick = (e: React.MouseEvent, groupName: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete button clicked for group:', groupName);
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"? All fields in this group will be removed.`)) {
      onDeleteGroup(groupName);
    }
  };

  /**
   * Empty state
   */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No fields selected</h3>
      <p className="mt-1 text-sm text-gray-500">
        Add fields from the Field Search panel on the right
      </p>
    </div>
  );

  /**
   * Field button chip component - small, sleek, rounded grey buttons
   * Matches vanilla design: padding 4px 12px, #f5f5f5 bg, #e0e0e0 border, 16px radius
   */
  const FieldButton: React.FC<{ field: Field; groupName: string }> = ({ field, groupName }) => (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1',
        'bg-gray-50 hover:bg-gray-100',
        'border border-gray-300 rounded-2xl',
        'text-xs text-gray-700',
        'whitespace-nowrap',
        'transition-all duration-150'
      )}
      title={field.name}
    >
      <span className="truncate max-w-[180px]">{field.name}</span>
      <XMarkIcon
        className="h-3 w-3 text-gray-400 hover:text-red-600 flex-shrink-0 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemoveField(field.id, groupName);
        }}
      />
    </div>
  );

  /**
   * Group component - all fields visible, no expand/collapse
   */
  const GroupSection: React.FC<{ groupName: string; fields: Field[] }> = ({
    groupName,
    fields,
  }) => {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
        {/* Group header */}
        <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {groupName}
            </h4>
            <span className="text-xs text-gray-500">
              ({fields.length})
            </span>
          </div>

          {/* Group actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => handleEditClick(e, groupName)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              aria-label="Rename group"
              title="Rename group"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => handleDeleteClick(e, groupName)}
              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              aria-label="Delete group"
              title="Delete group"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Group fields - shown as inline button chips */}
        <div className="bg-white px-3 py-2">
          {fields.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">
              No fields in this group
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {fields.map((field) => (
                <FieldButton key={field.id} field={field} groupName={groupName} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const groupNames = Object.keys(fieldGroups);
  const hasGroups = groupNames.length > 0;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 mb-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-900">
          Fields in this Workflow
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {totalFieldsCount} field{totalFieldsCount !== 1 ? 's' : ''} selected
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {!hasGroups ? (
          <EmptyState />
        ) : (
          <div className="space-y-0">
            {groupNames.map((groupName) => (
              <GroupSection
                key={groupName}
                groupName={groupName}
                fields={fieldGroups[groupName]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <FieldGroupDialog
        isOpen={editingGroup !== null}
        onClose={() => setEditingGroup(null)}
        onSave={handleRenameGroup}
        initialValue={editingGroup || ''}
        title="Rename Field Group"
        existingGroups={groupNames}
      />
    </div>
  );
};

export default SelectedFields;
