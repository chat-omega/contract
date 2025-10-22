import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DashboardPage, ScoutPage, LiftPage, MeshPage, MarketMapsPage } from '@/pages';
import { ValueCreationPage } from '@/pages/ValueCreationPage';
import { ThesisDetailPage } from '@/pages/ThesisDetailPage';

// Dashboard layout component (full-screen without sidebar)
function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardPage />
    </div>
  );
}

// Sidebar layout component (with sidebar for other pages)
function SidebarLayout() {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden transition-colors duration-300">
      <Sidebar />
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out overflow-x-hidden ${
          isCollapsed ? 'ml-14' : 'ml-64'
        }`}
      >
        <div className="h-full overflow-y-auto">
          <Routes>
            <Route path="/scout" element={<ScoutPage />} />
            <Route path="/scout/:categoryId" element={<ScoutPage />} />
            <Route path="/lift" element={<LiftPage />} />
            <Route path="/mesh" element={<MeshPage />} />
            <Route path="/corp-dev/market-maps" element={<MarketMapsPage />} />
            <Route path="/value-creation/:type" element={<ValueCreationPage />} />
            <Route path="/value-creation/:type/thesis/:thesisId" element={<ThesisDetailPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <SidebarProvider>
          <Routes>
            {/* Dashboard routes - full screen layout */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardLayout />} />
            
            {/* Other routes - sidebar layout */}
            <Route path="/*" element={<SidebarLayout />} />
          </Routes>
        </SidebarProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;