interface MetricCardProps {
  value: string | number;
  label: string;
}

function MetricCard({ value, label }: MetricCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800 hover:border-slate-600/50 transition-all">
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-white mb-1 break-words">
          {value}
        </div>
        <div className="text-xs text-slate-400">
          {label}
        </div>
      </div>
    </div>
  );
}

interface MarketOverviewStatsProps {
  numberOfCompanies: number;
  marketSize: string;
  growthRate: string;
}

export function MarketOverviewStats({ numberOfCompanies, marketSize, growthRate }: MarketOverviewStatsProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard
          value={numberOfCompanies}
          label="Est. Number of Companies"
        />
        <MetricCard
          value={marketSize}
          label="Current Market Size"
        />
        <MetricCard
          value={growthRate}
          label="Growth Rate (CAGR)"
        />
      </div>
    </div>
  );
}
