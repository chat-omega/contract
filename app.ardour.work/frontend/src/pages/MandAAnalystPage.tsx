import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PanelLeftClose, PanelLeftOpen, FileText } from 'lucide-react';
import { AnalystTab, StructureTab, SourcesTab } from '@/components/analyst';
import { BlockEditor } from '@/components/BlockEditor';
import { DocumentProvider } from '@/contexts/DocumentContext';

type TabType = 'analyst' | 'structure' | 'sources';

export function MandAAnalystPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('analyst');

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 300 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analyst':
        return <AnalystTab companyName="Goqii" />;
      case 'structure':
        return <StructureTab />;
      case 'sources':
        return <SourcesTab documentId={documentId} />;
      default:
        return <AnalystTab companyName="Goqii" />;
    }
  };

  return (
    <DocumentProvider>
      <div
        className="h-screen flex flex-col bg-slate-900"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700/20">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/corp-dev/documents')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
              title="Back to documents"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white">Goqii M&A Target Profile Document</h1>
                <p className="text-xs text-slate-400">Document ID: {documentId}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
              title={isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
            >
              {isSidebarVisible ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeftOpen className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content - Split Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Tabbed Sidebar */}
          {isSidebarVisible && (
            <>
              <div
                style={{ width: `${sidebarWidth}px` }}
                className="flex-shrink-0 h-full flex flex-col bg-slate-900 border-r border-slate-700/20"
              >
                {/* Tabs */}
                <div className="flex border-b border-slate-700/20">
                  <button
                    onClick={() => setActiveTab('analyst')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'analyst'
                        ? 'text-white bg-slate-800 border-b-2 border-blue-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    ANALYST
                  </button>
                  <button
                    onClick={() => setActiveTab('structure')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'structure'
                        ? 'text-white bg-slate-800 border-b-2 border-blue-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    STRUCTURE
                  </button>
                  <button
                    onClick={() => setActiveTab('sources')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'sources'
                        ? 'text-white bg-slate-800 border-b-2 border-blue-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    SOURCES
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {renderTabContent()}
                </div>
              </div>

              {/* Resizable Divider */}
              <div
                onMouseDown={handleMouseDown}
                className={`w-1 bg-slate-700/20 hover:bg-blue-500/50 cursor-col-resize transition-colors ${
                  isResizing ? 'bg-blue-500/70' : ''
                }`}
                style={{ userSelect: 'none' }}
              />
            </>
          )}

          {/* Right Panel - Block Editor Canvas */}
          <div className="flex-1 h-full overflow-hidden">
            <BlockEditor documentId={documentId || 'new'} />
          </div>
        </div>
      </div>
    </DocumentProvider>
  );
}
