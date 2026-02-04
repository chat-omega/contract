/**
 * CreditReportView Component
 * Displays the full credit analysis report with charts
 */

import React, { useState } from 'react';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { CompanyInfoCard } from './CompanyInfoCard';
import { MetricChart } from './MetricChart';
import type { CreditResultsResponse } from '@/services/creditAnalysisService';

interface CreditReportViewProps {
  report: CreditResultsResponse;
  onBack: () => void;
  onFollowUp: (question: string) => void;
}

export const CreditReportView: React.FC<CreditReportViewProps> = ({
  report,
  onBack,
  onFollowUp,
}) => {
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  const handleSubmitFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUpQuestion.trim()) {
      onFollowUp(followUpQuestion.trim());
      setFollowUpQuestion('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e0e0e0] mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#6366f1] hover:text-[#4f46e5] transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium">Back to Chat</span>
        </button>
        <h2 className="text-xl font-semibold text-[#212121]">
          Credit Analysis Report
        </h2>
      </div>

      {/* Report Content - Split Layout */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Analysis (60%) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">
                Analysis
              </h3>
              <div
                className="prose prose-sm max-w-none text-[#424242]"
                dangerouslySetInnerHTML={{ __html: report.analysis?.html || '' }}
              />
            </div>
          </div>

          {/* Right Column - Widgets (40%) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Company Info Card */}
            <CompanyInfoCard
              company={report.company}
              outlook={report.outlook}
            />

            {/* Probability of Default Chart */}
            {report.pod && (
              <MetricChart
                title="Probability of Default"
                value={report.pod.value}
                subtitle={report.pod.horizon}
                change={report.pod.change}
                timeSeries={report.pod.timeSeries}
                color="red"
              />
            )}

            {/* Credit Spread Chart */}
            {report.spread && (
              <MetricChart
                title="Credit Spread"
                value={report.spread.value}
                subtitle={report.spread.term}
                change={report.spread.change}
                timeSeries={report.spread.timeSeries}
                color="indigo"
              />
            )}
          </div>
        </div>
      </div>

      {/* Follow-up Question Input */}
      <div className="mt-6 pt-4 border-t border-[#e0e0e0]">
        <form onSubmit={handleSubmitFollowUp} className="flex gap-3">
          <input
            type="text"
            value={followUpQuestion}
            onChange={(e) => setFollowUpQuestion(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={!followUpQuestion.trim()}
            className="px-6 py-3 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5] disabled:bg-[#e0e0e0] disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreditReportView;
