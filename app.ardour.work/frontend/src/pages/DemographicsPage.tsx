import React, { useState } from 'react';
import { Search } from 'lucide-react';

export function DemographicsPage() {
  const [jobTitles, setJobTitles] = useState('');
  const [includeSimilar, setIncludeSimilar] = useState(true);
  const [seniorityLevel, setSeniorityLevel] = useState('');
  const [personLocation, setPersonLocation] = useState('');
  const [companyDomains, setCompanyDomains] = useState('');
  const [resultsPerPage, setResultsPerPage] = useState('10');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-96 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700/50 p-6 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">👤 Person Criteria</h2>

          <div className="space-y-6">
            {/* Job Titles */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Job Titles
              </label>
              <textarea
                value={jobTitles}
                onChange={(e) => setJobTitles(e.target.value)}
                placeholder="e.g., VP of M&A, Sales Manager..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex items-center mt-3">
                <input
                  type="checkbox"
                  id="includeSimilar"
                  checked={includeSimilar}
                  onChange={(e) => setIncludeSimilar(e.target.checked)}
                  className="w-4 h-4 bg-slate-800 border-slate-600 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="includeSimilar" className="ml-3 text-xs text-slate-300">
                  ✓ Include similar titles
                </label>
              </div>
            </div>

            {/* Seniority Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Seniority Level
              </label>
              <select
                value={seniorityLevel}
                onChange={(e) => setSeniorityLevel(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select seniority...</option>
                <option value="c-level">C-Level</option>
                <option value="vp">VP</option>
                <option value="director">Director</option>
                <option value="manager">Manager</option>
                <option value="individual">Individual Contributor</option>
              </select>
            </div>

            {/* Person Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Person Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={personLocation}
                  onChange={(e) => setPersonLocation(e.target.value)}
                  placeholder="City, State, or Country..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-3 w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Company Domains */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Company Domains
              </label>
              <textarea
                value={companyDomains}
                onChange={(e) => setCompanyDomains(e.target.value)}
                placeholder="e.g., apollo.io, microsoft.com..."
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Results Per Page */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Results Per Page
              </label>
              <select
                value={resultsPerPage}
                onChange={(e) => setResultsPerPage(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="10">10 Results</option>
                <option value="25">25 Results</option>
                <option value="50">50 Results</option>
                <option value="100">100 Results</option>
              </select>
            </div>

            {/* Search Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20">
              <Search size={20} />
              Search People
            </button>
          </div>
        </div>

        {/* Right Panel - Empty State */}
        <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
          {/* Decorative Dot Grid Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>

          <div className="max-w-2xl w-full text-center relative z-10">
            {/* Branding */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 transform hover:scale-105 transition-transform">
                <span className="text-6xl">🐵</span>
              </div>
              <h1 className="text-base font-semibold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                Apollo People Search
              </h1>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Search a database of 265M+ contacts across 70M+ companies worldwide.
              </p>
              <p className="text-xs text-slate-400 mb-6">
                Find decision-makers by job title, seniority, location, and company attributes.
              </p>
              <div className="inline-block bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg px-6 py-3">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Note:</span> This endpoint does not return email addresses. Use enrichment for contact details.
                </p>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                <div className="text-base font-semibold text-purple-400 mb-2">265M+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Contacts</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-pink-500/50 transition-colors">
                <div className="text-base font-semibold text-pink-400 mb-2">70M+</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Companies</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
                <div className="text-base font-semibold text-purple-400 mb-2">Real-time</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Intent Signals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
