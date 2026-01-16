/**
 * Authentication API Functions
 */

import type { ApiClient } from '../client';
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  AuthResponse,
  User,
  PatientProfile,
} from './types';
import { patientEndpoints } from './index';

export interface AuthApi {
  /**
   * Register a new patient account
   */
  register(data: RegisterRequest): Promise<AuthResponse>;

  /**
   * Login with email and password
   */
  login(data: LoginRequest): Promise<AuthResponse>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(data: RefreshTokenRequest): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }>;

  /**
   * Logout and invalidate session
   */
  logout(): Promise<{ message: string }>;

  /**
   * Get current authenticated user
   */
  getMe(): Promise<{
    user: User;
    patient: PatientProfile | null;
    referralProgram: any | null;
    notificationPreferences: any | null;
  }>;
}

export function createAuthApi(client: ApiClient): AuthApi {
  return {
    async register(data: RegisterRequest) {
      const response = await client.post<{ data: AuthResponse }>(
        patientEndpoints.auth.register,
        data
      );
      return response.data;
    },

    async login(data: LoginRequest) {
      const response = await client.post<{ data: AuthResponse }>(
        patientEndpoints.auth.login,
        data
      );
      return response.data;
    },

    async refreshToken(data: RefreshTokenRequest) {
      const response = await client.post<{
        data: { accessToken: string; refreshToken: string; expiresAt: string };
      }>(patientEndpoints.auth.refresh, data);
      return response.data;
    },

    async logout() {
      const response = await client.post<{ data: { message: string } }>(
        patientEndpoints.auth.logout
      );
      return response.data;
    },

    async getMe() {
      const response = await client.get<{
        data: {
          user: User;
          patient: PatientProfile | null;
          referralProgram: any | null;
          notificationPreferences: any | null;
        };
      }>(patientEndpoints.auth.me);
      return response.data;
    },
  };
}
