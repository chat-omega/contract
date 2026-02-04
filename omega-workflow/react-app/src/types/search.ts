/**
 * PDF Search Type Definitions
 * Type definitions for PDF text search functionality with progressive normalization
 */

import type { BBox } from './pdf';

// Re-export BBox for convenience
export type { BBox };

/**
 * PDF.js text item structure
 * Represents a single text item extracted from a PDF page
 */
export interface PDFTextItem {
  /** The text string */
  str: string;
  /** Transformation matrix [scaleX, skewY, skewX, scaleY, translateX, translateY] */
  transform: number[];
  /** Width of the text item */
  width: number;
  /** Height of the text item */
  height: number;
  /** Whether the text item has an end-of-line marker */
  hasEOL: boolean;
  /** Font name (optional) */
  fontName?: string;
  /** Direction (optional, e.g., 'ltr', 'rtl') */
  dir?: string;
}

/**
 * PDF.js text content structure
 * Contains all text items and styles for a PDF page
 */
export interface PDFTextContent {
  /** Array of text items on the page */
  items: PDFTextItem[];
  /** Style information for text items */
  styles: Record<string, any>;
}

/**
 * Normalization levels for progressive search
 * Each level becomes progressively more lenient in matching
 */
export type NormalizationLevel =
  | 'exact'
  | 'case-insensitive'
  | 'whitespace'
  | 'punctuation'
  | 'spanning'
  | 'partial';

export const NormalizationLevel = {
  EXACT: 'exact' as const,
  CASE_INSENSITIVE: 'case-insensitive' as const,
  WHITESPACE: 'whitespace' as const,
  PUNCTUATION: 'punctuation' as const,
  SPANNING: 'spanning' as const,
  PARTIAL: 'partial' as const,
};

/**
 * Search match result
 * Represents a single match found in the PDF
 */
export interface SearchMatch {
  /** Page number where match was found (1-indexed) */
  pageNumber: number;
  /** Index of the text item within the page's text content */
  textItemIndex: number;
  /** The text item containing the match */
  textItem: PDFTextItem;
  /** The actual matched text (may be normalized) */
  matchedText: string;
  /** Which normalization level found this match */
  normalizationLevel: NormalizationLevel;
  /** Match quality score (0-100, higher is better) */
  score: number;
  /** Bounding box coordinates (if available) */
  bbox?: BBox;
  /** For spanning matches: array of text items that were combined */
  spanningItems?: PDFTextItem[];
  /** For spanning matches: starting text item index */
  spanningStartIndex?: number;
  /** For spanning matches: ending text item index */
  spanningEndIndex?: number;
  /** Original query that produced this match */
  originalQuery?: string;
  /** Normalized query text */
  normalizedQuery?: string;
}

/**
 * Search state for the PDF viewer
 * Manages current search session
 */
export interface SearchState {
  /** Current search query */
  query: string;
  /** All matches found in the PDF */
  matches: SearchMatch[];
  /** Index of currently selected match (0-indexed, -1 if none) */
  currentMatchIndex: number;
  /** Whether a search is in progress */
  isSearching: boolean;
  /** Whether the search bar is visible */
  isSearchBarVisible: boolean;
  /** Error message if search failed */
  errorMessage?: string;
  /** Total number of matches */
  totalMatches: number;
  /** Last search timestamp */
  lastSearchTime?: number;
  /** Search duration in milliseconds */
  searchDurationMs?: number;
}

/**
 * Search options for configuring search behavior
 */
export interface SearchOptions {
  /** Case-sensitive search (default: false) */
  caseSensitive?: boolean;
  /** Whole word matching only (default: false) */
  wholeWord?: boolean;
  /** Enable spanning matches across text items (default: true) */
  enableSpanning?: boolean;
  /** Enable partial matches (default: false) */
  enablePartial?: boolean;
  /** Maximum normalization level to use (default: SPANNING) */
  maxNormalizationLevel?: NormalizationLevel;
  /** Minimum match score to include (0-100, default: 50) */
  minScore?: number;
  /** Maximum number of matches to return (default: 1000) */
  maxMatches?: number;
  /** Whether to extract bounding boxes for matches (default: true) */
  extractBbox?: boolean;
  /** Search in specific page range (default: all pages) */
  pageRange?: {
    start: number;
    end: number;
  };
}

/**
 * Search highlight style configuration
 */
export interface SearchHighlightStyle {
  /** Background color for non-current matches */
  normalColor: string;
  /** Background color for current match */
  currentColor: string;
  /** Opacity for normal matches (0-1) */
  normalOpacity: number;
  /** Opacity for current match (0-1) */
  currentOpacity: number;
  /** Border width in pixels */
  borderWidth: number;
  /** Border color for normal matches */
  normalBorderColor: string;
  /** Border color for current match */
  currentBorderColor: string;
  /** Whether to animate current match (pulse effect) */
  animateCurrent: boolean;
}

/**
 * Default search highlight styles
 * Orange for normal search matches, blue for current match
 */
export const DEFAULT_SEARCH_HIGHLIGHT_STYLE: SearchHighlightStyle = {
  normalColor: '#ff9800', // Orange
  currentColor: '#2196f3', // Blue
  normalOpacity: 0.3,
  currentOpacity: 0.5,
  borderWidth: 2,
  normalBorderColor: '#f57c00', // Darker orange
  currentBorderColor: '#1976d2', // Darker blue
  animateCurrent: true,
};

/**
 * Search performance metrics
 * For monitoring and optimizing search performance
 */
export interface SearchMetrics {
  /** Total time to extract text from all pages (ms) */
  textExtractionTimeMs: number;
  /** Total time to perform search (ms) */
  searchTimeMs: number;
  /** Number of pages searched */
  pagesSearched: number;
  /** Number of text items searched */
  textItemsSearched: number;
  /** Number of matches found */
  matchesFound: number;
  /** Number of matches per normalization level */
  matchesByLevel: Record<NormalizationLevel, number>;
  /** Average match score */
  averageScore: number;
}

/**
 * Search event types for analytics/debugging
 */
export type SearchEventType =
  | 'search_started'
  | 'search_completed'
  | 'search_failed'
  | 'search_cleared'
  | 'match_navigated'
  | 'text_extracted';

export const SearchEventType = {
  SEARCH_STARTED: 'search_started' as const,
  SEARCH_COMPLETED: 'search_completed' as const,
  SEARCH_FAILED: 'search_failed' as const,
  SEARCH_CLEARED: 'search_cleared' as const,
  MATCH_NAVIGATED: 'match_navigated' as const,
  TEXT_EXTRACTED: 'text_extracted' as const,
};

/**
 * Search event for logging/analytics
 */
export interface SearchEvent {
  type: SearchEventType;
  timestamp: number;
  query?: string;
  matchCount?: number;
  currentMatchIndex?: number;
  durationMs?: number;
  errorMessage?: string;
  metrics?: SearchMetrics;
}
