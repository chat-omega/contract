import { useState, useEffect, useRef } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  X
} from 'lucide-react';
import { BlockType } from '@/types/blocks';

interface SlashMenuProps {
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

interface MenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

const menuItems: MenuItem[] = [
  {
    type: 'text',
    label: 'Text',
    description: 'Plain text paragraph',
    icon: Type,
    keywords: ['text', 'paragraph', 'p']
  },
  {
    type: 'heading1',
    label: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    keywords: ['heading1', 'h1', 'title', 'heading']
  },
  {
    type: 'heading2',
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    keywords: ['heading2', 'h2', 'subtitle', 'heading']
  },
  {
    type: 'heading3',
    label: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    keywords: ['heading3', 'h3', 'heading']
  },
  {
    type: 'bulletList',
    label: 'Bullet List',
    description: 'Unordered list item',
    icon: List,
    keywords: ['bullet', 'list', 'ul', 'unordered']
  },
  {
    type: 'numberedList',
    label: 'Numbered List',
    description: 'Ordered list item',
    icon: ListOrdered,
    keywords: ['numbered', 'list', 'ol', 'ordered', 'number']
  },
  {
    type: 'quote',
    label: 'Quote',
    description: 'Block quote',
    icon: Quote,
    keywords: ['quote', 'blockquote', 'citation']
  },
  {
    type: 'code',
    label: 'Code',
    description: 'Code block',
    icon: Code,
    keywords: ['code', 'pre', 'monospace', 'snippet']
  }
];

export function SlashMenu({ position, onSelect, onClose }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items based on search
  const filteredItems = searchQuery
    ? menuItems.filter(item =>
        item.keywords.some(keyword =>
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredItems.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex].type);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredItems, onSelect, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '320px',
        maxHeight: '400px'
      }}
    >
      {/* Search Input */}
      <div className="flex items-center border-b border-slate-700 bg-slate-800/50 px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blocks..."
          className="flex-1 bg-transparent text-slate-200 text-sm placeholder-slate-500 outline-none"
        />
        <button
          onClick={onClose}
          className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="overflow-y-auto max-h-[340px]">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                className={`
                  w-full flex items-start px-3 py-2.5 transition-colors text-left
                  ${
                    isSelected
                      ? 'bg-blue-600/20 border-l-2 border-blue-500'
                      : 'hover:bg-slate-800/50 border-l-2 border-transparent'
                  }
                `}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded flex items-center justify-center mr-3
                  ${isSelected ? 'bg-blue-600/30 text-blue-400' : 'bg-slate-800 text-slate-400'}
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`
                    text-sm font-medium
                    ${isSelected ? 'text-blue-300' : 'text-slate-200'}
                  `}>
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="px-3 py-8 text-center text-slate-500 text-sm">
            No blocks found
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="border-t border-slate-700 bg-slate-800/30 px-3 py-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-400 mr-1">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center">
              <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-400 mr-1">Enter</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-400 mr-1">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
