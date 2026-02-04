/**
 * RenameDocumentModal Component
 * Modal for renaming a single document
 */

import { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button, Input } from '@components/ui';
import { useUIStore } from '@stores/uiStore';
import { useDocumentStore } from '@stores/documentStore';
import { documentService } from '@services';
import type { Document } from '@/types';

export interface RenameDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSuccess?: () => void;
}

const MAX_NAME_LENGTH = 255;

export const RenameDocumentModal: React.FC<RenameDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useUIStore((state) => state.addToast);
  const updateDocument = useDocumentStore((state) => state.updateDocument);

  // Reset form when modal opens with new document
  useEffect(() => {
    if (isOpen && document) {
      setName(document.name || '');
    }
  }, [isOpen, document]);

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!document || !name.trim()) {
      return;
    }

    const trimmedName = name.trim();

    // No change check
    if (trimmedName === document.name) {
      handleClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedDoc = await documentService.updateDocument(document.id, {
        name: trimmedName,
      });

      // Update store
      updateDocument(document.id, updatedDoc);

      addToast('success', `Document renamed to "${trimmedName}"`);

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error: any) {
      console.error('Failed to rename document:', error);
      addToast('error', error.message || 'Failed to rename document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = name.trim().length > 0 && name.length <= MAX_NAME_LENGTH;
  const charCount = name.length;
  const hasChanges = document && name.trim() !== document.name;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rename Document"
      size="md"
      closeOnOverlayClick={!isSubmitting}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <Input
              label="Document Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
              disabled={isSubmitting}
              autoFocus
              maxLength={MAX_NAME_LENGTH}
              error={!isValid && charCount > 0 ? 'Document name cannot be empty' : undefined}
            />

            {/* Character Counter */}
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Enter a unique name for this document
              </p>
              <p className={`text-xs ${charCount > MAX_NAME_LENGTH ? 'text-red-600' : 'text-gray-500'}`}>
                {charCount}/{MAX_NAME_LENGTH}
              </p>
            </div>
          </div>

          {/* Original filename reference */}
          {document && (
            <div className="rounded-md bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-700">Original filename:</p>
              <p className="text-sm text-gray-600 mt-1 truncate">{document.filename}</p>
            </div>
          )}
        </div>

        {/* Footer with buttons */}
        <ModalFooter className="mt-6 -mx-6 -mb-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || !hasChanges || isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default RenameDocumentModal;
