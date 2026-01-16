/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiClient, tokenStorage, ApiResponse } from './client';

// Types
interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

interface PatientProfile {
  id: string;
  referralCode?: string;
  availableCredits?: number;
  preferredLocationId?: string;
  preferredProviderId?: string;
}

interface AuthResponse {
  user: User;
  patient: PatientProfile | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface RegisterRequest {
  email: string;
  phone?: string;
  password?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  referralCode?: string;
  marketingOptIn?: boolean;
  smsOptIn?: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Register a new patient account
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(
      '/api/patient/auth/register',
      data,
      { skipAuth: true }
    );

    if (response.success && response.data) {
      // Store tokens
      await tokenStorage.setAccessToken(response.data.accessToken);
      await tokenStorage.setRefreshToken(response.data.refreshToken);
      await tokenStorage.setTokenExpiry(response.data.expiresAt);
    }

    return response;
  }

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(
      '/api/patient/auth/login',
      data,
      { skipAuth: true }
    );

    if (response.success && response.data) {
      // Store tokens
      await tokenStorage.setAccessToken(response.data.accessToken);
      await tokenStorage.setRefreshToken(response.data.refreshToken);
      await tokenStorage.setTokenExpiry(response.data.expiresAt);
    }

    return response;
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post<{ message: string }>(
      '/api/patient/auth/logout'
    );

    // Clear tokens regardless of response
    await tokenStorage.clearTokens();

    return response;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<{
    user: User;
    patient: PatientProfile | null;
    referralProgram: any | null;
    notificationPreferences: any | null;
  }>> {
    return apiClient.get('/api/patient/auth/me');
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await tokenStorage.getAccessToken();
    if (!token) return false;

    // Optionally verify with server
    const response = await this.getCurrentUser();
    return response.success;
  }

  /**
   * Get stored access token
   */
  getAccessToken(): Promise<string | null> {
    return tokenStorage.getAccessToken();
  }

  /**
   * Clear all auth data
   */
  clearAuth(): Promise<void> {
    return tokenStorage.clearTokens();
  }
}

export const authService = new AuthService();
export default authService;
