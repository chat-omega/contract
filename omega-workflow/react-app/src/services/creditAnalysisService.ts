/**
 * Credit Analysis Service
 * Handles API calls for credit analysis features
 */

import api from './api';

export interface CreditUploadResponse {
  success: boolean;
  document_id: string;
  extraction_id: string;
  workflow_id: number;
  status: 'processing' | 'pending';
  message: string;
  document?: {
    id: string;
    name: string;
    size: number;
  };
}

export interface CreditQueryResponse {
  success: boolean;
  status: 'complete' | 'processing' | 'not_started';
  message: string;
  company_name?: string;
  suggestions?: string[];
  company?: {
    name: string;
    rating: string;
    sector: string;
    coverage: string;
  };
  outlook?: {
    outlook: string;
    description: string;
  };
  pod?: {
    value: string;
    horizon: string;
    change: string;
    timeSeries: {
      labels: string[];
      values: number[];
    };
  };
  spread?: {
    value: string;
    term: string;
    change: string;
    timeSeries: {
      labels: string[];
      values: number[];
    };
  };
  analysis?: {
    html: string;
  };
  extracted_fields?: Record<string, unknown>[];
}

export interface CreditResultsResponse {
  success: boolean;
  status: 'complete' | 'processing' | 'failed';
  document_id: string;
  extraction_id: string;
  company: {
    name: string;
    rating: string;
    sector: string;
    coverage: string;
  };
  outlook: {
    outlook: string;
    description: string;
  };
  pod: {
    value: string;
    horizon: string;
    change: string;
    timeSeries: {
      labels: string[];
      values: number[];
    };
  };
  spread: {
    value: string;
    term: string;
    change: string;
    timeSeries: {
      labels: string[];
      values: number[];
    };
  };
  analysis: {
    html: string;
  };
  extracted_fields?: Record<string, unknown>[];
}

/**
 * Upload a credit document for analysis
 */
export const uploadCreditDocument = async (file: File): Promise<CreditUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<CreditUploadResponse>('/credit-analysis/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Send a credit analysis query
 */
export const queryCreditAnalysis = async (
  query: string,
  documentId?: string,
  companyName?: string
): Promise<CreditQueryResponse> => {
  const formData = new FormData();
  formData.append('query', query);
  if (documentId) {
    formData.append('document_id', documentId);
  }
  if (companyName) {
    formData.append('company_name', companyName);
  }

  const response = await api.post<CreditQueryResponse>('/credit-analysis/query', formData);

  return response.data;
};

/**
 * Get credit analysis results for a document
 */
export const getCreditAnalysisResults = async (documentId: string): Promise<CreditResultsResponse> => {
  const response = await api.get<CreditResultsResponse>(
    `/credit-analysis/document/${documentId}/results`
  );

  return response.data;
};

/**
 * Poll for credit analysis results until complete or timeout
 */
export const pollForResults = async (
  documentId: string,
  onProgress?: (status: string) => void,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<CreditResultsResponse | null> => {
  let attempts = 0;

  return new Promise((resolve) => {
    const poll = async () => {
      attempts++;

      try {
        const result = await getCreditAnalysisResults(documentId);

        if (result.status === 'complete') {
          resolve(result);
          return;
        }

        if (result.status === 'failed') {
          onProgress?.('Analysis failed');
          resolve(null);
          return;
        }

        if (attempts >= maxAttempts) {
          onProgress?.('Analysis timed out');
          resolve(null);
          return;
        }

        onProgress?.(`Processing... (${attempts}/${maxAttempts})`);
        setTimeout(poll, intervalMs);
      } catch (error) {
        if (attempts >= maxAttempts) {
          resolve(null);
          return;
        }
        setTimeout(poll, intervalMs);
      }
    };

    poll();
  });
};

export default {
  uploadCreditDocument,
  queryCreditAnalysis,
  getCreditAnalysisResults,
  pollForResults,
};
