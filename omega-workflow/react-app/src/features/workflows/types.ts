/**
 * Workflow Feature Types
 * Wizard-specific types and interfaces
 */

import type { Field, Workflow } from '@/types';

/**
 * Workflow Session (backend session state)
 */
export interface WorkflowSession {
  id: string;
  name: string;
  fields: Field[] | { [category: string]: Field[] };
  description: string;
  documentTypes: string[];
  scoringProfiles: ScoringProfile[];
  scoringEnabled?: boolean;
  status: 'draft' | 'active';
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
}

/**
 * Scoring Profile
 */
export interface ScoringProfile {
  name: string;
  rules: ScoringRule[];
  thresholds?: ScoringThresholds;
  enabled?: boolean;
}

/**
 * Scoring Rule
 */
export interface ScoringRule {
  fieldId: string;
  condition: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value?: string | number | boolean;
  score: number;
  weight?: number;
}

/**
 * Scoring Thresholds
 */
export interface ScoringThresholds {
  high: number;
  medium: number;
  low: number;
}

/**
 * Wizard Form Data
 */
export interface WizardFormData {
  name: string;
  description: string;
  selectedTemplateId: string | null;
  selectedFields: Field[];
  documentTypes: string[];
  scoringProfiles: ScoringProfile[];
  scoringEnabled: boolean;
}

/**
 * Wizard Step Validation
 */
export interface WizardValidation {
  step1: boolean; // Name & Template
  step2: boolean; // Field Selection
  step3: boolean; // Details
  step4: boolean; // Scoring
  step5: boolean; // Review
}

/**
 * Wizard State
 */
export interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  sessionId: string | null;
  isInitialized: boolean;
  formData: WizardFormData;
  validation: WizardValidation;
  isSaving: boolean;
  error: string | null;
}

/**
 * Session Creation Response
 */
export interface SessionCreateResponse {
  workflowId: string;
  session: WorkflowSession;
}

/**
 * Session Update Response
 */
export interface SessionUpdateResponse {
  success: boolean;
  session: WorkflowSession;
}

/**
 * Workflow Save Response
 */
export interface WorkflowSaveResponse {
  workflow: Workflow;
  message: string;
}

/**
 * Wizard Mode
 */
export type WizardMode = 'create' | 'edit';

/**
 * Wizard Step
 */
export type WizardStep = 1 | 2 | 3 | 4 | 5;

/**
 * Wizard Step Configuration
 */
export interface WizardStepConfig {
  step: WizardStep;
  label: string;
  description: string;
  isValid: (formData: WizardFormData) => boolean;
}

/**
 * Document Type Options - fetched from database via API
 * Use useDocumentTypes hook to load these dynamically
 */
export const DOCUMENT_TYPE_OPTIONS: string[] = [];

export type DocumentTypeOption = string;

/**
 * Step Names
 */
export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    step: 1,
    label: 'Name & Template',
    description: 'Set workflow name and choose a template',
    isValid: (formData) => formData.name.trim().length > 0,
  },
  {
    step: 2,
    label: 'Field Selection',
    description: 'Select fields to extract',
    isValid: (formData) => formData.selectedFields.length > 0,
  },
  {
    step: 3,
    label: 'Details',
    description: 'Configure workflow details',
    isValid: (formData) => formData.description.trim().length > 0,
  },
  {
    step: 4,
    label: 'Scoring',
    description: 'Setup scoring rules (optional)',
    isValid: () => true, // Scoring is optional
  },
  {
    step: 5,
    label: 'Review',
    description: 'Review and save workflow',
    isValid: (formData) =>
      formData.name.trim().length > 0 &&
      formData.selectedFields.length > 0 &&
      formData.description.trim().length > 0,
  },
];
