/**
 * Header Component
 * Top navigation bar with user menu
 */

import { useUIStore } from '@stores/uiStore';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header className={cn(
      "bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-30 transition-all duration-300",
      sidebarCollapsed ? 'md:left-16' : 'md:left-64'
    )}>
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left side - Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        >
          <span className="sr-only">Open sidebar</span>
          <span className="text-2xl font-bold">Ω</span>
        </button>

        {/* Center - Page title or breadcrumb can go here */}
        <div className="flex-1"></div>

        {/* Right side - Empty (profile/logout moved to sidebar) */}
        <div className="flex items-center gap-4">
          {/* Space for page-specific actions or breadcrumbs */}
        </div>
      </div>
    </header>
  );
};

export default Header;
