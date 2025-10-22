import { useCallback, useRef, useState, KeyboardEvent, DragEvent } from 'react';
import { Block, BlockType } from '@/types/blocks';
import { useDocument } from '@/contexts/DocumentContext';

export interface UseBlockEditorReturn {
  // Block manipulation
  handleAddBlock: (type: BlockType, content?: string, afterBlockId?: string) => void;
  handleUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  handleDeleteBlock: (blockId: string) => void;
  handleReorderBlocks: (startIndex: number, endIndex: number) => void;

  // Slash command
  handleSlashCommand: (blockId: string, content: string) => boolean;

  // Keyboard shortcuts
  handleKeyDown: (e: KeyboardEvent<HTMLElement>, blockId: string, blockIndex: number) => void;

  // Focus management
  focusBlock: (blockId: string) => void;
  blockRefs: React.MutableRefObject<Map<string, HTMLElement>>;

  // Block selection
  selectedBlockId: string | null;
  setSelectedBlockId: (blockId: string | null) => void;

  // Drag and drop
  handleDragStart: (e: DragEvent<HTMLElement>, blockIndex: number) => void;
  handleDragOver: (e: DragEvent<HTMLElement>, blockIndex: number) => void;
  handleDrop: (e: DragEvent<HTMLElement>, blockIndex: number) => void;
  draggedBlockIndex: number | null;
}

export function useBlockEditor(): UseBlockEditorReturn {
  const {
    currentDocument,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks
  } = useDocument();

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Focus management
  const focusBlock = useCallback((blockId: string) => {
    const element = blockRefs.current.get(blockId);
    if (element) {
      element.focus();
      setSelectedBlockId(blockId);
    }
  }, []);

  // Add block with optional positioning
  const handleAddBlock = useCallback((
    type: BlockType,
    content: string = '',
    afterBlockId?: string
  ) => {
    if (!currentDocument) return;

    const newBlock: Omit<Block, 'id'> = {
      type,
      content,
      properties: {}
    };

    // If afterBlockId is provided, we need to insert at specific position
    if (afterBlockId) {
      const blocks = currentDocument.blocks;
      const afterIndex = blocks.findIndex(b => b.id === afterBlockId);

      if (afterIndex !== -1) {
        // Create new block with temporary ID
        const tempBlock: Block = {
          ...newBlock,
          id: `block-${Date.now()}`
        };

        // Insert at position
        const newBlocks = [
          ...blocks.slice(0, afterIndex + 1),
          tempBlock,
          ...blocks.slice(afterIndex + 1)
        ];

        // Update all blocks at once
        currentDocument.blocks = newBlocks;

        // Focus the new block after a brief delay
        setTimeout(() => focusBlock(tempBlock.id), 0);
        return;
      }
    }

    // Default: add to end
    addBlock(newBlock);
  }, [currentDocument, addBlock, focusBlock]);

  // Update block
  const handleUpdateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    updateBlock(blockId, updates);
  }, [updateBlock]);

  // Delete block
  const handleDeleteBlock = useCallback((blockId: string) => {
    if (!currentDocument) return;

    const blocks = currentDocument.blocks;
    const blockIndex = blocks.findIndex(b => b.id === blockId);

    deleteBlock(blockId);

    // Focus previous block if available, otherwise next block
    if (blockIndex > 0) {
      const prevBlock = blocks[blockIndex - 1];
      setTimeout(() => focusBlock(prevBlock.id), 0);
    } else if (blockIndex < blocks.length - 1) {
      const nextBlock = blocks[blockIndex + 1];
      setTimeout(() => focusBlock(nextBlock.id), 0);
    }
  }, [currentDocument, deleteBlock, focusBlock]);

  // Reorder blocks
  const handleReorderBlocks = useCallback((startIndex: number, endIndex: number) => {
    reorderBlocks(startIndex, endIndex);
  }, [reorderBlocks]);

  // Slash command handler - detects "/" and returns true if slash command detected
  const handleSlashCommand = useCallback((blockId: string, content: string): boolean => {
    // Check if content ends with "/" (slash command trigger)
    if (content.endsWith('/')) {
      return true;
    }

    // Parse slash commands like "/h1", "/h2", "/h3", "/bullet", "/number", "/quote", "/code"
    const slashCommandMatch = content.match(/^\/(\w+)$/);
    if (slashCommandMatch) {
      const command = slashCommandMatch[1].toLowerCase();
      let newType: BlockType | null = null;

      switch (command) {
        case 'h1':
        case 'heading1':
          newType = 'heading1';
          break;
        case 'h2':
        case 'heading2':
          newType = 'heading2';
          break;
        case 'h3':
        case 'heading3':
          newType = 'heading3';
          break;
        case 'bullet':
        case 'ul':
          newType = 'bulletList';
          break;
        case 'number':
        case 'numbered':
        case 'ol':
          newType = 'numberedList';
          break;
        case 'quote':
          newType = 'quote';
          break;
        case 'code':
          newType = 'code';
          break;
        case 'text':
        case 'p':
          newType = 'text';
          break;
        case 'table':
          newType = 'table';
          break;
        case 'image':
        case 'img':
          newType = 'image';
          break;
      }

      if (newType) {
        handleUpdateBlock(blockId, { type: newType, content: '' });
        return true;
      }
    }

    return false;
  }, [handleUpdateBlock]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((
    e: KeyboardEvent<HTMLElement>,
    blockId: string,
    blockIndex: number
  ) => {
    if (!currentDocument) return;

    const blocks = currentDocument.blocks;
    const currentBlock = blocks[blockIndex];
    const content = currentBlock?.content || '';

    // Enter key - create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Create new text block after current block
      handleAddBlock('text', '', blockId);
    }

    // Backspace at beginning - merge with previous block or delete
    if (e.key === 'Backspace') {
      const target = e.target as HTMLElement;
      const cursorAtStart = target.textContent?.length === 0 ||
                           (window.getSelection()?.anchorOffset === 0);

      if (cursorAtStart) {
        e.preventDefault();

        if (blockIndex > 0 && content.length === 0) {
          // Delete empty block and focus previous
          handleDeleteBlock(blockId);
        } else if (blockIndex > 0) {
          // Merge with previous block
          const prevBlock = blocks[blockIndex - 1];
          const mergedContent = prevBlock.content + content;

          handleUpdateBlock(prevBlock.id, { content: mergedContent });
          handleDeleteBlock(blockId);
        }
      }
    }

    // Arrow Up - navigate to previous block
    if (e.key === 'ArrowUp') {
      const cursorAtStart = window.getSelection()?.anchorOffset === 0;

      if (cursorAtStart && blockIndex > 0) {
        e.preventDefault();
        const prevBlock = blocks[blockIndex - 1];
        focusBlock(prevBlock.id);
      }
    }

    // Arrow Down - navigate to next block
    if (e.key === 'ArrowDown') {
      const target = e.target as HTMLElement;
      const content = target.textContent || '';
      const cursorAtEnd = window.getSelection()?.anchorOffset === content.length;

      if (cursorAtEnd && blockIndex < blocks.length - 1) {
        e.preventDefault();
        const nextBlock = blocks[blockIndex + 1];
        focusBlock(nextBlock.id);
      }
    }

    // Cmd/Ctrl + D - duplicate block
    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault();

      const blockToDuplicate = blocks[blockIndex];
      handleAddBlock(
        blockToDuplicate.type,
        blockToDuplicate.content,
        blockId
      );
    }

    // Cmd/Ctrl + Shift + Up - move block up
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'ArrowUp') {
      e.preventDefault();

      if (blockIndex > 0) {
        handleReorderBlocks(blockIndex, blockIndex - 1);
        // Maintain focus after reorder
        setTimeout(() => focusBlock(blockId), 0);
      }
    }

    // Cmd/Ctrl + Shift + Down - move block down
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'ArrowDown') {
      e.preventDefault();

      if (blockIndex < blocks.length - 1) {
        handleReorderBlocks(blockIndex, blockIndex + 1);
        // Maintain focus after reorder
        setTimeout(() => focusBlock(blockId), 0);
      }
    }
  }, [currentDocument, handleAddBlock, handleUpdateBlock, handleDeleteBlock, handleReorderBlocks, focusBlock]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: DragEvent<HTMLElement>, blockIndex: number) => {
    setDraggedBlockIndex(blockIndex);
    e.dataTransfer.effectAllowed = 'move';

    // Add visual feedback
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>, blockIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Visual feedback for drop zone
    if (e.currentTarget && draggedBlockIndex !== null && draggedBlockIndex !== blockIndex) {
      e.currentTarget.style.borderTop = '2px solid #3b82f6';
    }
  }, [draggedBlockIndex]);

  const handleDrop = useCallback((e: DragEvent<HTMLElement>, dropIndex: number) => {
    e.preventDefault();

    // Clear visual feedback
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.style.borderTop = '';
    }

    if (draggedBlockIndex !== null && draggedBlockIndex !== dropIndex) {
      handleReorderBlocks(draggedBlockIndex, dropIndex);
    }

    setDraggedBlockIndex(null);
  }, [draggedBlockIndex, handleReorderBlocks]);

  return {
    // Block manipulation
    handleAddBlock,
    handleUpdateBlock,
    handleDeleteBlock,
    handleReorderBlocks,

    // Slash command
    handleSlashCommand,

    // Keyboard shortcuts
    handleKeyDown,

    // Focus management
    focusBlock,
    blockRefs,

    // Block selection
    selectedBlockId,
    setSelectedBlockId,

    // Drag and drop
    handleDragStart,
    handleDragOver,
    handleDrop,
    draggedBlockIndex
  };
}
