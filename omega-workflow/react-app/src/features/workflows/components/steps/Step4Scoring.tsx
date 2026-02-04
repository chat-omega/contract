/**
 * Step4Scoring Component
 * Coming soon feature placeholder
 */

import React from 'react';
import type { WizardFormData } from '../../types';

export interface Step4Props {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  validation: { step4: boolean };
}

export const Step4Scoring: React.FC<Step4Props> = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Coming Soon
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500">
          Confidence scoring configuration will be available in a future update.
        </p>
      </div>
    </div>
  );
};

export default Step4Scoring;
