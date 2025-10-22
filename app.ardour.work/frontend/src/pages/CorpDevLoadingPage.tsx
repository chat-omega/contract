import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function CorpDevLoadingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3);

  // Get company info from route state
  const companyName = location.state?.companyName || 'your company';
  const companyLogo = location.state?.companyLogo;
  const primaryInterest = location.state?.primaryInterest;

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / 30); // 30 increments over 3 seconds
      });
    }, 100);

    // Time remaining countdown
    const timeInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timeInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Navigate after 3 seconds
    const navigationTimer = setTimeout(() => {
      navigate('/corp-dev/analyst', {
        state: {
          companyName,
          companyLogo,
          primaryInterest,
        }
      });
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
      clearTimeout(navigationTimer);
    };
  }, [navigate, companyName, companyLogo, primaryInterest]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              2
            </div>
            <span className="text-sm font-medium text-gray-300">Step 2 of 2</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-8">
          {/* AI Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center animate-pulse">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-xl animate-pulse"></div>
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Generating Company Profile
            </h1>
            <p className="text-gray-400 text-lg">
              We're tailoring the experience for{' '}
              <span className="text-white font-semibold">{companyName}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3 px-8">
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
              </div>
            </div>

            {/* Progress Text */}
            <p className="text-gray-400 text-sm">
              {timeRemaining > 0 ? (
                <>Analyzing your company... {timeRemaining} second{timeRemaining !== 1 ? 's' : ''} remaining</>
              ) : (
                <>Almost ready...</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Add shimmer animation styles */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
