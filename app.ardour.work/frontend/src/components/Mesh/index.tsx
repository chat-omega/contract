import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Network, Code, DollarSign, TrendingUp, Users2, AlertCircle } from 'lucide-react';
import { Target, Company } from '@/types';
import { mockAnalysis } from '@/data/mockData';

interface MeshProps {
  selectedTarget: Target | null;
  selectedCompany: Company;
}

const techStackData = [
  { name: 'Frontend Alignment', score: 85, color: '#10B981' },
  { name: 'Backend Compatibility', score: 92, color: '#3B82F6' },
  { name: 'Database Sync', score: 78, color: '#8B5CF6' },
  { name: 'Cloud Infrastructure', score: 95, color: '#F59E0B' }
];

const synergyData = [
  { name: 'Cost Reduction', value: 25, color: '#EF4444' },
  { name: 'Revenue Growth', value: 40, color: '#10B981' },
  { name: 'Market Expansion', value: 35, color: '#3B82F6' }
];

export function Mesh({ selectedTarget }: MeshProps) {
  return (
    <div className="w-96 bg-white flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Network className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">MESH</h1>
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">GTM</span>
        </div>
        <p className="text-sm text-gray-500">Analysis and synergy assessment</p>
      </div>

      {selectedTarget ? (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Code className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Tech Stack Comparison</h3>
              </div>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={techStackData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                    />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {mockAnalysis.techStackComparison.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Financial Synergy</h3>
              </div>
              <div className="h-32 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={synergyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      dataKey="value"
                    >
                      {synergyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                {mockAnalysis.financialSynergy}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Recent Customer Traction</h3>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">{mockAnalysis.customerTraction}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Sensitivity Analysis</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">{mockAnalysis.sensitivityAnalysis}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-3">
                <Users2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Known Connections</h3>
              </div>
              <div className="space-y-3">
                {mockAnalysis.knownConnections.map((connection, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-900">{connection}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Network className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-700 mb-2">No Target Selected</h3>
            <p className="text-sm">Select a target from SCOUT to view detailed analysis</p>
          </div>
        </div>
      )}
    </div>
  );
}