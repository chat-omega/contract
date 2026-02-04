/**
 * Document Service
 * Handles document-related API calls
 */

import apiClient, { handleApiResponse, getErrorMessage } from './api';
import type { Document } from '@/types';

export const documentService = {
  /**
   * Get all documents
   */
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await apiClient.get<Document[]>('/documents');
      return handleApiResponse<Document[]>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<Document> {
    try {
      const response = await apiClient.get<Document>(`/documents/${id}`);
      return handleApiResponse<Document>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Upload document
   */
  async uploadDocument(file: File, docType: string): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', docType);

      const response = await apiClient.post<Document>(
        '/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return handleApiResponse<Document>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Update document
   */
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    try {
      const response = await apiClient.patch<Document>(`/documents/${id}`, updates);
      return handleApiResponse<Document>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await apiClient.delete(`/documents/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get document content (PDF/file URL)
   * Returns relative path - axios will automatically prepend baseURL
   */
  getDocumentContentUrl(id: string): string {
    return `/documents/${id}/content`;
  },
};

export default documentService;
