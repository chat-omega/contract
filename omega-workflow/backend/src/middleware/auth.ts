import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomRequest, User, UserRole, JwtPayload } from '../types';
import { OperationalError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate JWT access token
 */
export const generateAccessToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (user: User): string => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new OperationalError('Invalid or expired token', 401);
  }
};

/**
 * Authentication middleware - validates JWT token
 */
export const authenticate = async (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new OperationalError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Mock user data (in production, fetch from database)
    const user: User = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.email.split('@')[0],
      firstName: 'John',
      lastName: 'Doe',
      role: decoded.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      const user: User = {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.email.split('@')[0],
        firstName: 'John',
        lastName: 'Doe',
        role: decoded.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

/**
 * Role-based access control middleware
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: CustomRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new OperationalError('Authentication required', 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new OperationalError(
          'You do not have permission to access this resource',
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize(UserRole.ADMIN);

/**
 * Check if user is admin or regular user
 */
export const isAdminOrUser = authorize(UserRole.ADMIN, UserRole.USER);

/**
 * Require active user account
 */
export const requireActiveUser = (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      throw new OperationalError('Authentication required', 401);
    }

    if (!req.user.isActive) {
      throw new OperationalError('Your account has been deactivated', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
