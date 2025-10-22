import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { useDocument } from '@/contexts/DocumentContext';
import { Block, BlockType } from '@/types/blocks';
import { SlashMenu } from './blocks/SlashMenu';

interface BlockEditorProps {
  documentId?: string;
}

export function BlockEditor({ documentId }: BlockEditorProps) {
  const { currentDocument, addBlock, updateBlock, deleteBlock, reorderBlocks } = useDocument();
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [slashMenuBlock, setSlashMenuBlock] = useState<string | null>(null);
  const [slashMenuPosition, setSlashMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const saveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Auto-save with debounce (2s)
  const debouncedSave = (blockId: string, content: string) => {
    // Clear existing timeout for this block
    if (saveTimeoutRef.current[blockId]) {
      clearTimeout(saveTimeoutRef.current[blockId]);
    }

    // Set new timeout
    saveTimeoutRef.current[blockId] = setTimeout(() => {
      updateBlock(blockId, { content });
      delete saveTimeoutRef.current[blockId];
    }, 2000);
  };

  // Handle block content change
  const handleBlockChange = (blockId: string, content: string) => {
    debouncedSave(blockId, content);
  };

  // Handle block blur - immediate save
  const handleBlockBlur = (blockId: string) => {
    if (saveTimeoutRef.current[blockId]) {
      clearTimeout(saveTimeoutRef.current[blockId]);
      delete saveTimeoutRef.current[blockId];
    }

    const element = blockRefs.current[blockId];
    if (element) {
      const content = element.innerText || '';
      updateBlock(blockId, { content });
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, blockId: string, index: number) => {
    const element = blockRefs.current[blockId];
    if (!element) return;

    const content = element.innerText || '';
    const selection = window.getSelection();
    const cursorPosition = selection?.anchorOffset || 0;

    // Check for slash command
    if (e.key === '/' && content === '') {
      e.preventDefault();
      setSlashMenuBlock(blockId);

      // Calculate position for slash menu
      const rect = element.getBoundingClientRect();
      setSlashMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
      return;
    }

    // Backspace on empty block - delete block
    if (e.key === 'Backspace' && content === '' && currentDocument && currentDocument.blocks.length > 1) {
      e.preventDefault();
      deleteBlock(blockId);

      // Focus previous block
      if (index > 0) {
        const prevBlock = currentDocument.blocks[index - 1];
        setTimeout(() => {
          const prevElement = blockRefs.current[prevBlock.id];
          if (prevElement) {
            prevElement.focus();
            // Move cursor to end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(prevElement);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
          }
        }, 0);
      }
      return;
    }

    // Enter - create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Create new text block after current
      const newBlock: Omit<Block, 'id'> = {
        type: 'text',
        content: '',
        properties: {}
      };

      // Insert after current block
      if (currentDocument) {
        const blocks = [...currentDocument.blocks];
        blocks.splice(index + 1, 0, { ...newBlock, id: `block-${Date.now()}` } as Block);

        // Update document with new blocks
        addBlock(newBlock);

        // Focus new block
        setTimeout(() => {
          const newBlockId = blocks[index + 1].id;
          const newElement = blockRefs.current[newBlockId];
          if (newElement) {
            newElement.focus();
          }
        }, 10);
      }
      return;
    }

    // Arrow Up - move to previous block
    if (e.key === 'ArrowUp' && cursorPosition === 0 && index > 0) {
      e.preventDefault();
      if (currentDocument) {
        const prevBlock = currentDocument.blocks[index - 1];
        const prevElement = blockRefs.current[prevBlock.id];
        if (prevElement) {
          prevElement.focus();
          // Move cursor to end
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(prevElement);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
      return;
    }

    // Arrow Down - move to next block
    if (e.key === 'ArrowDown' && currentDocument && index < currentDocument.blocks.length - 1) {
      const textLength = content.length;
      if (cursorPosition === textLength) {
        e.preventDefault();
        const nextBlock = currentDocument.blocks[index + 1];
        const nextElement = blockRefs.current[nextBlock.id];
        if (nextElement) {
          nextElement.focus();
          // Move cursor to start
          const range = document.createRange();
          const sel = window.getSelection();
          range.setStart(nextElement.firstChild || nextElement, 0);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
      return;
    }
  };

  // Handle slash menu selection
  const handleSlashMenuSelect = (type: BlockType) => {
    if (slashMenuBlock) {
      updateBlock(slashMenuBlock, { type });
      setSlashMenuBlock(null);
      setSlashMenuPosition(null);

      // Focus the block
      setTimeout(() => {
        const element = blockRefs.current[slashMenuBlock];
        if (element) {
          element.focus();
        }
      }, 0);
    }
  };

  // Handle drag and drop
  const handleDragStart = (index: number) => {
    setDraggedBlockIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedBlockIndex !== null && draggedBlockIndex !== index) {
      reorderBlocks(draggedBlockIndex, index);
      setDraggedBlockIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedBlockIndex(null);
  };

  // Click empty area to create new block
  const handleEditorClick = (e: React.MouseEvent) => {
    if (e.target === editorRef.current) {
      const newBlock: Omit<Block, 'id'> = {
        type: 'text',
        content: '',
        properties: {}
      };
      addBlock(newBlock);

      // Focus new block
      setTimeout(() => {
        if (currentDocument) {
          const lastBlock = currentDocument.blocks[currentDocument.blocks.length - 1];
          const element = blockRefs.current[lastBlock.id];
          if (element) {
            element.focus();
          }
        }
      }, 10);
    }
  };

  // Get block styling based on type
  const getBlockStyles = (type: BlockType): string => {
    const baseStyles = 'outline-none transition-all duration-150';

    switch (type) {
      case 'heading1':
        return `${baseStyles} text-3xl font-bold text-slate-100 mb-4`;
      case 'heading2':
        return `${baseStyles} text-2xl font-semibold text-slate-100 mb-3`;
      case 'heading3':
        return `${baseStyles} text-xl font-semibold text-slate-100 mb-2`;
      case 'bulletList':
        return `${baseStyles} text-slate-300 ml-6 mb-2 before:content-['•'] before:mr-2 before:text-blue-400`;
      case 'numberedList':
        return `${baseStyles} text-slate-300 ml-6 mb-2`;
      case 'quote':
        return `${baseStyles} text-slate-400 italic border-l-4 border-blue-500 pl-4 py-2 mb-3`;
      case 'code':
        return `${baseStyles} text-sm font-mono text-green-400 bg-slate-900/50 rounded p-3 mb-3 overflow-x-auto`;
      case 'text':
      default:
        return `${baseStyles} text-slate-300 mb-2`;
    }
  };

  // Get placeholder text
  const getPlaceholder = (type: BlockType): string => {
    switch (type) {
      case 'heading1':
        return 'Heading 1';
      case 'heading2':
        return 'Heading 2';
      case 'heading3':
        return 'Heading 3';
      case 'bulletList':
        return 'List item';
      case 'numberedList':
        return 'Numbered item';
      case 'quote':
        return 'Quote';
      case 'code':
        return 'Code block';
      case 'text':
      default:
        return "Type '/' for commands...";
    }
  };

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        No document loaded
      </div>
    );
  }

  return (
    <div
      ref={editorRef}
      className="relative h-full bg-slate-800 overflow-y-auto"
      onClick={handleEditorClick}
    >
      <div className="max-w-4xl mx-auto py-12 px-8 min-h-full">
        {currentDocument.blocks.map((block, index) => (
          <div
            key={block.id}
            className="group relative"
            onMouseEnter={() => setHoveredBlockId(block.id)}
            onMouseLeave={() => setHoveredBlockId(null)}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            {/* Drag Handle */}
            {hoveredBlockId === block.id && (
              <div className="absolute left-0 top-0 -ml-8 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
                <button
                  className="p-1 text-slate-500 hover:text-slate-300"
                  onClick={() => {
                    const newBlock: Omit<Block, 'id'> = {
                      type: 'text',
                      content: '',
                      properties: {}
                    };
                    // This would need to insert at specific index
                    addBlock(newBlock);
                  }}
                  title="Add block"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Block Content */}
            <div
              ref={(el) => {
                blockRefs.current[block.id] = el;
              }}
              contentEditable
              suppressContentEditableWarning
              className={`
                ${getBlockStyles(block.type)}
                ${focusedBlockId === block.id ? 'ring-2 ring-blue-500/30 rounded px-2 -mx-2' : ''}
                ${hoveredBlockId === block.id ? 'bg-slate-700/20 rounded px-2 -mx-2' : ''}
              `}
              onFocus={() => setFocusedBlockId(block.id)}
              onBlur={() => {
                setFocusedBlockId(null);
                handleBlockBlur(block.id);
              }}
              onInput={(e) => {
                const content = e.currentTarget.innerText || '';
                handleBlockChange(block.id, content);
              }}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
              data-placeholder={block.content === '' ? getPlaceholder(block.type) : ''}
              style={{
                minHeight: '1.5em',
              }}
            >
              {block.content}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {currentDocument.blocks.length === 0 && (
          <div className="text-slate-500 text-center py-20">
            <p className="text-lg mb-2">Click anywhere to start writing</p>
            <p className="text-sm">Type '/' for commands</p>
          </div>
        )}
      </div>

      {/* Slash Menu */}
      {slashMenuBlock && slashMenuPosition && (
        <SlashMenu
          position={slashMenuPosition}
          onSelect={handleSlashMenuSelect}
          onClose={() => {
            setSlashMenuBlock(null);
            setSlashMenuPosition(null);
          }}
        />
      )}

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
          pointer-events: none;
          position: absolute;
        }

        [contenteditable]:focus {
          outline: none;
        }

        /* Prevent line break issues */
        [contenteditable] br {
          display: none;
        }

        [contenteditable] * {
          display: inline;
        }

        [contenteditable] div {
          display: inline;
        }
      `}</style>
    </div>
  );
}
