import { createContext, useContext, useState, ReactNode } from 'react';
import { Block, Document, Source, DocumentMetadata } from '@/types/blocks';

interface DocumentContextType {
  currentDocument: Document | null;
  createDocument: (document: Omit<Document, 'id' | 'metadata'>) => Document;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  addBlock: (block: Omit<Block, 'id'>) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  addSource: (source: Omit<Source, 'id' | 'citationNumber'>) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [currentDocument, setCurrentDocument] = useState<Document | null>({
    id: '1',
    title: 'Untitled Document',
    type: 'Live Document',
    blocks: [
      {
        id: 'block-1',
        type: 'heading1',
        content: 'Executive Summary',
        properties: {}
      },
      {
        id: 'block-2',
        type: 'text',
        content: 'This document provides an overview of the strategic analysis and key findings from our recent market research.',
        properties: {}
      },
      {
        id: 'block-3',
        type: 'heading2',
        content: 'Key Findings',
        properties: {}
      },
      {
        id: 'block-4',
        type: 'bulletList',
        content: 'Market size is estimated at $2.5B with 15% YoY growth',
        properties: {}
      },
      {
        id: 'block-5',
        type: 'bulletList',
        content: 'Primary competitors include Company A, Company B, and Company C',
        properties: {}
      },
      {
        id: 'block-6',
        type: 'bulletList',
        content: 'Target customer segment shows strong adoption trends',
        properties: {}
      },
      {
        id: 'block-7',
        type: 'heading2',
        content: 'Strategic Recommendations',
        properties: {}
      },
      {
        id: 'block-8',
        type: 'numberedList',
        content: 'Expand market presence in the Northeast region',
        properties: {}
      },
      {
        id: 'block-9',
        type: 'numberedList',
        content: 'Develop strategic partnerships with key industry players',
        properties: {}
      },
      {
        id: 'block-10',
        type: 'quote',
        content: 'The market opportunity is significant, but timing is critical for capturing market share.',
        properties: { author: 'Market Analysis Team' }
      }
    ],
    sources: [
      {
        id: 'source-1',
        title: 'Industry Report 2025',
        url: 'https://industry-research.com/report-2025',
        type: 'public',
        citationNumber: 1,
        domain: 'industry-research.com',
        usageCount: 3
      },
      {
        id: 'source-2',
        title: 'Internal Market Analysis',
        type: 'private',
        citationNumber: 2,
        usageCount: 5
      }
    ],
    metadata: {
      created: '2025-10-15',
      lastModified: '2025-10-18',
      folderId: 'folder-1',
      gradient: 'from-blue-500 to-purple-600'
    }
  });

  const createDocument = (document: Omit<Document, 'id' | 'metadata'>): Document => {
    // Validation
    if (!document.title || document.title.trim().length < 1) {
      throw new Error('Document title is required');
    }
    if (!document.type) {
      throw new Error('Document type is required');
    }

    const newDocument: Document = {
      ...document,
      id: Date.now().toString(),
      metadata: {
        created: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        folderId: 'default',
        gradient: 'from-blue-500 to-purple-600'
      }
    };

    setCurrentDocument(newDocument);
    return newDocument;
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setCurrentDocument(prev => {
      if (!prev || prev.id !== id) return prev;

      return {
        ...prev,
        ...updates,
        metadata: {
          ...prev.metadata,
          lastModified: new Date().toISOString().split('T')[0]
        }
      };
    });
  };

  const addBlock = (block: Omit<Block, 'id'>) => {
    setCurrentDocument(prev => {
      if (!prev) return prev;

      const newBlock: Block = {
        ...block,
        id: `block-${Date.now()}`
      };

      return {
        ...prev,
        blocks: [...prev.blocks, newBlock],
        metadata: {
          ...prev.metadata,
          lastModified: new Date().toISOString().split('T')[0]
        }
      };
    });
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    setCurrentDocument(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        blocks: prev.blocks.map(block =>
          block.id === blockId
            ? { ...block, ...updates }
            : block
        ),
        metadata: {
          ...prev.metadata,
          lastModified: new Date().toISOString().split('T')[0]
        }
      };
    });
  };

  const deleteBlock = (blockId: string) => {
    setCurrentDocument(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        blocks: prev.blocks.filter(block => block.id !== blockId),
        metadata: {
          ...prev.metadata,
          lastModified: new Date().toISOString().split('T')[0]
        }
      };
    });
  };

  const reorderBlocks = (startIndex: number, endIndex: number) => {
    setCurrentDocument(prev => {
      if (!prev) return prev;

      const blocks = Array.from(prev.blocks);
      const [removed] = blocks.splice(startIndex, 1);
      blocks.splice(endIndex, 0, removed);

      return {
        ...prev,
        blocks,
        metadata: {
          ...prev.metadata,
          lastModified: new Date().toISOString().split('T')[0]
        }
      };
    });
  };

  const addSource = (source: Omit<Source, 'id' | 'citationNumber'>) => {
    setCurrentDocument(prev => {
      if (!prev) return prev;

      // Validation
      if (!source.title || source.title.trim().length < 1) {
        throw new Error('Source title is required');
      }

      const nextCitationNumber = prev.sources.length > 0
        ? Math.max(...prev.sources.map(s => s.citationNumber)) + 1
        : 1;

      const newSource: Source = {
        ...source,
        id: `source-${Date.now()}`,
        citationNumber: nextCitationNumber,
        usageCount: source.usageCount || 0
      };

      return {
        ...prev,
        sources: [...prev.sources, newSource],
        metadata: {
          ...prev.metadata,
          lastModified: new Date().toISOString().split('T')[0]
        }
      };
    });
  };

  return (
    <DocumentContext.Provider
      value={{
        currentDocument,
        createDocument,
        updateDocument,
        addBlock,
        updateBlock,
        deleteBlock,
        reorderBlocks,
        addSource
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}
