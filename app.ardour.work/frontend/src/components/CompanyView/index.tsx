import { Building, MapPin, Users, DollarSign } from 'lucide-react';
import { Company, GrowthLever } from '@/types';

interface CompanyViewProps {
  company: Company;
  selectedLever: GrowthLever;
  onLeverChange: (lever: GrowthLever) => void;
}

const leverConfig = {
  'bolt-on': {
    label: 'Bolt-on Acquisition',
    icon: Building,
    color: 'blue',
    description: 'Strategic acquisitions to accelerate growth'
  },
  'strategic-partners': {
    label: 'Strategic Partners / GTM',
    icon: Users,
    color: 'green',
    description: 'Partnership opportunities and go-to-market strategies'
  },
  'liquidity': {
    label: 'Liquidity (Secondary)',
    icon: DollarSign,
    color: 'purple',
    description: 'Secondary market and liquidity events'
  }
};

export function CompanyView({ company, selectedLever, onLeverChange }: CompanyViewProps) {
  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-sm text-gray-500">{company.sector}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{company.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Building className="w-4 h-4" />
            <span>{company.stage}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Toggle Weight Options
        </h2>
        
        <div className="space-y-3">
          {Object.entries(leverConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isSelected = selectedLever === key;
            
            return (
              <button
                key={key}
                onClick={() => onLeverChange(key as GrowthLever)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? `border-${config.color}-200 bg-${config.color}-50 shadow-sm`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected 
                      ? `bg-${config.color}-100` 
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isSelected 
                        ? `text-${config.color}-600` 
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      isSelected ? `text-${config.color}-900` : 'text-gray-900'
                    }`}>
                      {config.label}
                    </h3>
                    <p className="text-sm text-gray-500">{config.description}</p>
                  </div>
                  {isSelected && (
                    <div className={`w-2 h-2 rounded-full bg-${config.color}-500`}></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}