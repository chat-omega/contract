/**
 * PDFViewer Component
 * PDF.js-based continuous scroll PDF viewer with highlighting support
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';
import type { PDFDocumentProxy, PDFPageProxy, HighlightRect } from '@/types';
import type { SearchState, PDFTextContent } from '@/types/search';
import { Button } from '@components/ui';
import {
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
} from '@heroicons/react/24/outline';
import {
  drawSearchHighlight,
  transformSearchMatchCoordinates,
} from '@utils/pdfCoordinates';
import { searchPDF, extractAllTextContent } from '@utils/pdfTextSearch';
// CSS-based text layer highlighting (replaces coordinate-based canvas highlighting)
import { highlightTextInLayer, clearHighlightsOnPage, waitForTextLayerReady } from '@utils/textLayerHighlight';
import { SearchBar } from './SearchBar';
import { useUIStore } from '@stores/uiStore';
import { usePDFCacheStore } from '@stores/pdfCacheStore';
import { apiClient } from '@services/api';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  documentId: string;
  pdfUrl: string;
  highlights?: HighlightRect[];
  selectedFieldId?: string | null;
  selectedExtractionIndex?: number | null;
  scrollToPage?: number | null;
  onHighlightClick?: (fieldId: string) => void;
  onLoad?: (pdf: PDFDocumentProxy) => void;
  onError?: (error: Error) => void;
  /** Callback fired after scrolling to page completes */
  onScrollComplete?: () => void;
  /** Enable PDF text search functionality */
  enableSearch?: boolean;
}

interface PageRenderState {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  rendered: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  documentId: _documentId,
  pdfUrl,
  highlights = [],
  selectedFieldId = null,
  selectedExtractionIndex = null,
  scrollToPage = null,
  onHighlightClick: _onHighlightClick,
  onLoad,
  onError,
  onScrollComplete,
  enableSearch = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const pageStatesRef = useRef<Map<number, PageRenderState>>(new Map());
  const textContentMapRef = useRef<Map<number, PDFTextContent>>(new Map());
  const pdfBlobUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputValue, setPageInputValue] = useState('');

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    matches: [],
    currentMatchIndex: -1,
    isSearching: false,
    isSearchBarVisible: false,
    totalMatches: 0,
  });

  // Pulse animation state for highlighting newly selected extractions (used in pulse effect)
  const [_pulseIntensity, setPulseIntensity] = useState(0);
  const pulseTimerRef = useRef<number | null>(null);

  // Track previous highlight pages for optimized rendering
  const previousHighlightPagesRef = useRef<Set<number>>(new Set());

  // Track active render operation to prevent overlapping renders
  const renderAbortControllerRef = useRef<AbortController | null>(null);

  // Track if scrolling is in progress to prevent render interference
  const isScrollingRef = useRef<boolean>(false);

  // Track render state to prevent unnecessary full re-renders on manual scroll
  const hasRenderedRef = useRef<boolean>(false);
  const previousScaleRef = useRef<number>(scale);

  const addToast = useUIStore((state) => state.addToast);

  // PDF Cache store
  const getCachedPage = usePDFCacheStore((state) => state.getCachedPage);
  const setCachedPage = usePDFCacheStore((state) => state.setCachedPage);
  const clearDocument = usePDFCacheStore((state) => state.clearDocument);

  /**
   * Check if PDF is still valid and not destroyed
   * Prevents "messageHandler is null" errors
   */
  const isPDFValid = useCallback((pdf: PDFDocumentProxy | null): boolean => {
    if (!pdf) return false;
    // Check if PDF has been destroyed by checking for _transport
    // This is an internal property but necessary to prevent race conditions
    try {
      return !!(pdf as any)._transport && isMountedRef.current;
    } catch {
      return false;
    }
  }, []);

  /**
   * Load PDF document
   */
  const loadPDF = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Reset render lock when loading new PDF
      hasRenderedRef.current = false;

      // Check if authentication token exists (from auth storage)
      const authStorage = localStorage.getItem('auth-storage');
      const authData = authStorage ? JSON.parse(authStorage) : null;
      const token = authData?.state?.token;

      console.log('[PDFViewer] Authentication check:', {
        storageExists: !!authStorage,
        tokenExists: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'NONE',
        isAuthenticated: authData?.state?.isAuthenticated,
      });
      console.log('[PDFViewer] Fetching PDF:', pdfUrl);

      // Fetch PDF through axios (includes auth headers via interceptors)
      const response = await apiClient.get(pdfUrl, {
        responseType: 'blob',
      });

      console.log('[PDFViewer] PDF fetch response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        blobSize: response.data.size,
      });

      // Verify we got a valid PDF blob
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty PDF file from server');
      }

      console.log('[PDFViewer] Creating blob URL from response data');

      // Create blob URL for PDF.js
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      // Store blob URL for cleanup
      pdfBlobUrlRef.current = blobUrl;

      console.log('[PDFViewer] Loading PDF from blob URL:', blobUrl);

      const loadingTask = pdfjsLib.getDocument(blobUrl);
      const pdf = await loadingTask.promise;

      console.log('[PDFViewer] PDF loaded successfully:', {
        numPages: pdf.numPages,
        fingerprint: pdf.fingerprints,
      });

      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);

      if (onLoad) {
        onLoad(pdf);
      }

      // Set loading to false BEFORE rendering pages to ensure container is visible
      setIsLoading(false);

      // Render all pages after loading state is cleared
      await renderAllPages(pdf);
    } catch (err: any) {
      console.error('[PDFViewer] Error loading PDF:', err);
      console.error('[PDFViewer] Error details:', {
        message: err.message,
        name: err.name,
        code: err.code,
        response: err.response ? {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
        } : 'No response',
        isAxiosError: err.isAxiosError,
        config: err.config ? {
          url: err.config.url,
          method: err.config.method,
          headers: err.config.headers ? {
            Authorization: err.config.headers.Authorization ? 'Present' : 'Missing',
          } : 'No headers',
        } : 'No config',
      });

      // Provide specific error messages based on error type
      let errorMsg = 'Failed to load PDF';

      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          errorMsg = 'Authentication failed. Please log in again.';
        } else if (err.response.status === 404) {
          errorMsg = 'PDF file not found on server.';
        } else if (err.response.status === 403) {
          errorMsg = 'Access denied. You do not have permission to view this document.';
        } else {
          errorMsg = `Server error (${err.response.status}): ${err.response.statusText}`;
        }
      } else if (err.request) {
        // Request made but no response
        errorMsg = 'No response from server. Please check your internet connection.';
      } else if (err.message) {
        // Something else went wrong
        errorMsg = err.message;
      }

      setError(errorMsg);
      setIsLoading(false);

      if (onError) {
        onError(err);
      }
    }
  }, [pdfUrl, onLoad, onError]);

  /**
   * Extract text content from all pages for search
   */
  const extractTextForSearch = useCallback(async () => {
    if (!pdfDocRef.current || !enableSearch) return;

    console.log('[PDFViewer] Extracting text content for search...');
    const startTime = performance.now();

    try {
      const textContentMap = await extractAllTextContent(pdfDocRef.current);
      textContentMapRef.current = textContentMap;

      const endTime = performance.now();
      console.log('[PDFViewer] Text extraction complete:', {
        duration: `${(endTime - startTime).toFixed(2)}ms`,
        pages: textContentMap.size,
      });
    } catch (err) {
      console.error('[PDFViewer] Error extracting text:', err);
    }
  }, [enableSearch]);

  /**
   * Perform search
   */
  const handleSearch = useCallback(
    async (query: string) => {
      if (!pdfDocRef.current || !enableSearch) return;

      // Clear search if query is empty
      if (!query || query.trim().length === 0) {
        setSearchState({
          query: '',
          matches: [],
          currentMatchIndex: -1,
          isSearching: false,
          isSearchBarVisible: searchState.isSearchBarVisible,
          totalMatches: 0,
        });
        return;
      }

      setSearchState((prev) => ({ ...prev, isSearching: true, query }));

      try {
        // Extract text if not already done
        if (textContentMapRef.current.size === 0) {
          await extractTextForSearch();
        }

        const matches = await searchPDF(
          query,
          textContentMapRef.current,
          pdfDocRef.current,
          {
            enableSpanning: true,
            enablePartial: false,
            extractBbox: true,
          }
        );

        setSearchState((prev) => ({
          ...prev,
          matches,
          currentMatchIndex: matches.length > 0 ? 0 : -1,
          isSearching: false,
          totalMatches: matches.length,
        }));

        // Show toast with results
        if (matches.length > 0) {
          addToast('success', `Found ${matches.length} match${matches.length > 1 ? 'es' : ''}`);
        } else {
          addToast('info', 'No matches found');
        }

        console.log('[PDFViewer] Search complete:', {
          query,
          matches: matches.length,
        });
      } catch (err) {
        console.error('[PDFViewer] Search error:', err);
        setSearchState((prev) => ({ ...prev, isSearching: false }));
        addToast('error', 'Search failed');
      }
    },
    [enableSearch, searchState.isSearchBarVisible, extractTextForSearch, addToast]
  );

  /**
   * Navigate to next search match
   */
  const handleNextMatch = useCallback(() => {
    if (searchState.totalMatches === 0) return;

    const newIndex = (searchState.currentMatchIndex + 1) % searchState.totalMatches;
    setSearchState((prev) => ({ ...prev, currentMatchIndex: newIndex }));

    const match = searchState.matches[newIndex];
    if (match) {
      // Scroll to the page containing this match
      const pageContainer = containerRef.current?.querySelector(
        `.pdf-page-container[data-page-number="${match.pageNumber}"]`
      ) as HTMLElement | null;

      if (pageContainer) {
        pageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchState]);

  /**
   * Navigate to previous search match
   */
  const handlePreviousMatch = useCallback(() => {
    if (searchState.totalMatches === 0) return;

    const newIndex =
      searchState.currentMatchIndex === 0
        ? searchState.totalMatches - 1
        : searchState.currentMatchIndex - 1;

    setSearchState((prev) => ({ ...prev, currentMatchIndex: newIndex }));

    const match = searchState.matches[newIndex];
    if (match) {
      // Scroll to the page containing this match
      const pageContainer = containerRef.current?.querySelector(
        `.pdf-page-container[data-page-number="${match.pageNumber}"]`
      ) as HTMLElement | null;

      if (pageContainer) {
        pageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchState]);

  /**
   * Close search bar
   */
  const handleCloseSearch = useCallback(() => {
    setSearchState({
      query: '',
      matches: [],
      currentMatchIndex: -1,
      isSearching: false,
      isSearchBarVisible: false,
      totalMatches: 0,
    });
  }, []);

  /**
   * Render highlights for a specific page
   * Uses CSS-based text layer highlighting (not canvas coordinate transforms)
   * This approach directly highlights text spans in the DOM for pixel-perfect alignment
   */
  const renderHighlightsForPage = useCallback(async (
    _page: PDFPageProxy,
    _viewport: any,
    pageNumber: number,
    highlightCanvas: HTMLCanvasElement
  ) => {
    // Clear the canvas (keep for search highlights but not extraction highlights)
    const ctx = highlightCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
    }

    // Filter highlights for this page using type-safe comparison
    const pageHighlights = highlights.filter((h) => {
      const highlightPage = Number(h.pageNumber);
      const targetPage = Number(pageNumber);
      return !isNaN(highlightPage) && !isNaN(targetPage) && highlightPage === targetPage;
    });

    console.log(`[PDFViewer] CSS highlight rendering for page ${pageNumber}:`, {
      totalHighlights: highlights.length,
      pageHighlights: pageHighlights.length,
      hasExtractionText: pageHighlights.filter(h => h.extractionText).length,
    });

    if (pageHighlights.length === 0) {
      // Clear any existing CSS highlights on this page
      clearHighlightsOnPage(pageNumber);
      return;
    }

    // Wait for text layer to be ready (PDF.js renders it asynchronously)
    const isReady = await waitForTextLayerReady(pageNumber, 15); // 750ms timeout
    if (!isReady) {
      console.warn(`[PDFViewer] Text layer not ready for page ${pageNumber}, skipping CSS highlights`);
      return;
    }

    // Clear existing CSS highlights before applying new ones
    clearHighlightsOnPage(pageNumber);

    // Apply CSS-based highlights using extraction text
    let successCount = 0;
    for (const highlight of pageHighlights) {
      // Use extractionText for CSS-based highlighting (text matching)
      if (highlight.extractionText) {
        const isSelected =
          highlight.fieldId === selectedFieldId &&
          (selectedExtractionIndex === null ||
           highlight.extractionIndex === selectedExtractionIndex);

        const highlightedElements = highlightTextInLayer(
          pageNumber,
          highlight.extractionText,
          isSelected,
          highlight.fieldId
        );

        if (highlightedElements.length > 0) {
          successCount++;
        }
      }
    }

    console.log(`[PDFViewer] Applied ${successCount}/${pageHighlights.length} CSS highlights on page ${pageNumber}`);
  }, [highlights, selectedFieldId, selectedExtractionIndex]);

  /**
   * Render search match highlights for a specific page
   */
  const renderSearchHighlightsForPage = useCallback(async (
    page: PDFPageProxy,
    viewport: any,
    pageNumber: number,
    highlightCanvas: HTMLCanvasElement
  ) => {
    if (!enableSearch || searchState.matches.length === 0) return;

    const ctx = highlightCanvas.getContext('2d');
    if (!ctx) return;

    // Filter search matches for this page
    const pageMatches = searchState.matches.filter((m) => m.pageNumber === pageNumber);

    if (pageMatches.length === 0) return;

    console.log(
      `[PDFViewer] Rendering ${pageMatches.length} search highlights on page ${pageNumber}`
    );

    // Render each search match
    for (let i = 0; i < pageMatches.length; i++) {
      const match = pageMatches[i];
      if (!match.bbox) continue;

      // Transform coordinates
      const coords = transformSearchMatchCoordinates(match.bbox, page, viewport);

      // Check if this is the current match
      const matchIndex = searchState.matches.indexOf(match);
      const isCurrent = matchIndex === searchState.currentMatchIndex;

      // Draw search highlight
      drawSearchHighlight(ctx, coords, isCurrent);
    }
  }, [enableSearch, searchState.matches, searchState.currentMatchIndex]);

  /**
   * Render a single PDF page
   */
  const renderPage = useCallback(async (pdf: PDFDocumentProxy, pageNumber: number) => {
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      // Create page container
      const pageContainer = document.createElement('div');
      pageContainer.className = 'pdf-page-container';
      pageContainer.style.position = 'relative';
      pageContainer.style.display = 'block';
      pageContainer.style.marginBottom = '20px';
      pageContainer.style.backgroundColor = '#ffffff';
      pageContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      pageContainer.style.overflow = 'visible';
      pageContainer.setAttribute('data-page-number', String(pageNumber));

      // Create canvas for PDF rendering
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get 2D context');
      }

      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.display = 'block';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';

      // Set explicit container dimensions
      pageContainer.style.width = `${viewport.width}px`;
      pageContainer.style.height = `${viewport.height}px`;

      // Add CSS variable for scale factor (needed for PDF.js)
      pageContainer.style.setProperty('--scale-factor', String(scale));

      // Check cache first for this page
      const cachedImageData = getCachedPage(_documentId, pageNumber, scale);

      if (cachedImageData) {
        // Cache hit - use cached image data (much faster!)
        context.putImageData(cachedImageData, 0, 0);

        // Force canvas to repaint by accessing a layout property
        void canvas.offsetHeight; // Trigger reflow

        // Ensure canvas is visible
        canvas.style.visibility = 'visible';
        canvas.style.opacity = '1';

        // Force browser to commit the paint using requestAnimationFrame
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            // Force another reflow to ensure visibility is applied
            void canvas.offsetHeight;
            resolve();
          });
        });

        console.log(`[PDFViewer] Page ${pageNumber} loaded from cache ⚡`);
      } else {
        // Cache miss - render page normally
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Cache the rendered page for future use
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        setCachedPage(_documentId, pageNumber, scale, imageData);

        // Ensure canvas is visible
        canvas.style.visibility = 'visible';
        canvas.style.opacity = '1';

        // Force browser to commit the paint using requestAnimationFrame
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            // Force another reflow to ensure visibility is applied
            void canvas.offsetHeight;
            resolve();
          });
        });

        console.log(`[PDFViewer] Page ${pageNumber} rendered and cached 💾`);
      }

      // Store page state
      pageStatesRef.current.set(pageNumber, {
        pageNumber,
        canvas,
        rendered: true,
      });

      // Create text layer for text selection
      const textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'textLayer';
      textLayerDiv.style.position = 'absolute';
      textLayerDiv.style.top = '0';
      textLayerDiv.style.left = '0';
      textLayerDiv.style.width = '100%';
      textLayerDiv.style.height = '100%';
      textLayerDiv.style.overflow = 'visible';
      textLayerDiv.style.zIndex = '5'; // Above canvas, below highlights
      textLayerDiv.setAttribute('data-page-number', String(pageNumber));

      // Render text layer for selection
      try {
        const textContent = await page.getTextContent();
        // FIX #1: Await text layer rendering to ensure spans are created before continuing
        await pdfjsLib.renderTextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport: viewport,
          textDivs: [],
        }).promise;
        console.log(`[PDFViewer] Text layer rendered for page ${pageNumber}`);
      } catch (textErr) {
        console.warn(`[PDFViewer] Failed to render text layer for page ${pageNumber}:`, textErr);
      }

      // Create highlight overlay canvas (will be used in Phase 2.4)
      const highlightCanvas = document.createElement('canvas');
      highlightCanvas.className = 'highlight-canvas';  // FIX: Match CSS class name
      highlightCanvas.width = viewport.width;
      highlightCanvas.height = viewport.height;
      highlightCanvas.style.position = 'absolute';
      highlightCanvas.style.top = '0';
      highlightCanvas.style.left = '0';
      highlightCanvas.style.display = 'block';        // Ensure proper rendering
      highlightCanvas.style.width = `${viewport.width}px`;   // FIX - Use exact pixels like vanilla (not %)
      highlightCanvas.style.height = `${viewport.height}px`; // FIX - Use exact pixels like vanilla (not auto)
      highlightCanvas.style.zIndex = '10';            // Layer above PDF canvas and text layer
      highlightCanvas.style.pointerEvents = 'none';
      highlightCanvas.setAttribute('data-page-number', String(pageNumber));

      // Add layers to container (order matters: canvas, text, highlights)
      pageContainer.appendChild(canvas);
      pageContainer.appendChild(textLayerDiv);
      pageContainer.appendChild(highlightCanvas);

      // Safety check: Remove any existing page container with this page number (should not happen, but prevents duplicates)
      if (containerRef.current) {
        const existingContainer = containerRef.current.querySelector(
          `.pdf-page-container[data-page-number="${pageNumber}"]`
        );
        if (existingContainer) {
          console.warn(`[PDFViewer] Removing duplicate container for page ${pageNumber}`);
          existingContainer.remove();
        }

        // Add to DOM
        containerRef.current.appendChild(pageContainer);
      }

      console.log(`[PDFViewer] Page ${pageNumber} rendered:`, {
        width: viewport.width,
        height: viewport.height,
        scale,
      });

      // Render extraction highlights for this page
      await renderHighlightsForPage(page, viewport, pageNumber, highlightCanvas);

      // Render search highlights for this page (if search is active)
      await renderSearchHighlightsForPage(page, viewport, pageNumber, highlightCanvas);

      // Cleanup page resources to prevent memory leaks
      page.cleanup();
    } catch (err: any) {
      // Ignore RenderingCancelledException - it's expected when pages are re-rendered or canceled
      if (err.name !== 'RenderingCancelledException') {
        console.error(`[PDFViewer] Error rendering page ${pageNumber}:`, err);
      }
    }
  }, [scale, _documentId, getCachedPage, setCachedPage, renderHighlightsForPage, renderSearchHighlightsForPage]);

  /**
   * Render all PDF pages in continuous scroll mode
   * @param pdf - The PDF document to render
   * @param priorityPage - Optional page number to render first (for immediate navigation)
   */
  const renderAllPages = useCallback(async (pdf: PDFDocumentProxy, priorityPage?: number) => {
    if (!containerRef.current) return;

    // Abort any previous render operation to prevent duplicates
    if (renderAbortControllerRef.current) {
      console.log('[PDFViewer] Aborting previous render operation');
      renderAbortControllerRef.current.abort();
    }

    // Create new abort controller for this render
    const abortController = new AbortController();
    renderAbortControllerRef.current = abortController;

    if (priorityPage) {
      console.log(`[PDFViewer] 🎯 Rendering with priority page ${priorityPage}...`);
    } else {
      console.log('[PDFViewer] Rendering all pages...');
    }

    // Clear existing content
    containerRef.current.innerHTML = '';
    pageStatesRef.current.clear();

    // If priorityPage is specified, render it first
    if (priorityPage && priorityPage >= 1 && priorityPage <= pdf.numPages) {
      console.log(`[PDFViewer] 🚀 Priority rendering page ${priorityPage} first...`);
      await renderPage(pdf, priorityPage);
      console.log(`[PDFViewer] ✅ Priority page ${priorityPage} rendered`);
    }

    // Render each page sequentially
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      // Skip priority page if already rendered
      if (priorityPage && pageNum === priorityPage) {
        continue;
      }

      // Check if aborted
      if (abortController.signal.aborted) {
        console.log('[PDFViewer] Render aborted at page', pageNum);
        return;
      }

      await renderPage(pdf, pageNum);
    }

    // Force browser to complete paint cycle
    await new Promise(resolve => requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    }));

    // Clear abort controller if this render completed successfully
    if (renderAbortControllerRef.current === abortController) {
      renderAbortControllerRef.current = null;
    }

    console.log('[PDFViewer] All pages rendered successfully');
  }, [renderPage]);

  /**
   * Zoom in
   */
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  /**
   * Zoom out
   */
  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  /**
   * Handle page jump from input
   */
  const handlePageJump = useCallback((pageNum: number) => {
    if (pageNum < 1 || pageNum > numPages) {
      addToast('error', `Please enter a page number between 1 and ${numPages}`);
      return;
    }

    console.log(`[PDFViewer] Jumping to page ${pageNum}`);

    // Find and scroll to the page
    if (!containerRef.current) return;

    const pageContainer = containerRef.current.querySelector(
      `.pdf-page-container[data-page-number="${pageNum}"]`
    ) as HTMLElement | null;

    if (pageContainer) {
      // Set scrolling flag to prevent render interference
      isScrollingRef.current = true;

      // FIX: Use instant direct jump instead of smooth scroll
      // Smooth scrolling was unreliable and didn't always reach the correct page
      pageContainer.scrollIntoView({
        behavior: 'instant', // Changed from 'smooth' to 'instant' for reliable page jumps
        block: 'center',
      });

      // Clear scrolling flag immediately since instant scroll completes synchronously
      // Small timeout to ensure DOM updates complete
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 50);

      addToast('success', `Navigated to page ${pageNum}`);
    } else {
      addToast('error', `Page ${pageNum} not found`);
    }

    // Clear input after successful navigation
    setPageInputValue('');
  }, [numPages, addToast]);

  /**
   * Handle page input keypress (Enter key)
   */
  const handlePageInputKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(pageInputValue, 10);
      if (!isNaN(pageNum)) {
        handlePageJump(pageNum);
      }
    }
  }, [pageInputValue, handlePageJump]);

  /**
   * Handle page input blur (focus loss)
   */
  const handlePageInputBlur = useCallback(() => {
    if (pageInputValue.trim()) {
      const pageNum = parseInt(pageInputValue, 10);
      if (!isNaN(pageNum)) {
        handlePageJump(pageNum);
      } else {
        setPageInputValue(''); // Clear invalid input
      }
    }
  }, [pageInputValue, handlePageJump]);

  /**
   * Re-render all pages when:
   * - PDF finishes loading (isLoading changes to false)
   * - Scale changes (zoom in/out)
   * - numPages is set (initial load)
   *
   * FIX: Use render lock to prevent unnecessary re-renders on manual scroll
   */
  useEffect(() => {
    // Skip if still loading, no pages, or currently scrolling
    if (!pdfDocRef.current || isLoading || numPages === 0 || isScrollingRef.current) {
      console.log('[PDFViewer] Skipping render - loading, no pages, or scrolling in progress');
      return;
    }

    // FIX: Only render when scale changes or initial load
    // This prevents re-renders triggered by manual scroll state changes
    if (hasRenderedRef.current && previousScaleRef.current === scale) {
      console.log('[PDFViewer] Skipping render - already rendered at this scale:', scale);
      return;
    }

    console.log('[PDFViewer] Triggering render - scale:', scale, 'numPages:', numPages);
    hasRenderedRef.current = true;
    previousScaleRef.current = scale;
    renderAllPages(pdfDocRef.current);
  }, [scale, isLoading, numPages, renderAllPages]);

  /**
   * Load PDF on mount and when pdfUrl changes
   * Note: We only reload when pdfUrl or _documentId changes, NOT when callbacks change
   */
  useEffect(() => {
    isMountedRef.current = true;
    loadPDF();

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy();
        pdfDocRef.current = null;
      }
      // Clean up blob URL to prevent memory leaks
      if (pdfBlobUrlRef.current) {
        URL.revokeObjectURL(pdfBlobUrlRef.current);
        pdfBlobUrlRef.current = null;
      }
      // Clear cache for this document to free memory
      clearDocument(_documentId);
    };
  }, [pdfUrl, _documentId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Track current page on scroll
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const containerMidpoint = containerTop + containerHeight / 2;

      // DIAGNOSTIC: Log scroll position changes during active navigation
      if (scrollToPage !== null) {
        console.log('[PDFViewer] 🔄 Scroll position changed during navigation:', {
          scrollToPage,
          containerTop,
          containerMidpoint,
          isScrolling: isScrollingRef.current,
        });
      }

      // Find which page is at the midpoint of the viewport
      const pageContainers = container.querySelectorAll('.pdf-page-container');
      pageContainers.forEach((pageEl) => {
        const pageTop = (pageEl as HTMLElement).offsetTop;
        const pageHeight = (pageEl as HTMLElement).offsetHeight;
        const pageBottom = pageTop + pageHeight;

        if (containerMidpoint >= pageTop && containerMidpoint <= pageBottom) {
          const pageNum = parseInt(
            (pageEl as HTMLElement).getAttribute('data-page-number') || '1',
            10
          );
          setCurrentPage(pageNum);
        }
      });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call to detect current page on load
    return () => container.removeEventListener('scroll', handleScroll);
  }, [numPages, isLoading]);

  /**
   * Re-render highlights when highlights or selectedFieldId changes
   * OPTIMIZED: Only re-renders pages that have highlights (not all pages)
   * DEBOUNCED: Prevents rapid re-renders and RenderingCancelledException
   */
  useEffect(() => {
    // RACE CONDITION FIX: Don't check isLoading - PDF is definitely loaded when highlights change
    if (!pdfDocRef.current) {
      console.log('[DIAGNOSTIC] Skipping highlight re-render - PDF not loaded');
      return;
    }

    // FIX: REMOVED isScrollingRef check - it was causing highlights to NOT render
    // The previous check was preventing highlight rendering because:
    // 1. User clicks extraction → scrollToPage set → isScrollingRef = true
    // 2. Highlights computed → this effect runs → exits early because isScrollingRef = true
    // 3. 300ms later isScrollingRef = false, but effect already ran and exited
    // The 50ms debounce below is sufficient to prevent rapid re-renders
    console.log('[DIAGNOSTIC] Highlight re-render proceeding (scrolling check removed)');

    const pdf = pdfDocRef.current;
    const abortController = new AbortController();

    // Calculate affected pages: current highlight pages + previous highlight pages
    const currentPages = new Set<number>();
    highlights.forEach(h => currentPages.add(h.pageNumber));

    const affectedPages = new Set<number>([
      ...currentPages,
      ...previousHighlightPagesRef.current
    ]);

    console.log('[DIAGNOSTIC] Highlight re-render effect triggered:', {
      highlightsCount: highlights.length,
      currentPages: Array.from(currentPages),
      previousPages: Array.from(previousHighlightPagesRef.current),
      affectedPages: Array.from(affectedPages),
      pdfLoaded: !!pdf,
      pdfNumPages: pdf?.numPages,
    });

    // If no affected pages, nothing to do
    if (affectedPages.size === 0) {
      console.log('[DIAGNOSTIC] No affected pages - skipping re-render');
      previousHighlightPagesRef.current = currentPages;
      return;
    }

    console.log(`[PDFViewer] Re-rendering highlights on ${affectedPages.size} affected pages (out of ${pdf.numPages} total)`);

    // DEBOUNCE: Wait 50ms before rendering to batch rapid state changes
    const timeoutId = setTimeout(async () => {
      for (const pageNum of affectedPages) {
        // Check if operation was aborted
        if (abortController.signal.aborted) {
          console.log('[PDFViewer] Extraction highlight rendering aborted');
          return;
        }

        // Check if PDF is still valid before attempting to use it
        if (!isPDFValid(pdf)) {
          console.warn('[PDFViewer] PDF destroyed during extraction highlight rendering, stopping');
          return;
        }

        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });

          // Find the highlight canvas for this page
          // FIX: Use correct class name 'highlight-canvas' (not 'pdf-highlight-layer')
          const highlightCanvas = containerRef.current?.querySelector(
            `.highlight-canvas[data-page-number="${pageNum}"]`
          ) as HTMLCanvasElement | null;

          if (highlightCanvas) {
            // FIX #4: renderHighlightsForPage now handles both canvas AND word-level highlighting
            // No need for duplicate word-level highlighting code here
            await renderHighlightsForPage(page, viewport, pageNum, highlightCanvas);
          } else {
            console.warn(`[PDFViewer] Highlight canvas not found for page ${pageNum}`);
          }

          // Cleanup page to prevent memory leaks
          page.cleanup();
        } catch (err: any) {
          // Ignore RenderingCancelledException - it's expected when rapidly switching
          if (err.name !== 'RenderingCancelledException' && !abortController.signal.aborted) {
            console.error(`Error re-rendering highlights for page ${pageNum}:`, err);
          }
        }
      }

      // Store current pages for next render
      previousHighlightPagesRef.current = currentPages;
      console.log('[DIAGNOSTIC] Highlight re-render complete, updated previousPages to:', Array.from(currentPages));
    }, 150); // 150ms debounce (increased from 50ms to ensure page is rendered)

    // Cleanup: abort ongoing operations and clear timeout
    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [highlights, selectedFieldId, selectedExtractionIndex, scale, isPDFValid, renderHighlightsForPage]); // FIX: Added renderHighlightsForPage to prevent stale closure

  /**
   * Re-render search highlights when search state changes
   */
  useEffect(() => {
    if (!pdfDocRef.current || isLoading || !enableSearch) return;

    const pdf = pdfDocRef.current;
    const abortController = new AbortController();

    const reRenderSearchHighlights = async () => {
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        // Check if operation was aborted
        if (abortController.signal.aborted) {
          console.log('[PDFViewer] Search highlight rendering aborted');
          return;
        }

        // Check if PDF is still valid before attempting to use it
        if (!isPDFValid(pdf)) {
          console.warn('[PDFViewer] PDF destroyed during search highlight rendering, stopping');
          return;
        }

        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });

          // Find the highlight canvas for this page
          // FIX: Use correct class name 'highlight-canvas' (not 'pdf-highlight-layer')
          const highlightCanvas = containerRef.current?.querySelector(
            `.highlight-canvas[data-page-number="${pageNum}"]`
          ) as HTMLCanvasElement | null;

          if (highlightCanvas) {
            // Re-render both extraction and search highlights
            await renderHighlightsForPage(page, viewport, pageNum, highlightCanvas);
            await renderSearchHighlightsForPage(page, viewport, pageNum, highlightCanvas);
          } else {
            console.warn(`[PDFViewer] Search highlight canvas not found for page ${pageNum}`);
          }
        } catch (err) {
          // Only log error if not aborted
          if (!abortController.signal.aborted) {
            console.error(`Error re-rendering search highlights for page ${pageNum}:`, err);
          }
        }
      }
    };

    reRenderSearchHighlights();

    // Cleanup: abort ongoing operations
    return () => {
      abortController.abort();
    };
  }, [searchState.matches, searchState.currentMatchIndex, scale, enableSearch, isLoading, isPDFValid]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Keyboard shortcut for search (Ctrl+F / Cmd+F)
   */
  useEffect(() => {
    if (!enableSearch) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchState((prev) => ({
          ...prev,
          isSearchBarVisible: true,
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableSearch]);

  /**
   * Priority page rendering effect - Ensures target page exists before scrolling
   * Triggered when scrollToPage is set but the target page doesn't exist in DOM yet
   */
  useEffect(() => {
    // Skip if no scroll target or still loading
    if (scrollToPage === null || !containerRef.current || isLoading || !pdfDocRef.current) {
      return;
    }

    // Check if target page already exists
    const pageContainer = containerRef.current.querySelector(
      `.pdf-page-container[data-page-number="${scrollToPage}"]`
    ) as HTMLElement | null;

    if (!pageContainer) {
      console.log(`[PDFViewer] 🎯 Target page ${scrollToPage} not in DOM - triggering priority render`);
      // Page doesn't exist - trigger priority rendering
      renderAllPages(pdfDocRef.current, scrollToPage);
    }
  }, [scrollToPage, isLoading, renderAllPages]);

  /**
   * Scroll to specific page when scrollToPage changes
   * Now with improved retry logic and longer timeout
   */
  useEffect(() => {
    console.log('[PDFViewer] 📜 Scroll effect triggered:', {
      scrollToPage,
      hasContainer: !!containerRef.current,
      isLoading,
      timestamp: new Date().toISOString(),
    });

    // Don't scroll if page is still loading or no scroll target
    if (scrollToPage === null || !containerRef.current || isLoading) {
      console.log('[PDFViewer] ⏭️ Scroll skipped:', {
        reason: scrollToPage === null ? 'scrollToPage is null' :
                !containerRef.current ? 'container missing' :
                'still loading',
        scrollToPage,
        hasContainer: !!containerRef.current,
        isLoading,
      });
      return;
    }

    const pageContainer = containerRef.current.querySelector(
      `.pdf-page-container[data-page-number="${scrollToPage}"]`
    ) as HTMLElement | null;

    console.log('[PDFViewer] 🔍 Page container lookup:', {
      pageNumber: scrollToPage,
      found: !!pageContainer,
      totalContainers: containerRef.current.querySelectorAll('.pdf-page-container').length,
      selector: `.pdf-page-container[data-page-number="${scrollToPage}"]`,
    });

    if (pageContainer) {
      console.log(`[PDFViewer] ✅ Page ${scrollToPage} found - jumping directly...`);

      // Set scrolling flag to prevent render interference
      isScrollingRef.current = true;

      // FIX: Use instant direct jump instead of smooth scroll for reliable page navigation
      // Smooth scrolling was unreliable and didn't always reach the correct page
      pageContainer.scrollIntoView({
        behavior: 'instant', // Changed from 'smooth' to 'instant' for reliable page jumps
        block: 'center',  // Center page in viewport for better visibility
      });

      // Instant scroll completes synchronously, so we can call callback immediately
      // Extended timeout to prevent race condition with render effect
      // Must remain true longer than scrollToPage reset delay (150ms) to prevent scroll-back
      setTimeout(async () => {
        console.log(`[PDFViewer] ✅ Jump to page ${scrollToPage} completed successfully`);
        isScrollingRef.current = false; // Clear scrolling flag

        // FORCE re-render highlights immediately after scroll completes
        if (highlights.length > 0 && pdfDocRef.current) {
          const highlightCanvas = containerRef.current?.querySelector(
            `.highlight-canvas[data-page-number="${scrollToPage}"]`
          ) as HTMLCanvasElement | null;

          if (highlightCanvas) {
            try {
              const page = await pdfDocRef.current.getPage(scrollToPage);
              const viewport = page.getViewport({ scale });
              console.log('[PDFViewer] FORCING highlight render after scroll to page', scrollToPage);
              await renderHighlightsForPage(page, viewport, scrollToPage, highlightCanvas);
              page.cleanup();
            } catch (err) {
              console.error('[PDFViewer] Error forcing highlight render:', err);
            }
          } else {
            console.warn('[PDFViewer] Highlight canvas not found for forced render on page', scrollToPage);
          }
        }

        if (onScrollComplete) {
          console.log('[PDFViewer] ✅ Calling onScrollComplete callback');
          onScrollComplete();
        }
      }, 300);
    } else {
      console.warn(`[PDFViewer] ⚠️ Page ${scrollToPage} not found in DOM - will retry with multiple attempts`);

      // IMPROVED: Multiple retry attempts with exponential backoff
      // Priority rendering should have already started, so we give it more time
      let retryCount = 0;
      const maxRetries = 5;
      const retryIntervals = [200, 400, 600, 800, 1000]; // Exponential backoff

      const attemptScroll = () => {
        const retryContainer = containerRef.current?.querySelector(
          `.pdf-page-container[data-page-number="${scrollToPage}"]`
        ) as HTMLElement | null;

        if (retryContainer) {
          console.log(`[PDFViewer] ✅ Retry ${retryCount + 1} successful - scrolling to page ${scrollToPage}`);
          isScrollingRef.current = true;

          retryContainer.scrollIntoView({
            behavior: 'instant',
            block: 'center',
          });

          setTimeout(() => {
            console.log(`[PDFViewer] ✅ Retry jump to page ${scrollToPage} completed`);
            isScrollingRef.current = false;
            if (onScrollComplete) {
              onScrollComplete();
            }
          }, 300);
        } else {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`[PDFViewer] ⏳ Retry ${retryCount} failed - attempting retry ${retryCount + 1} in ${retryIntervals[retryCount]}ms`);
            setTimeout(attemptScroll, retryIntervals[retryCount]);
          } else {
            console.error(`[PDFViewer] ❌ Page ${scrollToPage} still not found after ${maxRetries} retries`);
            // Page still not found after all retries, give up and reset
            if (onScrollComplete) {
              onScrollComplete();
            }
          }
        }
      };

      // Start first retry
      setTimeout(attemptScroll, retryIntervals[0]);
    }
  }, [scrollToPage, isLoading, onScrollComplete]);

  /**
   * Trigger pulse animation when scrollToPage changes
   * Draws attention to the newly highlighted extraction
   */
  useEffect(() => {
    if (scrollToPage && selectedFieldId) {
      // Clear any existing pulse animation
      if (pulseTimerRef.current) {
        clearInterval(pulseTimerRef.current);
      }

      // Animate pulse for 2 seconds using a sine wave
      const startTime = Date.now();
      const duration = 2000; // 2 seconds

      pulseTimerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          // Animation complete
          setPulseIntensity(0);
          if (pulseTimerRef.current) {
            clearInterval(pulseTimerRef.current);
            pulseTimerRef.current = null;
          }
        } else {
          // Sine wave pulse: 0 → 1 → 0 (two complete cycles)
          const intensity = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
          setPulseIntensity(intensity);
        }
      }, 16); // ~60 FPS
    }

    // Cleanup on unmount
    return () => {
      if (pulseTimerRef.current) {
        clearInterval(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  }, [scrollToPage, selectedFieldId, selectedExtractionIndex]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-red-600 mb-2">Failed to Load PDF</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* PDF Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Page</span>
          <input
            type="number"
            min="1"
            max={numPages}
            value={pageInputValue}
            onChange={(e) => setPageInputValue(e.target.value)}
            onKeyPress={handlePageInputKeyPress}
            onBlur={handlePageInputBlur}
            onFocus={(e) => e.target.select()}
            placeholder={String(currentPage)}
            className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            title="Enter page number and press Enter"
          />
          <span className="text-sm text-gray-600">of {numPages}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="h-4 w-4" />
          </Button>

          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {enableSearch && searchState.isSearchBarVisible && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <SearchBar
            onSearch={handleSearch}
            onNext={handleNextMatch}
            onPrevious={handlePreviousMatch}
            onClose={handleCloseSearch}
            currentMatchIndex={searchState.currentMatchIndex}
            totalMatches={searchState.totalMatches}
            isSearching={searchState.isSearching}
            initialQuery={searchState.query}
            isVisible={searchState.isSearchBarVisible}
          />
        </div>
      )}

      {/* PDF Container - Continuous Scroll */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      />
    </div>
  );
};
