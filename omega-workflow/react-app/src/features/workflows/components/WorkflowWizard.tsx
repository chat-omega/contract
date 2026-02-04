/**
 * WorkflowWizard Component
 * Main wizard orchestrator for creating/editing workflows
 */

import React, { useMemo } from 'react';
import { Stepper } from '@/components/ui/Stepper';
import { Button } from '@/components/ui/Button';
import { useWorkflowWizard } from '../hooks/useWorkflowWizard';
import type { Workflow } from '@/types';
import type { WizardMode } from '../types';

export interface WorkflowWizardProps {
  mode?: WizardMode;
  workflowId?: number;
  templateId?: string;
  onComplete: (workflow: Workflow) => void;
  onCancel: () => void;
}

/**
 * Step components
 */
import { Step1NameTemplate } from './steps/Step1NameTemplate';
import { Step2FieldSelection } from './steps/Step2FieldSelection';
import { Step3Details } from './steps/Step3Details';
import { Step4Scoring } from './steps/Step4Scoring';
import { Step5Review } from './steps/Step5Review';

export const WorkflowWizard: React.FC<WorkflowWizardProps> = ({
  mode = 'create',
  workflowId,
  templateId,
  onComplete,
  onCancel,
}) => {
  const wizard = useWorkflowWizard({
    mode,
    workflowId,
    templateId,
    onComplete,
    onError: (error) => console.error('Wizard error:', error),
  });

  // Define wizard steps
  const steps = useMemo(
    () => [
      { label: 'Name & Template', description: 'Set workflow name and choose template' },
      { label: 'Field Selection', description: 'Select fields to extract' },
      { label: 'Details', description: 'Configure workflow details' },
      { label: 'Scoring', description: 'Setup scoring rules (optional)' },
      { label: 'Review', description: 'Review and save workflow' },
    ],
    []
  );

  // Handle step click
  const handleStepClick = (stepIndex: number) => {
    wizard.goToStep(stepIndex as 1 | 2 | 3 | 4 | 5);
  };

  // Handle next button
  const handleNext = async () => {
    if (wizard.isLastStep) {
      // Final save
      await wizard.finalSave();
    } else {
      // Navigate to next step
      await wizard.goToNextStep();
    }
  };

  // Handle back button
  const handleBack = () => {
    wizard.goToPreviousStep();
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      wizard.resetWizard();
      onCancel();
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (wizard.currentStep) {
      case 1:
        return (
          <Step1NameTemplate
            formData={wizard.formData}
            onUpdate={wizard.updateFormData}
            validation={wizard.validation}
          />
        );
      case 2:
        return (
          <Step2FieldSelection
            formData={wizard.formData}
            onUpdate={wizard.updateFormData}
            validation={wizard.validation}
          />
        );
      case 3:
        return (
          <Step3Details
            formData={wizard.formData}
            onUpdate={wizard.updateFormData}
            validation={wizard.validation}
          />
        );
      case 4:
        return (
          <Step4Scoring
            formData={wizard.formData}
            onUpdate={wizard.updateFormData}
            validation={wizard.validation}
          />
        );
      case 5:
        return (
          <Step5Review
            formData={wizard.formData}
            validation={wizard.validation}
            onEditStep={wizard.goToStep}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state while initializing
  if (!wizard.isInitialized) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing workflow wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-wizard flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Create Workflow' : 'Edit Workflow'}
        </h2>
      </div>

      {/* Stepper */}
      <div className="px-6 py-6 border-b border-gray-200">
        <Stepper
          steps={steps}
          currentStep={wizard.currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {/* Error message */}
        {wizard.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{wizard.error}</p>
              </div>
              <button
                type="button"
                onClick={wizard.clearError}
                className="ml-auto flex-shrink-0 inline-flex text-red-400 hover:text-red-500"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Current step content */}
        <div className="workflow-wizard-content">
          {renderStepContent()}
        </div>

        {/* Debug info (development only) */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Debug Info</h4>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(
                {
                  currentStep: wizard.currentStep,
                  validation: wizard.validation,
                  canGoNext: wizard.canGoNext,
                  isComplete: wizard.isComplete,
                  formData: wizard.formData,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          {/* Cancel button */}
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={wizard.isSaving}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {/* Back button */}
            {!wizard.isFirstStep && (
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={wizard.isSaving}
              >
                Back
              </Button>
            )}

            {/* Next/Save button */}
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!wizard.canGoNext || wizard.isSaving}
              isLoading={wizard.isSaving}
            >
              {wizard.isLastStep ? 'Save Workflow' : 'Next'}
            </Button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Step {wizard.currentStep} of 5
            {wizard.isSaving && (
              <span className="ml-2 text-primary-600">Saving...</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowWizard;
