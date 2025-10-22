import { useState, useRef } from 'react';
import {
  Globe,
  Lock,
  Upload,
  Copy,
  Edit2,
  Search,
  FileText,
  X,
  Paperclip,
  CheckCircle
} from 'lucide-react';

interface PublicSource {
  id: string;
  citationNumber: number;
  title: string;
  domain: string;
  url: string;
  usedCount: number;
}

interface PrivateDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  type: string;
}

interface SourcesTabProps {
  documentId?: string;
}

export function SourcesTab({ documentId }: SourcesTabProps) {
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [searchQuery, setSearchQuery] = useState('');
  const [publicSources, setPublicSources] = useState<PublicSource[]>([
    {
      id: '1',
      citationNumber: 1,
      title: 'GOQii - India\'s Leading Preventive Healthcare Platform',
      domain: 'goqii.com',
      url: 'https://goqii.com',
      usedCount: 12
    },
    {
      id: '2',
      citationNumber: 2,
      title: 'Healthcare Innovation',
      domain: 'healthcareinnovation.com',
      url: 'https://healthcareinnovation.com',
      usedCount: 2
    },
    {
      id: '3',
      citationNumber: 3,
      title: 'Goqii Revolutionizes Uk Healthcare',
      domain: 'businesstoday.in',
      url: 'https://businesstoday.in',
      usedCount: 2
    },
    {
      id: '4',
      citationNumber: 4,
      title: 'GCC',
      domain: 'gcc.com',
      url: 'https://gcc.com',
      usedCount: 5
    },
    {
      id: '5',
      citationNumber: 5,
      title: 'BT Exclusive Goqii To Expand Into Connected Fitness',
      domain: 'businesstoday.in',
      url: 'https://businesstoday.in',
      usedCount: 3
    }
  ]);

  const [privateDocuments, setPrivateDocuments] = useState<PrivateDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const totalSources = 294;
  const totalCitations = 619;
  const uniqueDomains = 198;

  const filteredSources = publicSources.filter(source =>
    source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopySource = (source: PublicSource) => {
    const citationText = `[${source.citationNumber}] ${source.title} - ${source.domain}`;
    navigator.clipboard.writeText(citationText);
    setCopiedId(source.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditSource = (source: PublicSource) => {
    // Implement edit functionality
    console.log('Edit source:', source);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newDocuments: PrivateDocument[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      type: file.type
    }));

    setPrivateDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveDocument = (id: string) => {
    setPrivateDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 px-6 pt-6 pb-4 border-b border-slate-700/20">
        <button
          onClick={() => setActiveTab('public')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'public'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Public Sources</span>
        </button>
        <button
          onClick={() => setActiveTab('private')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'private'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Private Sources</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'public' ? (
          <div className="p-6 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sources..."
                className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700/20"
              />
            </div>

            {/* Sources List */}
            <div className="space-y-3">
              {filteredSources.map((source) => (
                <div
                  key={source.id}
                  className="bg-slate-800/50 border border-slate-700/20 rounded-lg p-4 hover:border-slate-600/50 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {/* Citation Number */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">[{source.citationNumber}]</span>
                      </div>

                      {/* Source Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs text-cyan-400 font-medium">
                            Used {source.usedCount} {source.usedCount === 1 ? 'time' : 'times'}
                          </span>
                        </div>
                        <h4 className="text-white font-medium text-sm mb-1 truncate">
                          {source.title}
                        </h4>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 text-xs hover:text-blue-400 transition-colors inline-flex items-center space-x-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span>{source.domain}</span>
                        </a>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditSource(source)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit source"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopySource(source)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors relative"
                        title="Copy citation"
                      >
                        {copiedId === source.id ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Statistics Section */}
            <div className="mt-8 pt-6 border-t border-slate-700/20">
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                Statistics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/20 rounded-lg p-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                    {totalSources}
                  </div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-medium">
                    Total Sources
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/20 rounded-lg p-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                    {totalCitations}
                  </div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-medium">
                    Total Citations
                  </div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/20 rounded-lg p-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                    {uniqueDomains}
                  </div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-medium">
                    Unique Domains
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-white font-semibold text-base mb-2 uppercase tracking-wider flex items-center space-x-2">
                <Paperclip className="w-5 h-5 text-slate-400" />
                <span>Private Document Attachments</span>
              </h3>
              <p className="text-slate-400 text-sm">
                Upload documents to use as reference material for this document. Supported formats: PDF, DOCX, TXT, and more.
              </p>
            </div>

            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Files</span>
                  </button>
                  <p className="text-slate-400 text-sm mt-2">
                    or drag and drop files here
                  </p>
                </div>
                <p className="text-slate-500 text-xs">
                  PDF, DOCX, TXT, MD, and other text formats
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                accept=".pdf,.docx,.doc,.txt,.md"
              />
            </div>

            {/* Uploaded Documents List */}
            {privateDocuments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
                  Uploaded Documents ({privateDocuments.length})
                </h4>
                {privateDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-800/50 border border-slate-700/20 rounded-lg p-4 hover:border-slate-600/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm mb-1 truncate">
                            {doc.name}
                          </h4>
                          <div className="flex items-center space-x-3 text-xs text-slate-400">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>•</span>
                            <span>
                              Uploaded {doc.uploadedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove document"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
