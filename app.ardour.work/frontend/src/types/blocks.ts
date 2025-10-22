export type BlockType = 'text' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'quote' | 'code' | 'table' | 'image';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: Record<string, any>;
  children?: Block[];
}

export interface Document {
  id: string;
  title: string;
  type: 'presentation' | 'Live Document' | 'M&A Profile';
  blocks: Block[];
  sources: Source[];
  metadata: DocumentMetadata;
}

export interface Source {
  id: string;
  title: string;
  url?: string;
  type: 'public' | 'private';
  citationNumber: number;
  domain?: string;
  usageCount: number;
}

export interface DocumentMetadata {
  created: string;
  lastModified: string;
  folderId: string;
  gradient: string;
}
