import { Router } from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  extractDocument,
  getDocumentStats
} from '../controllers/documentController';
import { authenticate, isAdminOrUser } from '../middleware/auth';
import { validate, validateId, validatePagination } from '../middleware/validation';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * @route   GET /api/documents
 * @desc    Get all documents with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  validatePagination,
  getDocuments
);

/**
 * @route   GET /api/documents/stats
 * @desc    Get document statistics
 * @access  Private
 */
router.get(
  '/stats',
  authenticate,
  getDocumentStats
);

/**
 * @route   GET /api/documents/:id
 * @desc    Get single document by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validateId('id'),
  getDocumentById
);

/**
 * @route   POST /api/documents
 * @desc    Upload new document
 * @access  Private (User or Admin)
 */
router.post(
  '/',
  authenticate,
  isAdminOrUser,
  upload.single('file'),
  validate([
    body('name').notEmpty().withMessage('Document name is required'),
    body('name').isLength({ max: 255 }).withMessage('Name must not exceed 255 characters')
  ]),
  uploadDocument
);

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document
 * @access  Private (User or Admin)
 */
router.put(
  '/:id',
  authenticate,
  isAdminOrUser,
  validateId('id'),
  validate([
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('status').optional().isIn(['uploaded', 'processing', 'processed', 'failed', 'archived'])
      .withMessage('Invalid status')
  ]),
  updateDocument
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document
 * @access  Private (User or Admin)
 */
router.delete(
  '/:id',
  authenticate,
  isAdminOrUser,
  validateId('id'),
  deleteDocument
);

/**
 * @route   POST /api/documents/:id/extract
 * @desc    Trigger document extraction
 * @access  Private (User or Admin)
 */
router.post(
  '/:id/extract',
  authenticate,
  isAdminOrUser,
  validateId('id'),
  extractDocument
);

export default router;
