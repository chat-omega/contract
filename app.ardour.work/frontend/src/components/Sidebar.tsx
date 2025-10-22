import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  BarChart3, Search, TrendingUp, Network, ChevronLeft, ChevronRight,
  Building2, Workflow, FileSearch, Sparkles, Brain, FileText, MapPin,
  Target, ListChecks, Plug, ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui';
import { useSidebar } from '@/contexts/SidebarContext';

const navigationItems = [
  {
    path: '/dashboard',
    icon: BarChart3,
    label: 'Dashboard',
    color: 'blue',
    children: [
      {
        path: '/workflows',
        icon: Workflow,
        label: 'Workflows',
        color: 'blue'
      }
    ]
  }
];

const corpDevItems = [
  {
    path: '/corp-dev/analyst',
    icon: Brain,
    label: 'Analyst',
    color: 'blue'
  },
  {
    path: '/corp-dev/documents',
    icon: FileText,
    label: 'Documents',
    color: 'blue'
  }
];

const corpDevSectionItems = [
  {
    path: '/corp-dev/market-maps',
    icon: MapPin,
    label: 'Market Maps',
    color: 'blue'
  },
  {
    path: '/corp-dev/sourcing',
    icon: Search,
    label: 'Sourcing',
    color: 'blue'
  },
  {
    path: '/corp-dev/pipeline',
    icon: Target,
    label: 'Pipeline',
    color: 'blue'
  },
  {
    path: '/corp-dev/lists',
    icon: ListChecks,
    label: 'Lists',
    color: 'blue'
  }
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [corpDevExpanded, setCorpDevExpanded] = useState(true);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-all duration-300 ease-in-out z-40 shadow-2xl ${
        isCollapsed ? 'w-14' : 'w-64'
      }`}
    >
      {/* Header with Collapse Button */}
      <div className="relative p-4 border-b border-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white truncate">Ardour</h1>
            </div>
          )}
        </div>
        
        {/* Collapse Button - Top Right */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border border-slate-700/50"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-slate-300" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-slate-300" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const hasChildren = item.children && item.children.length > 0;
            const isChildActive = hasChildren && item.children.some(child => location.pathname === child.path);

            return (
              <div key={item.path}>
                {hasChildren ? (
                  <div>
                    <div className="flex items-center justify-between w-full px-3 py-2">
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 flex-1 rounded-lg transition-all duration-200 ${
                          isActive || isChildActive
                            ? 'text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="text-sm font-medium">{item.label}</span>
                        )}
                      </Link>
                      {!isCollapsed && (
                        <button
                          onClick={() => setDashboardExpanded(!dashboardExpanded)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                            dashboardExpanded ? 'rotate-180' : ''
                          }`} />
                        </button>
                      )}
                    </div>

                    {!isCollapsed && dashboardExpanded && (
                      <div className="mt-1 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildItemActive = location.pathname === child.path;

                          return (
                            <button
                              key={child.path}
                              onClick={() => navigate(child.path)}
                              className={`w-full flex items-center space-x-3 pl-10 pr-3 py-2 rounded-lg transition-all duration-200 ${
                                isChildItemActive
                                  ? 'bg-slate-800 text-white'
                                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                              }`}
                            >
                              <ChildIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm font-medium">{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Corp Dev Section */}
        <div className="mt-6 px-2">
          {/* Corp Dev Top Items (Analyst, Documents) */}
          <div className="space-y-1 mb-3">
            {corpDevItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                             (item.path !== '/corp-dev/analyst' && location.pathname.startsWith(item.path));

              return (
                <div key={item.path} className="relative group">
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
                    }`} />

                    {!isCollapsed && (
                      <span className="text-sm truncate">{item.label}</span>
                    )}
                  </button>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Collapsible Corp Dev Section */}
          {!isCollapsed && (
            <div className="space-y-1">
              <button
                onClick={() => setCorpDevExpanded(!corpDevExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-white transition-colors"
              >
                <span className="text-xs font-semibold uppercase tracking-wider">More</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  corpDevExpanded ? 'rotate-180' : ''
                }`} />
              </button>

              {corpDevExpanded && (
                <div className="space-y-1">
                  {corpDevSectionItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <div key={item.path} className="relative group">
                        <button
                          onClick={() => navigate(item.path)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
                          }`} />
                          <span className="text-sm truncate">{item.label}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Integrations at bottom */}
        {!isCollapsed && (
          <div className="mt-6 px-2 border-t border-slate-800 pt-4">
            <button
              onClick={() => navigate('/integrations')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
            >
              <Plug className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">Integrations</span>
            </button>
          </div>
        )}
      </nav>

    </div>
  );
}