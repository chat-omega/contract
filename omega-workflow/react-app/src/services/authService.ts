/**
 * Authentication Service
 * Handles login, register, and auth-related API calls
 */

import apiClient, { handleApiResponse, getErrorMessage } from './api';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '@/types';

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Send credentials as JSON (backend uses Pydantic models, not OAuth2 form)
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        username: credentials.username,
        password: credentials.password,
      });

      return handleApiResponse<AuthResponse>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return handleApiResponse<AuthResponse>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Get current user profile
   */
  async me(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return handleApiResponse<User>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Verify token is still valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.me();
      return true;
    } catch {
      return false;
    }
  },
};

export default authService;
