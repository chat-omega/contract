/**
 * ExportModal Component
 * Modal for exporting single or multiple documents with extraction data
 */

import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalFooter, Button } from '@components/ui';
import { useUIStore } from '@stores/uiStore';
import { exportService } from '@services';
import {
  DocumentArrowDownIcon,
  DocumentIcon,
  CheckIcon,
  TableCellsIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import type { Document, ExtractionResult } from '@/types';
import type { ExportFormat } from '@services/exportService';

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  extractions: ExtractionResult[];
  mode: 'single' | 'batch';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  documents,
  extractions,
  mode,
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeExtractions, setIncludeExtractions] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const addToast = useUIStore((state) => state.addToast);

  const documentCount = documents.length;
  const isSingle = mode === 'single';

  // Extract unique field names from all extractions
  const availableFields = useMemo(() => {
    const fields = new Map<string, string>(); // field_id -> field_name

    extractions.forEach((extraction) => {
      // Guard against undefined results
      if (!extraction.results) return;

      Object.entries(extraction.results).forEach(([fieldId, fieldExtraction]) => {
        const fieldName = fieldExtraction.field_name || fieldId;
        fields.set(fieldId, fieldName);
      });
    });

    return Array.from(fields.entries()).map(([id, name]) => ({ id, name }));
  }, [extractions]);

  const hasExtractions = extractions.length > 0 && availableFields.length > 0;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormat('csv');
      setIncludeExtractions(false);
      setSelectedFields(new Set());
    }
  }, [isOpen]);

  // Auto-select all fields when includeExtractions is enabled
  useEffect(() => {
    if (includeExtractions && availableFields.length > 0) {
      setSelectedFields(new Set(availableFields.map((f) => f.id)));
    } else if (!includeExtractions) {
      setSelectedFields(new Set());
    }
  }, [includeExtractions, availableFields]);

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const handleExport = async () => {
    if (documentCount === 0) {
      return;
    }

    setIsExporting(true);

    try {
      const exportOptions = {
        format,
        includeExtractions,
        selectedFields: includeExtractions ? Array.from(selectedFields) : undefined,
      };

      if (isSingle) {
        const extraction = extractions.find((e) => e.document_id === documents[0].id) || null;
        exportService.exportDocument(documents[0], extraction, exportOptions);
      } else {
        exportService.exportDocuments(documents, extractions, exportOptions);
      }

      // Show success message
      const formatText = format.toUpperCase();
      if (isSingle) {
        addToast('success', `Document exported as ${formatText}`);
      } else {
        addToast('success', `${documentCount} documents exported as ${formatText}`);
      }

      handleClose();
    } catch (error: any) {
      console.error('Failed to export documents:', error);
      addToast('error', error.message || 'Failed to export documents');
    } finally {
      setIsExporting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const exportSummary = useMemo(() => {
    const parts = [];
    parts.push(`Exporting ${documentCount} document${documentCount !== 1 ? 's' : ''}`);
    parts.push(`as ${format.toUpperCase()}`);
    if (includeExtractions && selectedFields.size > 0) {
      parts.push(`with ${selectedFields.size} extraction field${selectedFields.size !== 1 ? 's' : ''}`);
    }
    return parts.join(' ');
  }, [documentCount, format, includeExtractions, selectedFields.size]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSingle ? 'Export Document' : `Export ${documentCount} Documents`}
      size="lg"
      closeOnOverlayClick={!isExporting}
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Export Format</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* CSV Option */}
            <button
              type="button"
              onClick={() => setFormat('csv')}
              disabled={isExporting}
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all
                ${
                  format === 'csv'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <TableCellsIcon
                className={`h-6 w-6 flex-shrink-0 ${
                  format === 'csv' ? 'text-primary-600' : 'text-gray-400'
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5
                    className={`text-sm font-medium ${
                      format === 'csv' ? 'text-primary-900' : 'text-gray-900'
                    }`}
                  >
                    CSV
                  </h5>
                  {format === 'csv' && (
                    <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Spreadsheet format, ideal for Excel or analysis
                </p>
              </div>
            </button>

            {/* JSON Option */}
            <button
              type="button"
              onClick={() => setFormat('json')}
              disabled={isExporting}
              className={`
                flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all
                ${
                  format === 'json'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <CodeBracketIcon
                className={`h-6 w-6 flex-shrink-0 ${
                  format === 'json' ? 'text-primary-600' : 'text-gray-400'
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h5
                    className={`text-sm font-medium ${
                      format === 'json' ? 'text-primary-900' : 'text-gray-900'
                    }`}
                  >
                    JSON
                  </h5>
                  {format === 'json' && (
                    <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Structured data format for APIs and integrations
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Extraction Toggle */}
        {hasExtractions && (
          <div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-700">Include Extraction Results</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Add extracted field data to the export
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIncludeExtractions(!includeExtractions)}
                disabled={isExporting}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${includeExtractions ? 'bg-primary-600' : 'bg-gray-200'}
                  ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${includeExtractions ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        )}

        {/* Field Selection */}
        {includeExtractions && availableFields.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Select Fields to Include ({selectedFields.size}/{availableFields.length})
            </h4>
            <div className="rounded-lg border border-gray-200 bg-gray-50 max-h-48 overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {availableFields.map((field) => {
                  const isSelected = selectedFields.has(field.id);
                  return (
                    <label
                      key={field.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleField(field.id)}
                        disabled={isExporting}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">{field.name}</span>
                      {isSelected && <CheckIcon className="h-4 w-4 text-primary-600" />}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Document List Preview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Documents to Export ({documentCount})
          </h4>
          <div className="rounded-lg border border-gray-200 bg-gray-50 max-h-40 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {documents.slice(0, isSingle ? 1 : 5).map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                  <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 truncate">{doc.filename}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400">{doc.doc_type}</span>
                    <span className="text-xs text-gray-400">{formatFileSize(doc.size)}</span>
                  </div>
                </div>
              ))}
              {!isSingle && documentCount > 5 && (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  and {documentCount - 5} more...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Summary */}
        <div className="rounded-md bg-blue-50 p-3">
          <div className="flex gap-2">
            <DocumentArrowDownIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">{exportSummary}</p>
          </div>
        </div>
      </div>

      {/* Footer with buttons */}
      <ModalFooter className="mt-6 -mx-6 -mb-4">
        <Button
          type="button"
          variant="ghost"
          onClick={handleClose}
          disabled={isExporting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleExport}
          disabled={isExporting || (includeExtractions && selectedFields.size === 0)}
          isLoading={isExporting}
        >
          {isExporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ExportModal;
