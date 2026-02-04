/**
 * Workflow Create Page
 * Full-screen page for creating or editing workflows using the wizard
 */

import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { WorkflowWizard } from './components/WorkflowWizard';
import { WorkflowErrorBoundary } from './components/WorkflowErrorBoundary';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useToast } from '@/hooks/useToast';
import type { Workflow } from '@/types';

export const WorkflowCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { loadWorkflows } = useWorkflowStore();

  // Determine mode (create or edit)
  const mode = id ? 'edit' : 'create';
  const workflowId = id ? parseInt(id) : undefined;

  // Get template ID from URL parameter
  const templateId = searchParams.get('template') || undefined;

  /**
   * Handle workflow completion
   */
  const handleComplete = async (workflow: Workflow) => {
    console.log('Workflow saved:', workflow);

    // Show success message
    addToast('success', `Workflow "${workflow.name}" ${mode === 'create' ? 'created' : 'updated'} successfully!`);

    // Refresh workflows list
    try {
      await loadWorkflows();
    } catch (error) {
      console.error('Failed to refresh workflows:', error);
    }

    // Navigate back to workflows list
    navigate('/workflows');
  };

  /**
   * Handle wizard cancel
   */
  const handleCancel = () => {
    navigate('/workflows');
  };

  /**
   * Handle error boundary reset
   */
  const handleErrorReset = () => {
    navigate('/workflows/create');
  };

  return (
    <WorkflowErrorBoundary onReset={handleErrorReset}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WorkflowWizard
            mode={mode}
            workflowId={workflowId}
            templateId={templateId}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </WorkflowErrorBoundary>
  );
};
