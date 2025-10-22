import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

export function FirmographicsPage() {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [revenueRange, setRevenueRange] = useState<[number, number]>([0, 10000000000]);
  const [employeeRange, setEmployeeRange] = useState<[number, number]>([1, 100000]);
  const [fundingRange, setFundingRange] = useState<[number, number]>([0, 1000000000]);
  const [fundingMonths, setFundingMonths] = useState<[number, number]>([0, 60]);
  const [selectedRevenue, setSelectedRevenue] = useState<string>('any');
  const [selectedSize, setSelectedSize] = useState<string>('any');
  const [projectedFunding, setProjectedFunding] = useState(false);

  const revenueButtons = [
    { id: 'any', label: 'Any Revenue' },
    { id: '0-1m', label: '$0-$1M' },
    { id: '1m-10m', label: '$1M-$10M' },
    { id: '10m-50m', label: '$10M-$50M' },
    { id: '50m-250m', label: '$50M-$250M' },
    { id: '250m-1b', label: '$250M-$1B' },
    { id: '1b+', label: '$1B+' },
  ];

  const sizeButtons = [
    { id: 'any', label: 'Any Size' },
    { id: '1-10', label: '1-10' },
    { id: '11-50', label: '11-50' },
    { id: '51-200', label: '51-200' },
    { id: '201-500', label: '201-500' },
    { id: '501-1000', label: '501-1000' },
    { id: '1001-5000', label: '1001-5000' },
    { id: '5000+', label: '5000+' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex h-screen">
        {/* Left Sidebar - Filters Panel */}
        <div className="w-96 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700/50 overflow-y-auto">
          <div className="p-6 space-y-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Search Filters</h2>

            {/* Keywords & Industry Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Keywords & Industry Tags
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter keywords or select from suggestions..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Annual Revenue */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-3">
                Annual Revenue
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {revenueButtons.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setSelectedRevenue(btn.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedRevenue === btn.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>${(revenueRange[0] / 1000000000).toFixed(1)}B</span>
                  <span>${(revenueRange[1] / 1000000000).toFixed(1)}B</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000000000"
                  step="100000000"
                  value={revenueRange[1]}
                  onChange={(e) => setRevenueRange([revenueRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                />
              </div>
            </div>

            {/* Number of Employees */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-3">
                Number of Employees
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {sizeButtons.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setSelectedSize(btn.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedSize === btn.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>{employeeRange[0]}</span>
                  <span>{(employeeRange[1] / 1000).toFixed(0)}K employees</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100000"
                  step="1000"
                  value={employeeRange[1]}
                  onChange={(e) => setEmployeeRange([employeeRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                />
              </div>
            </div>

            {/* HQ Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                HQ Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cities, states, or countries..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Search className="absolute right-3 top-3 w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Funding Information */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-3">
                Funding Information
              </label>
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <label className="block text-xs text-slate-400 mb-2">Total Funding Raised</label>
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>${(fundingRange[0] / 1000000000).toFixed(1)}B</span>
                    <span>${(fundingRange[1] / 1000000000).toFixed(1)}B</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000000000"
                    step="10000000"
                    value={fundingRange[1]}
                    onChange={(e) => setFundingRange([fundingRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <label className="block text-xs text-slate-400 mb-2">Months Since Last Funding</label>
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>{fundingMonths[0]} months ago</span>
                    <span>{fundingMonths[1]} months ago</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="1"
                    value={fundingMonths[1]}
                    onChange={(e) => setFundingMonths([fundingMonths[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="projected-funding"
                    checked={projectedFunding}
                    onChange={(e) => setProjectedFunding(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="projected-funding" className="ml-3 text-xs text-slate-300">
                    Projected to Raise Funding
                  </label>
                </div>

                <div className="relative">
                  <select className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                    <option>Funding Stages</option>
                    <option>Seed</option>
                    <option>Series A</option>
                    <option>Series B</option>
                    <option>Series C+</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Technology Stack */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Technology Stack
              </label>
              <div className="relative">
                <select className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                  <option>Select technologies used...</option>
                  <option>React</option>
                  <option>Node.js</option>
                  <option>Python</option>
                  <option>AWS</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Show Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center justify-between w-full text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="text-xs font-medium">Show Advanced Filters</span>
              {showAdvancedFilters ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {/* Results Per Page */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Results Per Page
              </label>
              <div className="relative">
                <select className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none">
                  <option>5 Results (Free trial)</option>
                  <option>10 Results</option>
                  <option>25 Results</option>
                  <option>50 Results</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Search Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search Companies</span>
            </button>
          </div>
        </div>

        {/* Right Panel - Results Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-base font-semibold text-white">Search Results</h1>
                <span className="text-xs text-slate-400">0 Total Results</span>
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-12 min-h-[600px] flex items-center justify-center">
              <div className="text-center max-w-2xl">
                {/* Mascot Illustration Placeholder */}
                <div className="mb-8">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <div className="text-white text-6xl">🐵</div>
                  </div>
                </div>

                {/* Heading */}
                <h2 className="text-base font-semibold text-white mb-4">
                  Long-tail Company Database
                </h2>

                {/* Description */}
                <p className="text-xs text-slate-400 mb-8">
                  Search this extensive database of over 70 million companies worldwide
                </p>

                <p className="text-xs text-slate-500 mb-12 leading-relaxed">
                  Access comprehensive firmographic data including revenue, employee count,
                  funding history, technology stack, and more. Use the filters on the left
                  to narrow down your search and discover the perfect companies for your needs.
                </p>

                {/* Metric Cards */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-slate-700/50">
                    <div className="text-base font-semibold text-blue-400 mb-2">70M+</div>
                    <div className="text-xs text-slate-400">Companies</div>
                  </div>
                  <div className="bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-slate-700/50">
                    <div className="text-base font-semibold text-purple-400 mb-2">265M+</div>
                    <div className="text-xs text-slate-400">Contacts</div>
                  </div>
                  <div className="bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-slate-700/50">
                    <div className="text-base font-semibold text-pink-400 mb-2">Real-time</div>
                    <div className="text-xs text-slate-400">Intent Signals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
