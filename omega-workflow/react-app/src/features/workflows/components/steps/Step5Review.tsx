/**
 * Step5Review Component
 * Review and confirm all workflow configuration before saving
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import type { WizardFormData, WizardValidation } from '../../types';

export interface Step5Props {
  formData: WizardFormData;
  validation: WizardValidation;
  onEditStep: (step: 1 | 2 | 3 | 4 | 5) => void;
}

export const Step5Review: React.FC<Step5Props> = ({
  formData,
  validation,
  onEditStep,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  // Get validation status for each step
  const stepStatuses = [
    { step: 1, label: 'Name & Template', valid: validation.step1 },
    { step: 2, label: 'Field Selection', valid: validation.step2 },
    { step: 3, label: 'Details', valid: validation.step3 },
    { step: 4, label: 'Scoring', valid: validation.step4 },
  ];

  // Check if all required steps are complete
  const allStepsComplete = validation.step1 && validation.step2 && validation.step3;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Review Your Workflow</h3>
        <p className="text-sm text-gray-500 mt-1">
          Review all settings before saving. You can edit any section by clicking the Edit button.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Workflow Completion Status</h4>
              <p className="text-xs text-gray-600 mt-1">
                {allStepsComplete ? 'All required steps completed' : 'Some steps need attention'}
              </p>
            </div>
            <div className="flex gap-2">
              {stepStatuses.map((status) => (
                <div
                  key={status.step}
                  className={`h-2 w-12 rounded-full ${
                    status.valid ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  title={`${status.label}: ${status.valid ? 'Complete' : 'Incomplete'}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning if steps incomplete */}
      {!allStepsComplete && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-yellow-600 mt-0.5"
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
              <h4 className="text-sm font-medium text-yellow-800">Incomplete Steps</h4>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                {!validation.step1 && <li>Complete Name & Template selection</li>}
                {!validation.step2 && <li>Select at least one field to extract</li>}
                {!validation.step3 && <li>Provide workflow details</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Basic Information</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Workflow name and description</p>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Workflow Name</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.name || <span className="text-gray-400 italic">Not provided</span>}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.description ? (
                  <p className="whitespace-pre-wrap">{formData.description}</p>
                ) : (
                  <span className="text-gray-400 italic">No description provided</span>
                )}
              </dd>
            </div>
            {formData.selectedTemplateId && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Template</dt>
                <dd className="mt-1">
                  <Badge variant="primary">Template: {formData.selectedTemplateId}</Badge>
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Selected Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Selected Fields</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {formData.selectedFields.length} field{formData.selectedFields.length !== 1 ? 's' : ''} to extract
              </p>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.selectedFields.length > 0 ? (
            <div className="space-y-4">
              {/* Group fields by category and display all */}
              {(() => {
                // Group fields by category
                const fieldsByCategory = formData.selectedFields.reduce((acc, field) => {
                  const category = field.category || 'Other';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(field);
                  return acc;
                }, {} as Record<string, typeof formData.selectedFields>);

                return Object.entries(fieldsByCategory).map(([category, fields]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">
                      {category} ({fields.length})
                    </h4>
                    <div className="space-y-2">
                      {fields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                        >
                          <svg
                            className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0"
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
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{field.name}</p>
                            {field.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg
                className="mx-auto h-10 w-10 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              No fields selected yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Document Types</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {formData.documentTypes.length > 0
                  ? `${formData.documentTypes.length} type${formData.documentTypes.length !== 1 ? 's' : ''} selected`
                  : 'No types selected'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.documentTypes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.documentTypes.map((type) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No document types selected</p>
          )}
        </CardContent>
      </Card>

      {/* Scoring Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scoring Configuration</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Optional scoring rules</p>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Edit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.scoringEnabled ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="success">Enabled</Badge>
                {formData.scoringProfiles.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {formData.scoringProfiles.length} profile{formData.scoringProfiles.length !== 1 ? 's' : ''} configured
                  </span>
                )}
              </div>
              {formData.scoringProfiles.map((profile, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">{profile.name} Profile</p>
                  {profile.thresholds && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">High Confidence:</span>
                        <Badge variant="success">{profile.thresholds.high}%+</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Medium Confidence:</span>
                        <Badge variant="secondary">{profile.thresholds.medium}% - {profile.thresholds.high - 1}%</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Low Confidence:</span>
                        <Badge variant="danger">&lt;{profile.thresholds.low}%</Badge>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Disabled</Badge>
              <span className="text-sm text-gray-500">Scoring is not enabled for this workflow</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation */}
      {allStepsComplete && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <Checkbox
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              label="I confirm all information is correct and want to save this workflow"
              description="This will create the workflow and make it available for document processing"
            />
          </CardContent>
        </Card>
      )}

      {/* Save Instructions */}
      <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <svg
          className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800">Ready to save?</p>
          <p className="text-sm text-blue-700 mt-1">
            {allStepsComplete && confirmed
              ? 'Click "Save Workflow" to complete the setup'
              : allStepsComplete && !confirmed
              ? 'Please confirm the information above to enable saving'
              : 'Complete all required steps and confirm to save your workflow'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step5Review;
