import { Response } from 'express';
import { CustomRequest, Document, DocumentStatus, DocumentFilter } from '../types';
import { createResponse, createPaginatedResponse, parsePaginationParams, generateId } from '../utils';
import { OperationalError, asyncHandler } from '../middleware/errorHandler';
import { Logger } from '../middleware/logger';

// Mock data store (in production, use a database)
let documents: Document[] = [
  {
    id: '1',
    name: 'Sample Contract.pdf',
    fileName: 'sample-contract.pdf',
    fileSize: 245678,
    mimeType: 'application/pdf',
    status: DocumentStatus.PROCESSED,
    uploadedBy: 'user-1',
    uploadedAt: new Date('2025-10-15T10:00:00Z'),
    processedAt: new Date('2025-10-15T10:05:00Z'),
    extractedData: {
      title: 'Service Agreement',
      parties: ['Company A', 'Company B'],
      effectiveDate: '2025-01-01',
      amount: 50000
    },
    metadata: {
      pageCount: 15,
      language: 'en'
    },
    tags: ['contract', 'legal', 'services'],
    workflowId: 'workflow-1',
    createdAt: new Date('2025-10-15T10:00:00Z'),
    updatedAt: new Date('2025-10-15T10:05:00Z')
  },
  {
    id: '2',
    name: 'Invoice-2025-001.pdf',
    fileName: 'invoice-2025-001.pdf',
    fileSize: 123456,
    mimeType: 'application/pdf',
    status: DocumentStatus.UPLOADED,
    uploadedBy: 'user-2',
    uploadedAt: new Date('2025-10-16T14:30:00Z'),
    tags: ['invoice', 'finance'],
    createdAt: new Date('2025-10-16T14:30:00Z'),
    updatedAt: new Date('2025-10-16T14:30:00Z')
  }
];

/**
 * Get all documents with filtering and pagination
 */
export const getDocuments = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(req.query);
    const filter: DocumentFilter = {
      status: req.query.status as DocumentStatus,
      uploadedBy: req.query.uploadedBy as string,
      workflowId: req.query.workflowId as string,
      search: req.query.search as string
    };

    Logger.info('Fetching documents', { filter, page, limit });

    // Filter documents
    let filtered = [...documents];

    if (filter.status) {
      filtered = filtered.filter(doc => doc.status === filter.status);
    }

    if (filter.uploadedBy) {
      filtered = filtered.filter(doc => doc.uploadedBy === filter.uploadedBy);
    }

    if (filter.workflowId) {
      filtered = filtered.filter(doc => doc.workflowId === filter.workflowId);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchLower) ||
        doc.fileName.toLowerCase().includes(searchLower) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort documents
    filtered.sort((a, b) => {
      const aValue = (a as any)[sortBy] || a.createdAt;
      const bValue = (b as any)[sortBy] || b.createdAt;

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    // Paginate
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    const response = createPaginatedResponse(paginated, page, limit, total);
    res.json(response);
  }
);

/**
 * Get single document by ID
 */
export const getDocumentById = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    Logger.info(`Fetching document ${id}`);

    const document = documents.find(doc => doc.id === id);

    if (!document) {
      throw new OperationalError('Document not found', 404);
    }

    res.json(createResponse(true, document));
  }
);

/**
 * Upload new document
 */
export const uploadDocument = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { name, tags, workflowId, metadata } = req.body;
    const file = req.file;

    if (!file) {
      throw new OperationalError('No file provided', 400);
    }

    if (!name) {
      throw new OperationalError('Document name is required', 400);
    }

    Logger.info('Uploading new document', { name, fileName: file.originalname });

    const newDocument: Document = {
      id: generateId(),
      name,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: DocumentStatus.UPLOADED,
      uploadedBy: req.user?.id || 'anonymous',
      uploadedAt: new Date(),
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      workflowId,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    documents.push(newDocument);

    res.status(201).json(createResponse(true, newDocument, 'Document uploaded successfully'));
  }
);

/**
 * Update document
 */
export const updateDocument = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, status, tags, workflowId, metadata } = req.body;

    Logger.info(`Updating document ${id}`, req.body);

    const index = documents.findIndex(doc => doc.id === id);

    if (index === -1) {
      throw new OperationalError('Document not found', 404);
    }

    const updatedDocument: Document = {
      ...documents[index],
      ...(name && { name }),
      ...(status && { status }),
      ...(tags && { tags }),
      ...(workflowId && { workflowId }),
      ...(metadata && { metadata: { ...documents[index].metadata, ...metadata } }),
      updatedAt: new Date()
    };

    documents[index] = updatedDocument;

    res.json(createResponse(true, updatedDocument, 'Document updated successfully'));
  }
);

/**
 * Delete document
 */
export const deleteDocument = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    Logger.info(`Deleting document ${id}`);

    const index = documents.findIndex(doc => doc.id === id);

    if (index === -1) {
      throw new OperationalError('Document not found', 404);
    }

    documents.splice(index, 1);

    res.json(createResponse(true, null, 'Document deleted successfully'));
  }
);

/**
 * Trigger document extraction
 */
export const extractDocument = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { extractionType, options } = req.body;

    Logger.info(`Triggering extraction for document ${id}`, { extractionType, options });

    const index = documents.findIndex(doc => doc.id === id);

    if (index === -1) {
      throw new OperationalError('Document not found', 404);
    }

    if (documents[index].status === DocumentStatus.PROCESSING) {
      throw new OperationalError('Document is already being processed', 409);
    }

    // Update status to processing
    documents[index] = {
      ...documents[index],
      status: DocumentStatus.PROCESSING,
      updatedAt: new Date()
    };

    // Simulate extraction (in production, this would trigger an async job)
    setTimeout(() => {
      const docIndex = documents.findIndex(doc => doc.id === id);
      if (docIndex !== -1) {
        documents[docIndex] = {
          ...documents[docIndex],
          status: DocumentStatus.PROCESSED,
          processedAt: new Date(),
          extractedData: {
            title: 'Extracted Title',
            content: 'Extracted content placeholder',
            entities: ['Entity1', 'Entity2'],
            summary: 'Document summary'
          },
          updatedAt: new Date()
        };
      }
    }, 5000);

    res.json(
      createResponse(
        true,
        documents[index],
        'Extraction started successfully. Check back in a few moments.'
      )
    );
  }
);

/**
 * Get document statistics
 */
export const getDocumentStats = asyncHandler(
  async (_req: CustomRequest, res: Response): Promise<void> => {
    Logger.info('Fetching document statistics');

    const stats = {
      total: documents.length,
      byStatus: {
        uploaded: documents.filter(d => d.status === DocumentStatus.UPLOADED).length,
        processing: documents.filter(d => d.status === DocumentStatus.PROCESSING).length,
        processed: documents.filter(d => d.status === DocumentStatus.PROCESSED).length,
        failed: documents.filter(d => d.status === DocumentStatus.FAILED).length,
        archived: documents.filter(d => d.status === DocumentStatus.ARCHIVED).length
      },
      totalSize: documents.reduce((sum, doc) => sum + doc.fileSize, 0),
      recentUploads: documents
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
        .slice(0, 5)
        .map(doc => ({ id: doc.id, name: doc.name, uploadedAt: doc.uploadedAt }))
    };

    res.json(createResponse(true, stats));
  }
);
