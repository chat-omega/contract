import { MarketOverviewStats } from '../MarketOverviewStats';
import { MarketInsightsPanel } from '../MarketInsightsPanel';
import { goqiiMarketInsights } from '@/data/goqiiMarketInsights';

export function MarketSizeTab() {
  return (
    <div className="overflow-y-auto h-full bg-slate-900">
      <div className="p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-4">
          Market Size Analysis
        </h2>

        {/* Market Overview Stats */}
        <div className="mb-4">
          <MarketOverviewStats
            numberOfCompanies={goqiiMarketInsights.numberOfCompanies}
            marketSize={goqiiMarketInsights.marketSize}
            growthRate={goqiiMarketInsights.growthRate}
          />
        </div>

        {/* Market Insights Panel */}
        <MarketInsightsPanel insights={goqiiMarketInsights.insights} />
      </div>
    </div>
  );
}
