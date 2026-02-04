/**
 * Credit Analysis Store
 * Manages state for credit analysis chat and reports
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreditResultsResponse } from '@/services/creditAnalysisService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isLoading?: boolean;
  isFileUpload?: boolean;
  fileName?: string;
  fileSize?: number;
}

export type ResearchTab = 'fast' | 'deep';

interface CreditAnalysisState {
  // Chat state
  messages: ChatMessage[];
  activeTab: ResearchTab;
  isLoading: boolean;

  // Document state
  currentDocumentId: string | null;
  currentExtractionId: string | null;
  isPolling: boolean;
  pollingStatus: string;

  // Report state
  creditReport: CreditResultsResponse | null;
  showReport: boolean;

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setActiveTab: (tab: ResearchTab) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentDocument: (documentId: string | null, extractionId?: string | null) => void;
  setPollingStatus: (isPolling: boolean, status?: string) => void;
  setCreditReport: (report: CreditResultsResponse | null) => void;
  setShowReport: (show: boolean) => void;
  reset: () => void;
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialState = {
  messages: [],
  activeTab: 'fast' as ResearchTab,
  isLoading: false,
  currentDocumentId: null,
  currentExtractionId: null,
  isPolling: false,
  pollingStatus: '',
  creditReport: null,
  showReport: false,
};

export const useCreditAnalysisStore = create<CreditAnalysisState>()(
  persist(
    (set) => ({
      ...initialState,

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
        return newMessage;
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        }));
      },

      removeMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      setIsLoading: (loading) => {
        set({ isLoading: loading });
      },

      setCurrentDocument: (documentId, extractionId = null) => {
        set({
          currentDocumentId: documentId,
          currentExtractionId: extractionId,
        });
      },

      setPollingStatus: (isPolling, status = '') => {
        set({
          isPolling,
          pollingStatus: status,
        });
      },

      setCreditReport: (report) => {
        set({ creditReport: report });
      },

      setShowReport: (show) => {
        set({ showReport: show });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'credit-analysis-storage',
      partialize: (state) => ({
        messages: state.messages,
        activeTab: state.activeTab,
      }),
    }
  )
);

export default useCreditAnalysisStore;
