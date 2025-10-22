import { Router } from 'express';
import { body } from 'express-validator';
import {
  getScoringProfiles,
  getScoringProfileById,
  createScoringProfile,
  updateScoringProfile,
  deleteScoringProfile,
  getScoringResults,
  scoreDocument
} from '../controllers/scoringController';
import { authenticate, isAdminOrUser } from '../middleware/auth';
import { validate, validateId, validatePagination } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/scoring/profiles
 * @desc    Get all scoring profiles
 * @access  Private
 */
router.get(
  '/profiles',
  authenticate,
  validatePagination,
  getScoringProfiles
);

/**
 * @route   GET /api/scoring/profiles/:id
 * @desc    Get scoring profile by ID
 * @access  Private
 */
router.get(
  '/profiles/:id',
  authenticate,
  validateId('id'),
  getScoringProfileById
);

/**
 * @route   POST /api/scoring/profiles
 * @desc    Create new scoring profile
 * @access  Private (User or Admin)
 */
router.post(
  '/profiles',
  authenticate,
  isAdminOrUser,
  validate([
    body('name').notEmpty().withMessage('Profile name is required'),
    body('name').isLength({ max: 255 }).withMessage('Name must not exceed 255 characters'),
    body('criteria').isArray({ min: 1 }).withMessage('At least one criteria is required'),
    body('criteria.*.name').notEmpty().withMessage('Criteria name is required'),
    body('criteria.*.field').notEmpty().withMessage('Criteria field is required'),
    body('criteria.*.weight').isNumeric().withMessage('Weight must be a number'),
    body('criteria.*.operator').isIn([
      'equals',
      'not_equals',
      'greater_than',
      'less_than',
      'contains',
      'not_contains',
      'regex'
    ]).withMessage('Invalid operator')
  ]),
  createScoringProfile
);

/**
 * @route   PUT /api/scoring/profiles/:id
 * @desc    Update scoring profile
 * @access  Private (User or Admin)
 */
router.put(
  '/profiles/:id',
  authenticate,
  isAdminOrUser,
  validateId('id'),
  validate([
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('criteria').optional().isArray({ min: 1 }).withMessage('At least one criteria is required'),
    body('weightingMethod').optional().isIn(['equal', 'weighted', 'prioritized'])
      .withMessage('Invalid weighting method')
  ]),
  updateScoringProfile
);

/**
 * @route   DELETE /api/scoring/profiles/:id
 * @desc    Delete scoring profile
 * @access  Private (User or Admin)
 */
router.delete(
  '/profiles/:id',
  authenticate,
  isAdminOrUser,
  validateId('id'),
  deleteScoringProfile
);

/**
 * @route   GET /api/scoring/results/:documentId
 * @desc    Get scoring results for a document
 * @access  Private
 */
router.get(
  '/results/:documentId',
  authenticate,
  validateId('documentId'),
  getScoringResults
);

/**
 * @route   POST /api/scoring/score
 * @desc    Score a document with a specific profile
 * @access  Private (User or Admin)
 */
router.post(
  '/score',
  authenticate,
  isAdminOrUser,
  validate([
    body('documentId').notEmpty().withMessage('Document ID is required'),
    body('profileId').notEmpty().withMessage('Profile ID is required')
  ]),
  scoreDocument
);

export default router;
