import { Response } from 'express';
import {
  CustomRequest,
  ScoringProfile,
  ScoringResult,
  WeightingMethod,
  ComparisonOperator
} from '../types';
import { createResponse, createPaginatedResponse, parsePaginationParams, generateId } from '../utils';
import { OperationalError, asyncHandler } from '../middleware/errorHandler';
import { Logger } from '../middleware/logger';

// Mock data stores
let scoringProfiles: ScoringProfile[] = [
  {
    id: 'profile-1',
    name: 'Contract Quality Assessment',
    description: 'Evaluates contract completeness and quality',
    criteria: [
      {
        id: 'criteria-1',
        name: 'Has All Parties',
        field: 'extractedData.parties',
        weight: 20,
        operator: ComparisonOperator.CONTAINS,
        expectedValue: null,
        scoreIfMatch: 20,
        scoreIfNoMatch: 0
      },
      {
        id: 'criteria-2',
        name: 'Has Effective Date',
        field: 'extractedData.effectiveDate',
        weight: 15,
        operator: ComparisonOperator.NOT_EQUALS,
        expectedValue: null,
        scoreIfMatch: 15,
        scoreIfNoMatch: 0
      },
      {
        id: 'criteria-3',
        name: 'Amount Above Threshold',
        field: 'extractedData.amount',
        weight: 25,
        operator: ComparisonOperator.GREATER_THAN,
        expectedValue: 10000,
        scoreIfMatch: 25,
        scoreIfNoMatch: 10
      },
      {
        id: 'criteria-4',
        name: 'Has Terms',
        field: 'extractedData.terms',
        weight: 20,
        operator: ComparisonOperator.NOT_EQUALS,
        expectedValue: null,
        scoreIfMatch: 20,
        scoreIfNoMatch: 0
      },
      {
        id: 'criteria-5',
        name: 'Properly Tagged',
        field: 'tags',
        weight: 20,
        operator: ComparisonOperator.CONTAINS,
        expectedValue: 'contract',
        scoreIfMatch: 20,
        scoreIfNoMatch: 5
      }
    ],
    weightingMethod: WeightingMethod.WEIGHTED,
    thresholds: [
      { level: 'Excellent', minScore: 90, maxScore: 100, action: 'auto-approve' },
      { level: 'Good', minScore: 75, maxScore: 89, action: 'review' },
      { level: 'Fair', minScore: 50, maxScore: 74, action: 'review' },
      { level: 'Poor', minScore: 0, maxScore: 49, action: 'reject' }
    ],
    isActive: true,
    createdBy: 'user-1',
    createdAt: new Date('2025-10-05T09:00:00Z'),
    updatedAt: new Date('2025-10-05T09:00:00Z')
  },
  {
    id: 'profile-2',
    name: 'Invoice Accuracy Check',
    description: 'Validates invoice data accuracy',
    criteria: [
      {
        id: 'criteria-1',
        name: 'Has Invoice Number',
        field: 'extractedData.invoiceNumber',
        weight: 30,
        operator: ComparisonOperator.NOT_EQUALS,
        expectedValue: null,
        scoreIfMatch: 30,
        scoreIfNoMatch: 0
      },
      {
        id: 'criteria-2',
        name: 'Has Valid Date',
        field: 'extractedData.date',
        weight: 25,
        operator: ComparisonOperator.NOT_EQUALS,
        expectedValue: null,
        scoreIfMatch: 25,
        scoreIfNoMatch: 0
      },
      {
        id: 'criteria-3',
        name: 'Has Amount',
        field: 'extractedData.amount',
        weight: 25,
        operator: ComparisonOperator.GREATER_THAN,
        expectedValue: 0,
        scoreIfMatch: 25,
        scoreIfNoMatch: 0
      },
      {
        id: 'criteria-4',
        name: 'Has Vendor',
        field: 'extractedData.vendor',
        weight: 20,
        operator: ComparisonOperator.NOT_EQUALS,
        expectedValue: null,
        scoreIfMatch: 20,
        scoreIfNoMatch: 0
      }
    ],
    weightingMethod: WeightingMethod.WEIGHTED,
    thresholds: [
      { level: 'Complete', minScore: 90, maxScore: 100 },
      { level: 'Incomplete', minScore: 0, maxScore: 89 }
    ],
    isActive: true,
    createdBy: 'user-1',
    createdAt: new Date('2025-10-08T11:00:00Z'),
    updatedAt: new Date('2025-10-08T11:00:00Z')
  }
];

let scoringResults: ScoringResult[] = [];

/**
 * Get all scoring profiles
 */
export const getScoringProfiles = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(req.query);
    const isActive = req.query.isActive === 'true';

    Logger.info('Fetching scoring profiles', { isActive, page, limit });

    let filtered = [...scoringProfiles];

    if (req.query.isActive !== undefined) {
      filtered = filtered.filter(profile => profile.isActive === isActive);
    }

    // Sort profiles
    filtered.sort((a, b) => {
      const aValue = (a as any)[sortBy] || a.createdAt;
      const bValue = (b as any)[sortBy] || b.createdAt;

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
 * Get scoring profile by ID
 */
export const getScoringProfileById = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    Logger.info(`Fetching scoring profile ${id}`);

    const profile = scoringProfiles.find(p => p.id === id);

    if (!profile) {
      throw new OperationalError('Scoring profile not found', 404);
    }

    res.json(createResponse(true, profile));
  }
);

/**
 * Create scoring profile
 */
export const createScoringProfile = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { name, description, criteria, weightingMethod, thresholds } = req.body;

    if (!name) {
      throw new OperationalError('Profile name is required', 400);
    }

    if (!criteria || !Array.isArray(criteria) || criteria.length === 0) {
      throw new OperationalError('At least one scoring criteria is required', 400);
    }

    Logger.info('Creating new scoring profile', { name });

    const newProfile: ScoringProfile = {
      id: generateId(),
      name,
      description,
      criteria: criteria.map((c: any) => ({
        id: c.id || generateId(),
        name: c.name,
        field: c.field,
        weight: c.weight || 10,
        operator: c.operator || ComparisonOperator.EQUALS,
        expectedValue: c.expectedValue,
        scoreIfMatch: c.scoreIfMatch || c.weight || 10,
        scoreIfNoMatch: c.scoreIfNoMatch || 0
      })),
      weightingMethod: weightingMethod || WeightingMethod.WEIGHTED,
      thresholds,
      isActive: true,
      createdBy: req.user?.id || 'anonymous',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    scoringProfiles.push(newProfile);

    res.status(201).json(createResponse(true, newProfile, 'Scoring profile created successfully'));
  }
);

/**
 * Update scoring profile
 */
export const updateScoringProfile = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, description, criteria, weightingMethod, thresholds, isActive } = req.body;

    Logger.info(`Updating scoring profile ${id}`, req.body);

    const index = scoringProfiles.findIndex(p => p.id === id);

    if (index === -1) {
      throw new OperationalError('Scoring profile not found', 404);
    }

    const updatedProfile: ScoringProfile = {
      ...scoringProfiles[index],
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(criteria && {
        criteria: criteria.map((c: any) => ({
          id: c.id || generateId(),
          name: c.name,
          field: c.field,
          weight: c.weight || 10,
          operator: c.operator || ComparisonOperator.EQUALS,
          expectedValue: c.expectedValue,
          scoreIfMatch: c.scoreIfMatch || c.weight || 10,
          scoreIfNoMatch: c.scoreIfNoMatch || 0
        }))
      }),
      ...(weightingMethod && { weightingMethod }),
      ...(thresholds && { thresholds }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date()
    };

    scoringProfiles[index] = updatedProfile;

    res.json(createResponse(true, updatedProfile, 'Scoring profile updated successfully'));
  }
);

/**
 * Delete scoring profile
 */
export const deleteScoringProfile = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    Logger.info(`Deleting scoring profile ${id}`);

    const index = scoringProfiles.findIndex(p => p.id === id);

    if (index === -1) {
      throw new OperationalError('Scoring profile not found', 404);
    }

    scoringProfiles.splice(index, 1);

    res.json(createResponse(true, null, 'Scoring profile deleted successfully'));
  }
);

/**
 * Get scoring results for a document
 */
export const getScoringResults = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { documentId } = req.params;

    Logger.info(`Fetching scoring results for document ${documentId}`);

    const results = scoringResults.filter(r => r.documentId === documentId);

    res.json(createResponse(true, results));
  }
);

/**
 * Calculate score for a document (helper function)
 */
const calculateScore = (document: any, profile: ScoringProfile): ScoringResult => {
  const criteriaResults = profile.criteria.map(criteria => {
    const fieldValue = getNestedValue(document, criteria.field);
    const matched = evaluateCriteria(fieldValue, criteria.operator, criteria.expectedValue);

    return {
      criteriaId: criteria.id,
      criteriaName: criteria.name,
      matched,
      score: matched ? criteria.scoreIfMatch : criteria.scoreIfNoMatch,
      actualValue: fieldValue,
      expectedValue: criteria.expectedValue
    };
  });

  const totalScore = criteriaResults.reduce((sum, result) => sum + result.score, 0);
  const maxPossibleScore = profile.criteria.reduce((sum, c) => sum + c.scoreIfMatch, 0);
  const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  // Determine threshold level
  let threshold = 'Unknown';
  if (profile.thresholds) {
    const matchedThreshold = profile.thresholds.find(
      t => percentage >= t.minScore && percentage <= t.maxScore
    );
    if (matchedThreshold) {
      threshold = matchedThreshold.level;
    }
  }

  return {
    documentId: document.id,
    profileId: profile.id,
    totalScore,
    maxPossibleScore,
    percentage: Math.round(percentage * 100) / 100,
    criteriaResults,
    threshold,
    recommendations: generateRecommendations(criteriaResults),
    calculatedAt: new Date()
  };
};

/**
 * Get nested object value by path
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Evaluate criteria based on operator
 */
const evaluateCriteria = (actualValue: any, operator: ComparisonOperator, expectedValue: any): boolean => {
  switch (operator) {
    case ComparisonOperator.EQUALS:
      return actualValue === expectedValue;
    case ComparisonOperator.NOT_EQUALS:
      return actualValue !== expectedValue && actualValue !== null && actualValue !== undefined;
    case ComparisonOperator.GREATER_THAN:
      return Number(actualValue) > Number(expectedValue);
    case ComparisonOperator.LESS_THAN:
      return Number(actualValue) < Number(expectedValue);
    case ComparisonOperator.CONTAINS:
      if (Array.isArray(actualValue)) {
        return expectedValue ? actualValue.includes(expectedValue) : actualValue.length > 0;
      }
      return String(actualValue).includes(String(expectedValue));
    case ComparisonOperator.NOT_CONTAINS:
      if (Array.isArray(actualValue)) {
        return !actualValue.includes(expectedValue);
      }
      return !String(actualValue).includes(String(expectedValue));
    case ComparisonOperator.REGEX:
      return new RegExp(expectedValue).test(String(actualValue));
    default:
      return false;
  }
};

/**
 * Generate recommendations based on failed criteria
 */
const generateRecommendations = (criteriaResults: any[]): string[] => {
  const recommendations: string[] = [];

  criteriaResults.forEach(result => {
    if (!result.matched) {
      recommendations.push(`Improve: ${result.criteriaName}`);
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('Document meets all criteria');
  }

  return recommendations;
};

/**
 * Score a document with a specific profile
 */
export const scoreDocument = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { documentId, profileId } = req.body;

    if (!documentId || !profileId) {
      throw new OperationalError('Document ID and Profile ID are required', 400);
    }

    Logger.info(`Scoring document ${documentId} with profile ${profileId}`);

    const profile = scoringProfiles.find(p => p.id === profileId);
    if (!profile) {
      throw new OperationalError('Scoring profile not found', 404);
    }

    // Mock document (in production, fetch from database)
    const mockDocument = {
      id: documentId,
      name: 'Sample Document',
      extractedData: {
        parties: ['Company A', 'Company B'],
        effectiveDate: '2025-01-01',
        amount: 50000,
        terms: 'Sample terms'
      },
      tags: ['contract', 'legal']
    };

    const result = calculateScore(mockDocument, profile);

    // Save result
    scoringResults.push(result);

    res.json(createResponse(true, result, 'Document scored successfully'));
  }
);
