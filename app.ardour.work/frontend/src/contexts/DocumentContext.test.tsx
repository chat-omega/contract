import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DocumentProvider, useDocument } from './DocumentContext';
import { Block, Source } from '@/types/blocks';

describe('DocumentContext', () => {
  describe('DocumentProvider', () => {
    it('should provide document context to children', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      expect(result.current.currentDocument).toBeDefined();
      expect(result.current.createDocument).toBeDefined();
      expect(result.current.updateDocument).toBeDefined();
      expect(result.current.addBlock).toBeDefined();
      expect(result.current.updateBlock).toBeDefined();
      expect(result.current.deleteBlock).toBeDefined();
      expect(result.current.reorderBlocks).toBeDefined();
      expect(result.current.addSource).toBeDefined();
    });

    it('should initialize with default document', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      expect(result.current.currentDocument).not.toBeNull();
      expect(result.current.currentDocument?.title).toBe('Untitled Document');
      expect(result.current.currentDocument?.blocks).toBeDefined();
      expect(result.current.currentDocument?.sources).toBeDefined();
      expect(result.current.currentDocument?.metadata).toBeDefined();
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useDocument());
      }).toThrow('useDocument must be used within a DocumentProvider');
    });
  });

  describe('createDocument', () => {
    it('should create a new document with valid data', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      let newDocument;
      act(() => {
        newDocument = result.current.createDocument({
          title: 'New Test Document',
          type: 'presentation',
          blocks: [],
          sources: [],
        });
      });

      expect(result.current.currentDocument?.title).toBe('New Test Document');
      expect(result.current.currentDocument?.type).toBe('presentation');
      expect(result.current.currentDocument?.id).toBeDefined();
      expect(result.current.currentDocument?.metadata).toBeDefined();
      expect(result.current.currentDocument?.metadata.created).toBeDefined();
      expect(result.current.currentDocument?.metadata.lastModified).toBeDefined();
    });

    it('should throw error for empty title', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      expect(() => {
        act(() => {
          result.current.createDocument({
            title: '  ',
            type: 'Live Document',
            blocks: [],
            sources: [],
          });
        });
      }).toThrow('Document title is required');
    });

    it('should create document with M&A Profile type', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      act(() => {
        result.current.createDocument({
          title: 'M&A Analysis',
          type: 'M&A Profile',
          blocks: [],
          sources: [],
        });
      });

      expect(result.current.currentDocument?.type).toBe('M&A Profile');
    });
  });

  describe('updateDocument', () => {
    it('should update document title', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const documentId = result.current.currentDocument?.id!;

      act(() => {
        result.current.updateDocument(documentId, {
          title: 'Updated Title',
        });
      });

      expect(result.current.currentDocument?.title).toBe('Updated Title');
    });

    it('should update document type', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const documentId = result.current.currentDocument?.id!;

      act(() => {
        result.current.updateDocument(documentId, {
          type: 'presentation',
        });
      });

      expect(result.current.currentDocument?.type).toBe('presentation');
    });

    it('should update lastModified when document is updated', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const documentId = result.current.currentDocument?.id!;
      const originalDate = result.current.currentDocument?.metadata.lastModified;

      act(() => {
        result.current.updateDocument(documentId, {
          title: 'Changed Title',
        });
      });

      expect(result.current.currentDocument?.metadata.lastModified).toBeDefined();
    });

    it('should not update document with wrong id', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const originalTitle = result.current.currentDocument?.title;

      act(() => {
        result.current.updateDocument('wrong-id', {
          title: 'Should Not Update',
        });
      });

      expect(result.current.currentDocument?.title).toBe(originalTitle);
    });
  });

  describe('addBlock', () => {
    it('should add a text block', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const initialBlockCount = result.current.currentDocument?.blocks.length!;

      act(() => {
        result.current.addBlock({
          type: 'text',
          content: 'New text block content',
          properties: {},
        });
      });

      expect(result.current.currentDocument?.blocks.length).toBe(initialBlockCount + 1);
      const lastBlock = result.current.currentDocument?.blocks[result.current.currentDocument.blocks.length - 1];
      expect(lastBlock?.type).toBe('text');
      expect(lastBlock?.content).toBe('New text block content');
      expect(lastBlock?.id).toBeDefined();
    });

    it('should add a heading block', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      act(() => {
        result.current.addBlock({
          type: 'heading1',
          content: 'New Heading',
          properties: {},
        });
      });

      const lastBlock = result.current.currentDocument?.blocks[result.current.currentDocument.blocks.length - 1];
      expect(lastBlock?.type).toBe('heading1');
      expect(lastBlock?.content).toBe('New Heading');
    });

    it('should add multiple blocks', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const initialBlockCount = result.current.currentDocument?.blocks.length!;

      act(() => {
        result.current.addBlock({
          type: 'text',
          content: 'First block',
          properties: {},
        });
        result.current.addBlock({
          type: 'text',
          content: 'Second block',
          properties: {},
        });
        result.current.addBlock({
          type: 'heading2',
          content: 'Third block',
          properties: {},
        });
      });

      expect(result.current.currentDocument?.blocks.length).toBe(initialBlockCount + 3);
    });

    it('should generate unique block IDs', async () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      act(() => {
        result.current.addBlock({
          type: 'text',
          content: 'Block 1',
          properties: {},
        });
      });

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 2));

      act(() => {
        result.current.addBlock({
          type: 'text',
          content: 'Block 2',
          properties: {},
        });
      });

      const blocks = result.current.currentDocument?.blocks!;
      const lastTwoBlocks = blocks.slice(-2);
      expect(lastTwoBlocks[0].id).not.toBe(lastTwoBlocks[1].id);
    });
  });

  describe('updateBlock', () => {
    it('should update block content', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const blockId = result.current.currentDocument?.blocks[0].id!;

      act(() => {
        result.current.updateBlock(blockId, {
          content: 'Updated content',
        });
      });

      const updatedBlock = result.current.currentDocument?.blocks.find(b => b.id === blockId);
      expect(updatedBlock?.content).toBe('Updated content');
    });

    it('should update block type', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const blockId = result.current.currentDocument?.blocks[0].id!;

      act(() => {
        result.current.updateBlock(blockId, {
          type: 'heading2',
        });
      });

      const updatedBlock = result.current.currentDocument?.blocks.find(b => b.id === blockId);
      expect(updatedBlock?.type).toBe('heading2');
    });

    it('should update block properties', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const blockId = result.current.currentDocument?.blocks[0].id!;

      act(() => {
        result.current.updateBlock(blockId, {
          properties: { color: 'blue', align: 'center' },
        });
      });

      const updatedBlock = result.current.currentDocument?.blocks.find(b => b.id === blockId);
      expect(updatedBlock?.properties?.color).toBe('blue');
      expect(updatedBlock?.properties?.align).toBe('center');
    });

    it('should not affect other blocks when updating one', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const blockId = result.current.currentDocument?.blocks[0].id!;
      const secondBlock = result.current.currentDocument?.blocks[1];

      act(() => {
        result.current.updateBlock(blockId, {
          content: 'Updated first block',
        });
      });

      const unchangedBlock = result.current.currentDocument?.blocks.find(b => b.id === secondBlock.id);
      expect(unchangedBlock?.content).toBe(secondBlock.content);
    });
  });

  describe('deleteBlock', () => {
    it('should delete a block', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const initialBlockCount = result.current.currentDocument?.blocks.length!;
      const blockId = result.current.currentDocument?.blocks[0].id!;

      act(() => {
        result.current.deleteBlock(blockId);
      });

      expect(result.current.currentDocument?.blocks.length).toBe(initialBlockCount - 1);
      expect(result.current.currentDocument?.blocks.find(b => b.id === blockId)).toBeUndefined();
    });

    it('should not affect other blocks when deleting one', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const blockToDelete = result.current.currentDocument?.blocks[0]!;
      const blockToKeep = result.current.currentDocument?.blocks[1]!;

      act(() => {
        result.current.deleteBlock(blockToDelete.id);
      });

      expect(result.current.currentDocument?.blocks.find(b => b.id === blockToKeep.id)).toBeDefined();
    });

    it('should handle deleting non-existent block gracefully', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const initialBlocks = result.current.currentDocument?.blocks.length!;

      act(() => {
        result.current.deleteBlock('non-existent-id');
      });

      expect(result.current.currentDocument?.blocks.length).toBe(initialBlocks);
    });
  });

  describe('reorderBlocks', () => {
    it('should reorder blocks from start to end', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const firstBlock = result.current.currentDocument?.blocks[0]!;
      const secondBlock = result.current.currentDocument?.blocks[1]!;

      act(() => {
        result.current.reorderBlocks(0, 2);
      });

      expect(result.current.currentDocument?.blocks[0].id).toBe(secondBlock.id);
      expect(result.current.currentDocument?.blocks[2].id).toBe(firstBlock.id);
    });

    it('should reorder blocks from end to start', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const thirdBlock = result.current.currentDocument?.blocks[2]!;

      act(() => {
        result.current.reorderBlocks(2, 0);
      });

      expect(result.current.currentDocument?.blocks[0].id).toBe(thirdBlock.id);
    });

    it('should maintain total block count after reordering', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const initialCount = result.current.currentDocument?.blocks.length!;

      act(() => {
        result.current.reorderBlocks(0, 3);
      });

      expect(result.current.currentDocument?.blocks.length).toBe(initialCount);
    });
  });

  describe('addSource', () => {
    it('should add a public source', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const initialSourceCount = result.current.currentDocument?.sources.length!;

      act(() => {
        result.current.addSource({
          title: 'New Public Source',
          url: 'https://example.com/article',
          type: 'public',
          domain: 'example.com',
          usageCount: 1,
        });
      });

      expect(result.current.currentDocument?.sources.length).toBe(initialSourceCount + 1);
      const lastSource = result.current.currentDocument?.sources[result.current.currentDocument.sources.length - 1];
      expect(lastSource?.title).toBe('New Public Source');
      expect(lastSource?.type).toBe('public');
      expect(lastSource?.id).toBeDefined();
      expect(lastSource?.citationNumber).toBeDefined();
    });

    it('should add a private source', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      act(() => {
        result.current.addSource({
          title: 'Private Internal Document',
          type: 'private',
          usageCount: 2,
        });
      });

      const lastSource = result.current.currentDocument?.sources[result.current.currentDocument.sources.length - 1];
      expect(lastSource?.title).toBe('Private Internal Document');
      expect(lastSource?.type).toBe('private');
    });

    it('should auto-increment citation numbers', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const initialMaxCitation = Math.max(...result.current.currentDocument?.sources.map(s => s.citationNumber)!);

      act(() => {
        result.current.addSource({
          title: 'Source 1',
          type: 'public',
          usageCount: 0,
        });
        result.current.addSource({
          title: 'Source 2',
          type: 'public',
          usageCount: 0,
        });
      });

      const sources = result.current.currentDocument?.sources!;
      const lastTwoSources = sources.slice(-2);
      expect(lastTwoSources[0].citationNumber).toBe(initialMaxCitation + 1);
      expect(lastTwoSources[1].citationNumber).toBe(initialMaxCitation + 2);
    });

    it('should throw error for empty source title', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      expect(() => {
        act(() => {
          result.current.addSource({
            title: '  ',
            type: 'public',
            usageCount: 0,
          });
        });
      }).toThrow('Source title is required');
    });

    it('should default usageCount to 0 if not provided', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      act(() => {
        result.current.addSource({
          title: 'Source Without Usage',
          type: 'public',
          usageCount: undefined as any,
        });
      });

      const lastSource = result.current.currentDocument?.sources[result.current.currentDocument.sources.length - 1];
      expect(lastSource?.usageCount).toBe(0);
    });
  });

  describe('metadata updates', () => {
    it('should update lastModified when adding a block', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const originalDate = result.current.currentDocument?.metadata.lastModified;

      act(() => {
        result.current.addBlock({
          type: 'text',
          content: 'New block',
          properties: {},
        });
      });

      expect(result.current.currentDocument?.metadata.lastModified).toBeDefined();
    });

    it('should update lastModified when updating a block', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const blockId = result.current.currentDocument?.blocks[0].id!;

      act(() => {
        result.current.updateBlock(blockId, {
          content: 'Updated',
        });
      });

      expect(result.current.currentDocument?.metadata.lastModified).toBeDefined();
    });

    it('should update lastModified when deleting a block', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const blockId = result.current.currentDocument?.blocks[0].id!;

      act(() => {
        result.current.deleteBlock(blockId);
      });

      expect(result.current.currentDocument?.metadata.lastModified).toBeDefined();
    });

    it('should update lastModified when reordering blocks', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      act(() => {
        result.current.reorderBlocks(0, 1);
      });

      expect(result.current.currentDocument?.metadata.lastModified).toBeDefined();
    });

    it('should update lastModified when adding a source', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      act(() => {
        result.current.addSource({
          title: 'New Source',
          type: 'public',
          usageCount: 0,
        });
      });

      expect(result.current.currentDocument?.metadata.lastModified).toBeDefined();
    });
  });

  describe('block types', () => {
    it('should support all block types', () => {
      const { result } = renderHook(() => useDocument(), {
        wrapper: DocumentProvider,
      });

      const blockTypes: Array<Block['type']> = [
        'text', 'heading1', 'heading2', 'heading3',
        'bulletList', 'numberedList', 'quote', 'code', 'table', 'image'
      ];

      blockTypes.forEach(type => {
        act(() => {
          result.current.addBlock({
            type,
            content: `Content for ${type}`,
            properties: {},
          });
        });
      });

      blockTypes.forEach(type => {
        const block = result.current.currentDocument?.blocks.find(b => b.type === type);
        expect(block).toBeDefined();
        expect(block?.type).toBe(type);
      });
    });
  });
});
