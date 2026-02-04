/**
 * TemplateCard Component
 * Displays a single workflow template with details - matching vanilla app design
 */

import React from 'react';
import type { WorkflowTemplate } from '@/types';

interface TemplateCardProps {
  template: WorkflowTemplate;
  onUseTemplate: (templateId: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUseTemplate }) => {
  // Show first 4 document types, then "+X more"
  const visibleDocTypes = template.documentTypes?.slice(0, 4) || [];
  const remainingCount = (template.documentTypes?.length || 0) - 4;

  return (
    <div className="relative bg-white rounded-lg border border-[#e0e0e0] shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-shadow p-5 pr-36 mb-4">
      {/* Copy Template Button - Absolute positioned top-right */}
      <button
        onClick={() => onUseTemplate(template.id)}
        className="absolute top-5 right-6 px-4 py-1.5 border border-[#1976d2] text-[#1976d2] text-sm font-medium rounded hover:bg-[#e3f2fd] transition-colors whitespace-nowrap"
      >
        Copy Template
      </button>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[#212121] mb-2">
        {template.name}
      </h3>

      {/* Description */}
      {template.description && (
        <p className="text-sm text-[#616161] leading-relaxed mb-3 max-w-[700px]">
          {template.description}
        </p>
      )}

      {/* Recommended for: Document Types */}
      {template.documentTypes && template.documentTypes.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[13px] text-[#757575] whitespace-nowrap">
            Recommended for:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {visibleDocTypes.map((docType, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#f5f5f5] border border-[#e0e0e0] rounded-full text-xs text-[#424242]"
              >
                {docType}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-3 py-1 bg-[#f5f5f5] border border-[#e0e0e0] rounded-full text-xs text-[#757575]">
                +{remainingCount} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
