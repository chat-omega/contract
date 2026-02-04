/**
 * DocumentDetailPage Component
 * PDF viewer with highlighting and extraction results
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner } from '@components/ui';
import { useDocumentStore } from '@stores/documentStore';
import { useUIStore } from '@stores/uiStore';
import { documentService, extractionService } from '@services';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import type { Document, ExtractionResult, PDFDocumentProxy, HighlightRect, BBox } from '@/types';
import { PDFViewer, ExtractionPanel, ExportModal, WorkflowSelector } from './components';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const addToast = useUIStore((state) => state.addToast);
  const documents = useDocumentStore((state) => state.documents);

  const [document, setDocument] = useState<Document | null>(null);
  const [extractions, setExtractions] = useState<ExtractionResult | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedExtractionIndex, setSelectedExtractionIndex] = useState<number | null>(null);
  const [scrollToPage, setScrollToPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Export state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  /**
   * Helper function to extract and validate bbox from extraction data
   * Enhanced with type validation to ensure bbox contains valid numbers
   */
  const extractBbox = (extraction: any): BBox | null => {
    // Validation helper: check if bbox is valid array of 4 numbers
    const isValidBbox = (arr: any): arr is BBox =>
      Array.isArray(arr) &&
      arr.length === 4 &&
      arr.every(n => typeof n === 'number' && !isNaN(n) && isFinite(n));

    // Try direct bbox first
    if (extraction.bbox) {
      if (isValidBbox(extraction.bbox)) {
        return extraction.bbox;
      }
      // Try to coerce to numbers if they're valid
      const coerced = extraction.bbox.map(Number);
      if (isValidBbox(coerced)) {
        return coerced as BBox;
      }
      console.warn('[DocumentDetailPage] Invalid bbox format:', extraction.bbox);
    }

    // Fallback to spans[0].bounds (same logic as ExtractionPanel)
    if (extraction.spans && extraction.spans.length > 0 && extraction.spans[0].bounds) {
      const b = extraction.spans[0].bounds;
      const candidate = [Number(b.left), Number(b.bottom), Number(b.right), Number(b.top)] as BBox;
      if (isValidBbox(candidate)) {
        return candidate;
      }
      console.warn('[DocumentDetailPage] Invalid spans bounds:', b);
    }

    console.warn('[DocumentDetailPage] No valid bbox found:', {
      hasBbox: !!extraction.bbox,
      hasSpans: !!extraction.spans,
    });
    return null;
  };

  /**
   * Convert extraction results to highlight rectangles
   */
  const highlights = useMemo<HighlightRect[]>(() => {
    // DIAGNOSTIC: Log when highlights are being computed
    console.log('[DIAGNOSTIC] Computing highlights...', {
      hasExtractions: !!extractions,
      hasResults: !!extractions?.results,
      selectedFieldId,
      selectedExtractionIndex,
    });

    if (!extractions || !extractions.results) {
      console.log('[DIAGNOSTIC] No extractions or results - returning empty highlights array');
      return [];
    }

    const highlightRects: HighlightRect[] = [];

    // If specific extraction selected, show ONLY that one
    if (selectedFieldId && selectedExtractionIndex !== null) {
      const fieldExtraction = extractions.results[selectedFieldId];
      const extraction = fieldExtraction?.extractions[selectedExtractionIndex];

      if (extraction) {
        const bbox = extractBbox(extraction);

        if (bbox && extraction.page) {
          highlightRects.push({
            x: 0, // Will be calculated by coordinate transformation
            y: 0, // Will be calculated by coordinate transformation
            width: 0, // Will be calculated by coordinate transformation
            height: 0, // Will be calculated by coordinate transformation
            pageNumber: Number(extraction.page), // FIX: Ensure page is a number
            fieldId: selectedFieldId,
            bbox: bbox,
            extractionIndex: selectedExtractionIndex, // Include index for precise identification
            extractionText: extraction.text, // ADDED: Pass text for word-level highlighting
          });
        }
      }
    } else if (selectedFieldId) {
      // Show all extractions for the selected field (when field clicked, not specific extraction)
      const fieldExtraction = extractions.results[selectedFieldId];

      if (fieldExtraction?.extractions) {
        fieldExtraction.extractions.forEach((extraction, idx) => {
          const bbox = extractBbox(extraction);

          if (bbox && extraction.page) {
            highlightRects.push({
              x: 0, // Will be calculated by coordinate transformation
              y: 0, // Will be calculated by coordinate transformation
              width: 0, // Will be calculated by coordinate transformation
              height: 0, // Will be calculated by coordinate transformation
              pageNumber: Number(extraction.page), // FIX: Ensure page is a number
              fieldId: selectedFieldId,
              bbox: bbox,
              extractionIndex: idx, // Include index for each extraction
              extractionText: extraction.text, // ADDED: Pass text for word-level highlighting
            });
          }
        });
      }
    }

    // DIAGNOSTIC: Log final highlights array
    console.log('[DIAGNOSTIC] Highlights computed:', {
      count: highlightRects.length,
      highlights: highlightRects.map(h => ({
        fieldId: h.fieldId,
        page: h.pageNumber,
        hasBbox: !!h.bbox,
        hasText: !!h.extractionText,
      })),
    });

    return highlightRects;
  }, [extractions, selectedFieldId, selectedExtractionIndex]);

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) {
        setError('No document ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Try to get document from store first
        let doc = documents.find((d) => d.id === id);

        // If not in store, fetch from API
        if (!doc) {
          doc = await documentService.getDocument(id);
        }

        setDocument(doc);

        // Fetch extraction results if document has a workflow assigned
        try {
          // Get the first workflow ID from the document (if any)
          const workflowId = doc.workflows?.[0];
          console.log('[DEBUG] Document workflows:', doc.workflows);
          console.log('[DEBUG] Using workflow_id:', workflowId);

          const extractionResult = await extractionService.getExtractions(id, workflowId);
          console.log('[DEBUG] Extraction result received:', extractionResult);
          console.log('[DEBUG] Extraction status:', extractionResult?.status);
          console.log('[DEBUG] Results object:', extractionResult?.results);
          console.log('[DEBUG] Results keys:', extractionResult?.results ? Object.keys(extractionResult.results) : []);
          console.log('[DEBUG] Number of fields:', extractionResult?.results ? Object.keys(extractionResult.results).length : 0);

          // DIAGNOSTIC: Check why hasExtractions might be false in the highlights useMemo
          console.log('[DEBUG] Extraction structure check:');
          console.log('  - extractionResult is null?', extractionResult === null);
          console.log('  - extractionResult is undefined?', extractionResult === undefined);
          console.log('  - extractionResult has results?', 'results' in (extractionResult || {}));
          console.log('  - typeof extractionResult:', typeof extractionResult);
          console.log('  - Full structure (JSON):', JSON.stringify(extractionResult, null, 2).substring(0, 1000) + '...');

          // TDD PHASE 2: Show extraction page numbers and their types
          console.log('[DEBUG] Extraction page numbers:',
            Object.entries(extractionResult?.results || {}).map(([fieldId, field]: [string, any]) => ({
              fieldId: fieldId.substring(0, 12) + '...',
              pages: field.extractions?.map((e: any) => ({
                page: e.page,
                type: typeof e.page,
                text: e.text?.substring(0, 30) + '...'
              }))
            }))
          );

          setExtractions(extractionResult);
        } catch (err) {
          // Extractions may not exist yet, that's OK
          console.error('Error loading extractions:', err);
          console.error('Error details:', err instanceof Error ? err.message : String(err));
        }
      } catch (err: any) {
        console.error('Error loading document:', err);
        setError(err.response?.data?.detail || 'Failed to load document');
        addToast('error', 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [id, documents, addToast]);

  const handleBack = () => {
    navigate('/documents');
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleWorkflowsUpdated = async () => {
    if (!id) return;

    try {
      // Reload document to get updated workflows
      const updatedDoc = await documentService.getDocument(id);
      setDocument(updatedDoc);

      // Reload extractions
      try {
        // Get the first workflow ID from the updated document
        const workflowId = updatedDoc.workflows?.[0];
        console.log('[DEBUG] Updated document workflows:', updatedDoc.workflows);
        console.log('[DEBUG] Using workflow_id:', workflowId);

        const extractionResult = await extractionService.getExtractions(id, workflowId);
        console.log('[DEBUG] Extraction result received (after workflow update):', extractionResult);
        console.log('[DEBUG] Results keys:', extractionResult?.results ? Object.keys(extractionResult.results) : []);
        setExtractions(extractionResult);
        addToast('success', 'Workflows updated and extraction complete');
      } catch (err) {
        // Extractions may not be ready yet, that's OK
        console.error('Error loading extractions after workflow update:', err);
        console.error('Error details:', err instanceof Error ? err.message : String(err));
        addToast('success', 'Workflows updated. Extraction in progress.');
      }
    } catch (error: any) {
      console.error('Error reloading document:', error);
      addToast('error', 'Failed to reload document');
    }
  };

  const handleStartExtraction = async () => {
    if (!id || !document) return;

    const workflowId = document.workflows?.[0];
    if (!workflowId) {
      addToast('error', 'No workflow assigned to this document');
      return;
    }

    setIsExtracting(true);

    try {
      console.log('[DocumentDetailPage] Starting extraction:', { documentId: id, workflowId });

      // Start extraction
      await extractionService.startExtraction(id, workflowId);
      addToast('info', 'Extraction started...');

      // Poll for status
      const status = await extractionService.pollExtractionStatus(
        id,
        workflowId,
        (progressStatus) => {
          console.log('[DocumentDetailPage] Extraction progress:', progressStatus);
        }
      );

      if (status.status === 'complete') {
        // Reload extractions
        const extractionResult = await extractionService.getExtractions(id, workflowId);
        setExtractions(extractionResult);
        addToast('success', 'Extraction completed successfully!');
      } else if (status.status === 'failed') {
        addToast('error', status.message || 'Extraction failed');
      }
    } catch (error: any) {
      console.error('Failed to start extraction:', error);
      addToast('error', error.message || 'Failed to start extraction');
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePDFLoad = useCallback((pdf: PDFDocumentProxy) => {
    console.log('[DocumentDetailPage] PDF loaded:', {
      numPages: pdf.numPages,
      fingerprint: pdf.fingerprints,
    });
  }, []);

  const handlePDFError = useCallback((error: Error) => {
    console.error('[DocumentDetailPage] PDF error:', error);
    addToast('error', 'Failed to load PDF');
  }, [addToast]);

  const handleFieldClick = useCallback((fieldId: string) => {
    // Toggle selection: if clicking the same field, deselect it
    setSelectedFieldId((prev) => (prev === fieldId ? null : fieldId));
    setSelectedExtractionIndex(null); // Reset extraction selection when field changes
  }, []);

  const handleExtractionClick = useCallback((
    fieldId: string,
    extractionIndex: number,
    page: number,
    bbox: BBox
  ) => {
    console.log('[DocumentDetailPage] ✅ handleExtractionClick CALLED:', {
      fieldId,
      extractionIndex,
      page,
      bbox,
      timestamp: new Date().toISOString(),
    });

    // Select the field and extraction
    console.log('[DocumentDetailPage] Setting state:', {
      selectedFieldId: fieldId,
      selectedExtractionIndex: extractionIndex,
      scrollToPage: page,
    });

    setSelectedFieldId(fieldId);
    setSelectedExtractionIndex(extractionIndex);

    // Trigger scroll to the page containing this extraction
    setScrollToPage(page);

    console.log('[DocumentDetailPage] State update triggered for page:', page);

    // Show toast notification
    addToast('info', `Viewing extraction on page ${page}`);
  }, [addToast]);

  // Memoized callback for scroll completion
  // FIX: Don't reset scrollToPage - the scroll effect is idempotent and won't re-scroll
  // This prevents state changes that could trigger the unstable dependency chain
  const handleScrollComplete = useCallback(() => {
    console.log('[DocumentDetailPage] Scroll completed - keeping scrollToPage value (idempotent)');
    // No reset needed - scroll effect checks if page exists before scrolling
  }, []);

  // Diagnostic: Log when handlers are created/updated
  useEffect(() => {
    console.log('[DocumentDetailPage] 🔧 Handlers initialized:', {
      hasHandleExtractionClick: typeof handleExtractionClick === 'function',
      hasHandleFieldClick: typeof handleFieldClick === 'function',
      hasHandleScrollComplete: typeof handleScrollComplete === 'function',
      timestamp: new Date().toISOString(),
    });
  }, [handleExtractionClick, handleFieldClick, handleScrollComplete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested document could not be found.'}</p>
          <Button variant="primary" onClick={handleBack}>
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{document.name}</h1>
              <p className="text-sm text-gray-500">
                Uploaded {new Date(document.upload_date).toLocaleDateString()} • {document.doc_type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {document && (
              <WorkflowSelector
                document={document}
                onWorkflowsUpdated={handleWorkflowsUpdated}
              />
            )}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content: PDF Viewer + Extraction Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Extraction Results Panel */}
        <ExtractionPanel
          extractions={extractions}
          selectedFieldId={selectedFieldId}
          selectedExtractionIndex={selectedExtractionIndex}
          hasWorkflow={!!(document?.workflows && document.workflows.length > 0)}
          isExtracting={isExtracting}
          onFieldClick={handleFieldClick}
          onExtractionClick={handleExtractionClick}
          onStartExtraction={handleStartExtraction}
        />

        {/* PDF Viewer */}
        <PDFViewer
          documentId={document.id}
          pdfUrl={documentService.getDocumentContentUrl(document.id)}
          highlights={highlights}
          selectedFieldId={selectedFieldId}
          selectedExtractionIndex={selectedExtractionIndex}
          scrollToPage={scrollToPage}
          onLoad={handlePDFLoad}
          onError={handlePDFError}
          onScrollComplete={handleScrollComplete}
          enableSearch={true}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        documents={document ? [document] : []}
        extractions={extractions?.results ? [extractions] : []}
        mode="single"
      />
    </div>
  );
};

export default DocumentDetailPage;
