/**
 * useWorkflowWizard Hook
 * Manages wizard state machine and session-based workflow creation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { workflowService } from '@/services/workflowService';
import type { Field, Workflow } from '@/types';
import type {
  WizardState,
  WizardFormData,
  WizardValidation,
  WizardStep,
  WizardMode,
} from '../types';

const STORAGE_KEY = 'workflow_wizard_draft';

/**
 * Initial form data
 */
const getInitialFormData = (): WizardFormData => ({
  name: '',
  description: '',
  selectedTemplateId: null,
  selectedFields: [],
  documentTypes: [],
  scoringProfiles: [],
  scoringEnabled: false,
});

/**
 * Initial validation state
 */
const getInitialValidation = (): WizardValidation => ({
  step1: false,
  step2: false,
  step3: false,
  step4: true, // Optional step
  step5: false,
});

/**
 * Validate step
 */
const validateStep = (step: WizardStep, formData: WizardFormData): boolean => {
  switch (step) {
    case 1: // Name & Template
      return formData.name.trim().length > 0;
    case 2: // Field Selection
      return formData.selectedFields.length > 0;
    case 3: // Details
      return formData.description.trim().length > 0;
    case 4: // Scoring (optional)
      return true;
    case 5: // Review
      return (
        formData.name.trim().length > 0 &&
        formData.selectedFields.length > 0 &&
        formData.description.trim().length > 0
      );
    default:
      return false;
  }
};

/**
 * Validate all steps
 */
const validateAllSteps = (formData: WizardFormData): WizardValidation => ({
  step1: validateStep(1, formData),
  step2: validateStep(2, formData),
  step3: validateStep(3, formData),
  step4: validateStep(4, formData),
  step5: validateStep(5, formData),
});

interface UseWorkflowWizardOptions {
  mode?: WizardMode;
  workflowId?: number;
  templateId?: string;
  onComplete?: (workflow: Workflow) => void;
  onError?: (error: string) => void;
}

export const useWorkflowWizard = (options: UseWorkflowWizardOptions = {}) => {
  const { mode = 'create', workflowId, templateId, onComplete, onError } = options;

  // State
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    sessionId: null,
    isInitialized: false,
    formData: getInitialFormData(),
    validation: getInitialValidation(),
    isSaving: false,
    error: null,
  });

  // Refs
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializingRef = useRef(false);

  /**
   * Load draft from localStorage
   */
  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setState((prev) => ({
          ...prev,
          formData: { ...getInitialFormData(), ...parsed.formData },
          currentStep: parsed.currentStep || 1,
          sessionId: parsed.sessionId || null,
        }));
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, []);

  /**
   * Save draft to localStorage
   */
  const saveDraft = useCallback((currentState: WizardState) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          formData: currentState.formData,
          currentStep: currentState.currentStep,
          sessionId: currentState.sessionId,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, []);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  /**
   * Initialize wizard session
   */
  const initializeWizard = useCallback(async () => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    try {
      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      if (mode === 'create') {
        // Create new session
        const { workflowId: sessionId } = await workflowService.initWorkflowSession();

        // If template is provided, apply it
        if (templateId) {
          try {
            // Fetch templates to get the template name
            const templates = await workflowService.getTemplates();
            const template = templates.find(t => t.id === templateId);

            if (!template) {
              throw new Error(`Template with ID "${templateId}" not found`);
            }

            // Apply template to session with both ID and name
            await workflowService.updateSessionTemplate(sessionId, templateId, template.name);

            // Get the updated session with template data
            const session = await workflowService.getWorkflowSession(sessionId);

            // Transform session fields to flat array
            let selectedFieldsArray: Field[] = [];
            if (Array.isArray(session.fields)) {
              // If fields is already an array (manual field selection)
              selectedFieldsArray = session.fields.filter((f): f is Field => typeof f !== 'string');
            } else if (session.fields && typeof session.fields === 'object') {
              // If fields is categorized (from template)
              // Flatten and transform: { "Category": [{fieldId, name}] } -> [{id, name, category}]
              selectedFieldsArray = Object.entries(session.fields).flatMap(([category, fields]) =>
                Array.isArray(fields)
                  ? fields
                      .filter((f): f is any => typeof f !== 'string' && f !== null)
                      .map((f) => ({
                        id: f.fieldId || f.id || '',
                        field_id: f.fieldId || f.id,
                        name: f.name || '',
                        description: f.description,
                        category: category,
                        type: f.type,
                        field_type: f.field_type || f.type,
                        tags: f.tags,
                        region: f.region,
                        document_types: f.document_types,
                        jurisdictions: f.jurisdictions,
                        languages: f.languages,
                      }))
                  : []
              );
            }

            // Transform session data to form data
            const formData: WizardFormData = {
              name: session.name || '',
              description: session.description || '',
              selectedTemplateId: templateId,
              selectedFields: selectedFieldsArray,
              documentTypes: session.documentTypes || [],
              scoringProfiles: session.scoringProfiles || [],
              scoringEnabled: session.scoringEnabled || false,
            };

            // Jump to step 5 (review) with template pre-populated
            setState((prev) => ({
              ...prev,
              sessionId,
              formData,
              validation: validateAllSteps(formData),
              currentStep: 5, // Jump to review step
              isInitialized: true,
              isSaving: false,
            }));
          } catch (templateError) {
            console.error('Failed to apply template:', templateError);
            // If template fails, continue with normal initialization
            setState((prev) => ({
              ...prev,
              sessionId,
              isInitialized: true,
              isSaving: false,
              error: 'Failed to apply template. You can continue creating the workflow manually.',
            }));
          }
        } else {
          // No template - normal initialization
          setState((prev) => ({
            ...prev,
            sessionId,
            isInitialized: true,
            isSaving: false,
          }));
        }
      } else if (mode === 'edit' && workflowId) {
        // Load existing workflow for editing
        const workflow = await workflowService.getWorkflow(workflowId);

        // Transform workflow fields to flat array
        let selectedFieldsArray: Field[] = [];
        if (Array.isArray(workflow.fields)) {
          selectedFieldsArray = workflow.fields.filter((f): f is Field => typeof f !== 'string');
        } else if (workflow.fields && typeof workflow.fields === 'object') {
          // If fields is categorized (from template)
          // Flatten and transform: { "Category": [{fieldId, name}] } -> [{id, name, category}]
          selectedFieldsArray = Object.entries(workflow.fields).flatMap(([category, fields]) =>
            Array.isArray(fields)
              ? fields
                  .filter((f): f is any => typeof f !== 'string' && f !== null)
                  .map((f) => ({
                    id: f.fieldId || f.id || '',
                    field_id: f.fieldId || f.id,
                    name: f.name || '',
                    description: f.description,
                    category: category,
                    type: f.type,
                    field_type: f.field_type || f.type,
                    tags: f.tags,
                    region: f.region,
                    document_types: f.document_types,
                    jurisdictions: f.jurisdictions,
                    languages: f.languages,
                  }))
              : []
          );
        }

        const formData: WizardFormData = {
          name: workflow.name,
          description: workflow.description || '',
          selectedTemplateId: null,
          selectedFields: selectedFieldsArray,
          documentTypes: workflow.documentTypes || [],
          scoringProfiles: [],
          scoringEnabled: workflow.scoringEnabled || false,
        };

        setState((prev) => ({
          ...prev,
          formData,
          validation: validateAllSteps(formData),
          currentStep: 5, // Jump to review step when editing
          isInitialized: true,
          isSaving: false,
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize wizard';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isSaving: false,
      }));
      onError?.(errorMessage);
    } finally {
      isInitializingRef.current = false;
    }
  }, [mode, workflowId, templateId, onError]);

  /**
   * Update form data
   */
  const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
    setState((prev) => {
      const newFormData = { ...prev.formData, ...updates };
      const newValidation = validateAllSteps(newFormData);
      const newState = {
        ...prev,
        formData: newFormData,
        validation: newValidation,
      };

      // Save draft on form data change
      saveDraft(newState);

      return newState;
    });
  }, [saveDraft]);

  /**
   * Save current step to backend session
   */
  const saveProgress = useCallback(async (step: WizardStep) => {
    if (!state.sessionId) return;

    try {
      switch (step) {
        case 1: // Name & Template
          await workflowService.updateSessionName(
            state.sessionId,
            state.formData.name,
            state.formData.description
          );
          if (state.formData.selectedTemplateId) {
            // Fetch templates to get the template name
            const templates = await workflowService.getTemplates();
            const template = templates.find(t => t.id === state.formData.selectedTemplateId);
            if (template) {
              await workflowService.updateSessionTemplate(
                state.sessionId,
                state.formData.selectedTemplateId,
                template.name
              );
            }
          }
          break;

        case 2: // Fields
          await workflowService.updateSessionFields(
            state.sessionId,
            state.formData.selectedFields.map(field => field.id)
          );
          break;

        case 3: // Details
          await workflowService.updateSessionDetails(state.sessionId, {
            description: state.formData.description,
            documentTypes: state.formData.documentTypes,
          });
          break;

        case 4: // Scoring
          await workflowService.updateSessionScoring(state.sessionId, {
            scoringProfiles: state.formData.scoringProfiles,
            scoringEnabled: state.formData.scoringEnabled,
          });
          break;
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
      // Don't block navigation on auto-save failure
    }
  }, [state.sessionId, state.formData]);

  /**
   * Navigate to next step
   */
  const goToNextStep = useCallback(async () => {
    const currentStepValid = validateStep(state.currentStep, state.formData);

    if (!currentStepValid) {
      setState((prev) => ({
        ...prev,
        error: 'Please complete all required fields before continuing',
      }));
      return;
    }

    // Save progress to backend
    await saveProgress(state.currentStep);

    if (state.currentStep < 5) {
      setState((prev) => ({
        ...prev,
        currentStep: (prev.currentStep + 1) as WizardStep,
        error: null,
      }));
    }
  }, [state.currentStep, state.formData, saveProgress]);

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > 1) {
      setState((prev) => ({
        ...prev,
        currentStep: (prev.currentStep - 1) as WizardStep,
        error: null,
      }));
    }
  }, [state.currentStep]);

  /**
   * Jump to specific step
   */
  const goToStep = useCallback((step: WizardStep) => {
    // Only allow jumping to completed steps or next step
    const canNavigate = step <= state.currentStep + 1;

    if (canNavigate) {
      setState((prev) => ({
        ...prev,
        currentStep: step,
        error: null,
      }));
    }
  }, [state.currentStep]);

  /**
   * Final save - complete workflow and save to database
   */
  const finalSave = useCallback(async () => {
    if (!state.sessionId) {
      setState((prev) => ({
        ...prev,
        error: 'No active session',
      }));
      return;
    }

    // Validate all steps
    const allValid = Object.values(state.validation).every((v) => v);
    if (!allValid) {
      setState((prev) => ({
        ...prev,
        error: 'Please complete all required steps',
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      // Save final workflow
      const workflow = await workflowService.saveWorkflowSession(state.sessionId);

      // Clear draft
      clearDraft();

      // Reset state
      setState({
        currentStep: 1,
        sessionId: null,
        isInitialized: false,
        formData: getInitialFormData(),
        validation: getInitialValidation(),
        isSaving: false,
        error: null,
      });

      // Call completion callback
      onComplete?.(workflow);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save workflow';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isSaving: false,
      }));
      onError?.(errorMessage);
    }
  }, [state.sessionId, state.validation, clearDraft, onComplete, onError]);

  /**
   * Reset wizard
   */
  const resetWizard = useCallback(() => {
    clearDraft();
    setState({
      currentStep: 1,
      sessionId: null,
      isInitialized: false,
      formData: getInitialFormData(),
      validation: getInitialValidation(),
      isSaving: false,
      error: null,
    });
  }, [clearDraft]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (!state.isInitialized) {
      // Try to load draft first
      loadDraft();
      // Then initialize session
      initializeWizard();
    }
  }, [state.isInitialized, loadDraft, initializeWizard]);

  // Auto-save with debounce
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (state.sessionId && state.isInitialized) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveProgress(state.currentStep);
      }, 2000); // 2 second debounce
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.formData, state.sessionId, state.isInitialized, state.currentStep, saveProgress]);

  return {
    // State
    currentStep: state.currentStep,
    sessionId: state.sessionId,
    isInitialized: state.isInitialized,
    formData: state.formData,
    validation: state.validation,
    isSaving: state.isSaving,
    error: state.error,

    // Actions
    initializeWizard,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    saveProgress,
    finalSave,
    resetWizard,
    clearError,

    // Computed
    canGoNext: validateStep(state.currentStep, state.formData),
    canGoPrevious: state.currentStep > 1,
    isFirstStep: state.currentStep === 1,
    isLastStep: state.currentStep === 5,
    isComplete: Object.values(state.validation).every((v) => v),
  };
};

export default useWorkflowWizard;
