/**
 * WorkflowSelector Component
 * Dropdown button for viewing and managing workflow assignments on a document
 * Phase 4 of Sprint 2
 */

import { useState, useEffect, useRef } from 'react';
import { Button, Modal, ModalFooter } from '@components/ui';
import { useUIStore } from '@stores/uiStore';
import { useWorkflowStore } from '@stores/workflowStore';
import { useDocumentStore } from '@stores/documentStore';
import { workflowService, extractionService } from '@services';
import {
  ChevronDownIcon,
  XMarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import type { Document, ExtractionStatus } from '@/types';
import { cn } from '@/utils/cn';

export interface WorkflowSelectorProps {
  document: Document;
  onWorkflowsUpdated: () => void;
}

export const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
  document,
  onWorkflowsUpdated,
}) => {
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<number>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<string | null>(null);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Store hooks
  const addToast = useUIStore((state) => state.addToast);
  const workflows = useWorkflowStore((state) => state.workflows);
  const updateDocument = useDocumentStore((state) => state.updateDocument);

  // Initialize selected workflows from document
  useEffect(() => {
    if (document.workflows) {
      setSelectedWorkflowIds(new Set(document.workflows));
    }
  }, [document.workflows]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (!isAssigning && !showConfirmDialog) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      window.document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isAssigning, showConfirmDialog]);

  // Calculate assigned workflows count
  const assignedCount = document.workflows?.length || 0;

  // Determine which workflows are being added vs removed
  const currentWorkflowIds = new Set(document.workflows || []);
  const addedWorkflows = Array.from(selectedWorkflowIds).filter(
    (id) => !currentWorkflowIds.has(id)
  );
  const removedWorkflows = Array.from(currentWorkflowIds).filter(
    (id) => !selectedWorkflowIds.has(id)
  );

  const hasChanges = addedWorkflows.length > 0 || removedWorkflows.length > 0;
  const hasAddedWorkflows = addedWorkflows.length > 0;

  // Toggle workflow selection
  const toggleWorkflow = (workflowId: number) => {
    setSelectedWorkflowIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workflowId)) {
        newSet.delete(workflowId);
      } else {
        newSet.add(workflowId);
      }
      return newSet;
    });
  };

  // Remove workflow from badge
  const removeWorkflow = (workflowId: number) => {
    setSelectedWorkflowIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(workflowId);
      return newSet;
    });
  };

  // Get workflow details by ID
  const getWorkflowById = (id: number) => {
    return workflows.find((wf) => wf.id === id);
  };

  // Handle save changes (no extraction)
  const handleSaveChanges = async () => {
    if (!hasChanges) {
      setIsOpen(false);
      return;
    }

    setIsAssigning(true);

    try {
      const workflowIdsArray = Array.from(selectedWorkflowIds);

      // Assign workflows to document
      await workflowService.assignWorkflowsToDocument(document.id, workflowIdsArray);

      // Update document in store
      const workflowNames = workflows
        .filter((wf) => workflowIdsArray.includes(wf.id))
        .map((wf) => wf.name);

      updateDocument(document.id, {
        workflows: workflowIdsArray,
        workflowNames: workflowNames,
      });

      // Show success message
      addToast(
        'success',
        `Workflows updated for "${document.name}"`
      );

      // Call callback
      onWorkflowsUpdated();

      // Close dropdown
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to update workflows:', error);
      addToast('error', error.message || 'Failed to update workflows');

      // Revert selection on error
      setSelectedWorkflowIds(new Set(document.workflows || []));
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle save and extract
  const handleSaveAndExtract = () => {
    if (!hasChanges || !hasAddedWorkflows) {
      return;
    }

    setShowConfirmDialog(true);
  };

  // Confirm and start extraction
  const handleConfirmExtract = async () => {
    setShowConfirmDialog(false);
    setIsAssigning(true);

    try {
      const workflowIdsArray = Array.from(selectedWorkflowIds);

      // Step 1: Assign workflows
      await workflowService.assignWorkflowsToDocument(document.id, workflowIdsArray);

      // Update document in store
      const workflowNames = workflows
        .filter((wf) => workflowIdsArray.includes(wf.id))
        .map((wf) => wf.name);

      updateDocument(document.id, {
        workflows: workflowIdsArray,
        workflowNames: workflowNames,
      });

      setIsAssigning(false);

      // Step 2: Start extraction
      setIsExtracting(true);
      setExtractionProgress('Starting extraction...');

      // Use the first workflow ID for extraction
      const firstWorkflowId = workflowIdsArray[0];
      await extractionService.startExtraction(document.id, firstWorkflowId);

      // Step 3: Poll extraction status
      const status = await extractionService.pollExtractionStatus(
        document.id,
        firstWorkflowId,
        (progressStatus: ExtractionStatus) => {
          if (progressStatus.message) {
            setExtractionProgress(progressStatus.message);
          } else if (progressStatus.status === 'processing') {
            setExtractionProgress('Processing document...');
          }
        },
        60, // max 60 attempts
        2000 // poll every 2 seconds
      );

      if (status.status === 'complete') {
        addToast('success', `Extraction completed for "${document.name}"`);
        setExtractionProgress(null);

        // Call callback to refresh extractions
        onWorkflowsUpdated();

        // Close dropdown
        setIsOpen(false);
      } else if (status.status === 'failed') {
        addToast('error', status.message || 'Extraction failed');
        setExtractionProgress(null);
      }
    } catch (error: any) {
      console.error('Failed to extract document:', error);

      if (error.message === 'Extraction polling timeout') {
        addToast('warning', 'Extraction is taking longer than expected. Check back later.');
      } else {
        addToast('error', error.message || 'Failed to start extraction');
      }

      setExtractionProgress(null);
    } finally {
      setIsExtracting(false);
    }
  };

  // Cancel confirmation dialog
  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
  };

  // Get currently selected workflow objects
  const selectedWorkflows = Array.from(selectedWorkflowIds)
    .map((id) => getWorkflowById(id))
    .filter(Boolean);

  return (
    <>
      <div ref={dropdownRef} className="relative inline-block">
        {/* Dropdown Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isAssigning || isExtracting}
          className="flex items-center gap-2"
        >
          <span>Workflows: {assignedCount} assigned</span>
          <ChevronDownIcon
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </Button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-lg border border-gray-200 shadow-lg z-10">
            <div className="max-h-[500px] overflow-y-auto">
              {/* Section 1: Currently Assigned Workflows */}
              {selectedWorkflows.length > 0 && (
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Currently Assigned ({selectedWorkflows.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkflows.map((workflow) => (
                      <span
                        key={workflow!.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        {workflow!.name}
                        <button
                          type="button"
                          onClick={() => removeWorkflow(workflow!.id)}
                          disabled={isAssigning || isExtracting}
                          className="hover:bg-purple-200 rounded-full p-0.5 transition-colors disabled:opacity-50"
                        >
                          <XMarkIcon className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Available Workflows List */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Available Workflows
                </h4>

                {workflows.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No workflows available</p>
                    <p className="text-xs mt-1">
                      Create a workflow first to assign it to documents
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workflows.map((workflow) => {
                      const isSelected = selectedWorkflowIds.has(workflow.id);
                      return (
                        <label
                          key={workflow.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                            isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 bg-white hover:border-gray-300',
                            (isAssigning || isExtracting) && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleWorkflow(workflow.id)}
                            disabled={isAssigning || isExtracting}
                            className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5
                                className={cn(
                                  'text-sm font-medium',
                                  isSelected ? 'text-primary-900' : 'text-gray-900'
                                )}
                              >
                                {workflow.name}
                              </h5>
                              {isSelected && (
                                <CheckCircleIcon className="h-4 w-4 text-primary-600 flex-shrink-0" />
                              )}
                            </div>
                            {workflow.description && (
                              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                {workflow.description}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-gray-400">
                              {(() => {
                                const fieldCount = workflow.fieldCount ?? (
                                  Array.isArray(workflow.fields) ? workflow.fields.length :
                                  (workflow.fields && typeof workflow.fields === 'object') ?
                                  Object.values(workflow.fields).reduce((total: number, fields: any) =>
                                    total + (Array.isArray(fields) ? fields.length : 0), 0) : 0
                                );
                                return `${fieldCount} field${fieldCount !== 1 ? 's' : ''}`;
                              })()}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Extraction Progress */}
              {isExtracting && extractionProgress && (
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="text-sm text-blue-800">{extractionProgress}</p>
                  </div>
                </div>
              )}

              {/* Section 3: Footer Actions */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isAssigning || isExtracting}
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  {/* Save Changes Button (only if changes but no new workflows added) */}
                  {hasChanges && !hasAddedWorkflows && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSaveChanges}
                      disabled={isAssigning || isExtracting}
                      isLoading={isAssigning}
                    >
                      {isAssigning ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}

                  {/* Save & Extract Button (if new workflows added) */}
                  {hasAddedWorkflows && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveAndExtract}
                      disabled={isAssigning || isExtracting}
                      isLoading={isExtracting}
                      className="flex items-center gap-1.5"
                    >
                      {isExtracting ? (
                        'Extracting...'
                      ) : (
                        <>
                          Save & Extract
                          <ArrowRightIcon className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Modal
        isOpen={showConfirmDialog}
        onClose={handleCancelConfirm}
        title="Extract with updated workflows?"
        size="md"
        closeOnOverlayClick={!isAssigning}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-700">
              You are about to assign <strong>{addedWorkflows.length}</strong> new
              workflow{addedWorkflows.length !== 1 ? 's' : ''} and trigger extraction.
            </p>
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Extraction may take several minutes depending on
                document size and complexity.
              </p>
            </div>
          </div>

          {/* Show workflows being added */}
          {addedWorkflows.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                New Workflows:
              </h4>
              <div className="space-y-1">
                {addedWorkflows.map((id) => {
                  const workflow = getWorkflowById(id);
                  return workflow ? (
                    <div
                      key={id}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      {workflow.name}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        <ModalFooter className="mt-6 -mx-6 -mb-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancelConfirm}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmExtract}
            disabled={isAssigning}
            isLoading={isAssigning}
            className="flex items-center gap-1.5"
          >
            {isAssigning ? (
              'Starting...'
            ) : (
              <>
                Confirm & Extract
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default WorkflowSelector;
