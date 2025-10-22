import React, { useState } from 'react';
import { X, FileText, Briefcase } from 'lucide-react';

interface DocumentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    type: 'Live Document' | 'M&A Profile';
    folderId: string;
  }) => void;
  folders: Array<{ id: string; name: string }>;
}

export const DocumentCreationModal: React.FC<DocumentCreationModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  folders,
}) => {
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<'Live Document' | 'M&A Profile'>('Live Document');
  const [selectedFolderId, setSelectedFolderId] = useState(folders[0]?.id || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    // Validate title
    if (!title.trim()) {
      setError('Please enter a document title');
      return;
    }

    // Call onCreate callback
    onCreate({
      title: title.trim(),
      type: documentType,
      folderId: selectedFolderId,
    });

    // Reset form
    setTitle('');
    setDocumentType('Live Document');
    setSelectedFolderId(folders[0]?.id || '');
    setError('');
  };

  const handleCancel = () => {
    // Reset form
    setTitle('');
    setDocumentType('Live Document');
    setSelectedFolderId(folders[0]?.id || '');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Create New Document</h2>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Title Input */}
          <div>
            <label htmlFor="document-title" className="block text-sm font-medium text-slate-300 mb-2">
              Document Title
            </label>
            <input
              id="document-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="Enter document title..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
          </div>

          {/* Document Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Document Type
            </label>
            <div className="space-y-3">
              {/* Live Document Option */}
              <label className="flex items-start p-3 bg-slate-900 rounded-md cursor-pointer hover:bg-slate-900/80 transition-colors border border-slate-700 hover:border-blue-600">
                <input
                  type="radio"
                  name="document-type"
                  value="Live Document"
                  checked={documentType === 'Live Document'}
                  onChange={(e) => setDocumentType(e.target.value as 'Live Document')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-800"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <FileText size={16} className="text-blue-400 mr-2" />
                    <span className="text-white font-medium">Live Document</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Simple editor for creating and editing documents
                  </p>
                </div>
              </label>

              {/* M&A Profile Option */}
              <label className="flex items-start p-3 bg-slate-900 rounded-md cursor-pointer hover:bg-slate-900/80 transition-colors border border-slate-700 hover:border-blue-600">
                <input
                  type="radio"
                  name="document-type"
                  value="M&A Profile"
                  checked={documentType === 'M&A Profile'}
                  onChange={(e) => setDocumentType(e.target.value as 'M&A Profile')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-800"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <Briefcase size={16} className="text-blue-400 mr-2" />
                    <span className="text-white font-medium">M&A Profile</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Analyst mode with advanced research and analysis tools
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Folder Selection */}
          <div>
            <label htmlFor="folder-select" className="block text-sm font-medium text-slate-300 mb-2">
              Save to Folder
            </label>
            <select
              id="folder-select"
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
