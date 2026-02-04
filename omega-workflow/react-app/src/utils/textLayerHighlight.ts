/**
 * Text Layer Highlighting Utilities
 * Provides word-for-word precise highlighting using PDF.js text layer
 *
 * Enhanced with progressive token-based matching for long/complex text
 */

/**
 * Normalize text for matching (remove extra whitespace, normalize line breaks)
 */
function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')  // Collapse multiple spaces
    .replace(/\n/g, ' ')   // Replace newlines with spaces
    .trim()
    .toLowerCase();
}

/**
 * Wait for PDF.js to finish rendering text layer spans
 *
 * CRITICAL FIX: PDF.js renderTextLayer() is async but not awaited in renderPage()
 * This causes word-level highlighting to run before spans are created
 *
 * @param pageNumber - PDF page number
 * @param maxAttempts - Maximum polling attempts (default 10 = 500ms)
 * @returns Promise<boolean> - true if text layer is ready, false if timeout
 */
export async function waitForTextLayerReady(
  pageNumber: number,
  maxAttempts: number = 10
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const textLayer = document.querySelector(
      `.textLayer[data-page-number="${pageNumber}"]`
    ) as HTMLElement;

    if (textLayer && textLayer.children.length > 0) {
      console.log(`[TextHighlight] ✅ Text layer ready on page ${pageNumber} after ${i * 50}ms (${textLayer.children.length} spans)`);
      return true;
    }

    // Wait 50ms before next attempt
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.warn(`[TextHighlight] ⚠️ Text layer not ready on page ${pageNumber} after ${maxAttempts * 50}ms timeout`);
  return false;
}

/**
 * Apply highlight styling to an element
 */
function applyHighlightToElement(element: HTMLElement, isSelected: boolean, fieldId?: string): void {
  element.style.backgroundColor = isSelected
    ? 'rgba(33, 150, 243, 0.3)'
    : 'rgba(255, 235, 59, 0.3)';
  element.style.borderRadius = '2px';
  element.style.transition = 'background-color 0.2s ease';

  if (isSelected) {
    element.style.outline = '2px solid rgba(33, 150, 243, 0.5)';
    element.style.outlineOffset = '1px';
  }

  element.setAttribute('data-highlighted', 'true');
  element.setAttribute('data-highlight-type', isSelected ? 'selected' : 'normal');

  if (fieldId) {
    element.setAttribute('data-field-id', fieldId);
  }
}

/**
 * Tokenize text into words for progressive matching
 */
function tokenizeText(text: string): string[] {
  // Split on whitespace, filter empty tokens
  // CRITICAL: Normalize to lowercase to match normalized element text
  return text
    .trim()
    .toLowerCase()  // BUG FIX #1: Add normalization
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Find matching spans using progressive token-based matching
 * This is more resilient to whitespace/normalization differences than exact matching
 */
function findMatchingSpansProgressive(
  elements: HTMLElement[],
  tokens: string[],
  fullSearchText: string
): HTMLElement[] {
  const matchedSpans: HTMLElement[] = [];

  if (tokens.length === 0 || elements.length === 0) {
    return matchedSpans;
  }

  // Build normalized text for each element
  const elementTexts = elements.map(el => normalizeText(el.textContent || ''));

  // Multi-token start search: Try first 3 tokens instead of just the first one
  // This is more robust when the first word of extraction doesn't match exactly
  let startIdx = -1;
  let startTokenOffset = 0;
  const maxStartTokens = Math.min(3, tokens.length);

  for (let tokenOffset = 0; tokenOffset < maxStartTokens; tokenOffset++) {
    for (let i = 0; i < elementTexts.length; i++) {
      if (elementTexts[i].includes(tokens[tokenOffset])) {
        startIdx = i;
        startTokenOffset = tokenOffset;
        break;
      }
    }
    if (startIdx !== -1) break;
  }

  if (startIdx === -1) {
    console.warn(`[TextHighlight] First ${maxStartTokens} tokens not found in ${elements.length} elements:`, tokens.slice(0, maxStartTokens));
    return matchedSpans;
  }

  // Adjust tokens array to start from the matched token
  const adjustedTokens = tokens.slice(startTokenOffset);

  console.log(`[TextHighlight] Progressive match starting at element ${startIdx} (token offset: ${startTokenOffset}), searching for ${adjustedTokens.length} tokens`);

  // Progressive matching: collect spans that contain tokens in order
  let currentIdx = startIdx;
  let tokenIdx = 0;
  let accumulatedText = '';

  // Limit search range to prevent highlighting entire document
  // BUG FIX #2: Increased from 3 to 10 to handle PDFs with many small spans
  const maxSearchRange = Math.min(elements.length, startIdx + adjustedTokens.length * 10);

  while (tokenIdx < adjustedTokens.length && currentIdx < maxSearchRange) {
    const elementText = elementTexts[currentIdx];
    const token = adjustedTokens[tokenIdx];

    // Check if this element contains the current token
    if (elementText.includes(token)) {
      matchedSpans.push(elements[currentIdx]);
      accumulatedText += ' ' + elementText;
      tokenIdx++;
    } else if (matchedSpans.length > 0) {
      // We've started matching but this element doesn't have the token
      // Include it anyway if it's short (likely whitespace/punctuation)
      if (elementText.length <= 3) {
        matchedSpans.push(elements[currentIdx]);
        accumulatedText += ' ' + elementText;
      }
    }

    currentIdx++;

    // Safety check: If we've collected enough text to cover the search text, stop
    if (accumulatedText.length >= fullSearchText.length * 1.5) {
      break;
    }
  }

  // Verify we matched a reasonable portion of tokens
  // BUG FIX #3: Lowered from 50% to 30%, then to 20% for better matching
  // This allows partial matches for very long text instead of all-or-nothing
  const minPercentage = adjustedTokens.length * 0.2;
  const minAbsolute = 50;
  const threshold = Math.min(minPercentage, minAbsolute);

  if (tokenIdx < threshold) {
    console.warn(`[TextHighlight] Only matched ${tokenIdx}/${adjustedTokens.length} tokens (threshold: ${threshold.toFixed(0)}), insufficient match`);
    return [];
  }

  // Limit matched spans to reasonable number (prevent highlighting too much)
  const maxSpans = Math.min(matchedSpans.length, adjustedTokens.length * 2);
  const finalSpans = matchedSpans.slice(0, maxSpans);

  console.log(`[TextHighlight] Progressive match found ${finalSpans.length} spans (matched ${tokenIdx}/${adjustedTokens.length} tokens, original tokens: ${tokens.length})`);

  return finalSpans;
}

/**
 * Fallback: Try matching partial text (first/last N characters)
 * Useful when long extraction text has formatting differences in the middle
 */
function findMatchingSpansPartial(
  elements: HTMLElement[],
  fullSearchText: string,
  charLimit: number = 100
): HTMLElement[] {
  const matchedSpans: HTMLElement[] = [];

  if (fullSearchText.length < charLimit * 2) {
    // Text is short enough, partial matching won't help
    return matchedSpans;
  }

  // Build element texts
  const elementTexts = elements.map(el => normalizeText(el.textContent || ''));

  // Try matching first N characters
  const firstChunk = normalizeText(fullSearchText.slice(0, charLimit));
  const firstTokens = tokenizeText(firstChunk);

  if (firstTokens.length > 3) {
    // Find first few tokens
    let startIdx = -1;
    for (let i = 0; i < elementTexts.length; i++) {
      if (elementTexts[i].includes(firstTokens[0])) {
        startIdx = i;
        break;
      }
    }

    if (startIdx !== -1) {
      // Collect spans that match first chunk tokens
      let currentIdx = startIdx;
      let tokenIdx = 0;
      const maxRange = Math.min(elements.length, startIdx + firstTokens.length * 5);

      while (tokenIdx < firstTokens.length && currentIdx < maxRange) {
        const elementText = elementTexts[currentIdx];
        const token = firstTokens[tokenIdx];

        if (elementText.includes(token)) {
          matchedSpans.push(elements[currentIdx]);
          tokenIdx++;
        } else if (matchedSpans.length > 0 && elementText.length <= 3) {
          matchedSpans.push(elements[currentIdx]);
        }
        currentIdx++;
      }

      // Need at least 50% of tokens to match
      if (tokenIdx >= firstTokens.length * 0.5) {
        console.log(`[TextHighlight] ✅ Partial match (first ${charLimit} chars) found ${matchedSpans.length} spans`);
        return matchedSpans;
      }
    }
  }

  // Try matching last N characters if first chunk failed
  const lastChunk = normalizeText(fullSearchText.slice(-charLimit));
  const lastTokens = tokenizeText(lastChunk);

  if (lastTokens.length > 3) {
    matchedSpans.length = 0; // Clear previous attempts

    let startIdx = -1;
    for (let i = 0; i < elementTexts.length; i++) {
      if (elementTexts[i].includes(lastTokens[0])) {
        startIdx = i;
        break;
      }
    }

    if (startIdx !== -1) {
      let currentIdx = startIdx;
      let tokenIdx = 0;
      const maxRange = Math.min(elements.length, startIdx + lastTokens.length * 5);

      while (tokenIdx < lastTokens.length && currentIdx < maxRange) {
        const elementText = elementTexts[currentIdx];
        const token = lastTokens[tokenIdx];

        if (elementText.includes(token)) {
          matchedSpans.push(elements[currentIdx]);
          tokenIdx++;
        } else if (matchedSpans.length > 0 && elementText.length <= 3) {
          matchedSpans.push(elements[currentIdx]);
        }
        currentIdx++;
      }

      if (tokenIdx >= lastTokens.length * 0.5) {
        console.log(`[TextHighlight] ✅ Partial match (last ${charLimit} chars) found ${matchedSpans.length} spans`);
        return matchedSpans;
      }
    }
  }

  console.log(`[TextHighlight] ℹ️ Partial matching also failed for text of length ${fullSearchText.length}`);
  return [];
}

/**
 * Find and highlight extracted text in the PDF text layer
 *
 * Uses three-tier strategy:
 * 1. Try exact substring match (fast, works for short text)
 * 2. Fall back to progressive token matching (robust, works for long/complex text)
 * 3. Fall back to partial text matching (highlights first/last portion for very long text)
 *
 * Improvements for better matching:
 * - Multi-token start search: Tries first 3 tokens instead of just first one
 * - Lower threshold: Accepts 20% token match (down from 30%)
 * - Partial text fallback: Matches first/last 100 chars when full text fails
 *
 * @param pageNumber - PDF page number
 * @param extractedText - Text extracted by Zuva
 * @param isSelected - Whether this extraction is currently selected
 * @param fieldId - Optional field ID for tracking/click handling
 * @returns Array of highlighted elements (for cleanup)
 */
export function highlightTextInLayer(
  pageNumber: number,
  extractedText: string,
  isSelected: boolean = false,
  fieldId?: string
): HTMLElement[] {
  const highlightedElements: HTMLElement[] = [];

  // Find the text layer for this page
  const textLayer = document.querySelector(
    `.textLayer[data-page-number="${pageNumber}"]`
  ) as HTMLElement;

  if (!textLayer) {
    console.warn(`[TextHighlight] Text layer not found for page ${pageNumber}`);
    return highlightedElements;
  }

  // Normalize the extracted text for matching
  const searchText = normalizeText(extractedText);

  if (!searchText) {
    console.warn(`[TextHighlight] Empty search text after normalization`);
    return highlightedElements;
  }

  // Get all text elements from the text layer
  const textElements = Array.from(textLayer.children) as HTMLElement[];

  if (textElements.length === 0) {
    console.warn(`[TextHighlight] No text elements found in text layer for page ${pageNumber}`);
    return highlightedElements;
  }

  console.log(`[TextHighlight] Searching for text on page ${pageNumber}:`, {
    textLength: searchText.length,
    textPreview: searchText.substring(0, 100) + (searchText.length > 100 ? '...' : ''),
    elementCount: textElements.length,
  });

  // STRATEGY 1: Try exact substring match (works for short text)
  // Build full page text with element mapping
  let fullText = '';
  const elementMap: Array<{ start: number; end: number; element: HTMLElement }> = [];

  textElements.forEach((element) => {
    const text = element.textContent || '';
    const normalizedText = text.replace(/\s+/g, ' ');
    const startPos = fullText.length;
    fullText += normalizedText;
    const endPos = fullText.length;

    elementMap.push({
      start: startPos,
      end: endPos,
      element,
    });

    // Add space between elements (word boundaries)
    fullText += ' ';
  });

  // Normalize the full text
  const normalizedFullText = normalizeText(fullText);

  // Try to find exact match
  const matchIndex = normalizedFullText.indexOf(searchText);

  if (matchIndex !== -1) {
    // ✅ EXACT MATCH FOUND - Use precise position-based highlighting
    const matchStart = matchIndex;
    const matchEnd = matchIndex + searchText.length;

    console.log(`[TextHighlight] ✅ Exact match found on page ${pageNumber}:`, {
      strategy: 'indexOf',
      matchStart,
      matchEnd,
      textPreview: searchText.substring(0, 50),
    });

    // Highlight all elements that overlap with the match
    elementMap.forEach(({ start, end, element }) => {
      if (end > matchStart && start < matchEnd) {
        applyHighlightToElement(element, isSelected, fieldId);
        highlightedElements.push(element);
      }
    });
  } else {
    // ❌ EXACT MATCH FAILED - Use progressive token matching (for long/complex text)
    console.log(`[TextHighlight] ℹ️ Exact match failed, trying progressive token matching...`);

    // Tokenize search text into words
    const tokens = tokenizeText(searchText);

    if (tokens.length === 0) {
      console.warn(`[TextHighlight] No tokens to search for`);
      return highlightedElements;
    }

    console.log(`[TextHighlight] Tokenized into ${tokens.length} tokens:`, tokens.slice(0, 10));

    // Find matching spans using progressive matching
    const matchedSpans = findMatchingSpansProgressive(textElements, tokens, searchText);

    if (matchedSpans.length > 0) {
      console.log(`[TextHighlight] ✅ Progressive match found on page ${pageNumber}:`, {
        strategy: 'progressive-token',
        spanCount: matchedSpans.length,
        tokensMatched: tokens.length,
      });

      matchedSpans.forEach(element => {
        applyHighlightToElement(element, isSelected, fieldId);
        highlightedElements.push(element);
      });
    } else {
      // ❌ PROGRESSIVE MATCH FAILED - Try partial text fallback (for very long text)
      console.log(`[TextHighlight] ℹ️ Progressive match failed, trying partial text fallback...`);

      const partialSpans = findMatchingSpansPartial(textElements, searchText);

      if (partialSpans.length > 0) {
        console.log(`[TextHighlight] ✅ Partial match found on page ${pageNumber}:`, {
          strategy: 'partial-text',
          spanCount: partialSpans.length,
        });

        partialSpans.forEach(element => {
          applyHighlightToElement(element, isSelected, fieldId);
          highlightedElements.push(element);
        });
      } else {
        console.warn(`[TextHighlight] ❌ No match found on page ${pageNumber}:`, {
          searchTextPreview: searchText.substring(0, 100),
          searchTextLength: searchText.length,
          pageTextPreview: normalizedFullText.substring(0, 200),
          pageTextLength: normalizedFullText.length,
          tokensSearched: tokens.length,
          elementsSearched: textElements.length,
        });
      }
    }
  }

  console.log(`[TextHighlight] Highlighted ${highlightedElements.length} elements on page ${pageNumber}`);

  return highlightedElements;
}

/**
 * Clear all highlights from a specific page
 */
export function clearHighlightsOnPage(pageNumber: number): void {
  const textLayer = document.querySelector(
    `.textLayer[data-page-number="${pageNumber}"]`
  ) as HTMLElement;

  if (!textLayer) {
    return;
  }

  // Find all highlighted elements
  const highlightedElements = textLayer.querySelectorAll('[data-highlighted="true"]');

  highlightedElements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    htmlElement.style.backgroundColor = '';
    htmlElement.style.outline = '';
    htmlElement.style.outlineOffset = '';
    htmlElement.removeAttribute('data-highlighted');
    htmlElement.removeAttribute('data-highlight-type');
  });

  console.log(`[TextHighlight] Cleared ${highlightedElements.length} highlights on page ${pageNumber}`);
}

/**
 * Clear all highlights from all pages
 */
export function clearAllHighlights(): void {
  const allHighlighted = document.querySelectorAll('[data-highlighted="true"]');

  allHighlighted.forEach((element) => {
    const htmlElement = element as HTMLElement;
    htmlElement.style.backgroundColor = '';
    htmlElement.style.outline = '';
    htmlElement.style.outlineOffset = '';
    htmlElement.removeAttribute('data-highlighted');
    htmlElement.removeAttribute('data-highlight-type');
  });

  console.log(`[TextHighlight] Cleared ${allHighlighted.length} highlights from all pages`);
}

/**
 * Highlight multiple extractions on a page
 */
export function highlightMultipleTexts(
  pageNumber: number,
  extractions: Array<{ text: string; isSelected: boolean }>
): void {
  // Clear existing highlights on this page first
  clearHighlightsOnPage(pageNumber);

  // Highlight each extraction
  extractions.forEach(({ text, isSelected }) => {
    highlightTextInLayer(pageNumber, text, isSelected);
  });
}
