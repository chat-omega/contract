/**
 * AppLayout Component
 * Main application layout with sidebar and header
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { ToastContainer } from '@components/ui';
import { LoadingOverlay } from '@components/ui/Spinner';
import { useUIStore } from '@stores/uiStore';
import { cn } from '@/utils/cn';

export const AppLayout: React.FC = () => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const isGlobalLoading = useUIStore((state) => state.isLoading);
  const loadingMessage = useUIStore((state) => state.loadingMessage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-col transition-all duration-300',
          'md:pl-64',
          sidebarCollapsed && 'md:pl-16'
        )}
      >
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 pt-16">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer />

      {/* Global loading overlay */}
      {isGlobalLoading && <LoadingOverlay message={loadingMessage || undefined} />}
    </div>
  );
};

export default AppLayout;
