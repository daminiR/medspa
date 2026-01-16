/**
 * API Client Factory
 * Creates a type-safe API client with authentication
 */

import { ApiError } from './errors';

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => Promise<string | null>;
  onUnauthorized?: () => void;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: any, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: any, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: any, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const { baseUrl, getToken, onUnauthorized } = config;

  async function request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, timeout = 30000 } = options;

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if available
    if (getToken) {
      const token = await getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle unauthorized
      if (response.status === 401) {
        onUnauthorized?.();
        throw new ApiError('Unauthorized', 401);
      }

      // Handle errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string; [key: string]: any };
        throw new ApiError(
          errorData.message || `Request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      // Parse response
      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0
      );
    }
  }

  return {
    get: <T>(path: string, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'GET' }),

    post: <T>(path: string, body?: any, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'POST', body }),

    put: <T>(path: string, body?: any, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'PUT', body }),

    patch: <T>(path: string, body?: any, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'PATCH', body }),

    delete: <T>(path: string, options?: RequestOptions) =>
      request<T>(path, { ...options, method: 'DELETE' }),
  };
}
