import { useState } from 'react';
import { TrendingUp, DollarSign, Target, Building2, FileText, MessageSquare, ChevronLeft, Download, Bookmark, Settings } from 'lucide-react';

// Tab type
type TabType = 'trending' | 'market-size' | 'strategies' | 'companies' | 'analyses' | 'analyst-qa';

export function MarketMapsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('trending');

  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'market-size', label: 'Market Size', icon: DollarSign },
    { id: 'strategies', label: 'Strategies', icon: Target },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'analyses', label: 'Analyses', icon: FileText },
    { id: 'analyst-qa', label: 'Analyst Q&A', icon: MessageSquare },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-3 text-slate-300">
              <button className="hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  M&A Targets for Goqii (goqii.com)
                </h1>
                <p className="text-sm text-slate-400">
                  Digital Health, Wellness, and Connected Wearables
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Bookmark className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex space-x-1 border-b border-slate-700/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'trending' && <TrendingTab />}
        {activeTab === 'market-size' && <MarketSizeTab />}
        {activeTab === 'strategies' && <StrategiesTab />}
        {activeTab === 'companies' && <CompaniesTab />}
        {activeTab === 'analyses' && <AnalysesTab />}
        {activeTab === 'analyst-qa' && <AnalystQATab />}
      </main>
    </div>
  );
}

// Trending Tab Component
function TrendingTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sunburst Visualization */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
        <div id="sunburst-chart" className="w-full h-[600px] flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Sunburst Visualization</p>
            <p className="text-sm text-slate-500 mt-2">D3.js chart will be rendered here</p>
          </div>
        </div>

        {/* Growth Rate Indicator */}
        <div className="mt-4 bg-slate-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Growth Rate</span>
            <div className="flex items-center space-x-3 flex-1 mx-4">
              <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full w-[15%]"></div>
              </div>
            </div>
            <span className="text-sm font-bold text-green-400">15%</span>
          </div>
        </div>
      </div>

      {/* Trends Panel */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 max-h-[700px] overflow-y-auto">
        <h2 className="text-lg font-bold text-white mb-6">
          Key Trends for the M&A Target Market
        </h2>

        <div className="space-y-6">
          {trends.map((trend, idx) => (
            <div key={idx} className="pb-6 border-b border-slate-700/30 last:border-0">
              <h3 className="font-semibold text-white mb-2 flex items-start">
                <span className={`text-2xl mr-2 ${trend.color}`}>•</span>
                <span>{trend.title}</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed ml-7">
                {trend.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-slate-500">Updated 1 hour ago</span>
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

// Market Size Tab Component
function MarketSizeTab() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-6">
        <MetricCard
          label="Est. Number of Companies"
          value="700"
          sublabel="—"
        />
        <MetricCard
          label="Current Market Size"
          value="—"
          sublabel="—"
        />
        <MetricCard
          label="Growth Rate Class"
          value="—"
          sublabel="—"
        />
      </div>

      {/* Market Segments Table */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4">Market Value (USD)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Market Segment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">2025 Estimated Value (USD)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Source</th>
              </tr>
            </thead>
            <tbody>
              {marketSegments.map((segment, idx) => (
                <tr key={idx} className="border-b border-slate-700/30">
                  <td className="py-3 px-4 text-sm text-white">{segment.name}</td>
                  <td className="py-3 px-4 text-sm text-white">{segment.value}</td>
                  <td className="py-3 px-4 text-sm">
                    <a href={segment.source} className="text-blue-400 hover:text-blue-300">Link</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Strategies Tab Component
function StrategiesTab() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">M&A Strategies for Goqii</h2>
          <p className="text-slate-400 mt-1">Based on market analysis and Goqii.com Market Entry Advisors</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 transition-colors">
          Refresh Insights
        </button>
      </div>

      {/* Current State */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4">Your Current State</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="text-green-400 font-semibold mb-2">Current Offerings:</h4>
            <p className="text-slate-300 leading-relaxed">
              AI-powered preventive healthcare platform integrating consumer wearables (proprietary GOQii band),
              connected fitness apps (GOQii Care), and chronic disease management.
            </p>
          </div>
        </div>
      </div>

      {/* Acquisition Targets */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">What's Available to Acquire</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {acquisitionTargets.map((target) => (
            <div key={target.id} className="bg-slate-800/50 backdrop-blur rounded-xl p-5 border-2 border-green-500/50">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-white font-semibold">{target.type}</h4>
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  {target.badge}
                </span>
              </div>
              <div className="flex gap-2 mb-3">
                <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">
                  ~${target.valueRange}
                </span>
                <span className="px-3 py-1 bg-slate-700 text-green-400 text-xs rounded-lg">
                  {target.growthRate}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">{target.description}</p>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Find Companies
                </button>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-colors">
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Companies Tab Component
function CompaniesTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚡</span>
          <span className="text-white">
            <strong>Quick Results: 86 companies</strong> / 2000 estimated total
          </span>
          <span className="text-slate-500 text-sm">Updated 6 minutes ago</span>
        </div>
      </div>

      {/* Category Filters */}
      <div>
        <p className="text-sm text-slate-400 mb-3">Filter by category (click to filter)</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}: {cat.count}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {companies.map((company, idx) => (
          <div
            key={idx}
            className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer"
          >
            <div className="text-center">
              <div className="text-sm font-medium text-slate-300">{company}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Analyses Tab Component
function AnalysesTab() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Market Analyses</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          + New Document
        </button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Document Name</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Category</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Last Updated</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-700/30">
              <td className="py-4 px-6 text-sm text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>New Document</span>
              </td>
              <td className="py-4 px-6">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">Market</span>
              </td>
              <td className="py-4 px-6 text-sm text-slate-400">N/A</td>
              <td className="py-4 px-6">
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                    Edit
                  </button>
                  <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Analyst Q&A Tab Component
function AnalystQATab() {
  const [question, setQuestion] = useState('');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the AI Analyst about this market..."
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-12 border border-slate-700/50 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Ask a question to get started with AI-powered market analysis</p>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 text-center">
      <div className="text-sm text-slate-400 mb-2">{label}</div>
      <div className="text-4xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-500">{sublabel}</div>
    </div>
  );
}

// Data
const trends = [
  {
    title: 'Convergence of Health Data Ecosystems',
    description: 'The market is shifting rapidly toward platforms that seamlessly integrate wearable data with electronic health records, insurance systems, and clinical workflows.',
    color: 'text-blue-400'
  },
  {
    title: 'Personalized Preventive Care at Scale',
    description: 'Advances in AI-driven analytics and longitudinal data collection are fueling the rise of hyper-personalized, preventive health solutions.',
    color: 'text-green-400'
  },
  {
    title: 'Expansion into Chronic Disease Management',
    description: 'There is accelerated interest in digital health assets that move beyond wellness tracking to address chronic conditions.',
    color: 'text-teal-400'
  },
  {
    title: 'Integration of Gamification and Community',
    description: 'Offerings that blend social engagement, gamification, and behavioral economics are seeing outsized user retention.',
    color: 'text-orange-400'
  },
  {
    title: 'Global Regulatory and Interoperability Readiness',
    description: 'Strategic acquirers favor targets with evolving data privacy regulations and international interoperability standards.',
    color: 'text-purple-400'
  }
];

const marketSegments = [
  { name: 'Wearable Electronics', value: '$82.2 billion', source: '#' },
  { name: 'Wearable Medical Devices', value: '$33.99 billion', source: '#' },
  { name: 'Smartwatches', value: '$49.53 billion', source: '#' }
];

const acquisitionTargets = [
  {
    id: 1,
    type: 'AI Health Analytics Startups',
    badge: 'BETA',
    valueRange: '5-20M',
    growthRate: '20-40% CAGR',
    description: 'Early-commercial-traction, pre-scale acquisitions with differentiated predictive health models'
  },
  {
    id: 2,
    type: 'Digital Health Coaching Platforms',
    badge: 'NEAR',
    valueRange: '5-30M',
    growthRate: '15-35% CAGR',
    description: 'Personalized coaching platforms, scalable content/AI, established coaching methodologies'
  }
];

const categories = [
  { id: 'all', label: 'All', count: 86 },
  { id: 'coaching', label: 'Digital Health Coaching Platforms', count: 25 },
  { id: 'medical', label: 'Wearable Medical Devices', count: 25 },
  { id: 'smartwatch', label: 'Smartwatches with Health Tracking', count: 25 }
];

const companies = [
  'Remo+', 'Blaze', 'Vera', 'Audicus', 'Speck', 'Iamme', 'BODI', 'Kurbao',
  'Withings', 'Nabla', 'Vital', 'Bellabeat', 'Cognaize', 'InReach', 'Garmin', 'TrainAway',
  'Bioo', 'Averda', 'Wysa', 'Owkin', 'Hoops', 'Beam', 'Livongo', 'ZIO',
  'Verizon', 'Alicia', 'Wislow', 'Omada', 'Livio', 'Aeroflow', 'Asurion', 'Evidation',
  'MyManu', 'Oura', 'TIRU', 'Hemudu', 'Scannio', 'Sensoria', 'Amazon', 'ZEPP',
  'IQWisa', 'Orpyx', 'POLAR', 'Bragi', 'Apple', 'Samsung', 'INTEX', 'Huawei',
  'Honor', 'Jabra', 'Mi', 'Noise', 'Boat', 'Fire-Boltt', 'Xiaomi', 'Fitbit'
];
