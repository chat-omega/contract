import { Router } from 'express';
import { body } from 'express-validator';
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  assignWorkflow,
  unassignWorkflow,
  getWorkflowStats
} from '../controllers/workflowController';
import { authenticate, isAdminOrUser } from '../middleware/auth';
import { validate, validateId, validatePagination } from '../middleware/validation';

const router = Router();

/**
 * @route   GET /api/workflows
 * @desc    Get all workflows
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validatePagination,
  getWorkflows
);

/**
 * @route   GET /api/workflows/stats
 * @desc    Get workflow statistics
 * @access  Private
 */
router.get(
  '/stats',
  authenticate,
  getWorkflowStats
);

/**
 * @route   GET /api/workflows/:id
 * @desc    Get workflow by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validateId('id'),
  getWorkflowById
);

/**
 * @route   POST /api/workflows
 * @desc    Create new workflow
 * @access  Private (User or Admin)
 */
router.post(
  '/',
  authenticate,
  isAdminOrUser,
  validate([
    body('name').notEmpty().withMessage('Workflow name is required'),
    body('name').isLength({ max: 255 }).withMessage('Name must not exceed 255 characters'),
    body('steps').isArray({ min: 1 }).withMessage('At least one step is required'),
    body('steps.*.name').notEmpty().withMessage('Step name is required'),
    body('steps.*.type').isIn(['extraction', 'validation', 'transformation', 'scoring', 'notification'])
      .withMessage('Invalid step type')
  ]),
  createWorkflow
);

/**
 * @route   PUT /api/workflows/:id
 * @desc    Update workflow
 * @access  Private (User or Admin)
 */
router.put(
  '/:id',
  authenticate,
  isAdminOrUser,
  validateId('id'),
  validate([
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('status').optional().isIn(['active', 'inactive', 'draft', 'archived'])
      .withMessage('Invalid status'),
    body('steps').optional().isArray({ min: 1 }).withMessage('At least one step is required')
  ]),
  updateWorkflow
);

/**
 * @route   DELETE /api/workflows/:id
 * @desc    Delete workflow
 * @access  Private (User or Admin)
 */
router.delete(
  '/:id',
  authenticate,
  isAdminOrUser,
  validateId('id'),
  deleteWorkflow
);

/**
 * @route   POST /api/workflows/:id/assign
 * @desc    Assign workflow to documents
 * @access  Private (User or Admin)
 */
router.post(
  '/:id/assign',
  authenticate,
  isAdminOrUser,
  validateId('id'),
  validate([
    body('documentIds').isArray({ min: 1 }).withMessage('At least one document ID is required')
  ]),
  assignWorkflow
);

/**
 * @route   POST /api/workflows/:id/unassign
 * @desc    Unassign workflow from documents
 * @access  Private (User or Admin)
 */
router.post(
  '/:id/unassign',
  authenticate,
  isAdminOrUser,
  validateId('id'),
  validate([
    body('documentIds').isArray().withMessage('Document IDs array is required')
  ]),
  unassignWorkflow
);

export default router;
