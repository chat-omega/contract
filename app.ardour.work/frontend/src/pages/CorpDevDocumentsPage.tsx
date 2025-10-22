import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Grid,
  List,
  ChevronDown,
  ChevronRight,
  Plus,
  Folder,
  FolderPlus,
  FolderOpen,
  FileStack,
  MoreVertical,
} from 'lucide-react';
import { DocumentCreationModal } from '../components/DocumentCreationModal';

interface FolderNode {
  id: string;
  name: string;
  parentId: string | null;
  children: FolderNode[];
  documentCount: number;
  expanded: boolean;
}

interface Document {
  id: string;
  title: string;
  type: 'presentation' | 'Live Document';
  lastModified: string;
  created: string;
  gradient: string;
  folderId: string;
}

type ViewMode = 'grid' | 'list';

const initialFolders: FolderNode[] = [
  {
    id: 'all',
    name: 'All Documents',
    parentId: null,
    children: [],
    documentCount: 7,
    expanded: true,
  },
  {
    id: 'ma-projects',
    name: 'M&A Projects',
    parentId: null,
    children: [
      {
        id: 'goqii',
        name: 'Goqii',
        parentId: 'ma-projects',
        children: [],
        documentCount: 4,
        expanded: false,
      },
    ],
    documentCount: 4,
    expanded: true,
  },
  {
    id: 'market-research',
    name: 'Market Research',
    parentId: null,
    children: [],
    documentCount: 2,
    expanded: false,
  },
  {
    id: 'drafts',
    name: 'Drafts',
    parentId: null,
    children: [],
    documentCount: 1,
    expanded: false,
  },
];

const sampleDocuments: Document[] = [
  {
    id: '1',
    title: 'New Document',
    type: 'presentation',
    lastModified: '1 hour ago',
    created: '23 minutes ago',
    gradient: 'from-purple-500 to-pink-500',
    folderId: 'drafts',
  },
  {
    id: '2',
    title: 'Goqii M&A Target Profile Document',
    type: 'presentation',
    lastModified: '14 hours ago',
    created: '15 hours ago',
    gradient: 'from-blue-500 to-cyan-500',
    folderId: 'goqii',
  },
  {
    id: '3',
    title: 'Due Diligence Plan for Goqii',
    type: 'Live Document',
    lastModified: '16 hours ago',
    created: '15 hours ago',
    gradient: 'from-green-500 to-emerald-500',
    folderId: 'goqii',
  },
  {
    id: '4',
    title: 'Goqii Board Presentation',
    type: 'presentation',
    lastModified: '16 hours ago',
    created: '15 hours ago',
    gradient: 'from-orange-500 to-red-500',
    folderId: 'goqii',
  },
  {
    id: '5',
    title: 'Goqii Deal Thesis Document',
    type: 'Live Document',
    lastModified: '16 hours ago',
    created: '15 hours ago',
    gradient: 'from-indigo-500 to-purple-500',
    folderId: 'goqii',
  },
  {
    id: '6',
    title: 'Cybersecurity Market Analysis Report',
    type: 'Live Document',
    lastModified: '16 hours ago',
    created: '15 hours ago',
    gradient: 'from-teal-500 to-blue-500',
    folderId: 'market-research',
  },
  {
    id: '7',
    title: 'Goqii M&A Target Profile Document',
    type: 'Live Document',
    lastModified: '16 hours ago',
    created: '15 hours ago',
    gradient: 'from-rose-500 to-pink-500',
    folderId: 'market-research',
  },
];

export function CorpDevDocumentsPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);
  const [folders, setFolders] = useState<FolderNode[]>(initialFolders);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [draggedDocument, setDraggedDocument] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter documents by selected folder
  const filteredDocuments = selectedFolder === 'all'
    ? documents
    : documents.filter(doc => doc.folderId === selectedFolder);

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    const updateFolderExpansion = (folders: FolderNode[]): FolderNode[] => {
      return folders.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, expanded: !folder.expanded };
        }
        if (folder.children.length > 0) {
          return { ...folder, children: updateFolderExpansion(folder.children) };
        }
        return folder;
      });
    };
    setFolders(updateFolderExpansion(folders));
  };

  // Handle document drag
  const handleDragStart = (docId: string) => {
    setDraggedDocument(docId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (folderId: string) => {
    if (draggedDocument) {
      setDocuments(docs =>
        docs.map(doc =>
          doc.id === draggedDocument
            ? { ...doc, folderId }
            : doc
        )
      );
      setDraggedDocument(null);
    }
  };

  // Create new folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FolderNode = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        parentId: null,
        children: [],
        documentCount: 0,
        expanded: false,
      };
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowNewFolderModal(false);
    }
  };

  // Recursive folder rendering
  const renderFolder = (folder: FolderNode, depth: number = 0) => {
    const isSelected = selectedFolder === folder.id;
    const FolderIcon = folder.expanded ? FolderOpen : Folder;
    const hasChildren = folder.children.length > 0;

    return (
      <div key={folder.id}>
        <button
          onClick={() => setSelectedFolder(folder.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => {
            e.stopPropagation();
            handleDrop(folder.id);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left group transition-all ${
            isSelected
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'hover:bg-slate-700/50 text-slate-300'
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="p-0.5 hover:bg-slate-600 rounded"
              >
                {folder.expanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            <FolderIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{folder.name}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isSelected ? 'bg-blue-500/30' : 'bg-slate-600/50'
          }`}>
            {folder.documentCount}
          </span>
        </button>

        {/* Render children if expanded */}
        {folder.expanded && folder.children.map(child => renderFolder(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700/20 flex flex-col">
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Folders</h2>
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="space-y-1">
            {folders.map(folder => renderFolder(folder))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700/20">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Folder</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileStack className="w-5 h-5 text-slate-400" />
              <h1 className="text-xl font-semibold">
                {folders.find(f => f.id === selectedFolder)?.name || 'All Documents'}
              </h1>
              <span className="text-sm text-slate-400">
                ({filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Recent Dropdown */}
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm hover:bg-slate-600">
              <span>Recent</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Templates Button */}
            <button
              onClick={() => navigate('/corp-dev/templates')}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm hover:bg-slate-600 transition-colors"
            >
              Templates
            </button>

            {/* New Document Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Document</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={() => handleDragStart(doc.id)}
                  className="group cursor-move bg-slate-800/50 backdrop-blur border border-slate-700/20 rounded-lg overflow-hidden hover:border-slate-600/50 hover:shadow-lg transition-all"
                >
                  {/* Thumbnail - Reduced from h-40 to h-24 */}
                  <div
                    className={`relative h-24 bg-gradient-to-br ${doc.gradient} flex items-center justify-center p-3`}
                  >
                    <div className="absolute top-1.5 right-1.5 bg-white/20 backdrop-blur-sm rounded px-1.5 py-0.5">
                      <span className="text-[10px] font-medium text-white">
                        {doc.type === 'presentation' ? 'Alpha' : 'Beta'}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-xs text-center line-clamp-2">
                      {doc.title}
                    </h3>
                  </div>

                  {/* Card Info - Reduced padding */}
                  <div className="p-3">
                    <h3 className="font-medium text-xs mb-1.5 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {doc.lastModified}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          doc.type === 'Live Document'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {doc.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      draggable
                      onDragStart={() => handleDragStart(doc.id)}
                      className="hover:bg-slate-700/50 cursor-move transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <span className="text-sm font-medium">{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.type === 'Live Document'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {doc.lastModified}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {doc.created}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Folder</h3>

            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                } else if (e.key === 'Escape') {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }
              }}
            />

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  newFolderName.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Creation Modal */}
      <DocumentCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(doc) => {
          const newDocId = Date.now().toString();
          if (doc.type === 'M&A Profile') {
            navigate(`/corp-dev/documents/${newDocId}/analyst`);
          } else {
            navigate(`/corp-dev/documents/${newDocId}/edit`);
          }
          setShowCreateModal(false);
        }}
        folders={folders}
      />
    </div>
  );
}
