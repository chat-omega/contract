/**
 * PDF Text Search Utility
 * Implements progressive normalization search algorithm for PDF documents
 */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import type {
  PDFTextContent,
  PDFTextItem,
  SearchMatch,
  SearchOptions,
  NormalizationLevel,
  BBox,
  SearchMetrics,
} from '@/types/search';
import { NormalizationLevel as NormLevelConst } from '@/types/search';

/**
 * Text normalization functions
 * Each level applies progressively more aggressive normalization
 */
export const normalizers = {
  /**
   * Level 1: Exact match - no modifications
   */
  exact: (text: string): string => text,

  /**
   * Level 2: Case-insensitive match
   */
  caseInsensitive: (text: string): string => text.toLowerCase(),

  /**
   * Level 3: Whitespace normalization
   * Collapses multiple spaces, trims, but preserves punctuation
   */
  whitespace: (text: string): string =>
    text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim(),

  /**
   * Level 4: Punctuation removal
   * Removes all punctuation, keeps only alphanumeric and spaces
   */
  punctuation: (text: string): string =>
    text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim(),

  /**
   * Level 5: Aggressive normalization for spanning matches
   * Removes all non-alphanumeric characters
   */
  aggressive: (text: string): string =>
    text
      .toLowerCase()
      .replace(/[^\w]/g, ''),
};

/**
 * Calculate match score based on normalization level
 * Lower levels (more exact) get higher scores
 */
function calculateMatchScore(
  level: NormalizationLevel,
  queryLength: number,
  matchLength: number
): number {
  const levelScores: Record<NormalizationLevel, number> = {
    [NormLevelConst.EXACT]: 100,
    [NormLevelConst.CASE_INSENSITIVE]: 90,
    [NormLevelConst.WHITESPACE]: 80,
    [NormLevelConst.PUNCTUATION]: 70,
    [NormLevelConst.SPANNING]: 60,
    [NormLevelConst.PARTIAL]: 50,
  };

  let baseScore = levelScores[level];

  // Penalize if match is significantly longer than query (over-matching)
  if (matchLength > queryLength * 1.5) {
    baseScore *= 0.8;
  }

  return Math.round(baseScore);
}

/**
 * Extract bounding box from PDF text item
 * Returns bbox in standard format: [left, bottom, right, top]
 */
function extractBBoxFromTextItem(item: PDFTextItem): BBox | undefined {
  if (!item.transform || item.transform.length < 6) {
    return undefined;
  }

  const [scaleX, , , scaleY, translateX, translateY] = item.transform;
  const width = item.width;
  const height = item.height;

  const left = translateX;
  const bottom = translateY;
  const right = translateX + width * Math.abs(scaleX);
  const top = translateY + height * Math.abs(scaleY);

  return [left, bottom, right, top];
}

/**
 * Check if text matches query at a specific normalization level
 */
function matchAtLevel(
  text: string,
  query: string,
  level: NormalizationLevel
): boolean {
  let normalizedText: string;
  let normalizedQuery: string;

  switch (level) {
    case NormLevelConst.EXACT:
      return text.includes(query);

    case NormLevelConst.CASE_INSENSITIVE:
      normalizedText = normalizers.caseInsensitive(text);
      normalizedQuery = normalizers.caseInsensitive(query);
      return normalizedText.includes(normalizedQuery);

    case NormLevelConst.WHITESPACE:
      normalizedText = normalizers.whitespace(text);
      normalizedQuery = normalizers.whitespace(query);
      return normalizedText.includes(normalizedQuery);

    case NormLevelConst.PUNCTUATION:
      normalizedText = normalizers.punctuation(text);
      normalizedQuery = normalizers.punctuation(query);
      return normalizedText.includes(normalizedQuery);

    case NormLevelConst.SPANNING:
    case NormLevelConst.PARTIAL:
      normalizedText = normalizers.aggressive(text);
      normalizedQuery = normalizers.aggressive(query);
      return normalizedText.includes(normalizedQuery);

    default:
      return false;
  }
}

/**
 * Search within a single text item
 */
function searchTextItem(
  item: PDFTextItem,
  query: string,
  pageNumber: number,
  itemIndex: number,
  options: Required<SearchOptions>
): SearchMatch | null {
  // Try each normalization level from most strict to most lenient
  const levels: NormalizationLevel[] = [
    NormLevelConst.EXACT,
    NormLevelConst.CASE_INSENSITIVE,
    NormLevelConst.WHITESPACE,
    NormLevelConst.PUNCTUATION,
  ];

  // Filter levels based on maxNormalizationLevel
  const maxLevelIndex = levels.indexOf(options.maxNormalizationLevel);
  const levelsToTry = maxLevelIndex >= 0 ? levels.slice(0, maxLevelIndex + 1) : levels;

  for (const level of levelsToTry) {
    if (matchAtLevel(item.str, query, level)) {
      const score = calculateMatchScore(level, query.length, item.str.length);

      if (score < options.minScore) {
        continue;
      }

      const match: SearchMatch = {
        pageNumber,
        textItemIndex: itemIndex,
        textItem: item,
        matchedText: item.str,
        normalizationLevel: level,
        score,
        originalQuery: query,
        normalizedQuery: normalizers.aggressive(query),
      };

      if (options.extractBbox) {
        match.bbox = extractBBoxFromTextItem(item);
      }

      return match;
    }
  }

  return null;
}

/**
 * Search for spanning matches across multiple text items
 * This handles cases where text is split across multiple items
 */
function searchSpanningMatches(
  items: PDFTextItem[],
  query: string,
  pageNumber: number,
  options: Required<SearchOptions>
): SearchMatch[] {
  const matches: SearchMatch[] = [];
  const normalizedQuery = normalizers.aggressive(query);
  const maxSpan = 10; // Maximum number of items to combine

  for (let startIdx = 0; startIdx < items.length; startIdx++) {
    let combinedText = '';
    const spanningItems: PDFTextItem[] = [];

    // Try combining up to maxSpan consecutive items
    for (let endIdx = startIdx; endIdx < Math.min(startIdx + maxSpan, items.length); endIdx++) {
      combinedText += items[endIdx].str;
      spanningItems.push(items[endIdx]);

      const normalizedCombined = normalizers.aggressive(combinedText);

      if (normalizedCombined.includes(normalizedQuery)) {
        const score = calculateMatchScore(
          NormLevelConst.SPANNING,
          query.length,
          combinedText.length
        );

        if (score >= options.minScore) {
          const match: SearchMatch = {
            pageNumber,
            textItemIndex: startIdx,
            textItem: items[startIdx],
            matchedText: combinedText,
            normalizationLevel: NormLevelConst.SPANNING,
            score,
            spanningItems: [...spanningItems],
            spanningStartIndex: startIdx,
            spanningEndIndex: endIdx,
            originalQuery: query,
            normalizedQuery,
          };

          // For spanning matches, create a combined bounding box
          if (options.extractBbox && spanningItems.length > 0) {
            const bboxes = spanningItems
              .map(extractBBoxFromTextItem)
              .filter((bbox): bbox is BBox => bbox !== undefined);

            if (bboxes.length > 0) {
              const left = Math.min(...bboxes.map((b) => b[0]));
              const bottom = Math.min(...bboxes.map((b) => b[1]));
              const right = Math.max(...bboxes.map((b) => b[2]));
              const top = Math.max(...bboxes.map((b) => b[3]));
              match.bbox = [left, bottom, right, top];
            }
          }

          matches.push(match);
        }

        // Found a match starting at this position, move to next start position
        break;
      }
    }
  }

  return matches;
}

/**
 * Search for partial matches
 * Finds matches where query is a substring of any word
 */
function searchPartialMatches(
  items: PDFTextItem[],
  query: string,
  pageNumber: number,
  options: Required<SearchOptions>
): SearchMatch[] {
  const matches: SearchMatch[] = [];
  const normalizedQuery = normalizers.aggressive(query);

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const normalizedText = normalizers.aggressive(item.str);

    // Check if query is a substring
    if (normalizedText.includes(normalizedQuery) && normalizedText !== normalizedQuery) {
      const score = calculateMatchScore(NormLevelConst.PARTIAL, query.length, item.str.length);

      if (score >= options.minScore) {
        const match: SearchMatch = {
          pageNumber,
          textItemIndex: idx,
          textItem: item,
          matchedText: item.str,
          normalizationLevel: NormLevelConst.PARTIAL,
          score,
          originalQuery: query,
          normalizedQuery,
        };

        if (options.extractBbox) {
          match.bbox = extractBBoxFromTextItem(item);
        }

        matches.push(match);
      }
    }
  }

  return matches;
}

/**
 * Search within a single page's text content
 */
async function searchPage(
  pageNumber: number,
  textContent: PDFTextContent,
  query: string,
  options: Required<SearchOptions>
): Promise<SearchMatch[]> {
  const matches: SearchMatch[] = [];
  const items = textContent.items as PDFTextItem[];

  // Skip empty query
  if (!query || query.trim().length === 0) {
    return matches;
  }

  // Level 1-4: Search individual text items
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const match = searchTextItem(item, query, pageNumber, i, options);

    if (match) {
      matches.push(match);
    }
  }

  // Level 5: Spanning matches (if enabled and not already found enough matches)
  if (
    options.enableSpanning &&
    (options.maxNormalizationLevel === NormLevelConst.SPANNING ||
      options.maxNormalizationLevel === NormLevelConst.PARTIAL)
  ) {
    const spanningMatches = searchSpanningMatches(items, query, pageNumber, options);
    matches.push(...spanningMatches);
  }

  // Level 6: Partial matches (if enabled)
  if (options.enablePartial && options.maxNormalizationLevel === NormLevelConst.PARTIAL) {
    const partialMatches = searchPartialMatches(items, query, pageNumber, options);
    matches.push(...partialMatches);
  }

  // Remove duplicate matches (same position, different levels)
  const uniqueMatches = deduplicateMatches(matches);

  return uniqueMatches.slice(0, options.maxMatches);
}

/**
 * Remove duplicate matches, keeping the highest-scoring one
 */
function deduplicateMatches(matches: SearchMatch[]): SearchMatch[] {
  const seen = new Map<string, SearchMatch>();

  for (const match of matches) {
    const key = `${match.pageNumber}-${match.textItemIndex}`;
    const existing = seen.get(key);

    if (!existing || match.score > existing.score) {
      seen.set(key, match);
    }
  }

  return Array.from(seen.values()).sort((a, b) => {
    // Sort by page number first, then by text item index
    if (a.pageNumber !== b.pageNumber) {
      return a.pageNumber - b.pageNumber;
    }
    return a.textItemIndex - b.textItemIndex;
  });
}

/**
 * Extract text content from a single page
 */
export async function extractPageTextContent(page: PDFPageProxy): Promise<PDFTextContent> {
  const textContent = await page.getTextContent();

  // Filter out TextMarkedContent items, only keep TextItem with required properties
  const filteredItems = textContent.items.filter(
    (item: any) => item.str !== undefined && item.transform !== undefined
  ) as PDFTextItem[];

  return {
    items: filteredItems,
    styles: textContent.styles,
  };
}

/**
 * Extract text content from all pages of a PDF
 * Returns a map of page number to text content
 */
export async function extractAllTextContent(
  pdf: PDFDocumentProxy
): Promise<Map<number, PDFTextContent>> {
  const textContentMap = new Map<number, PDFTextContent>();
  const numPages = pdf.numPages;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await extractPageTextContent(page);
    textContentMap.set(pageNum, textContent);
  }

  return textContentMap;
}

/**
 * Main search function - searches across all pages
 *
 * @param query - The search query string
 * @param textContentMap - Map of page numbers to text content (pre-extracted)
 * @param pdf - The PDF document proxy
 * @param options - Search options
 * @returns Array of search matches sorted by page and position
 */
export async function searchPDF(
  query: string,
  textContentMap: Map<number, PDFTextContent>,
  pdf: PDFDocumentProxy,
  options: SearchOptions = {}
): Promise<SearchMatch[]> {
  const startTime = performance.now();

  // Fill in default options
  const fullOptions: Required<SearchOptions> = {
    caseSensitive: options.caseSensitive ?? false,
    wholeWord: options.wholeWord ?? false,
    enableSpanning: options.enableSpanning ?? true,
    enablePartial: options.enablePartial ?? false,
    maxNormalizationLevel: options.maxNormalizationLevel ?? NormLevelConst.SPANNING,
    minScore: options.minScore ?? 50,
    maxMatches: options.maxMatches ?? 1000,
    extractBbox: options.extractBbox ?? true,
    pageRange: options.pageRange ?? { start: 1, end: pdf.numPages },
  };

  const allMatches: SearchMatch[] = [];

  // Determine which pages to search
  const startPage = Math.max(1, fullOptions.pageRange.start);
  const endPage = Math.min(pdf.numPages, fullOptions.pageRange.end);

  // Search each page
  for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
    const textContent = textContentMap.get(pageNum);

    if (!textContent) {
      // If text content not pre-extracted, extract it now
      const page = await pdf.getPage(pageNum);
      const newTextContent = await extractPageTextContent(page);
      textContentMap.set(pageNum, newTextContent);

      const pageMatches = await searchPage(pageNum, newTextContent, query, fullOptions);
      allMatches.push(...pageMatches);
    } else {
      const pageMatches = await searchPage(pageNum, textContent, query, fullOptions);
      allMatches.push(...pageMatches);
    }

    // Stop if we've reached max matches
    if (allMatches.length >= fullOptions.maxMatches) {
      break;
    }
  }

  const endTime = performance.now();
  const searchDuration = endTime - startTime;

  // Log performance metrics in development
  if (import.meta.env.DEV) {
    console.log('🔍 PDF Search Results:', {
      query,
      matches: allMatches.length,
      duration: `${searchDuration.toFixed(2)}ms`,
      pagesSearched: endPage - startPage + 1,
    });
  }

  return allMatches.slice(0, fullOptions.maxMatches);
}

/**
 * Calculate search performance metrics
 */
export function calculateSearchMetrics(
  matches: SearchMatch[],
  searchDurationMs: number,
  pagesSearched: number,
  textItemsSearched: number
): SearchMetrics {
  const matchesByLevel: Record<NormalizationLevel, number> = {
    [NormLevelConst.EXACT]: 0,
    [NormLevelConst.CASE_INSENSITIVE]: 0,
    [NormLevelConst.WHITESPACE]: 0,
    [NormLevelConst.PUNCTUATION]: 0,
    [NormLevelConst.SPANNING]: 0,
    [NormLevelConst.PARTIAL]: 0,
  };

  let totalScore = 0;

  for (const match of matches) {
    matchesByLevel[match.normalizationLevel]++;
    totalScore += match.score;
  }

  return {
    textExtractionTimeMs: 0, // To be filled by caller
    searchTimeMs: searchDurationMs,
    pagesSearched,
    textItemsSearched,
    matchesFound: matches.length,
    matchesByLevel,
    averageScore: matches.length > 0 ? totalScore / matches.length : 0,
  };
}

/**
 * Clear search highlights and reset search state
 * This is a utility function for components to use
 */
export function clearSearch(): void {
  if (import.meta.env.DEV) {
    console.log('🧹 Search cleared');
  }
}
