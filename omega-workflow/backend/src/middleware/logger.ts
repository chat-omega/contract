import { Request, Response, NextFunction } from 'express';

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  query: any;
  ip: string;
  userAgent: string;
  statusCode?: number;
  responseTime?: number;
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log request details
  const requestLog: RequestLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('user-agent') || 'unknown'
  };

  // Log on response finish
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    requestLog.statusCode = res.statusCode;
    requestLog.responseTime = responseTime;

    // Color-coded console logging based on status code
    const statusColor = getStatusColor(res.statusCode);
    const methodColor = getMethodColor(req.method);

    console.log(
      `[${requestLog.timestamp}] ${methodColor}${req.method}\x1b[0m ${req.path} ${statusColor}${res.statusCode}\x1b[0m - ${responseTime}ms`
    );
  });

  next();
};

// Helper function to get color based on status code
const getStatusColor = (statusCode: number): string => {
  if (statusCode >= 500) return '\x1b[31m'; // Red
  if (statusCode >= 400) return '\x1b[33m'; // Yellow
  if (statusCode >= 300) return '\x1b[36m'; // Cyan
  if (statusCode >= 200) return '\x1b[32m'; // Green
  return '\x1b[0m'; // Default
};

// Helper function to get color based on HTTP method
const getMethodColor = (method: string): string => {
  switch (method) {
    case 'GET':
      return '\x1b[34m'; // Blue
    case 'POST':
      return '\x1b[32m'; // Green
    case 'PUT':
      return '\x1b[33m'; // Yellow
    case 'DELETE':
      return '\x1b[31m'; // Red
    case 'PATCH':
      return '\x1b[35m'; // Magenta
    default:
      return '\x1b[0m'; // Default
  }
};

// Advanced logger that can write to files or external services
export class Logger {
  static info(message: string, meta?: any): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  static error(message: string, error?: Error | any): void {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error?.stack || error || ''
    );
  }

  static warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  static debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
    }
  }
}
