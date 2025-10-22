import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PanelLeftClose, PanelLeftOpen, FileText } from 'lucide-react';
import { DocumentChat } from '@/components/DocumentChat';
import { DocumentCanvas } from '@/components/DocumentCanvas';

export function DocumentEditorPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [chatWidth, setChatWidth] = useState(400); // Default 400px
  const [isResizing, setIsResizing] = useState(false);
  const canvasRef = useRef<any>(null);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 300 && newWidth <= 600) {
        setChatWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleInsertToCanvas = (content: string) => {
    // Use global function exposed by DocumentCanvas
    if ((window as any).insertToCanvas) {
      (window as any).insertToCanvas(content);
    }
  };

  const handleSave = (content: string) => {
    // Save to backend API
    console.log('Saving document:', documentId, content);
    // TODO: Implement actual save to backend
  };

  return (
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
              <h1 className="text-sm font-semibold text-white">Untitled Document</h1>
              <p className="text-xs text-slate-400">Document ID: {documentId}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsChatVisible(!isChatVisible)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title={isChatVisible ? 'Hide chat' : 'Show chat'}
          >
            {isChatVisible ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content - Split Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        {isChatVisible && (
          <>
            <div
              style={{ width: `${chatWidth}px` }}
              className="flex-shrink-0 h-full"
            >
              <DocumentChat
                documentId={documentId || 'new'}
                onInsertToCanvas={handleInsertToCanvas}
              />
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

        {/* Right Panel - Canvas */}
        <div className="flex-1 h-full overflow-hidden">
          <DocumentCanvas
            ref={canvasRef}
            documentId={documentId || 'new'}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
