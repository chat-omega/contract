/**
 * DeleteDocumentModal Component
 * Modal for deleting single or multiple documents with confirmation
 */

import { useState } from 'react';
import { Modal, ModalFooter, Button } from '@components/ui';
import { useUIStore } from '@stores/uiStore';
import { useDocumentStore } from '@stores/documentStore';
import { documentService } from '@services';
import { ExclamationTriangleIcon, DocumentIcon } from '@heroicons/react/24/outline';
import type { Document } from '@/types';

export interface DeleteDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onSuccess?: () => void;
}

export const DeleteDocumentModal: React.FC<DeleteDocumentModalProps> = ({
  isOpen,
  onClose,
  documents,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const addToast = useUIStore((state) => state.addToast);
  const removeDocument = useDocumentStore((state) => state.removeDocument);
  const clearSelection = useDocumentStore((state) => state.clearSelection);

  const documentCount = documents.length;
  const isSingle = documentCount === 1;

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (documentCount === 0) {
      return;
    }

    setIsDeleting(true);

    try {
      // Delete all documents in parallel
      const deletePromises = documents.map((doc) =>
        documentService.deleteDocument(doc.id)
      );

      await Promise.all(deletePromises);

      // Remove from store
      documents.forEach((doc) => {
        removeDocument(doc.id);
      });

      // Clear selection
      clearSelection();

      // Show success message
      if (isSingle) {
        addToast('success', `Document "${documents[0].name}" deleted successfully`);
      } else {
        addToast('success', `${documentCount} documents deleted successfully`);
      }

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error: any) {
      console.error('Failed to delete documents:', error);
      addToast('error', error.message || 'Failed to delete documents');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      closeOnOverlayClick={!isDeleting}
    >
      <div className="space-y-4">
        {/* Warning Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {isSingle ? 'Delete Document?' : `Delete ${documentCount} Documents?`}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {isSingle
                ? 'This action cannot be undone. The document will be permanently removed from the system.'
                : 'This action cannot be undone. All selected documents will be permanently removed from the system.'}
            </p>
          </div>
        </div>

        {/* Document List */}
        <div className="mt-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 max-h-60 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                >
                  <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{doc.filename}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {doc.doc_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="rounded-md bg-red-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">Warning</h4>
              <p className="mt-1 text-sm text-red-700">
                Deleting {isSingle ? 'this document' : 'these documents'} will also remove:
              </p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                <li>All extraction results and field data</li>
                <li>Workflow assignments</li>
                <li>Document history and metadata</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with buttons */}
      <ModalFooter className="mt-6 -mx-6 -mb-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
          isLoading={isDeleting}
        >
          {isDeleting
            ? 'Deleting...'
            : isSingle
            ? 'Delete Document'
            : `Delete ${documentCount} Documents`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteDocumentModal;
