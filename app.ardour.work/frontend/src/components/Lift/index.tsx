import { useState } from 'react';
import { TrendingUp, Users, BarChart3, ArrowUpRight, Calendar, Award } from 'lucide-react';
import { Company, Target as TargetType } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';

interface LiftProps {
  selectedCompany: Company;
  selectedTarget: TargetType | null;
}

interface LiftInitiative {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed';
  impact: 'high' | 'medium' | 'low';
  timeline: string;
  expectedLift: string;
  owner: string;
  metrics: {
    current: string;
    target: string;
    label: string;
  }[];
}

const mockLiftInitiatives: LiftInitiative[] = [
  {
    id: '1',
    title: 'Cross-Platform Integration',
    description: 'Integrate existing portfolio company technologies to create unified platform offering',
    status: 'active',
    impact: 'high',
    timeline: 'Q2 2024',
    expectedLift: '+25% Revenue',
    owner: 'Digital Transformation Team',
    metrics: [
      { current: '$2.4M', target: '$3.0M', label: 'ARR' },
      { current: '12%', target: '18%', label: 'Margin' }
    ]
  },
  {
    id: '2',
    title: 'Commercial Excellence Program',
    description: 'Implement best-in-class sales and marketing processes across portfolio',
    status: 'planning',
    impact: 'high',
    timeline: 'Q3 2024',
    expectedLift: '+15% Growth',
    owner: 'Commercial Team',
    metrics: [
      { current: '8%', target: '12%', label: 'Win Rate' },
      { current: '45 days', target: '30 days', label: 'Sales Cycle' }
    ]
  },
  {
    id: '3',
    title: 'Operational Efficiency Initiative',
    description: 'Streamline operations and reduce costs through shared services and automation',
    status: 'active',
    impact: 'medium',
    timeline: 'Q1 2024',
    expectedLift: '+8% EBITDA',
    owner: 'Operations Team',
    metrics: [
      { current: '22%', target: '30%', label: 'EBITDA Margin' },
      { current: '120', target: '95', label: 'FTE Count' }
    ]
  },
  {
    id: '4',
    title: 'Market Expansion Strategy',
    description: 'Leverage combined capabilities to enter new geographic markets',
    status: 'completed',
    impact: 'high',
    timeline: 'Completed Q4 2023',
    expectedLift: '+35% TAM',
    owner: 'Business Development',
    metrics: [
      { current: '3', target: '5', label: 'Markets' },
      { current: '$12M', target: '$18M', label: 'Pipeline' }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'active': return 'warning';
    case 'planning': return 'default';
    default: return 'default';
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-slate-600';
  }
};

export function Lift({ selectedCompany }: LiftProps) {
  const [selectedInitiative, setSelectedInitiative] = useState<LiftInitiative | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 flex relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-orange-600">LIFT</h1>
                  <Badge variant="orange" size="sm">Value Creation</Badge>
                </div>
                <p className="text-sm text-slate-600">Portfolio enhancement & value acceleration initiatives</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-slate-500">Active Company</div>
              <div className="font-semibold text-slate-900">{selectedCompany.name}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Panel - Initiative List */}
          <div className="w-1/2 bg-white border-r border-slate-200 p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Value Creation Initiatives</h2>
              <p className="text-sm text-slate-600">Strategic initiatives to accelerate portfolio company growth and value</p>
            </div>

            <div className="space-y-4">
              {mockLiftInitiatives.map((initiative) => (
                <Card
                  key={initiative.id}
                  onClick={() => setSelectedInitiative(initiative)}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    selectedInitiative?.id === initiative.id ? 'ring-2 ring-orange-500 border-orange-300 shadow-lg' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-2">{initiative.title}</CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={getStatusColor(initiative.status)} size="sm">
                            {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
                          </Badge>
                          <span className={`text-sm font-medium ${getImpactColor(initiative.impact)}`}>
                            {initiative.impact.charAt(0).toUpperCase() + initiative.impact.slice(1)} Impact
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">{initiative.expectedLift}</div>
                        <div className="text-xs text-slate-500">{initiative.timeline}</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{initiative.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">{initiative.owner}</span>
                      </div>
                      <div className="flex items-center text-orange-600 hover:text-orange-700 transition-colors">
                        <span className="font-medium">View Details</span>
                        <ArrowUpRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Panel - Initiative Details */}
          <div className="w-1/2 bg-slate-50 p-6 overflow-y-auto">
            {selectedInitiative ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedInitiative.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(selectedInitiative.status)}>
                          {selectedInitiative.status.charAt(0).toUpperCase() + selectedInitiative.status.slice(1)}
                        </Badge>
                        <span className={`text-sm font-medium ${getImpactColor(selectedInitiative.impact)}`}>
                          {selectedInitiative.impact.charAt(0).toUpperCase() + selectedInitiative.impact.slice(1)} Impact
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">{selectedInitiative.expectedLift}</div>
                      <div className="text-sm text-slate-500">Expected Lift</div>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{selectedInitiative.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div className="text-sm text-slate-500 uppercase tracking-wide">Timeline</div>
                    </div>
                    <div className="font-semibold text-slate-900">{selectedInitiative.timeline}</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div className="text-sm text-slate-500 uppercase tracking-wide">Owner</div>
                    </div>
                    <div className="font-semibold text-slate-900">{selectedInitiative.owner}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Key Metrics</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedInitiative.metrics.map((metric, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">{metric.label}</div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-slate-500">Current</div>
                            <div className="font-bold text-slate-900">{metric.current}</div>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-orange-500" />
                          <div className="text-right">
                            <div className="text-sm text-slate-500">Target</div>
                            <div className="font-bold text-orange-600">{metric.target}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>Success Metrics</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Revenue Impact</span>
                      <span className="font-medium text-green-600">+{selectedInitiative.expectedLift}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Implementation Progress</span>
                      <span className="font-medium text-slate-900">
                        {selectedInitiative.status === 'completed' ? '100%' : 
                         selectedInitiative.status === 'active' ? '65%' : '15%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Risk Level</span>
                      <span className={`font-medium ${
                        selectedInitiative.impact === 'high' ? 'text-red-600' : 
                        selectedInitiative.impact === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {selectedInitiative.impact === 'high' ? 'Medium' : 'Low'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button className="btn-primary flex-1">
                    Update Initiative
                  </button>
                  <button className="btn-secondary flex-1">
                    View Analytics
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-medium text-slate-900 mb-2">Select an Initiative</h3>
                <p className="text-slate-500 text-sm">Choose a value creation initiative to view detailed metrics and progress</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}