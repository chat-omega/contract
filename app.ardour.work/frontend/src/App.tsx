import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WorkflowProvider } from '@/contexts/WorkflowContext';
import {
  DashboardPage,
  WorkflowsPage,
  CorpDevProfilerPage,
  CorpDevLoadingPage,
  AIAnalystPage,
  CorpDevDocumentsPage,
  CorpDevTemplatesPage,
  CorpDevMarketMapsPage,
  CorpDevSourcingPage,
  CorpDevPipelinePage,
  CorpDevListsPage,
  IntegrationsPage,
  LLMMetaSearchPage,
  FirmographicsPage,
  GeographyPage,
  DemographicsPage
} from '@/pages';
import { CompanyResearchPage } from '@/pages/CompanyResearchPage';
import { DocumentEditorPage } from '@/pages/DocumentEditorPage';
import { MandAAnalystPage } from '@/pages/MandAAnalystPage';

// Sidebar layout component (with sidebar for all pages)
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/research" element={<Navigate to="/corp-dev/analyst" replace />} />
            <Route path="/portfolio/:companyId/research" element={<CompanyResearchPage />} />
            <Route path="/corp-dev/analyst" element={<AIAnalystPage />} />
            <Route path="/corp-dev/documents" element={<CorpDevDocumentsPage />} />
            <Route path="/corp-dev/templates" element={<CorpDevTemplatesPage />} />
            <Route path="/corp-dev/market-maps" element={<CorpDevMarketMapsPage />} />
            <Route path="/corp-dev/sourcing" element={<CorpDevSourcingPage />} />
            <Route path="/corp-dev/sourcing/llm-metasearch" element={<LLMMetaSearchPage />} />
            <Route path="/corp-dev/sourcing/firmographics" element={<FirmographicsPage />} />
            <Route path="/corp-dev/sourcing/geography" element={<GeographyPage />} />
            <Route path="/corp-dev/sourcing/demographics" element={<DemographicsPage />} />
            <Route path="/corp-dev/pipeline" element={<CorpDevPipelinePage />} />
            <Route path="/corp-dev/lists" element={<CorpDevListsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
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
        <WorkflowProvider>
          <SidebarProvider>
            <Routes>
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Standalone pages without sidebar */}
              <Route path="/corp-dev/profiler" element={<CorpDevProfilerPage />} />
              <Route path="/corp-dev/loading" element={<CorpDevLoadingPage />} />
              <Route path="/corp-dev/documents/:documentId/edit" element={<DocumentEditorPage />} />
              <Route path="/corp-dev/documents/:documentId/analyst" element={<MandAAnalystPage />} />

              {/* All other routes use sidebar layout */}
              <Route path="/*" element={<SidebarLayout />} />
            </Routes>
          </SidebarProvider>
        </WorkflowProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;