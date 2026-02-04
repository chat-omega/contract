/**
 * CompanyInfoCard Component
 * Displays company information and credit rating
 */

import React from 'react';
import { cn } from '@/utils/cn';

interface CompanyInfoCardProps {
  company: {
    name: string;
    rating: string;
    sector: string;
    coverage: string;
  };
  outlook?: {
    outlook: string;
    description: string;
  };
}

export const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  company,
  outlook,
}) => {
  // Determine rating color based on rating grade
  const getRatingColor = (rating: string) => {
    const upperRating = rating.toUpperCase();
    if (upperRating.startsWith('A')) return 'bg-green-500';
    if (upperRating.startsWith('B')) return 'bg-yellow-500';
    if (upperRating.startsWith('C')) return 'bg-orange-500';
    if (upperRating.startsWith('D')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  // Determine outlook badge color
  const getOutlookColor = (outlookText: string) => {
    const lower = outlookText.toLowerCase();
    if (lower === 'positive') return 'bg-green-100 text-green-800';
    if (lower === 'stable') return 'bg-yellow-100 text-yellow-800';
    if (lower === 'negative') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
      {/* Company Name */}
      <h3 className="text-lg font-semibold text-[#212121] mb-3">
        {company.name}
      </h3>

      {/* Credit Rating */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-[#757575]">Credit Rating</span>
        <span
          className={cn(
            'px-3 py-1 rounded text-white font-bold text-sm',
            getRatingColor(company.rating)
          )}
        >
          {company.rating}
        </span>
      </div>

      {/* Sector */}
      <div className="mb-3">
        <span className="text-sm text-[#757575]">Sector</span>
        <p className="text-sm text-[#212121] font-medium">{company.sector}</p>
      </div>

      {/* Coverage */}
      <div className="mb-4">
        <span className="text-sm text-[#757575]">Coverage</span>
        <p className="text-sm text-[#212121]">{company.coverage}</p>
      </div>

      {/* Outlook Section */}
      {outlook && (
        <div className="border-t border-[#e0e0e0] pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-[#757575]">Outlook</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                getOutlookColor(outlook.outlook)
              )}
            >
              {outlook.outlook}
            </span>
          </div>
          <p className="text-sm text-[#616161] leading-relaxed">
            {outlook.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyInfoCard;
