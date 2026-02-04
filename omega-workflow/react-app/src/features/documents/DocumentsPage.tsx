/**
 * DocumentsPage Component
 * Document management with table view, filters, and pagination
 */

import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui';
import {
  RenameDocumentModal,
  DeleteDocumentModal,
  WorkflowAssignmentModal,
  DocumentsToolbar,
  DocumentsFilterPanel,
  ExportModal,
  type FilterState,
} from './components';
import { useDocumentStore } from '@stores/documentStore';
import { useWorkflowStore } from '@stores/workflowStore';
import { useUIStore } from '@stores/uiStore';
import { documentService, workflowService, extractionService } from '@services';
import {
  DocumentIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';
import type { Document, ExtractionResult } from '@/types';

type SortField = 'name' | 'upload_date' | 'doc_type';
type SortDirection = 'asc' | 'desc';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const documents = useDocumentStore((state) => state.documents);
  const setDocuments = useDocumentStore((state) => state.setDocuments);
  const selectedDocuments = useDocumentStore((state) => state.selectedDocuments);
  const toggleSelection = useDocumentStore((state) => state.toggleSelection);
  const clearSelection = useDocumentStore((state) => state.clearSelection);
  const workflows = useWorkflowStore((state) => state.workflows);
  const setWorkflows = useWorkflowStore((state) => state.setWorkflows);
  const addToast = useUIStore((state) => state.addToast);

  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('upload_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [renameDocument, setRenameDocument] = useState<Document | null>(null);
  const [deleteDocuments, setDeleteDocuments] = useState<Document[]>([]);
  const [assignWorkflowDocs, setAssignWorkflowDocs] = useState<Document[]>([]);

  // Export state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDocuments, setExportDocuments] = useState<Document[]>([]);
  const [exportExtractions, setExportExtractions] = useState<ExtractionResult[]>([]);
  const [isLoadingExtractions, setIsLoadingExtractions] = useState(false);

  // Filter state
  const initialFilterState: FilterState = {
    searchQuery: '',
    documentType: null,
    workflowId: null,
    uploadedBy: null,
    dateRange: { start: null, end: null },
  };
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Load documents and workflows
  useEffect(() => {
    loadDocuments();
    loadWorkflows();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (error: any) {
      addToast('error', error.response?.data?.detail || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const wfs = await workflowService.getWorkflows();
      setWorkflows(wfs);
    } catch (error: any) {
      console.error('Failed to load workflows:', error);
      // Don't show error toast for workflows - not critical for document listing
    }
  };

  // Filtering
  const applyFilters = (docs: Document[], filters: FilterState): Document[] => {
    return docs.filter((doc) => {
      // Search query (searches name, filename, doc_type, uploadedBy)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          doc.name.toLowerCase().includes(query) ||
          doc.filename.toLowerCase().includes(query) ||
          doc.doc_type.toLowerCase().includes(query) ||
          (doc.uploadedBy?.toLowerCase().includes(query) || false);

        if (!matchesSearch) return false;
      }

      // Document Type
      if (filters.documentType && doc.doc_type !== filters.documentType) {
        return false;
      }

      // Workflow
      if (filters.workflowId) {
        if (!doc.workflows || !doc.workflows.includes(filters.workflowId)) {
          return false;
        }
      }

      // Uploaded By
      if (filters.uploadedBy && doc.uploadedBy !== filters.uploadedBy) {
        return false;
      }

      // Date Range
      if (filters.dateRange.start || filters.dateRange.end) {
        const docDate = new Date(doc.upload_date);

        if (filters.dateRange.start && docDate < filters.dateRange.start) {
          return false;
        }

        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Include entire end day
          if (docDate > endDate) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const filteredDocuments = useMemo(
    () => applyFilters(documents, filters),
    [documents, filters]
  );

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.documentType) count++;
    if (filters.workflowId) count++;
    if (filters.uploadedBy) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'upload_date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [filteredDocuments, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedDocuments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, sortedDocuments.length);
  const paginatedDocuments = sortedDocuments.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Selection
  const allSelected = paginatedDocuments.length > 0 &&
    paginatedDocuments.every(doc => selectedDocuments.has(doc.id));

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all on current page
      paginatedDocuments.forEach(doc => {
        if (selectedDocuments.has(doc.id)) {
          toggleSelection(doc.id);
        }
      });
    } else {
      // Select all on current page
      paginatedDocuments.forEach(doc => {
        if (!selectedDocuments.has(doc.id)) {
          toggleSelection(doc.id);
        }
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Batch operation handlers
  const handleDeleteSelected = () => {
    const selected = documents.filter((doc) => selectedDocuments.has(doc.id));
    setDeleteDocuments(selected);
  };

  const handleAssignWorkflowToSelected = () => {
    const selected = documents.filter((doc) => selectedDocuments.has(doc.id));
    setAssignWorkflowDocs(selected);
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  // Export handler
  const handleExport = async () => {
    // Determine which documents to export
    const docsToExport = selectedDocuments.size > 0
      ? documents.filter((doc) => selectedDocuments.has(doc.id))
      : filteredDocuments;

    if (docsToExport.length === 0) {
      addToast('warning', 'No documents to export');
      return;
    }

    setIsLoadingExtractions(true);
    setExportDocuments(docsToExport);

    // Fetch extractions for all documents
    try {
      const extractionsPromises = docsToExport.map((doc) =>
        extractionService.getExtractions(doc.id).catch(() => null)
      );
      const extractionsResults = await Promise.all(extractionsPromises);
      const validExtractions = extractionsResults.filter(
        (ext): ext is ExtractionResult => ext !== null
      );
      setExportExtractions(validExtractions);
      setIsExportModalOpen(true);
    } catch (error) {
      console.error('Failed to load extractions:', error);
      // Still allow export even if extractions fail
      setExportExtractions([]);
      setIsExportModalOpen(true);
    } finally {
      setIsLoadingExtractions(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar - Sleek design matching vanilla app */}
      <div className="bg-white rounded-lg p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#f0f0f0] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[#212121]">Documents</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {activeFilterCount}
              </span>
            )}
            <ChevronDownIcon
              className={cn(
                'h-4 w-4 ml-2 transition-transform',
                isPanelOpen && 'rotate-180'
              )}
            />
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoadingExtractions || (selectedDocuments.size === 0 && filteredDocuments.length === 0)}
          >
            {isLoadingExtractions ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export
                {selectedDocuments.size > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {selectedDocuments.size}
                  </span>
                )}
              </>
            )}
          </Button>
          <Button variant="primary" onClick={() => navigate('/upload')}>
            Add Documents
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <DocumentsFilterPanel
        isOpen={isPanelOpen}
        filters={filters}
        onFilterChange={setFilters}
        onClear={() => setFilters(initialFilterState)}
        documents={documents}
        workflows={workflows}
      />

      {/* Table Container - Sleek design with shadow */}
      <div className="bg-white rounded shadow-[0_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Table Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#757575]">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-[#e0e0e0] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-[#ff9800]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#757575]">
              {startIndex + 1}–{endIndex} of {sortedDocuments.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 text-[#424242]" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded hover:bg-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5 text-[#424242]" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fafafa] border-b-2 border-[#e0e0e0]">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="rounded border-[#e0e0e0] text-[#ff9800] focus:ring-[#ff9800] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-[#424242]"
                  >
                    Name
                    <ArrowUpIcon
                      className={cn(
                        'h-4 w-4 transition-transform',
                        sortField === 'name' && sortDirection === 'desc' && 'rotate-180',
                        sortField === 'name' ? 'text-[#ff9800]' : 'opacity-30'
                      )}
                    />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('upload_date')}
                    className="flex items-center gap-1 hover:text-[#424242]"
                  >
                    Added On
                    <ArrowUpIcon
                      className={cn(
                        'h-4 w-4 transition-transform',
                        sortField === 'upload_date' && sortDirection === 'desc' && 'rotate-180',
                        sortField === 'upload_date' ? 'text-[#ff9800]' : 'opacity-30'
                      )}
                    />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('doc_type')}
                    className="flex items-center gap-1 hover:text-[#424242]"
                  >
                    Document Type
                    <ArrowUpIcon
                      className={cn(
                        'h-4 w-4 transition-transform',
                        sortField === 'doc_type' && sortDirection === 'desc' && 'rotate-180',
                        sortField === 'doc_type' ? 'text-[#ff9800]' : 'opacity-30'
                      )}
                    />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Workflows
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Reviewers
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#e0e0e0]">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                      Loading documents...
                    </div>
                  </td>
                </tr>
              ) : paginatedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by uploading a document.
                    </p>
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/upload')}
                      >
                        Upload Document
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className={cn(
                      "hover:bg-[#fafafa] cursor-pointer transition-colors",
                      selectedDocuments.has(doc.id) && "bg-[#fff3e0]"
                    )}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).tagName !== 'INPUT' &&
                          (e.target as HTMLElement).tagName !== 'BUTTON') {
                        navigate(`/documents/${doc.id}`);
                      }
                    }}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(doc.id)}
                        onChange={() => toggleSelection(doc.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-[#e0e0e0] text-[#ff9800] focus:ring-[#ff9800] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <DocumentIcon className="h-5 w-5 text-[#757575] mr-3" />
                        <div>
                          <div className="text-sm font-medium text-[#212121]">{doc.name}</div>
                          <div className="text-xs text-[#757575]">{doc.filename}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#424242]">
                      {formatDate(doc.upload_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 inline-flex text-xs font-medium rounded-full bg-[#e3f2fd] text-[#1976d2]">
                        {doc.doc_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#424242]">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#424242]">
                      {doc.uploadedBy || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#424242]">
                      {doc.workflowNames && doc.workflowNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {doc.workflowNames.map((wfName, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-[#e3f2fd] text-[#1976d2]"
                            >
                              {wfName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#424242]">
                      {doc.reviewers && doc.reviewers.length > 0 ? (
                        doc.reviewers.join(', ')
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameDocument(doc);
                          }}
                          className="p-1.5 text-[#757575] hover:text-[#424242] rounded hover:bg-[#fafafa] transition-colors"
                          title="Rename document"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDocuments([doc]);
                          }}
                          className="p-1.5 text-[#757575] hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="Delete document"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/documents/${doc.id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rename Modal */}
      <RenameDocumentModal
        isOpen={!!renameDocument}
        onClose={() => setRenameDocument(null)}
        document={renameDocument}
        onSuccess={loadDocuments}
      />

      {/* Delete Modal */}
      <DeleteDocumentModal
        isOpen={deleteDocuments.length > 0}
        onClose={() => setDeleteDocuments([])}
        documents={deleteDocuments}
        onSuccess={loadDocuments}
      />

      {/* Workflow Assignment Modal */}
      <WorkflowAssignmentModal
        isOpen={assignWorkflowDocs.length > 0}
        onClose={() => setAssignWorkflowDocs([])}
        documents={assignWorkflowDocs}
        onSuccess={loadDocuments}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setExportDocuments([]);
          setExportExtractions([]);
        }}
        documents={exportDocuments}
        extractions={exportExtractions}
        mode="batch"
      />

      {/* Batch Operations Toolbar */}
      <DocumentsToolbar
        selectedCount={selectedDocuments.size}
        onDeleteSelected={handleDeleteSelected}
        onAssignWorkflow={handleAssignWorkflowToSelected}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
};

export default DocumentsPage;
