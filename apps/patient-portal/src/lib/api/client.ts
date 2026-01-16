/**
 * Patient API Client
 *
 * A typed HTTP client for communicating with the backend API.
 * Handles JWT authentication with automatic token refresh on 401 responses.
 *
 * Auth flow:
 * - Access token stored in memory (not localStorage for security)
 * - Refresh token stored in httpOnly cookie (handled by browser)
 * - On 401, automatically attempts refresh before failing
 */

// Types for API responses
export interface PatientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  membershipTier?: 'standard' | 'gold' | 'platinum';
  membershipCredits?: number;
  avatarUrl?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: PatientUser;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Request options extending standard fetch options
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Patient Portal API Client
 *
 * Singleton class that manages API communication with automatic
 * JWT refresh handling.
 */
export class PatientApiClient {
  private accessToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
      'http://localhost:8080';
  }

  /**
   * Set the access token (typically after login)
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if user is currently authenticated (has token)
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Attempt to refresh the access token using the httpOnly refresh cookie
   * Returns true if refresh was successful, false otherwise
   */
  async refreshToken(): Promise<boolean> {
    // If already refreshing, wait for that to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/patient/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include httpOnly cookies
      });

      if (!response.ok) {
        this.accessToken = null;
        return false;
      }

      const data: RefreshResponse = await response.json();
      this.accessToken = data.accessToken;
      return true;
    } catch (error) {
      console.error('[ApiClient] Token refresh failed:', error);
      this.accessToken = null;
      return false;
    }
  }

  /**
   * Generic request method with automatic 401 handling and token refresh
   */
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { body, skipAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Add auth header if we have a token and auth is not skipped
    if (this.accessToken && !skipAuth) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: 'include', // Always include cookies for refresh token
    };

    // Handle body serialization
    if (body !== undefined) {
      config.body = JSON.stringify(body);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    let response = await fetch(url, config);

    // Handle 401 - attempt token refresh and retry
    if (response.status === 401 && this.accessToken && !skipAuth) {
      const refreshed = await this.refreshToken();

      if (refreshed) {
        // Update the auth header with the new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        config.headers = headers;

        // Retry the original request
        response = await fetch(url, config);
      } else {
        // Refresh failed - throw session expired error
        throw new ApiClientError('Session expired', 401, 'SESSION_EXPIRED');
      }
    }

    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errorCode: string | undefined;

      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code;
      } catch {
        // Response body is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiClientError(errorMessage, response.status, errorCode);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse JSON response
    return response.json();
  }

  // ============================================
  // Auth Helper Methods
  // ============================================

  /**
   * Send a magic link to the user's email for passwordless login
   */
  async sendMagicLink(email: string): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(
      '/api/auth/patient/magic-link/send',
      {
        method: 'POST',
        body: { email },
        skipAuth: true,
      }
    );
  }

  /**
   * Verify a magic link token and complete login
   */
  async verifyMagicLink(token: string, email: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      '/api/auth/patient/magic-link/verify',
      {
        method: 'POST',
        body: { token, email },
        skipAuth: true,
      }
    );

    // Store the access token
    this.accessToken = response.accessToken;
    return response;
  }

  /**
   * Send an SMS OTP to the user's phone number
   */
  async sendSmsOtp(phone: string): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(
      '/api/auth/patient/sms-otp/send',
      {
        method: 'POST',
        body: { phone },
        skipAuth: true,
      }
    );
  }

  /**
   * Verify an SMS OTP code and complete login
   */
  async verifySmsOtp(phone: string, code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      '/api/auth/patient/sms-otp/verify',
      {
        method: 'POST',
        body: { phone, code },
        skipAuth: true,
      }
    );

    // Store the access token
    this.accessToken = response.accessToken;
    return response;
  }

  /**
   * Get the currently authenticated user's profile
   */
  async getCurrentUser(): Promise<PatientUser> {
    return this.request<PatientUser>('/api/auth/patient/me', {
      method: 'GET',
    });
  }

  /**
   * Log out the current user and clear session
   */
  async logout(): Promise<void> {
    try {
      await this.request<void>('/api/auth/patient/logout', {
        method: 'POST',
      });
    } finally {
      // Always clear the access token, even if the request fails
      this.accessToken = null;
    }
  }
}

// Export singleton instance
export const apiClient = new PatientApiClient();
