/**
 * PDF.js Type Definitions
 * Extended types for PDF rendering and highlighting
 */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

export type { PDFDocumentProxy, PDFPageProxy };

/**
 * PDF Page Viewport
 */
export interface PDFViewport {
  width: number;
  height: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  transform: number[];
  viewBox: number[];
}

/**
 * Bounding box coordinates from extraction API
 * Format: [left, bottom, right, top]
 * PDF coordinate system: bottom-left origin, Y increases upward
 */
export type BBox = [number, number, number, number];

/**
 * Transformed highlight coordinates for canvas rendering
 * Screen coordinate system: top-left origin, Y increases downward
 */
export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  fieldId?: string;
  bbox: BBox; // Original bbox for reference
  extractionIndex?: number; // Index of extraction within field (for precise identification)
  extractionText?: string; // ADDED: Text content for word-level highlighting
}

/**
 * PDF page rendering state
 */
export interface PDFPageState {
  pageNumber: number;
  pageProxy: PDFPageProxy | null;
  viewport: PDFViewport | null;
  canvas: HTMLCanvasElement | null;
  rendered: boolean;
  loading: boolean;
}

/**
 * PDF document metadata
 */
export interface PDFMetadata {
  numPages: number;
  fingerprint: string;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
}

/**
 * Coordinate transformation result
 */
export interface TransformedCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * PDF rendering options
 */
export interface PDFRenderOptions {
  scale?: number;
  rotation?: number;
  canvasContext?: CanvasRenderingContext2D;
  viewport?: PDFViewport;
}

/**
 * Search match result
 */
export interface SearchMatch {
  pageNumber: number;
  matchIndex: number;
  text: string;
  bbox?: BBox;
}

/**
 * PDF viewer configuration
 */
export interface PDFViewerConfig {
  defaultScale: number;
  minScale: number;
  maxScale: number;
  scrollMode: 'vertical' | 'horizontal' | 'wrapped';
  spreadMode: 'none' | 'odd' | 'even';
  enableTextLayer: boolean;
  enableAnnotations: boolean;
}
