/**
 * ExtractionPanel Component
 * Displays extraction results with clickable fields for highlighting
 */

import { useState } from 'react';
import type { ExtractionResult, BBox } from '@/types';
import { ChevronDownIcon, ChevronRightIcon, MapPinIcon, PlayIcon } from '@heroicons/react/24/outline';

interface ExtractionPanelProps {
  extractions: ExtractionResult | null;
  selectedFieldId: string | null;
  selectedExtractionIndex: number | null;
  hasWorkflow: boolean;
  isExtracting: boolean;
  onFieldClick: (fieldId: string) => void;
  onExtractionClick: (fieldId: string, extractionIndex: number, page: number, bbox: BBox) => void;
  onStartExtraction: () => void;
}

export const ExtractionPanel: React.FC<ExtractionPanelProps> = ({
  extractions,
  selectedFieldId,
  selectedExtractionIndex,
  hasWorkflow,
  isExtracting,
  onFieldClick,
  onExtractionClick,
  onStartExtraction,
}) => {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  // Debug logging
  console.log('[ExtractionPanel] Received extractions:', extractions);
  console.log('[ExtractionPanel] Has results?', !!extractions?.results);
  console.log('[ExtractionPanel] Results type:', typeof extractions?.results);
  console.log('[ExtractionPanel] Results keys:', extractions?.results ? Object.keys(extractions.results) : []);
  console.log('[ExtractionPanel] Has workflow:', hasWorkflow);
  console.log('[ExtractionPanel] Is extracting:', isExtracting);

  // No extractions available
  if (!extractions || !extractions.results || typeof extractions.results !== 'object') {
    console.log('[ExtractionPanel] Showing empty state message');
    return (
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Extraction Results</h2>

          {isExtracting ? (
            // Extraction in progress
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
                <p className="text-sm text-gray-700 font-medium">Extraction in progress...</p>
              </div>
              <p className="text-xs text-gray-500">
                This may take a few moments. The page will update automatically when complete.
              </p>
            </div>
          ) : hasWorkflow ? (
            // Workflow assigned but no extraction yet
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                A workflow is assigned to this document, but extraction hasn't been started yet.
              </p>
              <button
                onClick={onStartExtraction}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlayIcon className="h-4 w-4" />
                Start Extraction
              </button>
              <p className="text-xs text-gray-400">
                Click the button above to extract fields from this document using the assigned workflow.
              </p>
            </div>
          ) : (
            // No workflow assigned
            <div className="space-y-2">
              <p className="text-sm text-gray-500">No extractions available for this document.</p>
              <p className="text-xs text-gray-400">
                Assign a workflow to this document to extract fields.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const fieldEntries = Object.entries(extractions.results);

  if (fieldEntries.length === 0) {
    return (
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Extraction Results</h2>
          <p className="text-sm text-gray-500">No fields extracted yet.</p>
        </div>
      </div>
    );
  }

  const toggleFieldExpanded = (fieldId: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  return (
    <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Extraction Results</h2>
        <p className="text-sm text-gray-500 mt-1">
          {fieldEntries.length} field{fieldEntries.length !== 1 ? 's' : ''} extracted
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Status: <span className="font-medium">{extractions.status}</span>
        </p>
      </div>

      {/* Fields List */}
      <div className="flex-1 overflow-y-auto">
        {fieldEntries.map(([fieldId, fieldExtraction]) => {
          const isExpanded = expandedFields.has(fieldId);
          const isSelected = selectedFieldId === fieldId;
          const hasExtractions =
            fieldExtraction.extractions && fieldExtraction.extractions.length > 0;

          return (
            <div
              key={fieldId}
              className={`border-b border-gray-200 ${
                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Field Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => {
                  if (hasExtractions) {
                    toggleFieldExpanded(fieldId);
                    onFieldClick(fieldId);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {hasExtractions ? (
                        isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0" />
                      )}
                      <h3
                        className={`text-sm font-medium ${
                          isSelected ? 'text-blue-700' : 'text-gray-900'
                        }`}
                      >
                        {fieldExtraction.field_name || fieldId}
                      </h3>
                    </div>
                    {hasExtractions && (
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        {fieldExtraction.extractions.length} extraction
                        {fieldExtraction.extractions.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Selected
                    </span>
                  )}
                </div>
              </div>

              {/* Answer Information (for option-based questions) */}
              {isExpanded && hasExtractions && fieldExtraction.hasAnswers && (
                <div className="px-4 pb-3 pt-2 bg-blue-50 border-t border-blue-100">
                  <div className="ml-6">
                    {/* Available Options */}
                    {fieldExtraction.answerOptions &&
                      Object.keys(fieldExtraction.answerOptions).length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-700 mb-1.5">
                            Available Options:
                          </div>
                          <div className="space-y-1.5">
                            {Object.entries(fieldExtraction.answerOptions).map(
                              ([option, label]) => {
                                const isSelectedOption = fieldExtraction.answers?.some(
                                  (a) => a.option === option
                                );
                                return (
                                  <div
                                    key={option}
                                    className={`flex items-center gap-2 text-xs ${
                                      isSelectedOption
                                        ? 'text-blue-800 font-medium'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        isSelectedOption
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-gray-300 text-gray-700'
                                      }`}
                                    >
                                      {option.toUpperCase()}
                                    </span>
                                    <span>{label}</span>
                                    {isSelectedOption && (
                                      <span className="text-blue-600">✓</span>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Field Extractions (Expanded) */}
              {isExpanded && hasExtractions && (
                <div className="px-4 pb-4 space-y-3">
                  {fieldExtraction.extractions.map((extraction, idx) => {
                    const isExtractionSelected =
                      isSelected && selectedExtractionIndex === idx;

                    // Extract bbox from top level or fallback to spans[0].bounds (like vanilla frontend)
                    const extractedBbox = extraction.bbox ||
                      (extraction.spans && extraction.spans.length > 0 && extraction.spans[0].bounds
                        ? [
                            extraction.spans[0].bounds.left,
                            extraction.spans[0].bounds.bottom,
                            extraction.spans[0].bounds.right,
                            extraction.spans[0].bounds.top
                          ] as BBox
                        : null);

                    const canNavigate = !!extractedBbox && !!extraction.page;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          console.log('[ExtractionPanel] 🖱️ Extraction clicked:', {
                            fieldId,
                            idx,
                            canNavigate,
                            hasBbox: !!extraction.bbox,
                            hasSpansBbox: !!(extraction.spans?.[0]?.bounds),
                            extractedBbox,
                            hasPage: !!extraction.page,
                            bbox: extraction.bbox,
                            page: extraction.page,
                            timestamp: new Date().toISOString(),
                          });

                          // Enhanced diagnostic logging
                          if (!extractedBbox) {
                            console.error('[ExtractionPanel] ❌ NAVIGATION BLOCKED: No bbox data found', {
                              'extraction.bbox': extraction.bbox,
                              'extraction.spans': extraction.spans,
                              'spans[0]?.bounds': extraction.spans?.[0]?.bounds,
                            });
                          }
                          if (!extraction.page) {
                            console.error('[ExtractionPanel] ❌ NAVIGATION BLOCKED: No page number', {
                              'extraction.page': extraction.page,
                            });
                          }

                          if (canNavigate && extractedBbox) {
                            console.log('[ExtractionPanel] ✅ Calling onExtractionClick...');
                            onExtractionClick(
                              fieldId,
                              idx,
                              extraction.page!,
                              extractedBbox
                            );
                            console.log('[ExtractionPanel] ✅ onExtractionClick call completed');
                          } else {
                            console.warn('[ExtractionPanel] ⚠️ Cannot navigate - missing bbox or page', {
                              canNavigate,
                              hasExtractedBbox: !!extractedBbox,
                              hasPage: !!extraction.page,
                            });
                          }
                        }}
                        className={`
                          ml-6 p-3 rounded border transition-all
                          ${isExtractionSelected
                            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }
                          ${canNavigate ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}
                        `}
                      >
                        {/* Extracted Text with Location Icon */}
                        <div className="flex items-start gap-2">
                          {canNavigate && (
                            <MapPinIcon
                              className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                                isExtractionSelected ? 'text-blue-600' : 'text-gray-400'
                              }`}
                            />
                          )}
                          <p className={`text-sm font-medium flex-1 ${
                            isExtractionSelected ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {/* Validate text is a string, not array/object */}
                            {typeof extraction.text === 'string'
                              ? extraction.text
                              : (
                                  <span className="text-red-600 italic">
                                    [Invalid data: {typeof extraction.text}]
                                  </span>
                                )}
                          </p>
                        </div>

                        {/* Metadata */}
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          {extraction.page && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Page:</span> {extraction.page}
                            </span>
                          )}
                          {extraction.confidence !== undefined && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Confidence:</span>{' '}
                              {Math.round(extraction.confidence * 100)}%
                            </span>
                          )}
                          {canNavigate && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <span className="font-medium">Click to view</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No Extractions Message */}
              {isExpanded && !hasExtractions && (
                <div className="px-4 pb-4">
                  <p className="ml-6 text-xs text-gray-400 italic">No extractions for this field</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {extractions.completed_at && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500">
            Completed: {new Date(extractions.completed_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};
