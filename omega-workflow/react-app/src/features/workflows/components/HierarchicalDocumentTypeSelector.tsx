/**
 * HierarchicalDocumentTypeSelector Component
 * 3-level hierarchical document type selection with smart filtering
 * Features:
 * - Selecting parent automatically covers all children
 * - Children of selected parents are hidden (smart filtering)
 * - Visual hierarchy with indentation
 * - Chips display for selected items with full path
 */

import React, { useState, useMemo } from 'react';
import type { DocumentTopCategory } from '../hooks/useDocumentTypes';

export interface HierarchicalDocumentTypeSelectorProps {
  categories: DocumentTopCategory[];
  value: string[]; // Array of hierarchical paths like "Contract > Debt Related Agt > Credit & Loan Agt"
  onChange: (value: string[]) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const HierarchicalDocumentTypeSelector: React.FC<
  HierarchicalDocumentTypeSelectorProps
> = ({ categories, value = [], onChange, isLoading, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle selection
  // Allows flexible selection: can select parent + child together for maximum flexibility
  const toggleSelection = (path: string) => {
    const newValue = [...value];

    if (newValue.includes(path)) {
      // Unchecking: Remove this item and all its children (cleanup)
      const filtered = newValue.filter((v) => v !== path);
      // Also remove any children for consistency
      const finalFiltered = filtered.filter(
        (v) => !v.startsWith(path + ' > ')
      );
      onChange(finalFiltered);
    } else {
      // Checking: Add this item, keep all existing selections (allow parent + child)
      newValue.push(path);
      onChange(newValue);
    }
  };

  // Remove chip
  const removeChip = (path: string) => {
    const filtered = value.filter((v) => v !== path);
    // Also remove any children
    const finalFiltered = filtered.filter((v) => !v.startsWith(path + ' > '));
    onChange(finalFiltered);
  };

  // Render chips
  const chips = useMemo(
    () =>
      value.map((path) => (
        <div
          key={path}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-sm"
          title={path}
        >
          <span className="max-w-xs truncate">{path}</span>
          <button
            type="button"
            onClick={() => removeChip(path)}
            className="flex-shrink-0 hover:bg-blue-200 rounded p-0.5"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )),
    [value]
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Document Types
        </label>
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading document types...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Document Types
        </label>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">Error loading document types: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Document Types
      </label>

      {/* Dropdown button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <span className="text-sm text-gray-700">
            {value.length === 0
              ? 'Select document types'
              : `${value.length} type${value.length !== 1 ? 's' : ''} selected`}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <div className="p-2">
              {categories.map((topCategory) => {
                const topPath = topCategory.name;
                const isTopSelected = value.includes(topPath);

                return (
                  <div key={topCategory.id}>
                    {/* Level 1: Top category */}
                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTopSelected}
                        onChange={() => toggleSelection(topPath)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="font-semibold text-gray-900">
                        {topCategory.name}
                      </span>
                    </label>

                    {/* Show all children regardless of parent selection (allows flexible selection) */}
                    {topCategory.children.map((subCategory) => {
                        const subPath = `${topPath} > ${subCategory.name}`;
                        const isSubSelected = value.includes(subPath);

                        return (
                          <div key={subCategory.id} className="ml-4">
                            {/* Level 2: Sub category */}
                            <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSubSelected}
                                onChange={() => toggleSelection(subPath)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-gray-800">
                                {subCategory.name}
                              </span>
                            </label>

                            {/* Show all types regardless of sub-category selection (allows flexible selection) */}
                            {subCategory.types.map((type) => {
                                const typePath = `${subPath} > ${type.name}`;
                                const isTypeSelected = value.includes(typePath);

                                return (
                                  <div key={type.id} className="ml-4">
                                    {/* Level 3: Type */}
                                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer text-sm">
                                      <input
                                        type="checkbox"
                                        checked={isTypeSelected}
                                        onChange={() => toggleSelection(typePath)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                      />
                                      <span className="text-gray-700">
                                        {type.name}
                                      </span>
                                    </label>
                                  </div>
                                );
                              })}
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {chips}
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-500 mb-4">
        {value.length === 0
          ? 'Select document types at any level. You can select both parent categories and specific child types for maximum flexibility.'
          : `${value.length} selection${value.length !== 1 ? 's' : ''} - You can mix parent and child selections as needed`}
      </p>
    </div>
  );
};

export default HierarchicalDocumentTypeSelector;
