import { useEffect, useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';

interface ToastProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
}

export function Toast({ isVisible, message, onClose }: ToastProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      // Switch to success state after 1 second
      const successTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      // Auto dismiss after 3 seconds total
      const dismissTimeout = setTimeout(() => {
        onClose();
      }, 3000);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(successTimeout);
        clearTimeout(dismissTimeout);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-4 min-w-[320px] max-w-md">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${isLoading ? 'animate-spin' : ''}`}>
            {isLoading ? (
              <Loader className="w-5 h-5 text-blue-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">
              {isLoading ? 'Initiating outreach...' : 'Workflow created successfully'}
            </p>
            <p className="text-xs text-slate-600 mt-1 truncate" title={message}>
              {message}
            </p>

            {/* Progress Bar */}
            {isLoading && (
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
