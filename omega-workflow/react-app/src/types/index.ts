/**
 * Core TypeScript Type Definitions
 * Matches backend FastAPI data models
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: number;
  username: string;
  email?: string;
  created_at?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

// ============================================================================
// Document Types
// ============================================================================

export interface Document {
  id: string;
  user_id: number;
  name: string;
  filename: string;
  size: number;
  doc_type: string;
  file_path: string;
  upload_date: string;
  updated_at: string;
  // Additional fields from backend
  uploadedBy?: string;  // User who uploaded the document
  workflows?: number[];  // Array of workflow IDs
  workflowNames?: string[];  // Array of workflow names (for display)
  reviewers?: string[];  // Array of reviewer names/emails (future feature)
}

export interface DocumentUpload {
  file: File;
  doc_type: string;
}

// ============================================================================
// Workflow Types
// ============================================================================

export interface Field {
  id: string;
  field_id?: string;  // Backend uses field_id
  name: string;
  description?: string;
  category?: string;
  type?: string;  // Field type: text, date, etc.
  field_type?: string;  // Alias for type
  tags?: string[];
  region?: string;
  document_types?: Array<{ classifications: string[]; percentage: number }> | string[];  // Support both formats
  languages?: Array<{ language: string; percentage: number }>;
  jurisdictions?: Array<{
    country: { code: string; name: string };
    regions?: string[];
  }>;
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  fields: Field[] | string[] | Record<string, Field[]>;  // Array of Field objects, field IDs, or categorized fields
  fieldCount?: number;  // Backend-calculated field count
  created_at?: string;
  updated_at?: string;
  user_id?: number;
  documentType?: string;  // Legacy singular (deprecated)
  documentTypes?: string[];  // Current plural format
  notes?: string;
  scoringEnabled?: boolean;
  scoringProfile?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: string[];  // Array of field names
  fieldCategories?: Record<string, string[]>;  // Category name -> field names
  documentTypes: string[];  // Array of document type codes
}

export interface DocumentWorkflow {
  document_id: string;
  workflow_id: number;
  assigned_at: string;
}

// ============================================================================
// Extraction Types
// ============================================================================

export interface BoundingBox {
  left: number;
  bottom: number;
  right: number;
  top: number;
}

// Import BBox type from pdf.ts to maintain consistency across the app
import type { BBox } from './pdf';

export interface Extraction {
  text: string;
  page: number;
  bbox: BBox | null;  // Use BBox instead of BboxArray for consistency
  confidence?: number;
  spans?: any[];
}

export interface FieldExtraction {
  field_id: string;
  field_name?: string;
  extractions: Extraction[];
  metadata?: Record<string, any>;

  // Answer-type field support (for fields with predefined options)
  hasAnswers?: boolean;
  answers?: Array<{
    option: string;  // e.g., "c"
    value: string;   // e.g., "Assignable with consent"
  }>;
  answerOptions?: Record<string, string>;  // e.g., {a: "Yes", b: "No", c: "Assignable with consent"}
}

export interface ExtractionResult {
  document_id: string;
  workflow_id: number;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  results: Record<string, FieldExtraction>;  // field_id -> extractions
  error_message?: string;
  created_at?: string;  // Optional - backend may return null
  started_at?: string;
  completed_at?: string;
}

export interface ExtractionStatus {
  extraction_id: number;
  document_id: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  progress?: number;
  message?: string;
}

// ============================================================================
// Credit Analysis Types
// ============================================================================

export interface CreditAnalysisRequest {
  company: string;
  documents?: string[];  // Document IDs
  research_type: 'fast' | 'deep';
}

export interface CreditMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface CreditReport {
  company: string;
  rating: string;
  pod: number;  // Probability of Default
  z_spread: number;
  metrics: CreditMetric[];
  analysis: string;
  generated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface TableState {
  pagination: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams;
}

export interface ModalState {
  isOpen: boolean;
  data?: any;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'file';
  value: T;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ============================================================================
// Component Prop Types
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'error' | 'success';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// Constants
// ============================================================================

export const DOCUMENT_TYPES = ['PDF', 'DOC', 'DOCX', 'TXT'] as const;
export type DocumentType = typeof DOCUMENT_TYPES[number];

export const EXTRACTION_STATUS = ['pending', 'processing', 'complete', 'failed'] as const;
export type ExtractionStatusType = typeof EXTRACTION_STATUS[number];

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = typeof USER_ROLES[number];

// ============================================================================
// PDF Types
// ============================================================================

export * from './pdf';
