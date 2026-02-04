/**
 * useToast Hook
 * Simple toast notification hook
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export const useToast = () => {
  const addToast = (type: ToastType, message: string) => {
    // Simple console log for now - can be replaced with actual toast library
    console.log(`[${type.toUpperCase()}]`, message);

    // You can integrate with a toast library here (e.g., react-hot-toast, sonner, etc.)
    if (type === 'error') {
      alert(`Error: ${message}`);
    }
  };

  return { addToast };
};
