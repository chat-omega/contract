/**
 * WorkflowsPage Component
 * Workflow management page with list and library tabs
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

type TabType = 'workflows' | 'library';

export const WorkflowsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('workflows');

  const handleCreateWorkflow = () => {
    navigate('/workflows/create');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="mt-2 text-gray-600">
            Create and manage document analysis workflows
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateWorkflow}>
          Create Workflow
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workflows'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Your Workflows
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'library'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Workflow Library
          </button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Workflow Management Coming Soon
          </h3>
          <p className="text-gray-600 mb-4">
            Full workflow creation wizard with field selection is currently being finalized.
          </p>
          <p className="text-sm text-gray-500">
            Backend APIs are ready. Frontend components need final integration.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowsPage;
