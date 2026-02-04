/**
 * TemplateSelector Component
 * Grid of selectable workflow templates
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import type { WorkflowTemplate } from '@/types';

export interface TemplateSelectorProps {
  templates: WorkflowTemplate[];
  selectedTemplateId: string | null;
  onSelect: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
}) => {
  // Get field count for a template
  const getFieldCount = (template: WorkflowTemplate): number => {
    if (!template.fields) return 0;
    if (Array.isArray(template.fields)) return template.fields.length;
    return 0;
  };

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-1">Available Templates</h4>
        <p className="text-xs text-gray-500">
          Select a template to pre-populate fields and settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          const fieldCount = getFieldCount(template);

          return (
            <Card
              key={template.id}
              className={cn(
                'cursor-pointer transition-all duration-200',
                'hover:shadow-md hover:border-primary-300',
                isSelected
                  ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50'
                  : 'border-gray-200'
              )}
              onClick={() => onSelect(template.id)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(template.id);
                }
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">
                      {template.name}
                    </CardTitle>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={cn(
                      'flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      isSelected
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {template.description && (
                  <CardDescription className="mt-2 line-clamp-2">
                    {template.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {/* Field count badge */}
                  {fieldCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <svg
                        className="h-3 w-3 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                    </Badge>
                  )}

                  {/* Category badge */}
                  {template.category && (
                    <Badge variant="primary" className="text-xs">
                      {template.category}
                    </Badge>
                  )}

                  {/* Document types badges */}
                  {template.documentTypes && template.documentTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.documentTypes.slice(0, 2).map((docType, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {docType}
                        </Badge>
                      ))}
                      {template.documentTypes.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{template.documentTypes.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected indicator text */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-primary-200">
                    <p className="text-xs font-medium text-primary-700 flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Selected Template
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selection info */}
      {selectedTemplateId && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <svg
            className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-green-800">
              Template selected! The template's fields and settings will be pre-loaded in the next steps.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
