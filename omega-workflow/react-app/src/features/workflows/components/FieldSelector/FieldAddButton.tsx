/**
 * FieldAddButton Component
 * Split button with quick add and dropdown menu for group selection
 */

import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { Field } from '@/types';

export interface FieldAddButtonProps {
  field: Field;
  existingGroups: string[];
  onAddToGroup: (field: Field, groupName: string) => void;
  defaultGroup?: string;
}

export const FieldAddButton: React.FC<FieldAddButtonProps> = ({
  field,
  existingGroups,
  onAddToGroup,
  defaultGroup,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Click outside to close dropdown
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewGroupName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  /**
   * Auto-focus input when creating new group
   */
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  /**
   * Quick add to default group
   */
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetGroup = defaultGroup || field.category || 'Other';
    onAddToGroup(field, targetGroup);
  };

  /**
   * Select existing group from dropdown
   */
  const handleSelectGroup = (groupName: string) => {
    onAddToGroup(field, groupName);
    setIsOpen(false);
  };

  /**
   * Create new group and add field
   */
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    onAddToGroup(field, newGroupName.trim());
    setNewGroupName('');
    setIsCreating(false);
    setIsOpen(false);
  };

  /**
   * Cancel creating new group
   */
  const handleCancelCreate = () => {
    setNewGroupName('');
    setIsCreating(false);
  };

  /**
   * Toggle dropdown
   */
  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsCreating(false);
      setNewGroupName('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Split Button */}
      <div className="inline-flex rounded-lg overflow-hidden shadow-sm">
        {/* Left: Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white transition-colors flex items-center gap-1.5"
          title={`Add to ${defaultGroup || field.category || 'Other'}`}
          aria-label="Quick add to default group"
        >
          <PlusIcon className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="w-px bg-primary-700" />

        {/* Right: Dropdown Toggle */}
        <button
          onClick={handleToggleDropdown}
          className="px-2 py-1.5 bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          aria-label="Select group"
          title="Choose different group"
        >
          <ChevronDownIcon className="h-3 w-3" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
          {!isCreating ? (
            <>
              {/* Existing Groups List */}
              {existingGroups.length > 0 && (
                <div className="py-1">
                  {existingGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => handleSelectGroup(group)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {group}
                    </button>
                  ))}
                </div>
              )}

              {/* Divider */}
              {existingGroups.length > 0 && (
                <div className="border-t border-gray-200" />
              )}

              {/* Create New Group Option */}
              <div className="py-1">
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors font-medium"
                >
                  + Create New Group
                </button>
              </div>
            </>
          ) : (
            /* Inline Create Group Form */
            <div className="p-3">
              <div className="mb-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name..."
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateGroup();
                    if (e.key === 'Escape') handleCancelCreate();
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim()}
                  className="flex-1 px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={handleCancelCreate}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldAddButton;
