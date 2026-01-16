import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PatientApiClient,
  ApiClientError,
  type PatientUser,
  type AuthResponse,
  type RefreshResponse,
} from '../client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create mock Response objects
function createMockResponse(
  body: unknown,
  options: { status?: number; ok?: boolean; statusText?: string } = {}
): Response {
  const { status = 200, ok = true, statusText = 'OK' } = options;
  return {
    ok,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    bytes: vi.fn(),
  } as unknown as Response;
}

// Sample test data
const mockUser: PatientUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+15551234567',
  membershipTier: 'gold',
  membershipCredits: 100,
  emailVerified: true,
  phoneVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockAuthResponse: AuthResponse = {
  accessToken: 'test-access-token-123',
  user: mockUser,
};

const mockRefreshResponse: RefreshResponse = {
  accessToken: 'new-access-token-456',
};

describe('PatientApiClient', () => {
  let client: PatientApiClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PatientApiClient('http://test-api.example.com');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // Token Management Tests
  // ==========================================
  describe('Token Management', () => {
    describe('setAccessToken', () => {
      it('stores the token correctly', () => {
        client.setAccessToken('my-token');
        expect(client.getAccessToken()).toBe('my-token');
      });

      it('can clear the token by setting null', () => {
        client.setAccessToken('my-token');
        client.setAccessToken(null);
        expect(client.getAccessToken()).toBeNull();
      });

      it('overwrites existing token', () => {
        client.setAccessToken('first-token');
        client.setAccessToken('second-token');
        expect(client.getAccessToken()).toBe('second-token');
      });
    });

    describe('getAccessToken', () => {
      it('returns null initially', () => {
        expect(client.getAccessToken()).toBeNull();
      });

      it('returns stored token after setAccessToken', () => {
        client.setAccessToken('stored-token');
        expect(client.getAccessToken()).toBe('stored-token');
      });
    });

    describe('isAuthenticated', () => {
      it('returns false when no token exists', () => {
        expect(client.isAuthenticated()).toBe(false);
      });

      it('returns true when token exists', () => {
        client.setAccessToken('valid-token');
        expect(client.isAuthenticated()).toBe(true);
      });

      it('returns false after token is cleared', () => {
        client.setAccessToken('valid-token');
        client.setAccessToken(null);
        expect(client.isAuthenticated()).toBe(false);
      });
    });
  });

  // ==========================================
  // Request Method Tests
  // ==========================================
  describe('request method', () => {
    describe('Authorization header', () => {
      it('adds Authorization header when token exists', async () => {
        client.setAccessToken('bearer-token');
        mockFetch.mockResolvedValue(createMockResponse({ data: 'test' }));

        await client.request('/api/test');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://test-api.example.com/api/test',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer bearer-token',
            }),
          })
        );
      });

      it('does not add Authorization header when no token exists', async () => {
        mockFetch.mockResolvedValue(createMockResponse({ data: 'test' }));

        await client.request('/api/test');

        const calledHeaders = mockFetch.mock.calls[0][1].headers;
        expect(calledHeaders.Authorization).toBeUndefined();
      });

      it('does not add Authorization header when skipAuth is true', async () => {
        client.setAccessToken('bearer-token');
        mockFetch.mockResolvedValue(createMockResponse({ data: 'test' }));

        await client.request('/api/test', { skipAuth: true });

        const calledHeaders = mockFetch.mock.calls[0][1].headers;
        expect(calledHeaders.Authorization).toBeUndefined();
      });
    });

    describe('credentials handling', () => {
      it('includes credentials: include for cookies', async () => {
        mockFetch.mockResolvedValue(createMockResponse({ data: 'test' }));

        await client.request('/api/test');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            credentials: 'include',
          })
        );
      });
    });

    describe('JSON response parsing', () => {
      it('parses JSON response correctly', async () => {
        const responseData = { id: 1, name: 'Test' };
        mockFetch.mockResolvedValue(createMockResponse(responseData));

        const result = await client.request<{ id: number; name: string }>('/api/test');

        expect(result).toEqual(responseData);
      });

      it('handles 204 No Content response', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse(null, { status: 204, ok: true })
        );

        const result = await client.request('/api/test');

        expect(result).toBeUndefined();
      });
    });

    describe('error handling', () => {
      it('throws ApiClientError on non-OK response', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse(
            { message: 'Not found', code: 'NOT_FOUND' },
            { status: 404, ok: false, statusText: 'Not Found' }
          )
        );

        await expect(client.request('/api/test')).rejects.toThrow(ApiClientError);
      });

      it('includes status code in ApiClientError', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse(
            { message: 'Forbidden' },
            { status: 403, ok: false }
          )
        );

        try {
          await client.request('/api/test');
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiClientError);
          expect((error as ApiClientError).statusCode).toBe(403);
        }
      });

      it('includes error code in ApiClientError when provided', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse(
            { message: 'Invalid request', code: 'INVALID_REQUEST' },
            { status: 400, ok: false }
          )
        );

        try {
          await client.request('/api/test');
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiClientError);
          expect((error as ApiClientError).code).toBe('INVALID_REQUEST');
        }
      });

      it('uses statusText when response body is not JSON', async () => {
        const mockResponse = createMockResponse(null, {
          status: 500,
          ok: false,
          statusText: 'Internal Server Error',
        });
        (mockResponse.json as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not JSON'));
        mockFetch.mockResolvedValue(mockResponse);

        try {
          await client.request('/api/test');
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ApiClientError);
          expect((error as ApiClientError).message).toBe('Internal Server Error');
        }
      });
    });

    describe('request body handling', () => {
      it('serializes body as JSON', async () => {
        mockFetch.mockResolvedValue(createMockResponse({ success: true }));

        await client.request('/api/test', {
          method: 'POST',
          body: { name: 'Test', value: 123 },
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ name: 'Test', value: 123 }),
          })
        );
      });

      it('sets Content-Type header to application/json', async () => {
        mockFetch.mockResolvedValue(createMockResponse({ success: true }));

        await client.request('/api/test', { method: 'POST', body: { test: true } });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });
    });

    describe('URL handling', () => {
      it('prepends baseUrl to relative endpoints', async () => {
        mockFetch.mockResolvedValue(createMockResponse({ success: true }));

        await client.request('/api/test');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://test-api.example.com/api/test',
          expect.any(Object)
        );
      });

      it('uses absolute URLs as-is', async () => {
        mockFetch.mockResolvedValue(createMockResponse({ success: true }));

        await client.request('https://other-api.com/endpoint');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://other-api.com/endpoint',
          expect.any(Object)
        );
      });
    });
  });

  // ==========================================
  // Auto-Refresh on 401 Tests
  // ==========================================
  describe('Auto-Refresh on 401', () => {
    it('attempts refresh when 401 received with token', async () => {
      client.setAccessToken('expired-token');

      // First call returns 401, refresh succeeds, retry succeeds
      mockFetch
        .mockResolvedValueOnce(
          createMockResponse({ message: 'Unauthorized' }, { status: 401, ok: false })
        )
        .mockResolvedValueOnce(createMockResponse(mockRefreshResponse)) // refresh call
        .mockResolvedValueOnce(createMockResponse({ data: 'success' })); // retry call

      const result = await client.request<{ data: string }>('/api/protected');

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'http://test-api.example.com/api/auth/patient/refresh',
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toEqual({ data: 'success' });
    });

    it('retries original request after successful refresh', async () => {
      client.setAccessToken('expired-token');

      mockFetch
        .mockResolvedValueOnce(
          createMockResponse({ message: 'Unauthorized' }, { status: 401, ok: false })
        )
        .mockResolvedValueOnce(createMockResponse(mockRefreshResponse))
        .mockResolvedValueOnce(createMockResponse({ retried: true }));

      const result = await client.request<{ retried: boolean }>('/api/protected');

      expect(result).toEqual({ retried: true });

      // Verify retry used the new token
      const retryCall = mockFetch.mock.calls[2];
      expect(retryCall[1].headers.Authorization).toBe('Bearer new-access-token-456');
    });

    it('throws Session expired if refresh fails', async () => {
      client.setAccessToken('expired-token');

      mockFetch
        .mockResolvedValueOnce(
          createMockResponse({ message: 'Unauthorized' }, { status: 401, ok: false })
        )
        .mockResolvedValueOnce(
          createMockResponse({ message: 'Refresh failed' }, { status: 401, ok: false })
        );

      await expect(client.request('/api/protected')).rejects.toThrow('Session expired');
    });

    it('throws ApiClientError with SESSION_EXPIRED code on refresh failure', async () => {
      client.setAccessToken('expired-token');

      mockFetch
        .mockResolvedValueOnce(
          createMockResponse({ message: 'Unauthorized' }, { status: 401, ok: false })
        )
        .mockResolvedValueOnce(
          createMockResponse({ message: 'Refresh failed' }, { status: 401, ok: false })
        );

      try {
        await client.request('/api/protected');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).code).toBe('SESSION_EXPIRED');
        expect((error as ApiClientError).statusCode).toBe(401);
      }
    });

    it('does not refresh if no access token exists', async () => {
      // No token set
      mockFetch.mockResolvedValue(
        createMockResponse({ message: 'Unauthorized' }, { status: 401, ok: false })
      );

      await expect(client.request('/api/protected')).rejects.toThrow(ApiClientError);

      // Should only call once (no refresh attempt)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('does not refresh when skipAuth is true', async () => {
      client.setAccessToken('some-token');

      mockFetch.mockResolvedValue(
        createMockResponse({ message: 'Unauthorized' }, { status: 401, ok: false })
      );

      await expect(
        client.request('/api/protected', { skipAuth: true })
      ).rejects.toThrow(ApiClientError);

      // Should only call once (no refresh attempt)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('handles concurrent 401s with single refresh', async () => {
      client.setAccessToken('expired-token');

      // Setup: first request gets 401, second request gets 401,
      // but only one refresh should happen
      let refreshCallCount = 0;
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/refresh')) {
          refreshCallCount++;
          return Promise.resolve(createMockResponse(mockRefreshResponse));
        }
        // First calls return 401, subsequent calls succeed
        if (mockFetch.mock.calls.length <= 2) {
          return Promise.resolve(
            createMockResponse({ message: 'Unauthorized' }, { status: 401, ok: false })
          );
        }
        return Promise.resolve(createMockResponse({ success: true }));
      });

      // Make two concurrent requests
      const [result1, result2] = await Promise.all([
        client.request('/api/endpoint1'),
        client.request('/api/endpoint2'),
      ]);

      // Both should succeed
      expect(result1).toEqual({ success: true });
      expect(result2).toEqual({ success: true });
    });

    it('clears token when refresh fails', async () => {
      client.setAccessToken('expired-token');

      mockFetch
        .mockResolvedValueOnce(
          createMockResponse({ message: 'Unauthorized' }, { status: 401, ok: false })
        )
        .mockResolvedValueOnce(
          createMockResponse({ message: 'Refresh failed' }, { status: 401, ok: false })
        );

      try {
        await client.request('/api/protected');
      } catch {
        // Expected to throw
      }

      expect(client.getAccessToken()).toBeNull();
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  // ==========================================
  // Auth Methods Tests
  // ==========================================
  describe('Auth Methods', () => {
    describe('sendMagicLink', () => {
      it('calls correct endpoint with email', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({ success: true, message: 'Magic link sent' })
        );

        const result = await client.sendMagicLink('user@example.com');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://test-api.example.com/api/auth/patient/magic-link/send',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'user@example.com' }),
          })
        );
        expect(result).toEqual({ success: true, message: 'Magic link sent' });
      });

      it('does not include Authorization header (skipAuth)', async () => {
        client.setAccessToken('existing-token');
        mockFetch.mockResolvedValue(createMockResponse({ success: true }));

        await client.sendMagicLink('user@example.com');

        const calledHeaders = mockFetch.mock.calls[0][1].headers;
        expect(calledHeaders.Authorization).toBeUndefined();
      });
    });

    describe('verifyMagicLink', () => {
      it('returns user and stores token', async () => {
        mockFetch.mockResolvedValue(createMockResponse(mockAuthResponse));

        const result = await client.verifyMagicLink('magic-token-123', 'user@example.com');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://test-api.example.com/api/auth/patient/magic-link/verify',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ token: 'magic-token-123', email: 'user@example.com' }),
          })
        );
        expect(result).toEqual(mockAuthResponse);
        expect(client.getAccessToken()).toBe('test-access-token-123');
        expect(client.isAuthenticated()).toBe(true);
      });

      it('does not include Authorization header (skipAuth)', async () => {
        mockFetch.mockResolvedValue(createMockResponse(mockAuthResponse));

        await client.verifyMagicLink('token', 'email@example.com');

        const calledHeaders = mockFetch.mock.calls[0][1].headers;
        expect(calledHeaders.Authorization).toBeUndefined();
      });
    });

    describe('sendSmsOtp', () => {
      it('calls correct endpoint with phone', async () => {
        mockFetch.mockResolvedValue(
          createMockResponse({ success: true, message: 'OTP sent' })
        );

        const result = await client.sendSmsOtp('+15551234567');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://test-api.example.com/api/auth/patient/sms-otp/send',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ phone: '+15551234567' }),
          })
        );
        expect(result).toEqual({ success: true, message: 'OTP sent' });
      });

      it('does not include Authorization header (skipAuth)', async () => {
        client.setAccessToken('existing-token');
        mockFetch.mockResolvedValue(createMockResponse({ success: true }));

        await client.sendSmsOtp('+15551234567');

        const calledHeaders = mockFetch.mock.calls[0][1].headers;
        expect(calledHeaders.Authorization).toBeUndefined();
      });
    });

    describe('verifySmsOtp', () => {
      it('returns user and stores token', async () => {
        mockFetch.mockResolvedValue(createMockResponse(mockAuthResponse));

        const result = await client.verifySmsOtp('+15551234567', '123456');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://test-api.example.com/api/auth/patient/sms-otp/verify',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ phone: '+15551234567', code: '123456' }),
          })
        );
        expect(result).toEqual(mockAuthResponse);
        expect(client.getAccessToken()).toBe('test-access-token-123');
        expect(client.isAuthenticated()).toBe(true);
      });

      it('does not include Authorization header (skipAuth)', async () => {
        mockFetch.mockResolvedValue(createMockResponse(mockAuthResponse));

        await client.verifySmsOtp('+15551234567', '123456');

        const calledHeaders = mockFetch.mock.calls[0][1].headers;
        expect(calledHeaders.Authorization).toBeUndefined();
      });
    });

    describe('getCurrentUser', () => {
      it('calls /me endpoint with auth', async () => {
        client.setAccessToken('valid-token');
        mockFetch.mockResolvedValue(createMockResponse(mockUser));

        const result = await client.getCurrentUser();

        expect(mockFetch).toHaveBeenCalledWith(
          'http://test-api.example.com/api/auth/patient/me',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: 'Bearer valid-token',
            }),
          })
        );
        expect(result).toEqual(mockUser);
      });

      it('returns user data correctly', async () => {
        client.setAccessToken('valid-token');
        mockFetch.mockResolvedValue(createMockResponse(mockUser));

        const result = await client.getCurrentUser();

        expect(result.id).toBe('user-123');
        expect(result.email).toBe('test@example.com');
        expect(result.firstName).toBe('John');
        expect(result.lastName).toBe('Doe');
        expect(result.membershipTier).toBe('gold');
      });
    });

    describe('logout', () => {
      it('calls logout endpoint', async () => {
        client.setAccessToken('valid-token');
        mockFetch.mockResolvedValue(createMockResponse(null, { status: 204, ok: true }));

        await client.logout();

        expect(mockFetch).toHaveBeenCalledWith(
          'http://test-api.example.com/api/auth/patient/logout',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      it('clears token after successful logout', async () => {
        client.setAccessToken('valid-token');
        mockFetch.mockResolvedValue(createMockResponse(null, { status: 204, ok: true }));

        await client.logout();

        expect(client.getAccessToken()).toBeNull();
        expect(client.isAuthenticated()).toBe(false);
      });

      it('clears token even if logout request fails', async () => {
        client.setAccessToken('valid-token');
        mockFetch.mockResolvedValue(
          createMockResponse({ message: 'Server error' }, { status: 500, ok: false })
        );

        // Should not throw, but should still clear token
        try {
          await client.logout();
        } catch {
          // Expected to throw ApiClientError
        }

        expect(client.getAccessToken()).toBeNull();
        expect(client.isAuthenticated()).toBe(false);
      });
    });
  });

  // ==========================================
  // Constructor Tests
  // ==========================================
  describe('constructor', () => {
    it('uses provided baseUrl', () => {
      const customClient = new PatientApiClient('https://custom-api.com');
      mockFetch.mockResolvedValue(createMockResponse({ test: true }));

      customClient.request('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom-api.com/test',
        expect.any(Object)
      );
    });

    it('defaults to localhost:8080 when no URL provided', () => {
      const defaultClient = new PatientApiClient();
      mockFetch.mockResolvedValue(createMockResponse({ test: true }));

      defaultClient.request('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/test',
        expect.any(Object)
      );
    });
  });

  // ==========================================
  // ApiClientError Tests
  // ==========================================
  describe('ApiClientError', () => {
    it('has correct name property', () => {
      const error = new ApiClientError('Test error', 400);
      expect(error.name).toBe('ApiClientError');
    });

    it('has correct message property', () => {
      const error = new ApiClientError('Custom message', 400);
      expect(error.message).toBe('Custom message');
    });

    it('has correct statusCode property', () => {
      const error = new ApiClientError('Error', 404);
      expect(error.statusCode).toBe(404);
    });

    it('has correct code property when provided', () => {
      const error = new ApiClientError('Error', 400, 'VALIDATION_ERROR');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('code is undefined when not provided', () => {
      const error = new ApiClientError('Error', 400);
      expect(error.code).toBeUndefined();
    });

    it('is instanceof Error', () => {
      const error = new ApiClientError('Error', 400);
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ==========================================
  // refreshToken Method Tests
  // ==========================================
  describe('refreshToken method', () => {
    it('calls the refresh endpoint correctly', async () => {
      mockFetch.mockResolvedValue(createMockResponse(mockRefreshResponse));

      const result = await client.refreshToken();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.example.com/api/auth/patient/refresh',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toBe(true);
    });

    it('updates accessToken on successful refresh', async () => {
      mockFetch.mockResolvedValue(createMockResponse(mockRefreshResponse));

      await client.refreshToken();

      expect(client.getAccessToken()).toBe('new-access-token-456');
    });

    it('returns false and clears token on failed refresh', async () => {
      client.setAccessToken('old-token');
      mockFetch.mockResolvedValue(
        createMockResponse({ message: 'Refresh failed' }, { status: 401, ok: false })
      );

      const result = await client.refreshToken();

      expect(result).toBe(false);
      expect(client.getAccessToken()).toBeNull();
    });

    it('returns false on network error', async () => {
      client.setAccessToken('old-token');
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await client.refreshToken();

      expect(result).toBe(false);
      expect(client.getAccessToken()).toBeNull();
    });

    it('handles concurrent refresh calls with single request', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        return new Promise((resolve) =>
          setTimeout(() => resolve(createMockResponse(mockRefreshResponse)), 50)
        );
      });

      // Make concurrent refresh calls
      const [result1, result2, result3] = await Promise.all([
        client.refreshToken(),
        client.refreshToken(),
        client.refreshToken(),
      ]);

      // All should succeed but only one actual fetch call
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(callCount).toBe(1);
    });
  });
});
