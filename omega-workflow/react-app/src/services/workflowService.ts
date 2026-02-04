/**
 * Workflow Service
 * Handles workflow-related API calls
 */

import apiClient, { handleApiResponse, getErrorMessage } from './api';
import type { Workflow, Field, WorkflowTemplate } from '@/types';
import type {
  SessionCreateResponse,
  SessionUpdateResponse,
  WorkflowSaveResponse,
  WorkflowSession,
  ScoringProfile,
} from '@/features/workflows/types';

export const workflowService = {
  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<Workflow[]> {
    try {
      const response = await apiClient.get<Workflow[]>('/workflows/saved');
      return handleApiResponse<Workflow[]>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: number): Promise<Workflow> {
    try {
      const response = await apiClient.get<Workflow>(`/workflows/saved/${id}`);
      return handleApiResponse<Workflow>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Create new workflow
   */
  async createWorkflow(data: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    try {
      const response = await apiClient.post<Workflow>('/workflows/saved', data);
      return handleApiResponse<Workflow>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update workflow
   */
  async updateWorkflow(id: number, updates: Partial<Workflow>): Promise<Workflow> {
    try {
      const response = await apiClient.post<Workflow>(
        `/workflows/saved/${id}/edit`,
        updates
      );
      return handleApiResponse<Workflow>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: number): Promise<void> {
    try {
      await apiClient.delete(`/workflows/saved/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get all available fields
   */
  async getFields(params?: {
    search?: string;
    tags?: string;
    region?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ fields: Field[]; total: number; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.tags) queryParams.append('tags', params.tags);
      if (params?.region) queryParams.append('region', params.region);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const url = `/fields${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      // Backend returns field_id, but frontend expects id
      const response = await apiClient.get<{ fields: any[]; total: number; count: number }>(url);
      const result = handleApiResponse<{ fields: any[]; total: number; count: number }>(response);

      // Transform backend field structure to frontend Field interface
      const transformedFields: Field[] = result.fields.map((field: any) => ({
        id: field.field_id || field.id,        // Map field_id → id
        name: field.name,
        description: field.description,
        category: field.category,
        type: field.type,  // Field type (text, date, etc.)
        field_type: field.type || field.field_type,  // Map type → field_type
        tags: field.tags,
        region: field.region,
        document_types: field.document_types,
        jurisdictions: field.jurisdictions,  // Jurisdiction data
        languages: field.languages,  // Language data
      }));

      return {
        fields: transformedFields,
        total: result.total,
        count: result.count,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get workflow templates
   */
  async getTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const response = await apiClient.get<WorkflowTemplate[]>(
        '/analyze/workflows/templates'
      );
      return handleApiResponse<WorkflowTemplate[]>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get workflows assigned to a document
   */
  async getDocumentWorkflows(documentId: string): Promise<{ workflowIds: number[]; workflowNames: string[] }> {
    try {
      const response = await apiClient.get<{ workflowIds: number[]; workflowNames: string[] }>(
        `/documents/${documentId}/workflows`
      );
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Assign workflows to a document
   */
  async assignWorkflowsToDocument(documentId: string, workflowIds: number[]): Promise<void> {
    try {
      await apiClient.put(`/documents/${documentId}/workflows`, {
        workflowIds,
      });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Assign workflows to multiple documents (batch operation)
   */
  async batchAssignWorkflows(documentIds: string[], workflowIds: number[]): Promise<void> {
    try {
      // Assign workflows to each document in parallel
      const promises = documentIds.map((docId) =>
        this.assignWorkflowsToDocument(docId, workflowIds)
      );
      await Promise.all(promises);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Assign workflow to document (legacy - single workflow)
   * @deprecated Use assignWorkflowsToDocument instead
   */
  async assignWorkflowToDocument(documentId: string, workflowId: number): Promise<void> {
    return this.assignWorkflowsToDocument(documentId, [workflowId]);
  },

  // ============================================================================
  // Workflow Wizard Session-Based API Methods
  // ============================================================================

  /**
   * Initialize workflow creation session
   */
  async initWorkflowSession(): Promise<SessionCreateResponse> {
    try {
      const response = await apiClient.post<SessionCreateResponse>(
        '/analyze/workflows/create/init'
      );
      return handleApiResponse<SessionCreateResponse>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update session name
   */
  async updateSessionName(
    sessionId: string,
    name: string,
    description?: string
  ): Promise<SessionUpdateResponse> {
    try {
      const response = await apiClient.post<SessionUpdateResponse>(
        `/analyze/workflows/create/${sessionId}/name`,
        { name, description }
      );
      return handleApiResponse<SessionUpdateResponse>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update session template
   */
  async updateSessionTemplate(
    sessionId: string,
    templateId: string,
    templateName: string
  ): Promise<SessionUpdateResponse> {
    try {
      const response = await apiClient.post<SessionUpdateResponse>(
        `/analyze/workflows/create/${sessionId}/template`,
        { templateId, templateName }
      );
      return handleApiResponse<SessionUpdateResponse>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update session fields
   */
  async updateSessionFields(
    sessionId: string,
    fields: Field[] | string[]
  ): Promise<SessionUpdateResponse> {
    try {
      const response = await apiClient.post<SessionUpdateResponse>(
        `/analyze/workflows/create/${sessionId}/fields`,
        { fields }
      );
      return handleApiResponse<SessionUpdateResponse>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update session details
   */
  async updateSessionDetails(
    sessionId: string,
    details: { description: string; documentTypes: string[] }
  ): Promise<SessionUpdateResponse> {
    try {
      const response = await apiClient.post<SessionUpdateResponse>(
        `/analyze/workflows/create/${sessionId}/details`,
        details
      );
      return handleApiResponse<SessionUpdateResponse>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update session scoring
   */
  async updateSessionScoring(
    sessionId: string,
    scoring: { scoringProfiles: ScoringProfile[]; scoringEnabled?: boolean }
  ): Promise<SessionUpdateResponse> {
    try {
      const response = await apiClient.post<SessionUpdateResponse>(
        `/analyze/workflows/create/${sessionId}/scoring`,
        scoring
      );
      return handleApiResponse<SessionUpdateResponse>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Save workflow session (final save to database)
   */
  async saveWorkflowSession(sessionId: string): Promise<Workflow> {
    try {
      const response = await apiClient.post<WorkflowSaveResponse>(
        `/analyze/workflows/create/${sessionId}/review`
      );
      const result = handleApiResponse<WorkflowSaveResponse>(response);
      return result.workflow;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get workflow session (retrieve current state)
   */
  async getWorkflowSession(sessionId: string): Promise<WorkflowSession> {
    try {
      const response = await apiClient.get<WorkflowSession>(
        `/analyze/workflows/create/${sessionId}`
      );
      return handleApiResponse<WorkflowSession>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default workflowService;
