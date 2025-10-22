import { Building2, Globe, DollarSign, Users, Mail, Phone, Linkedin, X } from 'lucide-react';
import { Badge } from '@/components/ui';

interface ContactInfo {
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
}

interface PotentialTarget {
  name: string;
  type: string;
  location: string;
  dealSize: string;
  strategicRationale: string;
  contacts: ContactInfo[];
}

interface ValueCreationThesis {
  id: number;
  title: string;
  description: string;
  potentialValue: string;
  timeframe: string;
  targets: PotentialTarget[];
}

interface TargetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: PotentialTarget | null;
  thesis: ValueCreationThesis | null;
  onEmailClick?: (contact: ContactInfo, target: PotentialTarget, thesis: ValueCreationThesis) => void;
}

export function TargetDetailModal({ isOpen, onClose, target, thesis, onEmailClick }: TargetDetailModalProps) {
  if (!isOpen || !target || !thesis) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEmailContactClick = (contact: ContactInfo) => {
    if (onEmailClick) {
      onEmailClick(contact, target, thesis);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{target.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant="default" size="sm" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                    {target.type}
                  </Badge>
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {target.location}
                  </span>
                  <span className="flex items-center font-semibold">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {target.dealSize}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Thesis Context */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Value Creation Thesis</h3>
            <p className="text-sm font-medium text-blue-600 mb-1">#{thesis.id}. {thesis.title}</p>
            <div className="flex items-center space-x-4 text-xs text-slate-600">
              <span className="font-semibold text-green-600">{thesis.potentialValue}</span>
              <span>{thesis.timeframe}</span>
            </div>
          </div>

          {/* Strategic Rationale */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Strategic Rationale
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">{target.strategicRationale}</p>
          </div>

          {/* Key Contacts */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Key Contacts ({target.contacts.length})
            </h3>
            <div className="space-y-4">
              {target.contacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-base">{contact.name}</h4>
                      <p className="text-sm text-slate-600">{contact.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Email */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">Email</p>
                        {onEmailClick ? (
                          <button
                            onClick={() => handleEmailContactClick(contact)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium truncate block w-full text-left transition-colors"
                          >
                            {contact.email}
                          </button>
                        ) : (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium truncate block transition-colors"
                          >
                            {contact.email}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">Phone</p>
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-sm text-slate-700 hover:text-slate-900 font-medium transition-colors"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="flex items-center space-x-2 md:col-span-2">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Linkedin className="w-4 h-4 text-blue-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">LinkedIn</p>
                        <a
                          href={`https://${contact.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium truncate block transition-colors"
                        >
                          {contact.linkedin}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// Missing Target import fix
function Target({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
