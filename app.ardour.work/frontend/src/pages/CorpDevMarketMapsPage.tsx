import { useState } from 'react';
import { TrendingUp, DollarSign, Target, Building2, FileText, MessageSquare } from 'lucide-react';
import { MarketMapsSidebar } from '@/components/MarketMapsSidebar';
import { TrendingTab, MarketSizeTab, StrategiesTab, CompaniesTab, AnalysesTab, AnalystQATab } from '@/components/marketmaps';

// Tab type
type TabType = 'trending' | 'market-size' | 'strategies' | 'companies' | 'analyses' | 'analyst-qa';

export function CorpDevMarketMapsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('trending');

  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'market-size', label: 'Market Size', icon: DollarSign },
    { id: 'strategies', label: 'Strategies', icon: Target },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'analyses', label: 'Analyses', icon: FileText },
    { id: 'analyst-qa', label: 'Analyst Q&A', icon: MessageSquare },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'trending': return <TrendingTab />;
      case 'market-size': return <MarketSizeTab />;
      case 'strategies': return <StrategiesTab />;
      case 'companies': return <CompaniesTab />;
      case 'analyses': return <AnalysesTab />;
      case 'analyst-qa': return <AnalystQATab />;
      default: return <TrendingTab />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700/20 px-6 py-4">
        {/* Title and Tabs */}
        <div>
          <h1 className="text-base font-semibold text-white mb-4">
            M&A Targets for the company Goqii (goqii.com)
          </h1>

          {/* Tabs - RIGHT ALIGNED */}
          <div className="flex justify-end space-x-1 border-b border-slate-700/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Market Visualization Sidebar */}
        <div className="w-1/2 flex-shrink-0 border-r border-slate-700/20">
          <MarketMapsSidebar />
        </div>

        {/* Right: Tab Content */}
        <div className="w-1/2 overflow-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

// Trending Tab Component
