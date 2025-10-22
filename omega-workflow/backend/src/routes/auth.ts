import { Router } from 'express';
import { body } from 'express-validator';
import {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  deactivateUser
} from '../controllers/authController';
import { authenticate, isAdmin } from '../middleware/auth';
import { validate, validateId } from '../middleware/validation';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]),
  login
);

/**
 * @route   POST /api/auth/register
 * @desc    User registration
 * @access  Public
 */
router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username').notEmpty().withMessage('Username is required'),
    body('username').isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('username').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
  ]),
  register
);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  logout
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  validate([
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ]),
  refreshToken
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  getCurrentUser
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  validate([
    body('username').optional().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('username').optional().matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('firstName').optional().isLength({ max: 50 }).withMessage('First name must not exceed 50 characters'),
    body('lastName').optional().isLength({ max: 50 }).withMessage('Last name must not exceed 50 characters')
  ]),
  updateProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('newPassword').custom((value: string, { req }: any) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
  ]),
  changePassword
);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get(
  '/users',
  authenticate,
  isAdmin,
  getAllUsers
);

/**
 * @route   PUT /api/auth/users/:userId/role
 * @desc    Update user role (admin only)
 * @access  Private (Admin)
 */
router.put(
  '/users/:userId/role',
  authenticate,
  isAdmin,
  validateId('userId'),
  validate([
    body('role').isIn(['admin', 'user', 'viewer']).withMessage('Invalid role')
  ]),
  updateUserRole
);

/**
 * @route   POST /api/auth/users/:userId/deactivate
 * @desc    Deactivate user (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/users/:userId/deactivate',
  authenticate,
  isAdmin,
  validateId('userId'),
  deactivateUser
);

export default router;
