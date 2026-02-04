/**
 * Extraction Service
 * Handles document extraction-related API calls
 */

import apiClient, { handleApiResponse, getErrorMessage } from './api';
import type { ExtractionResult, ExtractionStatus } from '@/types';

export const extractionService = {
  /**
   * Start extraction for a document with a specific workflow
   */
  async startExtraction(documentId: string, workflowId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `/documents/${documentId}/extract?workflow_id=${workflowId}`
      );
      return handleApiResponse<{ message: string }>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get extraction status for a document-workflow pair
   */
  async getExtractionStatus(documentId: string, workflowId: number): Promise<ExtractionStatus> {
    try {
      const response = await apiClient.get<ExtractionStatus>(
        `/documents/${documentId}/extraction/status?workflow_id=${workflowId}`
      );
      return handleApiResponse<ExtractionStatus>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get extraction results
   */
  async getExtractionResults(documentId: string): Promise<ExtractionResult['results']> {
    try {
      const response = await apiClient.get<ExtractionResult['results']>(
        `/documents/${documentId}/extraction/results`
      );
      return handleApiResponse<ExtractionResult['results']>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get full extraction result (including metadata)
   * @param documentId - Document ID
   * @param workflowId - Optional workflow ID to get results for specific workflow
   */
  async getExtractions(documentId: string, workflowId?: number): Promise<ExtractionResult> {
    try {
      const url = workflowId
        ? `/documents/${documentId}/extraction/results?workflow_id=${workflowId}`
        : `/documents/${documentId}/extraction/results`;

      console.log(`[extractionService] Fetching extractions: ${url}`);

      const response = await apiClient.get<ExtractionResult>(url);
      return handleApiResponse<ExtractionResult>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Poll extraction status until complete
   */
  async pollExtractionStatus(
    documentId: string,
    workflowId: number,
    onProgress?: (status: ExtractionStatus) => void,
    maxAttempts = 60,
    interval = 2000
  ): Promise<ExtractionStatus> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getExtractionStatus(documentId, workflowId);

      if (onProgress) {
        onProgress(status);
      }

      if (status.status === 'complete' || status.status === 'failed') {
        return status;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error('Extraction polling timeout');
  },
};

export default extractionService;
