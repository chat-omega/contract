import { Request, Response, NextFunction } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';
import { OperationalError } from './errorHandler';

/**
 * Validates request using express-validator rules
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error: any) => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg
      }));

      throw new OperationalError(
        `Validation failed: ${formattedErrors.map((e: any) => e.message).join(', ')}`,
        422
      );
    }

    next();
  };
};

/**
 * Sanitize request body by removing undefined and null values
 */
export const sanitizeBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === undefined || req.body[key] === null) {
        delete req.body[key];
      }
    });
  }
  next();
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const page = parseInt(req.query.page as string);
  const limit = parseInt(req.query.limit as string);

  if (page && (isNaN(page) || page < 1)) {
    throw new OperationalError('Page must be a positive integer', 400);
  }

  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    throw new OperationalError('Limit must be between 1 and 100', 400);
  }

  next();
};

/**
 * Validate ObjectId format (MongoDB-style ID)
 */
export const isValidId = (id: string): boolean => {
  // Simple validation for UUID or timestamp-based IDs
  return /^[a-zA-Z0-9-_]+$/.test(id) && id.length > 0;
};

/**
 * Validate ID parameter middleware
 */
export const validateId = (paramName: string = 'id') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const id = req.params[paramName];

    if (!id || !isValidId(id)) {
      throw new OperationalError(`Invalid ${paramName} format`, 400);
    }

    next();
  };
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.file && !req.files) {
    throw new OperationalError('No file uploaded', 400);
  }

  const file = req.file || (Array.isArray(req.files) ? req.files[0] : null);

  if (!file) {
    throw new OperationalError('No file uploaded', 400);
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new OperationalError('File size exceeds 10MB limit', 400);
  }

  // Validate file type (common document types)
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new OperationalError('Invalid file type', 400);
  }

  next();
};

/**
 * Wrap validation middleware with error handling
 */
export const validationHandler = (
  validations: ValidationChain[]
) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await validate(validations)(req, _res, next);
    } catch (error) {
      next(error);
    }
  };
};
