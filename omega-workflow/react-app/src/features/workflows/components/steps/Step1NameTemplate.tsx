/**
 * Step1NameTemplate Component
 * Simplified workflow name and description input
 */

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { WizardFormData } from '../../types';

export interface Step1Props {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  validation: { step1: boolean };
}

export const Step1NameTemplate: React.FC<Step1Props> = ({
  formData,
  onUpdate,
  validation,
}) => {
  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ description: e.target.value });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Workflow Information</h3>
        <p className="text-sm text-gray-500 mt-1">
          Give your workflow a name and description
        </p>
      </div>

      {/* Workflow Name */}
      <Input
        label="Workflow Name"
        placeholder="e.g., M&A Due Diligence, Contract Review, etc."
        value={formData.name}
        onChange={handleNameChange}
        required
        error={!validation.step1 && formData.name.trim().length === 0 ? 'Workflow name is required' : undefined}
        helperText="A descriptive name that identifies this workflow"
      />

      {/* Description (Optional) */}
      <Textarea
        label="Description (Optional)"
        placeholder="Briefly describe the purpose of this workflow..."
        value={formData.description}
        onChange={handleDescriptionChange}
        rows={3}
        helperText="Provide details about what this workflow extracts"
        showCharCount
        maxLength={500}
      />
    </div>
  );
};

export default Step1NameTemplate;
