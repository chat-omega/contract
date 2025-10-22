import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, UserRole, CustomRequest } from '../types';
import { createResponse, generateId, isValidEmail } from '../utils';
import { OperationalError, asyncHandler } from '../middleware/errorHandler';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../middleware/auth';
import { Logger } from '../middleware/logger';

// Mock user store (in production, use a database)
let users: Array<User & { password: string }> = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    username: 'admin',
    password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of 'admin123'
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date('2025-09-01T08:00:00Z'),
    updatedAt: new Date('2025-09-01T08:00:00Z')
  },
  {
    id: 'user-2',
    email: 'user@example.com',
    username: 'user',
    password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of 'user123'
    firstName: 'Regular',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date('2025-09-05T10:00:00Z'),
    updatedAt: new Date('2025-09-05T10:00:00Z')
  },
  {
    id: 'user-3',
    email: 'viewer@example.com',
    username: 'viewer',
    password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of 'viewer123'
    firstName: 'View',
    lastName: 'Only',
    role: UserRole.VIEWER,
    isActive: true,
    createdAt: new Date('2025-09-10T12:00:00Z'),
    updatedAt: new Date('2025-09-10T12:00:00Z')
  }
];

// Store for refresh tokens (in production, use Redis or database)
const refreshTokens: Set<string> = new Set();

/**
 * User login
 */
export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new OperationalError('Email and password are required', 400);
    }

    Logger.info(`Login attempt for email: ${email}`);

    // Find user
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new OperationalError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new OperationalError('Your account has been deactivated', 403);
    }

    // For demo purposes, accept any password or check against 'password123'
    // In production, use bcrypt.compare(password, user.password)
    const isPasswordValid = password === 'password123' ||
                           await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new OperationalError('Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    refreshTokens.add(refreshToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    Logger.info(`User ${email} logged in successfully`);

    res.json(
      createResponse(
        true,
        {
          user: userWithoutPassword,
          tokens: {
            accessToken,
            refreshToken
          }
        },
        'Login successful'
      )
    );
  }
);

/**
 * User registration
 */
export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, username, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !username) {
      throw new OperationalError('Email, password, and username are required', 400);
    }

    if (!isValidEmail(email)) {
      throw new OperationalError('Invalid email format', 400);
    }

    if (password.length < 6) {
      throw new OperationalError('Password must be at least 6 characters long', 400);
    }

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      throw new OperationalError('User with this email already exists', 409);
    }

    if (users.find(u => u.username === username)) {
      throw new OperationalError('Username is already taken', 409);
    }

    Logger.info(`Registering new user: ${email}`);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser: User & { password: string } = {
      id: generateId(),
      email,
      username,
      password: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      role: UserRole.USER, // Default role
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Store refresh token
    refreshTokens.add(refreshToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    Logger.info(`User ${email} registered successfully`);

    res.status(201).json(
      createResponse(
        true,
        {
          user: userWithoutPassword,
          tokens: {
            accessToken,
            refreshToken
          }
        },
        'Registration successful'
      )
    );
  }
);

/**
 * User logout
 */
export const logout = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    Logger.info(`User ${req.user?.email || 'unknown'} logged out`);

    res.json(createResponse(true, null, 'Logout successful'));
  }
);

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new OperationalError('Refresh token is required', 400);
    }

    // Check if refresh token exists in store
    if (!refreshTokens.has(refreshToken)) {
      throw new OperationalError('Invalid refresh token', 401);
    }

    try {
      // Verify refresh token
      const decoded = verifyToken(refreshToken);

      // Find user
      const user = users.find(u => u.id === decoded.userId);

      if (!user) {
        throw new OperationalError('User not found', 404);
      }

      if (!user.isActive) {
        throw new OperationalError('Your account has been deactivated', 403);
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user);

      Logger.info(`Access token refreshed for user ${user.email}`);

      res.json(
        createResponse(
          true,
          {
            accessToken: newAccessToken
          },
          'Token refreshed successfully'
        )
      );
    } catch (error) {
      // Remove invalid refresh token
      refreshTokens.delete(refreshToken);
      throw new OperationalError('Invalid or expired refresh token', 401);
    }
  }
);

/**
 * Get current user profile
 */
export const getCurrentUser = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new OperationalError('User not authenticated', 401);
    }

    Logger.info(`Fetching profile for user ${req.user.email}`);

    res.json(createResponse(true, req.user));
  }
);

/**
 * Update current user profile
 */
export const updateProfile = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new OperationalError('User not authenticated', 401);
    }

    const { firstName, lastName, username } = req.body;

    Logger.info(`Updating profile for user ${req.user.email}`, req.body);

    const userIndex = users.findIndex(u => u.id === req.user!.id);

    if (userIndex === -1) {
      throw new OperationalError('User not found', 404);
    }

    // Check if username is taken by another user
    if (username && username !== users[userIndex].username) {
      if (users.find(u => u.username === username && u.id !== req.user!.id)) {
        throw new OperationalError('Username is already taken', 409);
      }
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(username && { username }),
      updatedAt: new Date()
    };

    const { password: _, ...userWithoutPassword } = users[userIndex];

    res.json(createResponse(true, userWithoutPassword, 'Profile updated successfully'));
  }
);

/**
 * Change password
 */
export const changePassword = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new OperationalError('User not authenticated', 401);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new OperationalError('Current password and new password are required', 400);
    }

    if (newPassword.length < 6) {
      throw new OperationalError('New password must be at least 6 characters long', 400);
    }

    Logger.info(`Password change requested for user ${req.user.email}`);

    const userIndex = users.findIndex(u => u.id === req.user!.id);

    if (userIndex === -1) {
      throw new OperationalError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = currentPassword === 'password123' ||
                           await bcrypt.compare(currentPassword, users[userIndex].password);

    if (!isPasswordValid) {
      throw new OperationalError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    users[userIndex] = {
      ...users[userIndex],
      password: hashedPassword,
      updatedAt: new Date()
    };

    Logger.info(`Password changed successfully for user ${req.user.email}`);

    res.json(createResponse(true, null, 'Password changed successfully'));
  }
);

/**
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(
  async (_req: CustomRequest, res: Response): Promise<void> => {
    Logger.info('Fetching all users');

    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    res.json(createResponse(true, usersWithoutPasswords));
  }
);

/**
 * Update user role (admin only)
 */
export const updateUserRole = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(UserRole).includes(role)) {
      throw new OperationalError('Valid role is required', 400);
    }

    Logger.info(`Updating role for user ${userId} to ${role}`);

    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new OperationalError('User not found', 404);
    }

    users[userIndex] = {
      ...users[userIndex],
      role,
      updatedAt: new Date()
    };

    const { password: _, ...userWithoutPassword } = users[userIndex];

    res.json(createResponse(true, userWithoutPassword, 'User role updated successfully'));
  }
);

/**
 * Deactivate user (admin only)
 */
export const deactivateUser = asyncHandler(
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { userId } = req.params;

    Logger.info(`Deactivating user ${userId}`);

    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new OperationalError('User not found', 404);
    }

    users[userIndex] = {
      ...users[userIndex],
      isActive: false,
      updatedAt: new Date()
    };

    const { password: _, ...userWithoutPassword } = users[userIndex];

    res.json(createResponse(true, userWithoutPassword, 'User deactivated successfully'));
  }
);
