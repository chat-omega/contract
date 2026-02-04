/**
 * UserWorkflows Component
 * Displays user's custom workflows
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useWorkflowStore } from '@/stores/workflowStore';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export const UserWorkflows: React.FC = () => {
  const navigate = useNavigate();
  const { workflows, isLoading, deleteWorkflow } = useWorkflowStore();
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<number>>(new Set());

  /**
   * Toggle workflow expanded state
   */
  const toggleExpanded = (workflowId: number) => {
    setExpandedWorkflows((prev) => {
      const next = new Set(prev);
      if (next.has(workflowId)) {
        next.delete(workflowId);
      } else {
        next.add(workflowId);
      }
      return next;
    });
  };

  /**
   * Calculate field count for both array and categorized fields
   */
  const getFieldCount = (workflow: any): number => {
    // Use backend-provided fieldCount if available
    if (typeof workflow.fieldCount === 'number') {
      return workflow.fieldCount;
    }

    // Fallback calculation
    if (Array.isArray(workflow.fields)) {
      return workflow.fields.length;
    } else if (workflow.fields && typeof workflow.fields === 'object') {
      return Object.values(workflow.fields).reduce((total: number, fields: any) => {
        return total + (Array.isArray(fields) ? fields.length : 0);
      }, 0);
    }
    return 0;
  };

  /**
   * Handle edit workflow
   */
  const handleEdit = (workflowId: number) => {
    navigate(`/workflows/${workflowId}/edit`);
  };

  /**
   * Handle delete workflow
   */
  const handleDelete = async (workflowId: number, workflowName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${workflowName}"?`)) {
      return;
    }

    try {
      await deleteWorkflow(workflowId.toString());
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your workflows...</p>
        </div>
      </Card>
    );
  }

  /**
   * Empty state
   */
  if (workflows.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">No Workflows Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first workflow from our template library or use the "Create Workflow" button above.
          </p>
          <Button variant="outline" onClick={() => navigate('/workflows?tab=library')}>
            Browse Template Library
          </Button>
        </div>
      </Card>
    );
  }

  /**
   * Main render - workflows list
   */
  return (
    <div className="user-workflows space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Your Workflows</h2>
        <p className="text-sm text-gray-600 mt-1">
          {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Workflows Grid */}
      <div className="grid gap-4">
        {workflows.map((workflow) => {
          const fieldCount = getFieldCount(workflow);
          const isExpanded = expandedWorkflows.has(workflow.id);
          const hasCategories = workflow.fields && typeof workflow.fields === 'object' && !Array.isArray(workflow.fields);

          return (
            <Card key={workflow.id}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {workflow.name}
                    </h3>

                    {workflow.description && (
                      <p className="mt-1 text-sm text-gray-600">{workflow.description}</p>
                    )}

                    {/* Document Types */}
                    {workflow.documentTypes && workflow.documentTypes.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-gray-500">Recommended for use on:</span>
                          {workflow.documentTypes.map((docType: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {docType}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      {/* Field Count with Expand/Collapse */}
                      <button
                        onClick={() => toggleExpanded(workflow.id)}
                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                        <span>
                          {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                        </span>
                      </button>

                      {workflow.created_at && (
                        <>
                          <span>•</span>
                          <span>
                            Created {new Date(workflow.created_at).toLocaleDateString()}
                          </span>
                        </>
                      )}

                      {workflow.updated_at && workflow.updated_at !== workflow.created_at && (
                        <>
                          <span>•</span>
                          <span>
                            Updated {new Date(workflow.updated_at).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Expandable Field Categories */}
                    {isExpanded && hasCategories && (
                      <div className="mt-4 space-y-3 pl-5 border-l-2 border-gray-200">
                        {Object.entries(workflow.fields as Record<string, any[]>).map(([category, fields]) => (
                          <div key={category} className="space-y-1">
                            <div className="text-sm font-semibold text-gray-700">
                              {category} ({Array.isArray(fields) ? fields.length : 0})
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(fields) && fields.map((field: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                >
                                  {field.name || field}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expandable Field List (for array fields) */}
                    {isExpanded && !hasCategories && Array.isArray(workflow.fields) && (
                      <div className="mt-4 flex flex-wrap gap-2 pl-5 border-l-2 border-gray-200">
                        {workflow.fields.map((field: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                          >
                            {field.name || field}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(workflow.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(workflow.id, workflow.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
