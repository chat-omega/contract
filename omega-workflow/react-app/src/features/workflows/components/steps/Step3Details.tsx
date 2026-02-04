/**
 * Step3Details Component
 * Detailed workflow description and document types selection
 * Updated to support 3-level hierarchical document type selection
 */

import React from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { useDocumentTypes } from '../../hooks/useDocumentTypes';
import { HierarchicalDocumentTypeSelector } from '../HierarchicalDocumentTypeSelector';
import type { WizardFormData } from '../../types';

export interface Step3Props {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  validation: { step3: boolean };
}

export const Step3Details: React.FC<Step3Props> = ({
  formData,
  onUpdate,
}) => {
  // Fetch document types from API (3-level hierarchy)
  const { categories, isLoading: isLoadingTypes, error: typesError } = useDocumentTypes();

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ description: e.target.value });
  };

  // Handle document types change (now hierarchical paths)
  const handleDocumentTypesChange = (types: string[]) => {
    onUpdate({ documentTypes: types });
  };

  // Max length for description
  const maxLength = 500;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Workflow Details</h2>
        <p className="text-sm text-gray-600 mt-1">
          Provide a detailed description and select document types
        </p>
      </div>

      {/* Detailed Description */}
      <div>
        <Textarea
          label="Workflow Description"
          placeholder="Provide a detailed description of what this workflow extracts and its intended use case..."
          value={formData.description}
          onChange={handleDescriptionChange}
          rows={3}
          showCharCount
          maxLength={maxLength}
        />
      </div>

      {/* Document Types - Hierarchical Selection */}
      <div className="border-t border-gray-200 pt-3 pb-20">
        <HierarchicalDocumentTypeSelector
          categories={categories}
          value={formData.documentTypes || []}
          onChange={handleDocumentTypesChange}
          isLoading={isLoadingTypes}
          error={typesError}
        />
      </div>
    </div>
  );
};

export default Step3Details;
