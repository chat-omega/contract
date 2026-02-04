/**
 * FieldGroupDialog Component
 * Modal dialog for creating and editing field groups
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface FieldGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupName: string) => void;
  initialValue?: string;
  title?: string;
  existingGroups?: string[];
}

export const FieldGroupDialog: React.FC<FieldGroupDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValue = '',
  title = 'Create New Field Group',
  existingGroups = [],
}) => {
  const [groupName, setGroupName] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  // Reset when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setGroupName(initialValue);
      setError(null);
    }
  }, [isOpen, initialValue]);

  /**
   * Validate group name
   */
  const validateGroupName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Group name cannot be empty';
    }
    if (name.trim().length < 2) {
      return 'Group name must be at least 2 characters';
    }
    if (existingGroups.includes(name.trim()) && name.trim() !== initialValue) {
      return 'A group with this name already exists';
    }
    return null;
  };

  /**
   * Handle save
   */
  const handleSave = () => {
    const validationError = validateGroupName(groupName);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSave(groupName.trim());
    setGroupName('');
    setError(null);
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setGroupName('');
    setError(null);
    onClose();
  };

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="group-name-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Group Name
                </label>
                <input
                  id="group-name-input"
                  type="text"
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter group name..."
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    error
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  )}
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
            >
              {initialValue ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FieldGroupDialog;
