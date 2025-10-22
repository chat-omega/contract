import { X, Target, TrendingUp, Shield, Users, Building2, Copy, Trash2, ChevronRight } from 'lucide-react';

interface MarketMapsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarketMapsListModal({ isOpen, onClose }: MarketMapsListModalProps) {
  if (!isOpen) return null;

  const mainMarketMaps = [
    { id: 1, name: 'M&A Targets for Goqii', icon: Target, iconColor: 'text-blue-400' },
    { id: 2, name: 'Investment Targets for Goqii', icon: TrendingUp, iconColor: 'text-green-400' },
    { id: 3, name: 'Competitors of Goqii', icon: Shield, iconColor: 'text-red-400' },
    { id: 4, name: 'Potential Customers for Goqii', icon: Users, iconColor: 'text-purple-400' },
    { id: 5, name: 'Potential M&A Acquirers for Goqii', icon: Building2, iconColor: 'text-orange-400' },
  ];

  const viewedCompanies = [
    { id: 1, name: 'Fitbit', logo: '🏃', sector: 'Wearables' },
    { id: 2, name: 'Withings', logo: '⌚', sector: 'Health Tech' },
    { id: 3, name: 'Garmin', logo: '🎯', sector: 'Fitness Tech' },
    { id: 4, name: 'Oura', logo: '💍', sector: 'Wellness' },
  ];

  const strategies = [
    { id: 1, name: 'Geographic Expansion Analysis', status: 'In Progress' },
    { id: 2, name: 'Product Line Extension', status: 'Completed' },
    { id: 3, name: 'Market Share Growth', status: 'Draft' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-7xl bg-slate-900 rounded-xl shadow-2xl border border-slate-700/50 animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white">Market Maps</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-3 gap-6 p-6 max-h-[80vh] overflow-y-auto">
          {/* Left Column - Main Market Maps */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Main Market Maps</h3>
              <p className="text-sm text-slate-400 mb-4">
                Quick access to common market maps tailored to your company
              </p>

              <div className="space-y-2">
                {mainMarketMaps.map((map) => {
                  const Icon = map.icon;
                  return (
                    <button
                      key={map.id}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50 text-left group"
                    >
                      <Icon className={`w-5 h-5 ${map.iconColor}`} />
                      <span className="text-sm text-slate-200 group-hover:text-white flex-1">
                        {map.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                    </button>
                  );
                })}
              </div>

              <button className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                AI Recommended Markets
              </button>
            </div>

            {/* My Market Maps Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">My Market Maps</h3>

              <div className="space-y-2">
                <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden">
                  {/* Parent Map */}
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition-colors group">
                    <div className="flex items-center space-x-3 flex-1">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-200 group-hover:text-white">
                        M&A Targets for Goqii
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1.5 hover:bg-slate-700 rounded transition-colors">
                        <Copy className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-700 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Drill-down Item */}
                  <div className="flex items-center space-x-3 px-4 py-2 pl-12 bg-slate-800/30 border-t border-slate-700/30">
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-400">
                      Wearables Tech Companies in Asia
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Strategy Analyses */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Strategy Analyses</h3>

            <div className="space-y-3">
              {strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="px-4 py-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-200 group-hover:text-white">
                      {strategy.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      strategy.status === 'Completed'
                        ? 'bg-green-500/20 text-green-400'
                        : strategy.status === 'In Progress'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {strategy.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Last updated: {Math.floor(Math.random() * 7) + 1} days ago
                  </p>
                </div>
              ))}

              <button className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors border border-slate-700/50 border-dashed">
                + Create New Analysis
              </button>
            </div>

            {/* Additional Info Section */}
            <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <h4 className="text-sm font-semibold text-white mb-2">Recent Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>New companies added to M&A Targets</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>Geographic Analysis completed</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span>3 new competitors identified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Viewed Companies */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Viewed Companies</h3>

            <div className="space-y-2">
              {viewedCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center space-x-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50 cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-xl">
                    {company.logo}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-200 group-hover:text-white">
                      {company.name}
                    </h4>
                    <p className="text-xs text-slate-500">{company.sector}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                </div>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors border border-slate-700/50">
              View All Companies
            </button>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="text-2xl font-bold text-white">127</div>
                <div className="text-xs text-slate-500">Total Companies</div>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-slate-500">Active Maps</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
