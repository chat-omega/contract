import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { MarketInsight } from '@/data/goqiiMarketInsights';

interface InsightBoxProps {
  insight: MarketInsight;
  defaultExpanded?: boolean;
}

function InsightBox({ insight, defaultExpanded = false }: InsightBoxProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        <span className="text-xs font-semibold text-white">{insight.title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Content - Expandable */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-700/30">
          <div className="prose prose-xs prose-invert max-w-none mt-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {insight.content}
            </ReactMarkdown>
          </div>

          {/* Sources */}
          {insight.sources && insight.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-700/30">
              <div className="text-xs font-semibold text-slate-400 mb-2">Sources:</div>
              <div className="space-y-1">
                {insight.sources.map((source, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-xs text-slate-500 flex-shrink-0">[{index + 1}]</span>
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center space-x-1 break-all"
                    >
                      <span>{source}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MarketInsightsPanelProps {
  insights: {
    companies: MarketInsight;
    marketValue: MarketInsight;
    growthRate: MarketInsight;
  };
}

export function MarketInsightsPanel({ insights }: MarketInsightsPanelProps) {
  return (
    <div className="space-y-2">
      <InsightBox insight={insights.companies} defaultExpanded={true} />
      <InsightBox insight={insights.marketValue} defaultExpanded={true} />
      <InsightBox insight={insights.growthRate} defaultExpanded={true} />
    </div>
  );
}
