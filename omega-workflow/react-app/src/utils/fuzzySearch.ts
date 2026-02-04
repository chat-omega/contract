/**
 * Fuzzy Search Utility
 * Provides lightweight fuzzy matching functionality without external dependencies
 */

/**
 * Calculate fuzzy match score between text and query
 * Higher score = better match
 *
 * @param text - Text to search in
 * @param query - Search query
 * @returns Score (0-100), 0 means no match
 */
export function fuzzyMatch(text: string, query: string): number {
  if (!text || !query) return 0;

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match - highest score
  if (textLower === queryLower) return 100;

  // Starts with query - high score
  if (textLower.startsWith(queryLower)) return 90;

  // Contains query - medium score
  if (textLower.includes(queryLower)) return 70;

  // Character-by-character fuzzy match
  let score = 0;
  let queryIndex = 0;
  let consecutiveMatches = 0;

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 10;
      queryIndex++;
      consecutiveMatches++;

      // Bonus for consecutive matches
      if (consecutiveMatches > 1) {
        score += 5;
      }
    } else {
      consecutiveMatches = 0;
    }
  }

  // Return score only if all query characters were found
  return queryIndex === queryLower.length ? score : 0;
}

/**
 * Search array of items using fuzzy matching
 * Returns items sorted by relevance score
 *
 * @param items - Array of strings to search
 * @param query - Search query
 * @param minScore - Minimum score threshold (default: 1)
 * @returns Filtered and sorted array of items
 */
export function fuzzySearch(
  items: string[],
  query: string,
  minScore: number = 1
): string[] {
  // If no query, return all items
  if (!query || !query.trim()) {
    return items;
  }

  // Calculate score for each item
  const scoredItems = items
    .map((item) => ({
      item,
      score: fuzzyMatch(item, query),
    }))
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => {
      // Sort by score (descending)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // If scores equal, sort alphabetically
      return a.item.localeCompare(b.item);
    });

  return scoredItems.map(({ item }) => item);
}

/**
 * Highlight matching characters in text
 * Returns array of text segments with match indicators
 *
 * @param text - Text to highlight
 * @param query - Search query
 * @returns Array of {text: string, match: boolean} segments
 */
export function highlightMatches(
  text: string,
  query: string
): Array<{ text: string; match: boolean }> {
  if (!query || !query.trim()) {
    return [{ text, match: false }];
  }

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const segments: Array<{ text: string; match: boolean }> = [];

  let queryIndex = 0;
  let currentSegment = '';
  let isMatching = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isMatch = queryIndex < queryLower.length &&
                    textLower[i] === queryLower[queryIndex];

    if (isMatch) {
      // Start new matching segment
      if (!isMatching && currentSegment) {
        segments.push({ text: currentSegment, match: false });
        currentSegment = '';
      }
      currentSegment += char;
      isMatching = true;
      queryIndex++;
    } else {
      // Start new non-matching segment
      if (isMatching && currentSegment) {
        segments.push({ text: currentSegment, match: true });
        currentSegment = '';
      }
      currentSegment += char;
      isMatching = false;
    }
  }

  // Add final segment
  if (currentSegment) {
    segments.push({ text: currentSegment, match: isMatching });
  }

  return segments;
}
