import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Rocket, 
  Network, 
  Building2, 
  ArrowLeft,
  BarChart3,
  Globe,
  Target as TargetIcon,
  Clock
} from 'lucide-react';
import { Company, ValueCreationThesis, PortfolioAnalysis } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export function ValueCreationPage() {
  const { type } = useParams<{ type: 'scout' | 'lift' | 'mesh' }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCompanies] = useState<Company[]>(location.state?.selectedCompanies || []);

  // Generate portfolio analysis based on selected companies
  const portfolioAnalysis: PortfolioAnalysis = {
    totalCompanies: selectedCompanies.length,
    totalValue: '$8.5B',
    sectorDistribution: [
      { sector: 'Technology', count: Math.floor(selectedCompanies.length * 0.4), percentage: 40 },
      { sector: 'Healthcare', count: Math.floor(selectedCompanies.length * 0.25), percentage: 25 },
      { sector: 'Finance', count: Math.floor(selectedCompanies.length * 0.2), percentage: 20 },
      { sector: 'Manufacturing', count: Math.floor(selectedCompanies.length * 0.15), percentage: 15 }
    ],
    geographicDistribution: [
      { location: 'North America', count: Math.floor(selectedCompanies.length * 0.5) },
      { location: 'Europe', count: Math.floor(selectedCompanies.length * 0.3) },
      { location: 'Asia', count: Math.floor(selectedCompanies.length * 0.2) }
    ],
    stageDistribution: [
      { stage: 'Growth', count: Math.floor(selectedCompanies.length * 0.4) },
      { stage: 'Mature', count: Math.floor(selectedCompanies.length * 0.35) },
      { stage: 'Early', count: Math.floor(selectedCompanies.length * 0.25) }
    ],
    growthPotential: 'High - 25-30% CAGR expected over 3 years',
    keyRisks: [
      'Market volatility in tech sector',
      'Regulatory changes in healthcare',
      'Geographic concentration risk'
    ],
    opportunities: [
      'Cross-portfolio synergies identified',
      'Operational efficiency improvements',
      'Market expansion opportunities',
      'Digital transformation potential'
    ]
  };

  // Mock thesis data based on type
  const getThesesByType = (): ValueCreationThesis[] => {
    const baseTheses: Record<string, ValueCreationThesis[]> = {
      scout: [
        {
          id: '1',
          title: 'AI/ML Platform Consolidation',
          description: 'Acquire and integrate complementary AI/ML companies to create a comprehensive platform offering',
          category: 'scout',
          potentialValue: '$2.5B',
          timeframe: '18-24 months',
          riskLevel: 'medium',
          keyMetrics: ['3x revenue multiple', '40% EBITDA margin', '85% customer retention']
        },
        {
          id: '2',
          title: 'Vertical SaaS Roll-up',
          description: 'Consolidate vertical-specific SaaS solutions to dominate niche markets',
          category: 'scout',
          potentialValue: '$1.8B',
          timeframe: '12-18 months',
          riskLevel: 'low',
          keyMetrics: ['5x ARR growth', '30% market share', '90% gross margin']
        },
        {
          id: '3',
          title: 'Geographic Expansion Play',
          description: 'Acquire regional leaders to establish global footprint',
          category: 'scout',
          potentialValue: '$3.2B',
          timeframe: '24-36 months',
          riskLevel: 'high',
          keyMetrics: ['8 new markets', '2x revenue growth', '25% cost synergies']
        },
        {
          id: '4',
          title: 'Supply Chain Technology Integration',
          description: 'Build end-to-end supply chain platform through strategic acquisitions',
          category: 'scout',
          potentialValue: '$2.0B',
          timeframe: '18-24 months',
          riskLevel: 'medium',
          keyMetrics: ['30% efficiency gains', '4x platform value', '60% customer adoption']
        }
      ],
      lift: [
        {
          id: '5',
          title: 'Operational Excellence Program',
          description: 'Implement best-in-class operational practices across portfolio companies',
          category: 'lift',
          potentialValue: '$1.5B',
          timeframe: '12-18 months',
          riskLevel: 'low',
          keyMetrics: ['20% cost reduction', '15% margin improvement', '2x productivity']
        },
        {
          id: '6',
          title: 'Digital Transformation Initiative',
          description: 'Modernize technology infrastructure and digital capabilities',
          category: 'lift',
          potentialValue: '$2.2B',
          timeframe: '24-30 months',
          riskLevel: 'medium',
          keyMetrics: ['50% process automation', '35% revenue from digital', '3x customer engagement']
        },
        {
          id: '7',
          title: 'Talent & Leadership Development',
          description: 'Build world-class management teams and organizational capabilities',
          category: 'lift',
          potentialValue: '$1.0B',
          timeframe: '18-24 months',
          riskLevel: 'low',
          keyMetrics: ['90% leadership retention', '25% productivity gain', '4.5/5 employee satisfaction']
        },
        {
          id: '8',
          title: 'Customer Experience Enhancement',
          description: 'Transform customer journey and experience across touchpoints',
          category: 'lift',
          potentialValue: '$1.8B',
          timeframe: '12-18 months',
          riskLevel: 'medium',
          keyMetrics: ['NPS > 70', '30% churn reduction', '25% upsell increase']
        }
      ],
      mesh: [
        {
          id: '9',
          title: 'Cross-Portfolio Revenue Synergies',
          description: 'Enable portfolio companies to sell into each other\'s customer bases',
          category: 'mesh',
          potentialValue: '$1.2B',
          timeframe: '6-12 months',
          riskLevel: 'low',
          keyMetrics: ['15% revenue uplift', '50 cross-sell deals', '2x deal velocity']
        },
        {
          id: '10',
          title: 'Shared Services Platform',
          description: 'Create centralized services for HR, IT, procurement across portfolio',
          category: 'mesh',
          potentialValue: '$800M',
          timeframe: '12-18 months',
          riskLevel: 'medium',
          keyMetrics: ['30% cost savings', '90% adoption rate', '5x efficiency']
        },
        {
          id: '11',
          title: 'Innovation & R&D Collaboration',
          description: 'Foster innovation through shared R&D initiatives and IP sharing',
          category: 'mesh',
          potentialValue: '$1.5B',
          timeframe: '18-24 months',
          riskLevel: 'high',
          keyMetrics: ['10 joint products', '25% R&D efficiency', '3x innovation speed']
        },
        {
          id: '12',
          title: 'Strategic Partnership Network',
          description: 'Build ecosystem of strategic partners benefiting entire portfolio',
          category: 'mesh',
          potentialValue: '$2.0B',
          timeframe: '12-24 months',
          riskLevel: 'medium',
          keyMetrics: ['20 strategic partners', '40% revenue from partnerships', '3x market reach']
        }
      ]
    };

    return baseTheses[type || 'scout'];
  };

  const theses = getThesesByType();

  const getTypeIcon = () => {
    switch (type) {
      case 'scout':
        return <TrendingUp className="w-5 h-5 text-white" />;
      case 'lift':
        return <Rocket className="w-5 h-5 text-white" />;
      case 'mesh':
        return <Network className="w-5 h-5 text-white" />;
      default:
        return <TrendingUp className="w-5 h-5 text-white" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'scout':
        return 'from-green-600 to-green-700';
      case 'lift':
        return 'from-purple-600 to-purple-700';
      case 'mesh':
        return 'from-indigo-600 to-indigo-700';
      default:
        return 'from-blue-600 to-blue-700';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleThesisClick = (thesis: ValueCreationThesis) => {
    navigate(`/value-creation/${type}/thesis/${thesis.id}`, {
      state: { thesis, selectedCompanies }
    });
  };

  if (selectedCompanies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Companies Selected</h2>
              <p className="text-slate-600 mb-6">Please select portfolio companies to view value creation opportunities.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Portfolio
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${getTypeColor()} rounded-xl flex items-center justify-center`}>
                  {getTypeIcon()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 capitalize">
                    {type} - Value Creation Opportunities
                  </h1>
                  <p className="text-sm text-slate-600">
                    {selectedCompanies.length} portfolio companies selected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Portfolio Analysis Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Portfolio Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Portfolio Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Companies</span>
                    <span className="font-semibold">{portfolioAnalysis.totalCompanies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Value</span>
                    <span className="font-semibold text-green-600">{portfolioAnalysis.totalValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Growth Potential</span>
                    <span className="font-semibold text-blue-600">25-30% CAGR</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sector Distribution Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <span>Sector Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {portfolioAnalysis.sectorDistribution.map((sector) => (
                    <div key={sector.sector} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{sector.sector}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${sector.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-10 text-right">{sector.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Opportunities Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TargetIcon className="w-5 h-5 text-green-600" />
                  <span>Key Opportunities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {portfolioAnalysis.opportunities.slice(0, 3).map((opp, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-sm text-slate-700">{opp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Value Creation Thesis Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Value Creation Thesis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {theses.map((thesis) => (
              <Card
                key={thesis.id}
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
                onClick={() => handleThesisClick(thesis)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{thesis.title}</CardTitle>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(thesis.riskLevel)}`}>
                      {thesis.riskLevel} risk
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{thesis.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-slate-500 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Potential Value</span>
                      </div>
                      <p className="font-semibold text-green-600">{thesis.potentialValue}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-slate-500 mb-1">
                        <Clock className="w-4 h-4" />
                        <span>Timeframe</span>
                      </div>
                      <p className="font-semibold">{thesis.timeframe}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-slate-500 mb-2">KEY METRICS</p>
                    <div className="flex flex-wrap gap-2">
                      {thesis.keyMetrics.map((metric, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}