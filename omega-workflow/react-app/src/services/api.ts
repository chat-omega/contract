/**
 * API Client
 * Axios-based HTTP client with interceptors and error handling
 */

import axios, { AxiosError } from 'axios';
import type {
  AxiosInstance,

  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError } from '@/types';
import { useAuthStore } from '@stores/authStore';
import { useUIStore } from '@stores/uiStore';

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

/**
 * Create Axios instance with default configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle responses and errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const { response, config } = error;

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: config?.url,
        status: response?.status,
        message: response?.data?.message || error.message,
        detail: response?.data?.detail,
      });
    }

    // Handle specific error status codes
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - but don't logout for auth endpoints (login/register)
          // Those are expected to return 401 for invalid credentials
          const isAuthEndpoint = config?.url &&
            (config.url.includes('/auth/login') || config.url.includes('/auth/register'));

          if (!isAuthEndpoint) {
            console.warn('🔒 Unauthorized - logging out');
            useAuthStore.getState().logout();
            useUIStore.getState().addToast('error', 'Session expired. Please log in again.');

            // Optionally redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
          break;

        case 403:
          // Forbidden
          useUIStore.getState().addToast('error', 'Access denied');
          break;

        case 404:
          // Not found
          useUIStore
            .getState()
            .addToast('error', response.data?.message || 'Resource not found');
          break;

        case 429:
          // Too many requests
          useUIStore.getState().addToast('error', 'Too many requests. Please try again later.');
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          useUIStore
            .getState()
            .addToast('error', 'Server error. Please try again later.');
          break;

        default:
          // Generic error
          useUIStore
            .getState()
            .addToast(
              'error',
              response.data?.message || 'An unexpected error occurred'
            );
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      useUIStore.getState().addToast('error', 'Request timeout. Please try again.');
    } else if (!navigator.onLine) {
      // Network error
      useUIStore
        .getState()
        .addToast('error', 'No internet connection. Please check your network.');
    } else {
      // Unknown error
      useUIStore
        .getState()
        .addToast('error', error.message || 'An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

/**
 * Retry logic for failed requests
 */
export const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      console.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw new Error('Max retries exceeded');
};

/**
 * Type-safe wrapper for API responses
 */
export const handleApiResponse = <T>(response: any): T => {
  return response.data as T;
};

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.detail ||
      axiosError.message ||
      'An unexpected error occurred'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Create a cancelable request
 */
export const createCancelToken = () => {
  const source = axios.CancelToken.source();

  return {
    token: source.token,
    cancel: (message?: string) => source.cancel(message),
  };
};

export default apiClient;
