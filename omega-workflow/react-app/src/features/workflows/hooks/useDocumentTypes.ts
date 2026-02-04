/**
 * useDocumentTypes Hook
 * Fetches document types from the database via API
 * Supports 3-level hierarchy: Top Category → Sub Category → Types
 */

import { useState, useEffect } from 'react';

// Type definitions for 3-level hierarchy
export interface DocumentType {
  id: number;
  name: string;
  display_order: number;
}

export interface DocumentSubCategory {
  id: number;
  name: string;
  display_order: number;
  level: number;
  parent_id: number;
  types: DocumentType[];
}

export interface DocumentTopCategory {
  id: number;
  name: string;
  display_order: number;
  level: number;
  children: DocumentSubCategory[];
  types: DocumentType[]; // Usually empty for top-level
}

export interface DocumentTypesResponse {
  success: boolean;
  categories: DocumentTopCategory[];
  total_categories: number;
  total_types: number;
}

export const useDocumentTypes = () => {
  const [categories, setCategories] = useState<DocumentTopCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await fetch('/api/document-types');

        if (!response.ok) {
          throw new Error(`Failed to fetch document types: ${response.statusText}`);
        }

        const data: DocumentTypesResponse = await response.json();

        if (data.success) {
          setCategories(data.categories);
        } else {
          throw new Error('API returned success: false');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error fetching document types:', err);
        // Set empty array on error so component doesn't break
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  // Helper function to get flat list of all types (for backward compatibility)
  const getAllTypeNames = (): string[] => {
    const allTypes: string[] = [];
    categories.forEach((topCategory) => {
      topCategory.children.forEach((subCategory) => {
        subCategory.types.forEach((type) => {
          allTypes.push(type.name);
        });
      });
    });
    return allTypes;
  };

  return {
    categories,
    isLoading,
    error,
    // For backward compatibility
    documentTypes: getAllTypeNames(),
  };
};

export default useDocumentTypes;
