import { useState } from 'react';
import { Search, Globe, MapPin } from 'lucide-react';

type TabType = 'regions' | 'subregions' | 'countries' | 'states' | 'cities';

interface RegionCard {
  name: string;
  count: number;
  color: string;
}

export function GeographyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('regions');
  const [keywords, setKeywords] = useState('');
  const [businessTypes, setBusinessTypes] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'regions', label: 'Regions' },
    { id: 'subregions', label: 'Subregions' },
    { id: 'countries', label: 'Countries' },
    { id: 'states', label: 'States/Areas' },
    { id: 'cities', label: 'Cities' },
  ];

  const regions: RegionCard[] = [
    { name: 'Africa', count: 58, color: 'from-orange-500 to-red-500' },
    { name: 'Americas', count: 57, color: 'from-blue-500 to-cyan-500' },
    { name: 'Asia', count: 53, color: 'from-purple-500 to-pink-500' },
    { name: 'Europe', count: 53, color: 'from-green-500 to-emerald-500' },
    { name: 'Oceania', count: 27, color: 'from-teal-500 to-blue-500' },
    { name: 'Polar', count: 2, color: 'from-cyan-500 to-blue-500' },
  ];

  const toggleRegion = (regionName: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionName)
        ? prev.filter((r) => r !== regionName)
        : [...prev, regionName]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Left Panel - Search Filters */}
        <div className="w-[600px] bg-slate-900/50 backdrop-blur-sm border-r border-slate-700/50 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <MapPin className="w-6 h-6 text-blue-400" />
                <h1 className="text-base font-semibold text-white">Find Companies with Google Maps</h1>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Map search is AI best finding companies by physical locations, matching keywords or categories in a specific geographic areas
              </p>
            </div>

            {/* Search Inputs */}
            <div className="space-y-4">
              {/* Keywords Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Specify search keywords (e.g., 'HVAC contractor')"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Business Types Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Business Types
                </label>
                <input
                  type="text"
                  value={businessTypes}
                  onChange={(e) => setBusinessTypes(e.target.value)}
                  placeholder="Optional location type (note: adding both 'keyword' and 'type' with the same value can yield zero results)"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Geographic Areas Section */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Geographic Areas</h2>

              {/* Tabs */}
              <div className="flex space-x-1 border-b border-slate-700/50 mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Regions Grid */}
              {activeTab === 'regions' && (
                <div className="grid grid-cols-2 gap-3">
                  {regions.map((region) => (
                    <button
                      key={region.name}
                      onClick={() => toggleRegion(region.name)}
                      className={`relative bg-slate-800/50 backdrop-blur rounded-lg p-4 border transition-all hover:border-blue-500/50 ${
                        selectedRegions.includes(region.name)
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${region.color}`}></div>
                          <span className="text-white font-medium text-xs">{region.name}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-700/50 text-slate-300 text-[10px] font-semibold rounded-full">
                          {region.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Placeholder for other tabs */}
              {activeTab !== 'regions' && (
                <div className="bg-slate-800/50 backdrop-blur rounded-lg p-8 border border-slate-700/50 text-center">
                  <Globe className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-xs">Select {activeTab} to filter geographic areas</p>
                </div>
              )}
            </div>

            {/* Areas Drawn on Map */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 mb-2">Areas Drawn on Map</h3>
              <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-500 text-xs">None</p>
              </div>
            </div>

            {/* Searches Section */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 mb-2">Searches</h3>
              <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700/50">
                <p className="text-slate-500 text-xs">Specify at least keywords to run a search</p>
              </div>
            </div>

            {/* Search Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search Companies</span>
            </button>
          </div>
        </div>

        {/* Right Panel - Map and Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Results Section */}
          <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Results</h2>

            {/* Results Table */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-300 w-12">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-300">Logo</th>
                      <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-300">Name</th>
                      <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-300">Address</th>
                      <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-300">Website</th>
                      <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-300">Rating</th>
                      <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-300">Reviews</th>
                      <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-wider text-slate-300">More</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Globe className="w-16 h-16 text-slate-700 mb-4" />
                          <p className="text-slate-500 text-xs">No records</p>
                          <p className="text-slate-600 text-[10px] mt-1">Search for companies to see results here</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Map Display */}
          <div className="flex-1 relative bg-slate-900">
            {/* Map Container */}
            <div className="absolute inset-0">
              {/* Map Placeholder */}
              <div
                className="w-full h-full bg-cover bg-center relative"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                }}
              >
                {/* Map Overlay Effect */}
                <div className="absolute inset-0 opacity-30">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="map-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#map-grid)" />
                  </svg>
                </div>

                {/* Continent Shapes with Green Highlights */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* North America Highlight */}
                  <div className="absolute left-[20%] top-[30%] w-64 h-48 bg-green-500/20 rounded-full blur-3xl"></div>

                  {/* South America Highlight */}
                  <div className="absolute left-[28%] top-[55%] w-32 h-40 bg-green-500/20 rounded-full blur-2xl"></div>

                  {/* Europe Highlight */}
                  <div className="absolute left-[48%] top-[25%] w-32 h-32 bg-green-500/20 rounded-full blur-2xl"></div>

                  {/* Africa Highlight */}
                  <div className="absolute left-[48%] top-[48%] w-40 h-48 bg-green-500/20 rounded-full blur-2xl"></div>

                  {/* Asia Highlight */}
                  <div className="absolute left-[65%] top-[32%] w-56 h-44 bg-green-500/20 rounded-full blur-3xl"></div>

                  {/* Australia Highlight */}
                  <div className="absolute right-[15%] bottom-[25%] w-32 h-24 bg-green-500/20 rounded-full blur-2xl"></div>
                </div>

                {/* Map UI Elements */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  {/* Map Type Toggle */}
                  <button className="bg-slate-800/90 backdrop-blur text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors border border-slate-700/50">
                    Satellite
                  </button>

                  {/* Zoom Controls */}
                  <div className="bg-slate-800/90 backdrop-blur rounded-lg border border-slate-700/50 overflow-hidden">
                    <button className="w-10 h-10 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors border-b border-slate-700/50">
                      <span className="text-lg font-bold">+</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors">
                      <span className="text-lg font-bold">-</span>
                    </button>
                  </div>
                </div>

                {/* Map Attribution */}
                <div className="absolute bottom-2 left-2 text-xs text-slate-500 bg-slate-900/80 backdrop-blur px-2 py-1 rounded">
                  Map data ©2025 Google, INEGI, NOAA
                </div>

                {/* Placeholder Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Globe className="w-24 h-24 text-slate-700/50 mx-auto mb-4" />
                    <p className="text-slate-600 text-xs font-semibold">Google Maps View</p>
                    <p className="text-slate-700 text-[10px] mt-2">Interactive map will be displayed here</p>
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
