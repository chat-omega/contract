/**
 * Document Store
 * Manages document list, selection, and operations
 */

import { create } from 'zustand';
import type { Document } from '@/types';

interface DocumentState {
  // State
  documents: Document[];
  selectedDocuments: Set<string>;
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  setCurrentDocument: (document: Document | null) => void;
  toggleDocumentSelection: (id: string) => void;
  toggleSelection: (id: string) => void; // Alias for toggleDocumentSelection
  clearSelection: () => void;
  selectAll: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  // Initial state
  documents: [],
  selectedDocuments: new Set(),
  currentDocument: null,
  isLoading: false,
  error: null,

  // Set all documents (replaces current list)
  setDocuments: (documents: Document[]) => {
    set({ documents, error: null });
  },

  // Add a single document
  addDocument: (document: Document) => {
    set((state) => ({
      documents: [document, ...state.documents],
    }));
  },

  // Update document by ID
  updateDocument: (id: string, updates: Partial<Document>) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    }));
  },

  // Remove document by ID
  removeDocument: (id: string) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
      selectedDocuments: new Set(
        Array.from(state.selectedDocuments).filter((docId) => docId !== id)
      ),
    }));
  },

  // Set current document being viewed
  setCurrentDocument: (document: Document | null) => {
    set({ currentDocument: document });
  },

  // Toggle document selection (for bulk operations)
  toggleDocumentSelection: (id: string) => {
    set((state) => {
      const newSelection = new Set(state.selectedDocuments);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return { selectedDocuments: newSelection };
    });
  },

  // Alias for toggleDocumentSelection (for backward compatibility)
  toggleSelection: (id: string) => {
    get().toggleDocumentSelection(id);
  },

  // Clear all selections
  clearSelection: () => {
    set({ selectedDocuments: new Set() });
  },

  // Select all documents
  selectAll: () => {
    const { documents } = get();
    set({ selectedDocuments: new Set(documents.map((doc) => doc.id)) });
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Set error message
  setError: (error: string | null) => {
    set({ error });
  },

  // Reset store to initial state
  reset: () => {
    set({
      documents: [],
      selectedDocuments: new Set(),
      currentDocument: null,
      isLoading: false,
      error: null,
    });
  },
}));

// Selectors
export const selectDocuments = (state: DocumentState) => state.documents;
export const selectSelectedDocuments = (state: DocumentState) =>
  Array.from(state.selectedDocuments);
export const selectCurrentDocument = (state: DocumentState) => state.currentDocument;
export const selectDocumentById = (id: string) => (state: DocumentState) =>
  state.documents.find((doc) => doc.id === id);
