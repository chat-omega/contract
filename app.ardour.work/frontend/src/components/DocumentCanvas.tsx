import { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Code,
  Undo,
  Redo,
  Save,
  Download
} from 'lucide-react';

interface DocumentCanvasProps {
  documentId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

export function DocumentCanvas({ documentId, initialContent = '', onSave }: DocumentCanvasProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== history[historyIndex]) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [content]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 500));
    if (onSave) {
      onSave(content);
    }
    setLastSaved(new Date());
    setIsSaving(false);
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);

      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex];
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex];
      }
    }
  };

  const insertContent = (text: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const div = document.createElement('div');
        div.innerHTML = text.replace(/\n/g, '<br>');
        const frag = document.createDocumentFragment();
        let lastNode;
        while (div.firstChild) {
          lastNode = frag.appendChild(div.firstChild);
        }
        range.insertNode(frag);

        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        updateContent();
      }
    }
  };

  // Expose insertContent method to parent
  useEffect(() => {
    (window as any).insertToCanvas = insertContent;
    return () => {
      delete (window as any).insertToCanvas;
    };
  }, []);

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${documentId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/20 bg-slate-900/50">
        <div className="flex items-center space-x-1">
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-2" />

          {/* Text Formatting */}
          <button
            onClick={() => executeCommand('bold')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => executeCommand('italic')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-2" />

          {/* Headings */}
          <button
            onClick={() => executeCommand('formatBlock', 'h1')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => executeCommand('formatBlock', 'h2')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-2" />

          {/* Lists */}
          <button
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => executeCommand('insertOrderedList')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-2" />

          {/* Block Quotes */}
          <button
            onClick={() => executeCommand('formatBlock', 'blockquote')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => executeCommand('formatBlock', 'pre')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {lastSaved && (
            <span className="text-xs text-slate-500">
              {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          )}
          <button
            onClick={handleSave}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Save"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
            title="Export"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-6">
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            className="prose prose-invert prose-slate max-w-none focus:outline-none"
            style={{
              minHeight: '100%',
              color: '#e2e8f0',
              lineHeight: '1.75'
            }}
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: content || '<p>Start typing or ask the assistant to research something...</p>' }}
          />
        </div>
      </div>

      <style>{`
        .prose-invert h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #f1f5f9;
        }
        .prose-invert h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #f1f5f9;
        }
        .prose-invert h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #f1f5f9;
        }
        .prose-invert p {
          margin-bottom: 1rem;
          color: #e2e8f0;
        }
        .prose-invert ul,
        .prose-invert ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .prose-invert li {
          margin-bottom: 0.5rem;
        }
        .prose-invert blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: #cbd5e1;
        }
        .prose-invert pre {
          background-color: #1e293b;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .prose-invert code {
          background-color: #1e293b;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .prose-invert strong {
          font-weight: 600;
          color: #f1f5f9;
        }
        .prose-invert em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
