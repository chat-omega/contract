/**
 * Workflow Store
 * Manages workflows, fields, and workflow assignments
 */

import { create } from 'zustand';
import type { Workflow, Field, WorkflowTemplate } from '@/types';
import { workflowService } from '@/services/workflowService';

interface WorkflowState {
  // State
  workflows: Workflow[];
  fields: Field[];
  templates: WorkflowTemplate[];
  currentWorkflow: Workflow | null;
  availableFields: Field[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setWorkflows: (workflows: Workflow[]) => void;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: number, updates: Partial<Workflow>) => void;
  removeWorkflow: (id: number) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setFields: (fields: Field[]) => void;
  setTemplates: (templates: WorkflowTemplate[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Async actions
  loadWorkflows: () => Promise<void>;
  loadTemplates: () => Promise<void>;
  loadFields: () => Promise<void>;
  initializeWorkflow: () => void;
  updateWorkflowName: (name: string, description?: string) => void;
  updateWorkflowFields: (fields: Field[]) => void;
  updateWorkflowDetails: (details: any) => void;
  updateWorkflowScoring: (scoring: any) => void;
  saveWorkflow: () => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  duplicateWorkflow: (id: string) => Promise<void>;
  createFromTemplate: (templateId: string) => Promise<Workflow>;
  loadWorkflowForEdit: (id: string) => void;
  clearCurrentWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, _get) => ({
  // Initial state
  workflows: [],
  fields: [],
  templates: [],
  currentWorkflow: null,
  availableFields: [],
  isLoading: false,
  error: null,

  // Set all workflows
  setWorkflows: (workflows: Workflow[]) => {
    set({ workflows, error: null });
  },

  // Add a new workflow
  addWorkflow: (workflow: Workflow) => {
    set((state) => ({
      workflows: [...state.workflows, workflow],
    }));
  },

  // Update workflow by ID
  updateWorkflow: (id: number, updates: Partial<Workflow>) => {
    set((state) => ({
      workflows: state.workflows.map((wf) =>
        wf.id === id ? { ...wf, ...updates } : wf
      ),
    }));
  },

  // Remove workflow by ID
  removeWorkflow: (id: number) => {
    set((state) => ({
      workflows: state.workflows.filter((wf) => wf.id !== id),
    }));
  },

  // Set current workflow
  setCurrentWorkflow: (workflow: Workflow | null) => {
    set({ currentWorkflow: workflow });
  },

  // Set available fields
  setFields: (fields: Field[]) => {
    set({ fields });
  },

  // Set workflow templates
  setTemplates: (templates: WorkflowTemplate[]) => {
    set({ templates });
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Set error message
  setError: (error: string | null) => {
    set({ error });
  },

  // Reset store
  reset: () => {
    set({
      workflows: [],
      fields: [],
      templates: [],
      currentWorkflow: null,
      availableFields: [],
      isLoading: false,
      error: null,
    });
  },

  // Async: Load workflows
  loadWorkflows: async () => {
    try {
      set({ isLoading: true });
      const workflows = await workflowService.getWorkflows();
      set({ workflows, isLoading: false, error: null });
    } catch (error) {
      set({ error: 'Failed to load workflows', isLoading: false });
    }
  },

  // Async: Load templates
  loadTemplates: async () => {
    try {
      const templates = await workflowService.getTemplates();
      set({ templates });
    } catch (error) {
      set({ error: 'Failed to load templates' });
    }
  },

  // Async: Load fields
  loadFields: async () => {
    try {
      const response = await workflowService.getFields();
      set({ availableFields: response.fields });
    } catch (error) {
      set({ error: 'Failed to load fields' });
    }
  },

  // Initialize new workflow
  initializeWorkflow: () => {
    set({
      currentWorkflow: {
        id: 0,
        name: '',
        description: '',
        fields: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  },

  // Update workflow name
  updateWorkflowName: (name: string, description?: string) => {
    set((state) => ({
      currentWorkflow: state.currentWorkflow
        ? { ...state.currentWorkflow, name, description: description || state.currentWorkflow.description }
        : null,
    }));
  },

  // Update workflow fields
  updateWorkflowFields: (fields: Field[]) => {
    set((state) => ({
      currentWorkflow: state.currentWorkflow
        ? { ...state.currentWorkflow, fields }
        : null,
    }));
  },

  // Update workflow details
  updateWorkflowDetails: (details: any) => {
    set((state) => ({
      currentWorkflow: state.currentWorkflow
        ? { ...state.currentWorkflow, ...details }
        : null,
    }));
  },

  // Update workflow scoring
  updateWorkflowScoring: (scoring: any) => {
    set((state) => ({
      currentWorkflow: state.currentWorkflow
        ? { ...state.currentWorkflow, ...scoring }
        : null,
    }));
  },

  // Async: Save workflow
  saveWorkflow: async () => {
    const currentWorkflow = _get().currentWorkflow;
    if (!currentWorkflow) throw new Error('No workflow to save');

    try {
      await workflowService.createWorkflow(currentWorkflow);
      set({ currentWorkflow: null });
    } catch (error) {
      throw error;
    }
  },

  // Async: Delete workflow
  deleteWorkflow: async (id: string) => {
    try {
      await workflowService.deleteWorkflow(parseInt(id));
      set((state) => ({
        workflows: state.workflows.filter((wf) => wf.id !== parseInt(id)),
      }));
    } catch (error) {
      throw error;
    }
  },

  // Async: Duplicate workflow
  duplicateWorkflow: async (id: string) => {
    const workflow = _get().workflows.find((wf) => wf.id === parseInt(id));
    if (!workflow) throw new Error('Workflow not found');

    try {
      const { id: _id, created_at, updated_at, ...workflowData } = workflow;
      const newWorkflow = await workflowService.createWorkflow({
        ...workflowData,
        name: `${workflow.name} (Copy)`,
      });
      set((state) => ({
        workflows: [...state.workflows, newWorkflow],
      }));
    } catch (error) {
      throw error;
    }
  },

  // Async: Create from template
  createFromTemplate: async (templateId: string) => {
    const template = _get().templates.find((t) => t.id === templateId);
    if (!template) throw new Error('Template not found');

    const newWorkflow: Workflow = {
      id: 0,
      name: template.name,
      description: template.description,
      fields: template.fields || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set({ currentWorkflow: newWorkflow });
    return newWorkflow;
  },

  // Load workflow for editing
  loadWorkflowForEdit: (id: string) => {
    const workflow = _get().workflows.find((wf) => wf.id === parseInt(id));
    if (workflow) {
      set({ currentWorkflow: { ...workflow } });
    }
  },

  // Clear current workflow
  clearCurrentWorkflow: () => {
    set({ currentWorkflow: null });
  },
}));

// Selectors
export const selectWorkflows = (state: WorkflowState) => state.workflows;
export const selectFields = (state: WorkflowState) => state.fields;
export const selectTemplates = (state: WorkflowState) => state.templates;
export const selectWorkflowById = (id: number) => (state: WorkflowState) =>
  state.workflows.find((wf) => wf.id === id);
export const selectFieldsByIds = (fieldIds: string[]) => (state: WorkflowState) =>
  state.fields.filter((field) => fieldIds.includes(field.id));
