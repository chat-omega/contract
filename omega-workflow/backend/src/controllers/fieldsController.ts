import { Response } from 'express';
import { CustomRequest, Field, FieldType, FieldFilter } from '../types';
import { createResponse, createPaginatedResponse, parsePaginationParams, generateId } from '../utils';
import { OperationalError, asyncHandler } from '../middleware/errorHandler';
import { Logger } from '../middleware/logger';

// Mock data store
let fields: Field[] = [
  {
    id: 'field-1',
    name: 'contractParties',
    displayName: 'Contract Parties',
    type: FieldType.ARRAY,
    description: 'List of parties involved in the contract',
    category: 'Legal',
    isRequired: true,
    validationRules: [
      { type: 'minLength', value: 1, message: 'At least one party is required' }
    ],
    metadata: {
      example: ['Company A', 'Company B']
    },
    usageCount: 125,
    lastUsed: new Date('2025-10-17T10:00:00Z'),
    createdAt: new Date('2025-09-01T08:00:00Z')
  },
  {
    id: 'field-2',
    name: 'effectiveDate',
    displayName: 'Effective Date',
    type: FieldType.DATE,
    description: 'The date when the contract becomes effective',
    category: 'Legal',
    isRequired: true,
    validationRules: [
      { type: 'format', value: 'YYYY-MM-DD', message: 'Date must be in YYYY-MM-DD format' }
    ],
    metadata: {
      format: 'YYYY-MM-DD'
    },
    usageCount: 118,
    lastUsed: new Date('2025-10-17T09:30:00Z'),
    createdAt: new Date('2025-09-01T08:00:00Z')
  },
  {
    id: 'field-3',
    name: 'contractAmount',
    displayName: 'Contract Amount',
    type: FieldType.CURRENCY,
    description: 'Total monetary value of the contract',
    category: 'Financial',
    isRequired: true,
    validationRules: [
      { type: 'min', value: 0, message: 'Amount must be positive' }
    ],
    metadata: {
      currency: 'USD',
      decimals: 2
    },
    usageCount: 110,
    lastUsed: new Date('2025-10-16T15:00:00Z'),
    createdAt: new Date('2025-09-01T08:00:00Z')
  },
  {
    id: 'field-4',
    name: 'invoiceNumber',
    displayName: 'Invoice Number',
    type: FieldType.TEXT,
    description: 'Unique invoice identifier',
    category: 'Financial',
    isRequired: true,
    validationRules: [
      { type: 'pattern', value: '^INV-[0-9]{4,}$', message: 'Must match format INV-####' }
    ],
    metadata: {
      pattern: 'INV-####'
    },
    usageCount: 89,
    lastUsed: new Date('2025-10-16T12:00:00Z'),
    createdAt: new Date('2025-09-05T10:00:00Z')
  },
  {
    id: 'field-5',
    name: 'customerEmail',
    displayName: 'Customer Email',
    type: FieldType.EMAIL,
    description: 'Customer contact email address',
    category: 'Contact',
    isRequired: false,
    validationRules: [
      { type: 'format', value: 'email', message: 'Must be a valid email address' }
    ],
    usageCount: 67,
    lastUsed: new Date('2025-10-15T14:00:00Z'),
    createdAt: new Date('2025-09-10T11:00:00Z')
  },
  {
    id: 'field-6',
    name: 'phoneNumber',
    displayName: 'Phone Number',
    type: FieldType.PHONE,
    description: 'Contact phone number',
    category: 'Contact',
    isRequired: false,
    validationRules: [
      { type: 'pattern', value: '^\\+?[1-9]\\d{1,14}$', message: 'Must be a valid phone number' }
    ],
    usageCount: 54,
    lastUsed: new Date('2025-10-14T16:00:00Z'),
    createdAt: new Date('2025-09-10T11:00:00Z')
  },
  {
    id: 'field-7',
    name: 'completionPercentage',
    displayName: 'Completion Percentage',
    type: FieldType.PERCENTAGE,
    description: 'Progress completion percentage',
    category: 'Analytics',
    isRequired: false,
    validationRules: [
      { type: 'min', value: 0, message: 'Cannot be less than 0' },
      { type: 'max', value: 100, message: 'Cannot be more than 100' }
    ],
    usageCount: 42,
    lastUsed: new Date('2025-10-13T10:00:00Z'),
    createdAt: new Date('2025-09-15T09:00:00Z')
  },
  {
    id: 'field-8',
    name: 'isActive',
    displayName: 'Is Active',
    type: FieldType.BOOLEAN,
    description: 'Whether the record is active',
    category: 'Status',
    isRequired: false,
    defaultValue: true,
    usageCount: 38,
    lastUsed: new Date('2025-10-12T11:00:00Z'),
    createdAt: new Date('2025-09-20T08:00:00Z')
  },
  {
    id: 'field-9',
    name: 'websiteUrl',
    displayName: 'Website URL',
    type: FieldType.URL,
    description: 'Company or resource website URL',
    category: 'Contact',
    isRequired: false,
    validationRules: [
      { type: 'format', value: 'url', message: 'Must be a valid URL' }
    ],
    usageCount: 31,
    lastUsed: new Date('2025-10-11T13:00:00Z'),
    createdAt: new Date('2025-09-22T10:00:00Z')
  },
  {
    id: 'field-10',
    name: 'itemCount',
    displayName: 'Item Count',
    type: FieldType.NUMBER,
    description: 'Number of items',
    category: 'Inventory',
    isRequired: false,
    validationRules: [
      { type: 'min', value: 0, message: 'Cannot be negative' },
      { type: 'integer', value: true, message: 'Must be a whole number' }
    ],
    usageCount: 25,
    lastUsed: new Date('2025-10-10T09:00:00Z'),
    createdAt: new Date('2025-09-25T11:00:00Z')
  }
];

/**
 * Search fields with filters
 */
export const searchFields = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(req.query);
    const filter: FieldFilter = {
      type: req.query.type as FieldType,
      category: req.query.category as string,
      isRequired: req.query.isRequired === 'true',
      search: req.query.search as string
    };

    Logger.info('Searching fields', { filter, page, limit });

    let filtered = [...fields];

    // Apply filters
    if (filter.type) {
      filtered = filtered.filter(field => field.type === filter.type);
    }

    if (filter.category) {
      filtered = filtered.filter(
        field => field.category?.toLowerCase() === filter.category?.toLowerCase()
      );
    }

    if (req.query.isRequired !== undefined) {
      filtered = filtered.filter(field => field.isRequired === filter.isRequired);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        field =>
          field.name.toLowerCase().includes(searchLower) ||
          field.displayName.toLowerCase().includes(searchLower) ||
          field.description?.toLowerCase().includes(searchLower) ||
          field.category?.toLowerCase().includes(searchLower)
      );
    }

    // Sort fields (default by usage count descending)
    const sortField = sortBy || 'usageCount';
    filtered.sort((a, b) => {
      const aValue = (a as any)[sortField] || 0;
      const bValue = (b as any)[sortField] || 0;

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    const response = createPaginatedResponse(paginated, page, limit, total);
    res.json(response);
  }
);

/**
 * Get field details by ID
 */
export const getFieldById = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    Logger.info(`Fetching field ${id}`);

    const field = fields.find(f => f.id === id);

    if (!field) {
      throw new OperationalError('Field not found', 404);
    }

    res.json(createResponse(true, field));
  }
);

/**
 * Get field by name
 */
export const getFieldByName = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { name } = req.params;

    Logger.info(`Fetching field by name: ${name}`);

    const field = fields.find(f => f.name === name);

    if (!field) {
      throw new OperationalError('Field not found', 404);
    }

    res.json(createResponse(true, field));
  }
);

/**
 * Get all field categories
 */
export const getFieldCategories = asyncHandler(
  async (_req: CustomRequest, res: Response): Promise<void> => {
    Logger.info('Fetching field categories');

    const categories = [...new Set(fields.map(f => f.category).filter(Boolean))];

    const categoriesWithCounts = categories.map(category => ({
      name: category,
      count: fields.filter(f => f.category === category).length
    }));

    res.json(createResponse(true, categoriesWithCounts));
  }
);

/**
 * Get field types with counts
 */
export const getFieldTypes = asyncHandler(
  async (_req: CustomRequest, res: Response): Promise<void> => {
    Logger.info('Fetching field types');

    const typeCounts = Object.values(FieldType).map(type => ({
      type,
      count: fields.filter(f => f.type === type).length
    }));

    res.json(createResponse(true, typeCounts));
  }
);

/**
 * Get most used fields
 */
export const getMostUsedFields = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const limit = parseInt(req.query.limit as string) || 10;

    Logger.info(`Fetching top ${limit} most used fields`);

    const sorted = [...fields].sort((a, b) => b.usageCount - a.usageCount);
    const topFields = sorted.slice(0, limit);

    res.json(createResponse(true, topFields));
  }
);

/**
 * Get recently used fields
 */
export const getRecentlyUsedFields = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const limit = parseInt(req.query.limit as string) || 10;

    Logger.info(`Fetching ${limit} recently used fields`);

    const withLastUsed = fields.filter(f => f.lastUsed);
    const sorted = withLastUsed.sort((a, b) => {
      const aTime = a.lastUsed?.getTime() || 0;
      const bTime = b.lastUsed?.getTime() || 0;
      return bTime - aTime;
    });

    const recentFields = sorted.slice(0, limit);

    res.json(createResponse(true, recentFields));
  }
);

/**
 * Get field statistics
 */
export const getFieldStats = asyncHandler(
  async (_req: CustomRequest, res: Response): Promise<void> => {
    Logger.info('Fetching field statistics');

    const stats = {
      total: fields.length,
      byType: Object.values(FieldType).reduce((acc: any, type) => {
        acc[type] = fields.filter(f => f.type === type).length;
        return acc;
      }, {}),
      byCategory: [...new Set(fields.map(f => f.category).filter(Boolean))].reduce(
        (acc: any, category) => {
          acc[category || 'Uncategorized'] = fields.filter(f => f.category === category).length;
          return acc;
        },
        {}
      ),
      required: fields.filter(f => f.isRequired).length,
      optional: fields.filter(f => !f.isRequired).length,
      totalUsage: fields.reduce((sum, f) => sum + f.usageCount, 0),
      avgUsagePerField:
        fields.length > 0
          ? Math.round(fields.reduce((sum, f) => sum + f.usageCount, 0) / fields.length)
          : 0
    };

    res.json(createResponse(true, stats));
  }
);

/**
 * Create new field (admin only)
 */
export const createField = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { name, displayName, type, description, category, isRequired, defaultValue, validationRules, metadata } = req.body;

    if (!name || !displayName || !type) {
      throw new OperationalError('Name, display name, and type are required', 400);
    }

    // Check if field name already exists
    if (fields.find(f => f.name === name)) {
      throw new OperationalError('Field with this name already exists', 409);
    }

    Logger.info('Creating new field', { name, type });

    const newField: Field = {
      id: generateId(),
      name,
      displayName,
      type,
      description,
      category,
      isRequired: isRequired || false,
      defaultValue,
      validationRules,
      metadata,
      usageCount: 0,
      createdAt: new Date()
    };

    fields.push(newField);

    res.status(201).json(createResponse(true, newField, 'Field created successfully'));
  }
);

/**
 * Update field (admin only)
 */
export const updateField = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;

    Logger.info(`Updating field ${id}`, updates);

    const index = fields.findIndex(f => f.id === id);

    if (index === -1) {
      throw new OperationalError('Field not found', 404);
    }

    // Prevent changing the name to one that already exists
    if (updates.name && updates.name !== fields[index].name) {
      if (fields.find(f => f.name === updates.name)) {
        throw new OperationalError('Field with this name already exists', 409);
      }
    }

    fields[index] = {
      ...fields[index],
      ...updates,
      id: fields[index].id, // Prevent ID change
      usageCount: fields[index].usageCount, // Preserve usage count
      createdAt: fields[index].createdAt // Preserve creation date
    };

    res.json(createResponse(true, fields[index], 'Field updated successfully'));
  }
);

/**
 * Delete field (admin only)
 */
export const deleteField = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    Logger.info(`Deleting field ${id}`);

    const index = fields.findIndex(f => f.id === id);

    if (index === -1) {
      throw new OperationalError('Field not found', 404);
    }

    fields.splice(index, 1);

    res.json(createResponse(true, null, 'Field deleted successfully'));
  }
);
