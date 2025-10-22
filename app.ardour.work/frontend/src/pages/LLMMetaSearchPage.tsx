import React, { useState } from 'react';
import { Search, History, Save, ChevronDown, ChevronRight } from 'lucide-react';

export function LLMMetaSearchPage() {
  const [searchText, setSearchText] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [isQuickFiltersOpen, setIsQuickFiltersOpen] = useState(false);

  const maxResultsOptions = [25, 50, 75, 100, 150];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-base font-semibold text-white mb-2">Company Search and Screening</h1>
            <p className="text-slate-400 text-xs">
              LLM metasearch for finding the most important companies matching highly specific strategic criteria. Queries multiple AI models, verifies their responses, then screens results against your requirements. For exhaustive lists via keywords and quantitative filters, use Long-tail Search.
            </p>
          </div>

          {/* Powered By Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg px-4 py-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">Powered By</div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-medium text-white">OpenAI</div>
              <div className="w-px h-4 bg-slate-600"></div>
              <div className="text-sm font-medium text-white">Anthropic</div>
              <div className="w-px h-4 bg-slate-600"></div>
              <div className="text-sm font-medium text-white">Perplexity</div>
              <div className="w-px h-4 bg-slate-600"></div>
              <div className="text-sm font-medium text-white">Google</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Semantic Search */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-blue-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Semantic Search</h2>
          </div>

          {/* Search Textarea */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-300 mb-3">
              Describe companies you're looking for
            </label>
            <textarea
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Describe companies (e.g., 'Companies developing AI for invoice processing, with $10-50M revenue, 100+ employees in California')"
              className="w-full h-48 bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Max Results Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Max Results
              </label>
              <span className="inline-flex items-center bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-semibold">
                ⚡ 25 Credits
              </span>
            </div>
            <div className="flex gap-2">
              {maxResultsOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setMaxResults(option)}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                    maxResults === option
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors mb-4 shadow-lg shadow-blue-600/20">
            <div className="flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              Search (Max {maxResults} results)
            </div>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <button className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-lg transition-colors border border-slate-600 text-xs">
              <History className="w-4 h-4" />
              History
            </button>
            <button className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-lg transition-colors border border-slate-600 text-xs">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-white px-4 py-2 rounded-lg transition-colors border border-slate-600 text-xs">
              Saved
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filters Collapsible */}
          <div className="border-t border-slate-700/50 pt-4">
            <button
              onClick={() => setIsQuickFiltersOpen(!isQuickFiltersOpen)}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors w-full"
            >
              {isQuickFiltersOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="font-medium text-xs">Quick Filters</span>
            </button>
            {isQuickFiltersOpen && (
              <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <p className="text-slate-400 text-xs">Quick filters will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Empty State */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
          {/* Decorative Dot Grid Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>

          {/* Empty State Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[500px] text-center px-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full p-8 mb-6 backdrop-blur-sm border border-blue-500/30">
              <Search className="w-16 h-16 text-blue-400" />
            </div>

            <h3 className="text-xs font-medium text-white mb-3">Company Search</h3>

            <p className="text-slate-400 text-xs mb-8 max-w-md leading-relaxed">
              Start by describing the companies you're looking for, or create an Ideal Target Profile in your Company Profile.
            </p>

            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-6 py-3 rounded-lg transition-colors shadow-lg shadow-blue-600/30">
              Go to Company Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
