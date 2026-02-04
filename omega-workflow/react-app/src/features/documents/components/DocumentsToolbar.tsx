/**
 * DocumentsToolbar Component
 * Contextual toolbar that appears when documents are selected
 * Provides batch operations like delete, assign workflow, export
 */

import { Button } from '@components/ui';
import {
  TrashIcon,
  DocumentArrowDownIcon,
  RectangleStackIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export interface DocumentsToolbarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onExportSelected?: () => void;
  onAssignWorkflow: () => void;
  onClearSelection: () => void;
}

export const DocumentsToolbar: React.FC<DocumentsToolbarProps> = ({
  selectedCount,
  onDeleteSelected,
  onExportSelected,
  onAssignWorkflow,
  onClearSelection,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Selection Count */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {selectedCount} selected
            </span>
            <div className="h-4 w-px bg-gray-300" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAssignWorkflow}
            >
              <RectangleStackIcon className="h-4 w-4 mr-2" />
              Assign Workflow
            </Button>

            {onExportSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportSelected}
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={onDeleteSelected}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-gray-300" />

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title="Clear selection"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsToolbar;
