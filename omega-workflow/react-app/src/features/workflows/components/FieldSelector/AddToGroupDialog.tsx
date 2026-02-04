/**
 * AddToGroupDialog Component
 * Modal for selecting which group to add a field to
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Field } from '@/types';

export interface AddToGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToGroup: (groupName: string) => void;
  onCreateNewGroup: (groupName: string) => void;
  field: Field | null;
  existingGroups: string[];
}

export const AddToGroupDialog: React.FC<AddToGroupDialogProps> = ({
  isOpen,
  onClose,
  onAddToGroup,
  onCreateNewGroup,
  field,
  existingGroups,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  /**
   * Handle add to existing group
   */
  const handleAddToExisting = () => {
    if (!selectedGroup) return;
    onAddToGroup(selectedGroup);
    setSelectedGroup('');
    onClose();
  };

  /**
   * Handle create new group and add
   */
  const handleCreateAndAdd = () => {
    if (!newGroupName.trim()) return;
    onCreateNewGroup(newGroupName.trim());
    setNewGroupName('');
    setIsCreatingNew(false);
    onClose();
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    setSelectedGroup('');
    setNewGroupName('');
    setIsCreatingNew(false);
    onClose();
  };

  if (!isOpen || !field) return null;

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
            <h3 className="text-lg font-semibold text-gray-900">
              Add Field to Group
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Adding: <span className="font-medium">{field.name}</span>
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {!isCreatingNew ? (
              <div className="space-y-4">
                {/* Existing groups list */}
                {existingGroups.length > 0 ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select a group:
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {existingGroups.map((group) => (
                        <label
                          key={group}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="group"
                            value={group}
                            checked={selectedGroup === group}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {group}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No groups exist yet
                  </div>
                )}

                {/* Create new group button */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="w-full px-4 py-2 text-sm text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    + Create New Group
                  </button>
                </div>
              </div>
            ) : (
              /* Create new group form */
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="new-group-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Group Name
                  </label>
                  <input
                    id="new-group-name"
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateAndAdd();
                      if (e.key === 'Escape') setIsCreatingNew(false);
                    }}
                  />
                </div>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back to group selection
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            {!isCreatingNew ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToExisting}
                disabled={!selectedGroup}
              >
                Add to Group
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateAndAdd}
                disabled={!newGroupName.trim()}
              >
                Create & Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddToGroupDialog;
