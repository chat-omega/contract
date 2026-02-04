/**
 * UI Store
 * Manages UI state (sidebar, modals, toasts, etc.)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToastType, ModalState } from '@/types';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface UIState {
  // State
  sidebarCollapsed: boolean;
  modals: Record<string, ModalState>;
  toasts: Toast[];
  isLoading: boolean;
  loadingMessage: string | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modalId: string, data?: any) => void;
  closeModal: (modalId: string) => void;
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      modals: {},
      toasts: [],
      isLoading: false,
      loadingMessage: null,

      // Toggle sidebar collapsed state
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      // Set sidebar collapsed state
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      // Open a modal
      openModal: (modalId: string, data?: any) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: { isOpen: true, data },
          },
        }));
      },

      // Close a modal
      closeModal: (modalId: string) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: { isOpen: false, data: null },
          },
        }));
      },

      // Add a toast notification
      addToast: (type: ToastType, message: string, duration = 5000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, type, message, duration };

        set((state) => ({
          toasts: [...state.toasts, toast],
        }));

        // Auto-remove toast after duration
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }
      },

      // Remove a toast notification
      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },

      // Set global loading state
      setGlobalLoading: (loading: boolean, message?: string) => {
        set({
          isLoading: loading,
          loadingMessage: loading ? message || null : null,
        });
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        // Only persist sidebar state
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Selectors
export const selectSidebarCollapsed = (state: UIState) => state.sidebarCollapsed;
export const selectModal = (modalId: string) => (state: UIState) =>
  state.modals[modalId] || { isOpen: false, data: null };
export const selectToasts = (state: UIState) => state.toasts;
export const selectIsGlobalLoading = (state: UIState) => state.isLoading;
