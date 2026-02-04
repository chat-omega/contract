/**
 * Sidebar Component
 * Application sidebar with navigation
 */

import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentIcon,
  Square3Stack3DIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';
import { useUIStore } from '@stores/uiStore';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Documents', href: '/documents', icon: DocumentIcon },
  { name: 'Workflows', href: '/workflows', icon: Square3Stack3DIcon },
  { name: 'Field Discovery', href: '/field-discovery', icon: MagnifyingGlassIcon },
  { name: 'Upload', href: '/upload', icon: ArrowUpTrayIcon },
  { name: 'Credit Analysis', href: '/credit-analysis', icon: ChartBarIcon },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <>
      {/* Sidebar for desktop */}
      <div
        className={cn(
          'hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300',
          sidebarCollapsed ? 'md:w-16' : 'md:w-64'
        )}
      >
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto">
          {/* Logo/Header */}
          <div className={cn(
            "flex flex-shrink-0 border-b border-gray-200 transition-all duration-300",
            sidebarCollapsed
              ? "items-center justify-center px-2 py-4"
              : "flex-row items-center justify-between px-4 h-16"
          )}>
            {/* Logo - clickable when collapsed to expand */}
            {sidebarCollapsed ? (
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Expand sidebar"
              >
                {/* Gold Omega Logo SVG - Yellow Circle (matching vanilla app) */}
                <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M64 32C64 14.3269 49.6731 0 32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64C49.6731 64 64 49.6731 64 32ZM52.5714 32C52.5714 20.6387 43.3613 11.4286 32 11.4286C20.6387 11.4286 11.4286 20.6387 11.4286 32C11.4286 43.3613 20.6387 52.5714 32 52.5714C43.3613 52.5714 52.5714 43.3613 52.5714 32Z" fill="#FEC62C"/>
                </svg>
              </button>
            ) : (
              <>
                {/* Logo (non-clickable when expanded) */}
                <div className="flex items-center gap-3">
                  {/* Gold Omega Logo SVG - Yellow Circle (matching vanilla app) */}
                  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M64 32C64 14.3269 49.6731 0 32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64C49.6731 64 64 49.6731 64 32ZM52.5714 32C52.5714 20.6387 43.3613 11.4286 32 11.4286C20.6387 11.4286 11.4286 20.6387 11.4286 32C11.4286 43.3613 20.6387 52.5714 32 52.5714C43.3613 52.5714 52.5714 43.3613 52.5714 32Z" fill="#FEC62C"/>
                  </svg>
                  <span className="text-xl font-bold text-gray-800">OMEGA</span>
                </div>

                {/* Collapse toggle button - chevron icon (only when expanded) */}
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  title="Collapse sidebar"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center text-sm font-medium rounded-lg transition-colors',
                    sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
                    isActive
                      ? 'bg-accent-50 text-accent-600'  // Orange active state matching vanilla
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      'flex-shrink-0 h-6 w-6',
                      isActive ? 'text-accent-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Profile & Logout - Bottom Left */}
          <div className={cn(
            "flex-shrink-0 border-t border-gray-200",
            sidebarCollapsed ? "p-2" : "p-4"
          )}>
            <div className={cn(
              "flex items-center",
              sidebarCollapsed ? "flex-col gap-3" : "justify-between gap-3"
            )}>
              {/* User Profile */}
              <div className={cn(
                "flex items-center",
                sidebarCollapsed ? "justify-center" : "gap-3 min-w-0 flex-1"
              )}>
                <UserCircleIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">User</p>
                    <p className="text-xs text-gray-500 truncate">user@omega.com</p>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  // Clear localStorage and redirect to login
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className={cn(
                  "flex items-center justify-center text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500",
                  sidebarCollapsed ? "p-1.5" : "p-2"
                )}
                title={sidebarCollapsed ? 'Logout' : undefined}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden',
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10C27.909 10 10 27.909 10 50C10 72.091 27.909 90 50 90C72.091 90 90 72.091 90 50C90 27.909 72.091 10 50 10ZM65 70H55V60C55 57.239 52.761 55 50 55C47.239 55 45 57.239 45 60V70H35V60C35 51.716 41.716 45 50 45C58.284 45 65 51.716 65 60V70ZM50 35C44.477 35 40 30.523 40 25C40 19.477 44.477 15 50 15C55.523 15 60 19.477 60 25C60 30.523 55.523 35 50 35Z" fill="#FEC62C"/>
              </svg>
              <span className="text-xl font-bold text-gray-800">OMEGA</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={toggleSidebar}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-accent-50 text-accent-600'  // Orange active state matching vanilla
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'flex-shrink-0 h-6 w-6',
                      isActive ? 'text-accent-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  <span className="ml-3">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
