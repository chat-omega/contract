// Common type definitions for the application
import { Request } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  status: string;
  message: string;
  stack?: string;
  error?: any;
}

// Common HTTP status codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

// Environment configuration type
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  CORS_ORIGIN: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  API_KEY?: string;
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Extend Express Request type with custom properties
export interface CustomRequest extends Request {
  user?: User;
  requestId?: string;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: Date;
  processedAt?: Date;
  extractedData?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];
  workflowId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

export interface DocumentFilter {
  status?: DocumentStatus;
  uploadedBy?: string;
  workflowId?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface ExtractionRequest {
  documentId: string;
  extractionType?: string;
  options?: Record<string, any>;
}

// Workflow Types
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  createdBy: string;
  assignedDocuments: string[];
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  order: number;
  config?: Record<string, any>;
  condition?: string;
}

export enum StepType {
  EXTRACTION = 'extraction',
  VALIDATION = 'validation',
  TRANSFORMATION = 'transformation',
  SCORING = 'scoring',
  NOTIFICATION = 'notification'
}

export enum WorkflowStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}

export interface WorkflowAssignment {
  workflowId: string;
  documentIds: string[];
}

// Scoring Types
export interface ScoringProfile {
  id: string;
  name: string;
  description?: string;
  criteria: ScoringCriteria[];
  weightingMethod: WeightingMethod;
  thresholds?: ScoreThreshold[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoringCriteria {
  id: string;
  name: string;
  field: string;
  weight: number;
  operator: ComparisonOperator;
  expectedValue?: any;
  scoreIfMatch: number;
  scoreIfNoMatch: number;
}

export enum WeightingMethod {
  EQUAL = 'equal',
  WEIGHTED = 'weighted',
  PRIORITIZED = 'prioritized'
}

export enum ComparisonOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  REGEX = 'regex'
}

export interface ScoreThreshold {
  level: string;
  minScore: number;
  maxScore: number;
  action?: string;
}

export interface ScoringResult {
  documentId: string;
  profileId: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  criteriaResults: CriteriaResult[];
  threshold?: string;
  recommendations?: string[];
  calculatedAt: Date;
}

export interface CriteriaResult {
  criteriaId: string;
  criteriaName: string;
  matched: boolean;
  score: number;
  actualValue?: any;
  expectedValue?: any;
}

// Field Discovery Types
export interface Field {
  id: string;
  name: string;
  displayName: string;
  type: FieldType;
  description?: string;
  category?: string;
  isRequired: boolean;
  defaultValue?: any;
  validationRules?: ValidationRule[];
  metadata?: Record<string, any>;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
}

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  ARRAY = 'array',
  OBJECT = 'object'
}

export interface ValidationRule {
  type: string;
  value?: any;
  message?: string;
}

export interface FieldFilter {
  type?: FieldType;
  category?: string;
  isRequired?: boolean;
  search?: string;
}
