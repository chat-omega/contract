/**
 * useFieldSelection Hook
 * Manages field selection state, search, grouping, and pagination
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { workflowService } from '@/services/workflowService';
import type { Field } from '@/types';

export interface FieldGroup {
  [groupName: string]: Field[];
}

export interface FieldSelectionState {
  // Data
  availableFields: Field[];
  fieldGroups: FieldGroup;

  // Search
  searchQuery: string;

  // Pagination
  page: number;
  limit: number;
  totalFields: number;
  totalPages: number;
  hasMore: boolean;

  // UI State
  isLoading: boolean;
  error: string | null;
}

export interface UseFieldSelectionReturn extends FieldSelectionState {
  // Field loading
  loadFields: (resetPagination?: boolean) => Promise<void>;

  // Search
  setSearchQuery: (query: string) => void;

  // Field Groups
  createGroup: (groupName: string) => void;
  renameGroup: (oldName: string, newName: string) => void;
  deleteGroup: (groupName: string) => void;
  addFieldToGroup: (field: Field, groupName: string) => void;
  removeFieldFromGroup: (fieldId: string, groupName: string) => void;
  getGroupNames: () => string[];
  getTotalFieldsCount: () => number;
  selectedFields: Field[]; // Flat list of all fields in all groups

  // Pagination
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
}

const DEFAULT_ITEMS_PER_PAGE = 10;
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEBOUNCE_DELAY = 300;

export const useFieldSelection = (
  initialSelectedFields: Field[] = []
): UseFieldSelectionReturn => {
  // State
  const [availableFields, setAvailableFields] = useState<Field[]>([]);
  const [fieldGroups, setFieldGroups] = useState<FieldGroup>({});
  const [searchQuery, setSearchQueryState] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [totalFields, setTotalFields] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for debouncing
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load and initialize Basic Information group with Title, Parties, Date
  useEffect(() => {
    const loadBasicInformationFields = async () => {
      // Skip if we have initialSelectedFields (from template or existing workflow)
      if (initialSelectedFields && initialSelectedFields.length > 0) {
        console.log('Initial selected fields provided, skipping auto-load of Basic Information');
        return;
      }

      // Skip if Basic Information already exists
      if (fieldGroups['Basic Information']) {
        console.log('Basic Information group already exists, skipping initialization');
        return;
      }

      console.log('Loading Basic Information fields...');

      try {
        // Search for Title, Parties, and Date fields
        const basicFieldNames = ['Title', 'Parties', 'Date'];
        const foundFields: Field[] = [];

        for (const fieldName of basicFieldNames) {
          const response = await workflowService.getFields({ search: fieldName, limit: 50 });
          const exactMatch = response.fields.find(f => f.name === fieldName);
          if (exactMatch) {
            foundFields.push(exactMatch);
            console.log(`Found ${fieldName} field:`, exactMatch.id);
          }
        }

        // If we found all 3 fields, create Basic Information group
        if (foundFields.length === 3) {
          console.log('Creating Basic Information group with 3 fields');
          setFieldGroups(prev => ({
            'Basic Information': foundFields,
            ...prev
          }));
        } else {
          console.warn(`Only found ${foundFields.length}/3 Basic Information fields`);
        }
      } catch (error) {
        console.error('Error loading Basic Information fields:', error);
      }
    };

    // Run only once on mount
    loadBasicInformationFields();
  }, []); // Empty deps - run once on mount

  // Initialize field groups from initial selected fields
  useEffect(() => {
    // Group initial selected fields by category if provided
    if (initialSelectedFields.length > 0 && Object.keys(fieldGroups).length === 0) {
      console.log('Initializing field groups from initial selected fields');

      const grouped = initialSelectedFields.reduce((acc, field) => {
        const groupName = field.category || 'Other';
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(field);
        return acc;
      }, {} as FieldGroup);

      setFieldGroups(grouped);
    }
  }, [availableFields, initialSelectedFields]);

  // Computed values
  const totalPages = Math.ceil(totalFields / limit);
  const hasMore = page < totalPages;

  // Get flat list of selected fields from all groups
  const selectedFields = Object.values(fieldGroups).flat();

  /**
   * Load fields from API
   */
  const loadFields = useCallback(
    async (resetPagination: boolean = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setIsLoading(true);
      setError(null);

      try {
        const currentPage = resetPagination ? 1 : page;
        const offset = (currentPage - 1) * limit;

        // Build query params
        const params: {
          search?: string;
          limit: number;
          offset: number;
        } = {
          limit,
          offset,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await workflowService.getFields(params);

        setAvailableFields(response.fields);
        setTotalFields(response.total);

        if (resetPagination) {
          setPage(1);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        const errorMessage = err instanceof Error ? err.message : 'Failed to load fields';
        setError(errorMessage);
        console.error('Error loading fields:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, searchQuery]
  );

  /**
   * Set search query with debouncing
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer to trigger search after delay
    debounceTimerRef.current = setTimeout(() => {
      // Search will be triggered by useEffect
    }, DEBOUNCE_DELAY);
  }, []);

  /**
   * Create new field group
   */
  const createGroup = useCallback((groupName: string) => {
    setFieldGroups((prev) => ({
      ...prev,
      [groupName]: [],
    }));
  }, []);

  /**
   * Rename field group
   */
  const renameGroup = useCallback((oldName: string, newName: string) => {
    setFieldGroups((prev) => {
      const { [oldName]: fields, ...rest } = prev;
      return {
        ...rest,
        [newName]: fields,
      };
    });
  }, []);

  /**
   * Delete field group
   */
  const deleteGroup = useCallback((groupName: string) => {
    setFieldGroups((prev) => {
      const { [groupName]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Add field to group (auto-creates group from field category)
   */
  const addFieldToGroup = useCallback((field: Field, groupName?: string) => {
    setFieldGroups((prev) => {
      // Check if field already exists in any group
      const existsInGroup = Object.values(prev).some((fields) =>
        fields.some((f) => f.id === field.id)
      );

      if (existsInGroup) {
        console.warn(`Field ${field.name} already exists in a group`);
        return prev;
      }

      // Auto-determine group name from field category if not provided
      const targetGroupName = groupName || field.category || 'Other';

      // Create group if it doesn't exist
      if (!prev[targetGroupName]) {
        return {
          ...prev,
          [targetGroupName]: [field],
        };
      }

      // Add field to existing group
      return {
        ...prev,
        [targetGroupName]: [...prev[targetGroupName], field],
      };
    });
  }, []);

  /**
   * Remove field from group
   */
  const removeFieldFromGroup = useCallback((fieldId: string, groupName: string) => {
    setFieldGroups((prev) => {
      if (!prev[groupName]) return prev;

      return {
        ...prev,
        [groupName]: prev[groupName].filter((field) => field.id !== fieldId),
      };
    });
  }, []);

  /**
   * Get all group names
   */
  const getGroupNames = useCallback((): string[] => {
    return Object.keys(fieldGroups);
  }, [fieldGroups]);

  /**
   * Get total count of all fields across all groups
   */
  const getTotalFieldsCount = useCallback((): number => {
    return selectedFields.length;
  }, [selectedFields]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  /**
   * Go to previous page
   */
  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  /**
   * Set items per page
   */
  const setItemsPerPage = useCallback((items: number) => {
    if (ITEMS_PER_PAGE_OPTIONS.includes(items)) {
      setLimit(items);
      setPage(1); // Reset to first page
    }
  }, []);

  /**
   * Load fields on initial mount
   */
  useEffect(() => {
    console.log('Initial field load on mount');
    loadFields(true);
  }, []); // Only run once on mount

  /**
   * Load fields when search query changes
   */
  useEffect(() => {
    if (searchQuery) {
      console.log('Loading fields due to search query change:', searchQuery);
      loadFields(true);
    }
  }, [searchQuery]);

  /**
   * Load fields when page changes
   */
  useEffect(() => {
    console.log('Loading fields due to page change:', page);
    loadFields(false);
  }, [page]);

  /**
   * Load fields when limit changes
   */
  useEffect(() => {
    console.log('Loading fields due to limit change:', limit);
    loadFields(true); // Reset to page 1 when limit changes
  }, [limit]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    availableFields,
    fieldGroups,
    selectedFields,
    searchQuery,
    page,
    limit,
    totalFields,
    totalPages,
    hasMore,
    isLoading,
    error,

    // Methods
    loadFields,
    setSearchQuery,
    createGroup,
    renameGroup,
    deleteGroup,
    addFieldToGroup,
    removeFieldFromGroup,
    getGroupNames,
    getTotalFieldsCount,
    nextPage,
    previousPage,
    goToPage,
    setItemsPerPage,
  };
};

export { ITEMS_PER_PAGE_OPTIONS };
export default useFieldSelection;
