import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Search, TrendingUp, Network, Menu, ChevronLeft, ChevronRight, Building2, Target } from 'lucide-react';
import { Badge } from '@/components/ui';
import { useSidebar } from '@/contexts/SidebarContext';

const navigationItems = [
  {
    path: '/dashboard',
    icon: BarChart3,
    label: 'Dashboard',
    badge: 'Overview',
    color: 'blue'
  },
  {
    path: '/scout',
    icon: Search,
    label: 'Scout',
    badge: 'Discovery',
    color: 'accent'
  },
  {
    path: '/lift',
    icon: TrendingUp,
    label: 'Lift',
    badge: 'Value',
    color: 'orange'
  },
  {
    path: '/mesh',
    icon: Network,
    label: 'Mesh',
    badge: 'GTM',
    color: 'purple'
  },
  {
    path: '/corp-dev/market-maps',
    icon: Target,
    label: 'Market Maps',
    badge: 'M&A',
    color: 'blue'
  }
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebar();

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
              <h1 className="text-lg font-bold text-white truncate">PE Dashboard</h1>
              <p className="text-xs text-slate-400 truncate">DST Global Portfolio</p>
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
      <nav className="flex-1 py-4">
        <div className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <div key={item.path} className="relative group">
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="font-medium truncate">{item.label}</span>
                      {isActive && (
                        <Badge 
                          variant={item.color as any} 
                          size="sm"
                          className="ml-auto"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.label}
                    {isActive && (
                      <span className="ml-2 px-1 py-0.5 bg-blue-600 text-xs rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Portfolio Stats (when expanded) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800/50">
          <div className="space-y-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium">
              Portfolio Overview
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-2.5 backdrop-blur">
                <div className="text-xs text-slate-400">Companies</div>
                <div className="text-lg font-bold text-white">7</div>
              </div>
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-2.5 backdrop-blur">
                <div className="text-xs text-slate-400">Value</div>
                <div className="text-lg font-bold text-green-400">$32B+</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}