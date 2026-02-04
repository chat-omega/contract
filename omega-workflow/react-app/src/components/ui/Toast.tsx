/**
 * Toast Component
 * Notification toast that integrates with uiStore
 */

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';
import { useUIStore } from '@stores/uiStore';
import type { ToastType } from '@/types';

const toastIcons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const toastColors: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-green-50',
    icon: 'text-green-400',
    border: 'border-green-200',
  },
  error: {
    bg: 'bg-red-50',
    icon: 'text-red-400',
    border: 'border-red-200',
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-400',
    border: 'border-yellow-200',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'text-blue-400',
    border: 'border-blue-200',
  },
};

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id: _id, type, message, onClose }) => {
  const Icon = toastIcons[type];
  const colors = toastColors[type];

  return (
    <Transition
      show={true}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={cn(
          'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border',
          colors.bg,
          colors.border
        )}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={cn('h-6 w-6', colors.icon)} />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

/**
 * ToastContainer - Renders all active toasts from the store
 * Place this once in your app layout
 */
export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
