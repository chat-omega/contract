import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Building2, CheckCircle2 } from 'lucide-react';

interface PrimaryInterest {
  id: string;
  title: string;
  description: string;
}

const primaryInterests: PrimaryInterest[] = [
  {
    id: 'ma',
    title: 'M&A Opportunities',
    description: 'You are looking to acquire companies that fit your strategic objectives'
  },
  {
    id: 'investment',
    title: 'Investment Opportunities',
    description: 'You are looking to invest in companies with growth potential'
  },
  {
    id: 'partnership',
    title: 'Partnership Opportunities',
    description: 'You are looking to form strategic partnerships with other companies'
  },
  {
    id: 'customers',
    title: 'Customers',
    description: 'You are looking to do business development and strategic selling'
  }
];

export function CorpDevProfilerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);

  // Get company info from route state or query params
  const companyName = location.state?.companyName || new URLSearchParams(location.search).get('company') || 'Your Company';
  const companyLogo = location.state?.companyLogo;

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  const handleContinue = () => {
    if (!selectedInterest) return;

    // Navigate to loading/next step with selected data
    navigate('/corp-dev/loading', {
      state: {
        companyName,
        companyLogo,
        primaryInterest: selectedInterest,
        interestData: primaryInterests.find(i => i.id === selectedInterest)
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-4xl">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Section */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-200">
            <div className="flex items-start space-x-4 mb-6">
              {companyLogo ? (
                <img src={companyLogo} alt={companyName} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">Corporate Development Profiler</h1>
                <p className="text-gray-600 mt-1">Set up your profile to get personalized insights</p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Your Organization</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4 rounded-full">
                <div className="h-full w-1/2 bg-blue-600 rounded-full"></div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Preferences</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Primary Interest</h2>
              <p className="text-gray-600">What is your main focus for using this platform?</p>
            </div>

            {/* Radio Button Options */}
            <div className="space-y-4">
              {primaryInterests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => setSelectedInterest(interest.id)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                    selectedInterest === interest.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Radio Circle */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                      selectedInterest === interest.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {selectedInterest === interest.id && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${
                        selectedInterest === interest.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {interest.title}
                      </h3>
                      <p className={`text-sm ${
                        selectedInterest === interest.id ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {interest.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Section */}
          <div className="px-8 py-6 border-t border-gray-200 flex items-center justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedInterest}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedInterest
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Company Name Display */}
        {companyName && companyName !== 'Your Company' && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Setting up profile for <span className="text-white font-medium">{companyName}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
