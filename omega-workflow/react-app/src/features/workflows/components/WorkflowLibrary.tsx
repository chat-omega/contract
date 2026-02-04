/**
 * WorkflowLibrary Component
 * Displays categorized workflow templates
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TemplateCard } from './TemplateCard';
import { Card } from '@/components/ui/Card';
import { workflowService } from '@/services/workflowService';
import type { WorkflowTemplate } from '@/types';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export const WorkflowLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  /**
   * Load templates on mount
   */
  useEffect(() => {
    loadTemplates();
  }, []);

  /**
   * Fetch templates from API
   */
  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await workflowService.getTemplates();
      setTemplates(data);

      // Expand all categories by default
      const categories = new Set(data.map(t => t.category));
      setExpandedCategories(categories);
    } catch (err: any) {
      console.error('Error loading templates:', err);
      setError(err.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Group templates by category
   */
  const categorizedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, WorkflowTemplate[]>);

  /**
   * Toggle category expansion
   */
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  /**
   * Handle template selection
   */
  const handleUseTemplate = (templateId: string) => {
    navigate(`/workflows/create?template=${templateId}`);
  };

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading template library...</p>
        </div>
      </Card>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <Card>
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Templates</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadTemplates}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  /**
   * Empty state
   */
  if (templates.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Available</h3>
          <p className="text-gray-600">No workflow templates found.</p>
        </div>
      </Card>
    );
  }

  /**
   * Main render
   */
  return (
    <div className="workflow-library space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Workflow Library</h2>
          <p className="text-sm text-gray-600 mt-1">
            {templates.length} template{templates.length !== 1 ? 's' : ''} across{' '}
            {Object.keys(categorizedTemplates).length} categor
            {Object.keys(categorizedTemplates).length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      </div>

      {/* Categorized Templates */}
      <div className="space-y-4">
        {Object.entries(categorizedTemplates)
          .sort(([a], [b]) => {
            // Custom sort: M&A first, then alphabetical
            if (a === 'M&A') return -1;
            if (b === 'M&A') return 1;
            return a.localeCompare(b);
          })
          .map(([category, categoryTemplates]) => {
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-150 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <h3 className="text-base font-semibold text-gray-900">{category}</h3>
                    <span className="text-sm text-gray-500">
                      ({categoryTemplates.length})
                    </span>
                  </div>
                </button>

                {/* Category Templates (Collapsible) */}
                {isExpanded && (
                  <div className="p-4 bg-white">
                    <div className="flex flex-col gap-3">
                      {categoryTemplates.map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onUseTemplate={handleUseTemplate}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
