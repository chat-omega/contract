import { Building2, TrendingUp, Activity, Target, ArrowUpRight } from 'lucide-react';
import { Portfolio, Company } from '@/types';
import { Badge } from '@/components/ui';

interface LeftRailProps {
  portfolio: Portfolio;
  selectedCompany: Company;
  onCompanySelect: (company: Company) => void;
}

export function LeftRail({ portfolio, selectedCompany, onCompanySelect }: LeftRailProps) {
  return (
    <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-slate-200/60 flex flex-col shadow-financial">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">{portfolio.name}</h1>
            <p className="text-sm text-slate-600">Investment Portfolio</p>
          </div>
        </div>
      </div>

      {/* Portfolio Companies */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Portfolio Companies
            </h2>
            <Badge variant="default" size="sm">{portfolio.companies.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {portfolio.companies.map((company) => (
              <button
                key={company.id}
                onClick={() => onCompanySelect(company)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                  selectedCompany.id === company.id
                    ? 'bg-gradient-to-r from-accent-50 to-amber-50 border-2 border-accent-200 shadow-card'
                    : 'bg-slate-50/50 border-2 border-transparent hover:bg-white hover:shadow-card hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-slate-800">
                        {company.name}
                      </h3>
                      {selectedCompany.id === company.id && (
                        <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{company.sector}</p>
                    <p className="text-xs text-slate-500">{company.location}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant="success" size="sm">{company.stage}</Badge>
                    <div className="flex items-center space-x-1 text-success-600">
                      <TrendingUp className="w-3 h-3" />
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Performance Dashboard */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Performance Dashboard
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Portfolio Value</div>
              <div className="text-lg font-bold text-slate-900">€2.4B</div>
              <div className="text-xs text-success-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.3%
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent-50 to-amber-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Active Targets</div>
              <div className="text-lg font-bold text-accent-700">24</div>
              <div className="text-xs text-accent-600 flex items-center">
                <Target className="w-3 h-3 mr-1" />
                3 regions
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Discovery Pipeline</span>
              <span className="font-semibold text-slate-900">18 companies</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Due Diligence</span>
              <span className="font-semibold text-accent-600">4 active</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
              <span className="text-sm text-slate-600">This Quarter</span>
              <span className="font-semibold text-success-600">+2 Acquisitions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}