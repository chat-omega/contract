/**
 * Step2FieldSelection Component
 * Field selection step for workflow wizard
 */

import React, { useCallback } from 'react';
import { FieldSelector } from '../FieldSelector/FieldSelector';
import type { WizardFormData, WizardValidation } from '../../types';
import type { Field } from '@/types';

export interface Step2FieldSelectionProps {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  validation: WizardValidation;
}

export const Step2FieldSelection: React.FC<Step2FieldSelectionProps> = ({
  formData,
  onUpdate,
  validation,
}) => {
  /**
   * Handle fields change
   */
  const handleFieldsChange = useCallback(
    (fields: Field[]) => {
      onUpdate({ selectedFields: fields });
    },
    [onUpdate]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Select Fields</h2>
        <p className="text-sm text-gray-600 mt-1">
          Choose the fields you want to extract from documents. You can search,
          filter by category, tags, or region, and select multiple fields.
        </p>

        {/* Validation warning */}
        {!validation.step2 && formData.selectedFields.length === 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-amber-400 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  No fields selected
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Please select at least one field to continue.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Field Selector */}
      <div className="min-h-[600px]">
        <FieldSelector
          selectedFields={formData.selectedFields}
          onFieldsChange={handleFieldsChange}
        />
      </div>
    </div>
  );
};

export default Step2FieldSelection;
