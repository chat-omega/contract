/**
 * WorkflowAssignmentModal Component
 * Modal for assigning workflows to single or multiple documents
 */

import { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button } from '@components/ui';
import { useUIStore } from '@stores/uiStore';
import { useWorkflowStore } from '@stores/workflowStore';
import { useDocumentStore } from '@stores/documentStore';
import { workflowService } from '@services';
import { DocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import type { Document } from '@/types';

export interface WorkflowAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onSuccess?: () => void;
}

export const WorkflowAssignmentModal: React.FC<WorkflowAssignmentModalProps> = ({
  isOpen,
  onClose,
  documents,
  onSuccess,
}) => {
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<number>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);
  const addToast = useUIStore((state) => state.addToast);
  const workflows = useWorkflowStore((state) => state.workflows);
  const updateDocument = useDocumentStore((state) => state.updateDocument);

  const documentCount = documents.length;
  const isSingle = documentCount === 1;

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedWorkflowIds(new Set());
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isAssigning) {
      onClose();
    }
  };

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

  const handleAssign = async () => {
    if (selectedWorkflowIds.size === 0 || documentCount === 0) {
      return;
    }

    setIsAssigning(true);

    try {
      const workflowIdsArray = Array.from(selectedWorkflowIds);
      const documentIds = documents.map((doc) => doc.id);

      // Batch assign workflows to all documents
      await workflowService.batchAssignWorkflows(documentIds, workflowIdsArray);

      // Update documents in store with new workflow assignments
      const workflowNames = workflows
        .filter((wf) => workflowIdsArray.includes(wf.id))
        .map((wf) => wf.name);

      documents.forEach((doc) => {
        updateDocument(doc.id, {
          workflows: workflowIdsArray,
          workflowNames: workflowNames,
        });
      });

      // Show success message
      if (isSingle) {
        addToast(
          'success',
          `${selectedWorkflowIds.size} workflow(s) assigned to "${documents[0].name}"`
        );
      } else {
        addToast(
          'success',
          `${selectedWorkflowIds.size} workflow(s) assigned to ${documentCount} documents`
        );
      }

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error: any) {
      console.error('Failed to assign workflows:', error);
      addToast('error', error.message || 'Failed to assign workflows');
    } finally {
      setIsAssigning(false);
    }
  };

  // Get currently assigned workflows for single document
  const currentWorkflows = isSingle && documents[0].workflowNames
    ? documents[0].workflowNames
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSingle ? 'Assign Workflows' : `Assign Workflows to ${documentCount} Documents`}
      size="lg"
      closeOnOverlayClick={!isAssigning}
    >
      <div className="space-y-6">
        {/* Document List (collapsed for batch) */}
        {!isSingle && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Selected Documents ({documentCount})
            </h4>
            <div className="rounded-lg border border-gray-200 bg-gray-50 max-h-32 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 px-3 py-2">
                    <DocumentIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-700 truncate">{doc.name}</p>
                  </div>
                ))}
                {documentCount > 5 && (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    and {documentCount - 5} more...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Currently Assigned Workflows (for single document) */}
        {isSingle && currentWorkflows.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Currently Assigned
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentWorkflows.map((name, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                >
                  <CheckCircleIconSolid className="h-4 w-4" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Available Workflows */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Select Workflows to Assign
          </h4>

          {workflows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No workflows available</p>
              <p className="text-xs mt-1">Create a workflow first to assign it to documents</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {workflows.map((workflow) => {
                const isSelected = selectedWorkflowIds.has(workflow.id);
                return (
                  <button
                    key={workflow.id}
                    type="button"
                    onClick={() => toggleWorkflow(workflow.id)}
                    disabled={isAssigning}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all
                      ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                      ${isAssigning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isSelected ? (
                        <CheckCircleIconSolid className="h-5 w-5 text-primary-600" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`text-sm font-medium ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                        {workflow.name}
                      </h5>
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
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {selectedWorkflowIds.size > 0 && (
          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>{selectedWorkflowIds.size}</strong> workflow{selectedWorkflowIds.size !== 1 ? 's' : ''}{' '}
              will be assigned to <strong>{documentCount}</strong> document{documentCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Footer with buttons */}
      <ModalFooter className="mt-6 -mx-6 -mb-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleClose}
          disabled={isAssigning}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleAssign}
          disabled={selectedWorkflowIds.size === 0 || isAssigning}
          isLoading={isAssigning}
        >
          {isAssigning ? 'Assigning...' : `Assign ${selectedWorkflowIds.size > 0 ? selectedWorkflowIds.size : ''} Workflow${selectedWorkflowIds.size !== 1 ? 's' : ''}`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default WorkflowAssignmentModal;
