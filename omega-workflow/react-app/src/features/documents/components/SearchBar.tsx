/**
 * SearchBar Component
 * PDF search interface with keyboard shortcuts and navigation
 */

import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Input } from '@components/ui';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  /** Callback when user performs a search */
  onSearch: (query: string) => void;
  /** Callback to navigate to next match */
  onNext: () => void;
  /** Callback to navigate to previous match */
  onPrevious: () => void;
  /** Callback to close search bar */
  onClose: () => void;
  /** Current match index (0-based, -1 if no matches) */
  currentMatchIndex: number;
  /** Total number of matches found */
  totalMatches: number;
  /** Whether a search is currently in progress */
  isSearching: boolean;
  /** Initial search query (optional) */
  initialQuery?: string;
  /** Whether the search bar is visible */
  isVisible?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onNext,
  onPrevious,
  onClose,
  currentMatchIndex,
  totalMatches,
  isSearching,
  initialQuery = '',
  isVisible = true,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Auto-focus input when search bar becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isVisible]);

  // Debounced search (wait 300ms after user stops typing)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(query);
      }, 300);
    } else {
      // Clear search if query is empty
      onSearch('');
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, onSearch]);

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        if (e.shiftKey) {
          // Shift+Enter: Previous match
          e.preventDefault();
          onPrevious();
        } else {
          // Enter: Next match
          e.preventDefault();
          onNext();
        }
        break;

      case 'Escape':
        // Escape: Close search
        e.preventDefault();
        onClose();
        break;

      default:
        break;
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  if (!isVisible) {
    return null;
  }

  // Format match counter
  const matchCounter =
    totalMatches > 0 ? `${currentMatchIndex + 1} of ${totalMatches}` : 'No matches';

  const hasMatches = totalMatches > 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md',
        'transition-all duration-200 ease-in-out'
      )}
    >
      {/* Search Icon */}
      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />

      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search in PDF... (Ctrl+F)"
          className="pr-8 text-sm"
          disabled={isSearching}
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Match Counter */}
      <div
        className={cn(
          'text-sm font-medium px-2 py-1 rounded min-w-[90px] text-center',
          hasMatches ? 'text-gray-700 bg-gray-100' : 'text-gray-400 bg-gray-50'
        )}
      >
        {isSearching ? 'Searching...' : matchCounter}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasMatches || isSearching}
          className={cn(
            'p-1.5 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
            'transition-colors'
          )}
          aria-label="Previous match (Shift+Enter)"
          title="Previous match (Shift+Enter)"
        >
          <ChevronUpIcon className="h-5 w-5 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasMatches || isSearching}
          className={cn(
            'p-1.5 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
            'transition-colors'
          )}
          aria-label="Next match (Enter)"
          title="Next match (Enter)"
        >
          <ChevronDownIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        aria-label="Close search (Esc)"
        title="Close search (Esc)"
      >
        <XMarkIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

export default SearchBar;
