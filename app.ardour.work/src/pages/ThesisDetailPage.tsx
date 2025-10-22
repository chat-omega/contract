import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Clock, AlertTriangle, Target as TargetIcon } from 'lucide-react';
import { ValueCreationThesis, Company, TargetCompany } from '@/types';
import { mockTargetCompanies } from '@/data/mockData';
import { TargetSourcingTable } from '@/components/TargetSourcingTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export function ThesisDetailPage() {
  const { type } = useParams<{ type: 'scout' | 'lift' | 'mesh'; thesisId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [thesis] = useState<ValueCreationThesis | null>(location.state?.thesis || null);
  const [selectedCompanies] = useState<Company[]>(location.state?.selectedCompanies || []);
  const [targetCompanies] = useState<TargetCompany[]>(mockTargetCompanies);

  useEffect(() => {
    if (!thesis) {
      // Redirect back if no thesis data is provided
      navigate(`/value-creation/${type}`);
    }
  }, [thesis, type, navigate]);

  if (!thesis) {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/value-creation/${type}`, { state: { selectedCompanies } })}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{thesis.title}</h1>
                <p className="text-sm text-slate-600 mt-1">{thesis.description}</p>
              </div>
            </div>
            <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${getRiskColor(thesis.riskLevel)}`}>
              {thesis.riskLevel} risk
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Thesis Metrics */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${getTypeColor()} rounded-lg flex items-center justify-center`}>
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Potential Value</p>
                    <p className="text-xl font-bold text-green-600">{thesis.potentialValue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Timeframe</p>
                    <p className="text-xl font-bold text-slate-900">{thesis.timeframe}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Risk Level</p>
                    <p className="text-xl font-bold text-slate-900 capitalize">{thesis.riskLevel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <TargetIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Target Companies</p>
                    <p className="text-xl font-bold text-slate-900">{targetCompanies.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Metrics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Key Success Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {thesis.keyMetrics.map((metric, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                  <span className="text-blue-600">✓</span>
                  <span className="text-sm text-slate-700">{metric}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Implementation Roadmap */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Implementation Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">Initial Assessment (Month 1-2)</h4>
                  <p className="text-sm text-slate-600 mt-1">Conduct due diligence on target companies, assess strategic fit, and prioritize opportunities</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">Engagement & Negotiation (Month 3-6)</h4>
                  <p className="text-sm text-slate-600 mt-1">Initiate discussions with high-priority targets, negotiate terms, and structure deals</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">Integration Planning (Month 6-9)</h4>
                  <p className="text-sm text-slate-600 mt-1">Develop integration plans, identify synergies, and prepare for operational alignment</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">4</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">Execution & Value Capture (Month 9+)</h4>
                  <p className="text-sm text-slate-600 mt-1">Execute integration, realize synergies, and track value creation metrics</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Sourcing Table */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Potential Target Companies</h2>
          <TargetSourcingTable 
            targets={targetCompanies}
            onContactSelect={(target, contact) => {
              console.log('Contact selected:', target, contact);
            }}
          />
        </div>
      </div>
    </div>
  );
}