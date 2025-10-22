import { useNavigate } from 'react-router-dom';
import { Search, Building2, Users, Globe, BarChart3, MapPin } from 'lucide-react';

export function CorpDevSourcingPage() {
  const navigate = useNavigate();

  const companiesTools = [
    {
      id: 'llm-metasearch',
      title: 'LLM MetaSearch',
      description: 'AI-powered semantic search for finding companies using natural language descriptions',
      icon: Search,
      color: 'blue',
      path: '/corp-dev/sourcing/llm-metasearch',
      badge: 'AI'
    },
    {
      id: 'firmographics',
      title: 'Firmographics',
      description: 'Advanced filtering by revenue, employees, funding, technology stack, and location',
      icon: BarChart3,
      color: 'purple',
      path: '/corp-dev/sourcing/firmographics',
      badge: '70M+ Companies'
    },
    {
      id: 'geography',
      title: 'Geography',
      description: 'Find companies by physical location using Google Maps integration',
      icon: MapPin,
      color: 'green',
      path: '/corp-dev/sourcing/geography',
      badge: 'Maps'
    }
  ];

  const peopleTools = [
    {
      id: 'demographics',
      title: 'Demographics',
      description: 'Search for decision-makers by job title, seniority level, and company attributes',
      icon: Users,
      color: 'pink',
      path: '/corp-dev/sourcing/demographics',
      badge: '265M+ Contacts'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-600/30">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Sourcing</h1>
            <p className="text-slate-400 text-xs mt-1">Discover and source potential acquisition targets using AI-powered tools</p>
          </div>
        </div>

        {/* Companies Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Companies</h2>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
              3 Tools
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companiesTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => navigate(tool.path)}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 text-left relative overflow-hidden"
                >
                  {/* Background Gradient on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(tool.color)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getColorClasses(tool.color)} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-[10px] font-semibold rounded-full">
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="text-xs font-medium text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </h3>

                    <p className="text-slate-400 text-xs leading-relaxed">
                      {tool.description}
                    </p>

                    <div className="mt-4 flex items-center text-blue-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Explore</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* People Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-pink-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">People</h2>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 text-xs font-semibold rounded-full">
              1 Tool
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {peopleTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => navigate(tool.path)}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300 text-left relative overflow-hidden"
                >
                  {/* Background Gradient on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(tool.color)} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getColorClasses(tool.color)} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-[10px] font-semibold rounded-full">
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="text-xs font-medium text-white mb-2 group-hover:text-pink-400 transition-colors">
                      {tool.title}
                    </h3>

                    <p className="text-slate-400 text-xs leading-relaxed">
                      {tool.description}
                    </p>

                    <div className="mt-4 flex items-center text-pink-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Explore</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-12 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white mb-2">About Sourcing Tools</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Our sourcing suite combines AI-powered semantic search, advanced firmographic filtering, geographic mapping,
                and people search capabilities to help you discover the perfect acquisition targets. Access data on 70M+ companies
                and 265M+ contacts worldwide with real-time intent signals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
