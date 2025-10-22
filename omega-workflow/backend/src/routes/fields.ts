import { Router } from 'express';
import { body } from 'express-validator';
import {
  searchFields,
  getFieldById,
  getFieldByName,
  getFieldCategories,
  getFieldTypes,
  getMostUsedFields,
  getRecentlyUsedFields,
  getFieldStats,
  createField,
  updateField,
  deleteField
} from '../controllers/fieldsController';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate, validateId, validatePagination } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/fields
 * @desc    Search fields with filters
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validatePagination,
  searchFields
);

/**
 * @route   GET /api/fields/stats
 * @desc    Get field statistics
 * @access  Private
 */
router.get(
  '/stats',
  authenticate,
  getFieldStats
);

/**
 * @route   GET /api/fields/categories
 * @desc    Get all field categories
 * @access  Private
 */
router.get(
  '/categories',
  authenticate,
  getFieldCategories
);

/**
 * @route   GET /api/fields/types
 * @desc    Get field types with counts
 * @access  Private
 */
router.get(
  '/types',
  authenticate,
  getFieldTypes
);

/**
 * @route   GET /api/fields/most-used
 * @desc    Get most used fields
 * @access  Private
 */
router.get(
  '/most-used',
  authenticate,
  getMostUsedFields
);

/**
 * @route   GET /api/fields/recently-used
 * @desc    Get recently used fields
 * @access  Private
 */
router.get(
  '/recently-used',
  authenticate,
  getRecentlyUsedFields
);

/**
 * @route   GET /api/fields/by-name/:name
 * @desc    Get field by name
 * @access  Private
 */
router.get(
  '/by-name/:name',
  authenticate,
  getFieldByName
);

/**
 * @route   GET /api/fields/:id
 * @desc    Get field details by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validateId('id'),
  getFieldById
);

/**
 * @route   POST /api/fields
 * @desc    Create new field (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticate,
  isAdmin,
  validate([
    body('name').notEmpty().withMessage('Field name is required'),
    body('name').matches(/^[a-zA-Z][a-zA-Z0-9_]*$/).withMessage('Invalid field name format'),
    body('displayName').notEmpty().withMessage('Display name is required'),
    body('type').isIn([
      'text',
      'number',
      'date',
      'boolean',
      'email',
      'url',
      'phone',
      'currency',
      'percentage',
      'array',
      'object'
    ]).withMessage('Invalid field type')
  ]),
  createField
);

/**
 * @route   PUT /api/fields/:id
 * @desc    Update field (admin only)
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticate,
  isAdmin,
  validateId('id'),
  validate([
    body('name').optional().matches(/^[a-zA-Z][a-zA-Z0-9_]*$/).withMessage('Invalid field name format'),
    body('type').optional().isIn([
      'text',
      'number',
      'date',
      'boolean',
      'email',
      'url',
      'phone',
      'currency',
      'percentage',
      'array',
      'object'
    ]).withMessage('Invalid field type')
  ]),
  updateField
);

/**
 * @route   DELETE /api/fields/:id
 * @desc    Delete field (admin only)
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validateId('id'),
  deleteField
);

export default router;
