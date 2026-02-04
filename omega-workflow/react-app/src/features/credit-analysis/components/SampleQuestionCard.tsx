/**
 * SampleQuestionCard Component
 * Clickable card with sample questions for credit analysis
 */

import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface SampleQuestionCardProps {
  question: string;
  onClick: (question: string) => void;
}

export const SampleQuestionCard: React.FC<SampleQuestionCardProps> = ({
  question,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(question)}
      className="group relative bg-white border border-[#e0e0e0] rounded-lg p-4 text-left transition-all duration-200 hover:border-[#6366f1] hover:shadow-[0_4px_12px_rgba(99,102,241,0.15)] hover:-translate-y-0.5"
    >
      <p className="text-sm text-[#424242] pr-6 leading-relaxed">
        {question}
      </p>
      <ArrowRightIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6366f1] opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default SampleQuestionCard;
