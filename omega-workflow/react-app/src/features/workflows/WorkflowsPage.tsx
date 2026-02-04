/**
 * WorkflowsPage Component
 * Workflow management page - two-tab layout showing Library and User Workflows
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { WorkflowLibrary } from './components/WorkflowLibrary';
import { UserWorkflows } from './components/UserWorkflows';
import { useWorkflowStore } from '@/stores/workflowStore';

export const WorkflowsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loadWorkflows } = useWorkflowStore();

  // Get active tab from URL params, default to 'library'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'library' | 'yours'>(
    tabParam === 'yours' ? 'yours' : 'library'
  );

  // Load workflows on mount
  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  /**
   * Handle tab change
   */
  const handleTabChange = (tab: 'library' | 'yours') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="mt-2 text-gray-600">
            Create and manage document analysis workflows
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/workflows/create')}>
          + Create Workflow
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('library')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150
              ${
                activeTab === 'library'
                  ? 'border-accent-600 text-accent-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Workflow Library
          </button>
          <button
            onClick={() => handleTabChange('yours')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150
              ${
                activeTab === 'yours'
                  ? 'border-accent-600 text-accent-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Your Workflows
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'library' ? <WorkflowLibrary /> : <UserWorkflows />}
      </div>
    </div>
  );
};

export default WorkflowsPage;
