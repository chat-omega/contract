/**
 * PDF Page Cache Store
 * Provides memory-based caching for rendered PDF pages to improve performance
 */

import { create } from 'zustand';

interface CachedPage {
  documentId: string;
  pageNumber: number;
  imageData: ImageData;
  timestamp: number;
  scale: number;
  sizeBytes: number;
}

interface PDFCacheState {
  cache: Map<string, CachedPage>;
  maxSizeBytes: number;
  currentSizeBytes: number;
  hitCount: number;
  missCount: number;

  // Actions
  getCachedPage: (documentId: string, pageNumber: number, scale: number) => ImageData | null;
  setCachedPage: (documentId: string, pageNumber: number, scale: number, imageData: ImageData) => void;
  clearDocument: (documentId: string) => void;
  clearAll: () => void;
  getStats: () => {
    cacheSize: number;
    maxSize: number;
    pageCount: number;
    hitRate: number;
  };
}

// DISABLED: Aggressive caching was causing constant re-renders as user scrolls
// Cache was too small (50MB) for large PDFs, causing eviction/re-render cycles
// PDF.js has its own internal caching that works better
// FIX: Setting MAX_CACHE_SIZE_MB to 0 caused IMMEDIATE eviction (worse than 50MB!)
// Must disable cache logic entirely using CACHE_ENABLED flag
const CACHE_ENABLED = false; // Master switch to disable caching entirely
const MAX_CACHE_SIZE_MB = 0; // Not used when CACHE_ENABLED = false
const MAX_CACHE_SIZE_BYTES = MAX_CACHE_SIZE_MB * 1024 * 1024;

const getCacheKey = (documentId: string, pageNumber: number, scale: number): string => {
  return `${documentId}-${pageNumber}-${scale.toFixed(2)}`;
};

const calculateImageDataSize = (imageData: ImageData): number => {
  // ImageData size = width * height * 4 bytes per pixel (RGBA)
  return imageData.width * imageData.height * 4;
};

export const usePDFCacheStore = create<PDFCacheState>((set, get) => ({
  cache: new Map(),
  maxSizeBytes: MAX_CACHE_SIZE_BYTES,
  currentSizeBytes: 0,
  hitCount: 0,
  missCount: 0,

  getCachedPage: (documentId: string, pageNumber: number, scale: number) => {
    // Skip cache entirely when disabled
    if (!CACHE_ENABLED) {
      return null;
    }

    const key = getCacheKey(documentId, pageNumber, scale);
    const cachedPage = get().cache.get(key);

    if (cachedPage) {
      set({ hitCount: get().hitCount + 1 });
      console.log(`[PDFCache] HIT - Page ${pageNumber} (scale: ${scale.toFixed(2)})`);
      return cachedPage.imageData;
    }

    set({ missCount: get().missCount + 1 });
    console.log(`[PDFCache] MISS - Page ${pageNumber} (scale: ${scale.toFixed(2)})`);
    return null;
  },

  setCachedPage: (documentId: string, pageNumber: number, scale: number, imageData: ImageData) => {
    // Skip cache entirely when disabled - don't cache anything
    if (!CACHE_ENABLED) {
      return;
    }

    const key = getCacheKey(documentId, pageNumber, scale);
    const sizeBytes = calculateImageDataSize(imageData);

    // Create cache entry
    const cachedPage: CachedPage = {
      documentId,
      pageNumber,
      imageData,
      timestamp: Date.now(),
      scale,
      sizeBytes,
    };

    const state = get();
    const newCache = new Map(state.cache);

    // Check if adding this page would exceed max size
    let newSize = state.currentSizeBytes + sizeBytes;

    // If page already exists in cache, subtract its old size
    const existingPage = newCache.get(key);
    if (existingPage) {
      newSize -= existingPage.sizeBytes;
    }

    // Evict oldest pages if needed (LRU)
    while (newSize > state.maxSizeBytes && newCache.size > 0) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      // Find oldest page
      newCache.forEach((page, pageKey) => {
        if (page.timestamp < oldestTime) {
          oldestTime = page.timestamp;
          oldestKey = pageKey;
        }
      });

      if (oldestKey) {
        const evictedPage = newCache.get(oldestKey);
        if (evictedPage) {
          newSize -= evictedPage.sizeBytes;
          newCache.delete(oldestKey);
          console.log(`[PDFCache] EVICTED - Page ${evictedPage.pageNumber} from doc ${evictedPage.documentId}`);
        }
      } else {
        break;
      }
    }

    // Add new page to cache
    newCache.set(key, cachedPage);
    console.log(
      `[PDFCache] CACHED - Page ${pageNumber} (scale: ${scale.toFixed(2)}) - ${(sizeBytes / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `[PDFCache] Size: ${(newSize / 1024 / 1024).toFixed(2)}MB / ${(state.maxSizeBytes / 1024 / 1024).toFixed(2)}MB`
    );

    set({
      cache: newCache,
      currentSizeBytes: newSize,
    });
  },

  clearDocument: (documentId: string) => {
    const state = get();
    const newCache = new Map(state.cache);
    let freedBytes = 0;
    let clearedCount = 0;

    // Remove all pages for this document
    newCache.forEach((page, key) => {
      if (page.documentId === documentId) {
        freedBytes += page.sizeBytes;
        newCache.delete(key);
        clearedCount++;
      }
    });

    if (clearedCount > 0) {
      console.log(`[PDFCache] CLEARED - ${clearedCount} pages from doc ${documentId} - Freed ${(freedBytes / 1024 / 1024).toFixed(2)}MB`);
      set({
        cache: newCache,
        currentSizeBytes: state.currentSizeBytes - freedBytes,
      });
    }
  },

  clearAll: () => {
    console.log('[PDFCache] CLEARED ALL CACHE');
    set({
      cache: new Map(),
      currentSizeBytes: 0,
      hitCount: 0,
      missCount: 0,
    });
  },

  getStats: () => {
    const state = get();
    const totalRequests = state.hitCount + state.missCount;
    const hitRate = totalRequests > 0 ? (state.hitCount / totalRequests) * 100 : 0;

    return {
      cacheSize: state.currentSizeBytes,
      maxSize: state.maxSizeBytes,
      pageCount: state.cache.size,
      hitRate,
    };
  },
}));
