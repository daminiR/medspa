/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VerifyPage from '../page';

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
}));

// Mock the Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button className={className} data-testid="button">
      {children}
    </button>
  ),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('VerifyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Reset search params
    mockSearchParams.delete('token');
    mockSearchParams.delete('email');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Parameter Handling', () => {
    it('shows error when token is missing', async () => {
      mockSearchParams.set('email', 'test@example.com');
      // No token set

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Invalid link')).toBeInTheDocument();
      });

      expect(screen.getByText('The verification link is missing required parameters.')).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('shows error when email is missing', async () => {
      mockSearchParams.set('token', 'valid-token-123');
      // No email set

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Invalid link')).toBeInTheDocument();
      });

      expect(screen.getByText('The verification link is missing required parameters.')).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('extracts token and email from URL params and calls API', async () => {
      const testToken = 'test-magic-link-token-abc123';
      const testEmail = 'patient@example.com';
      mockSearchParams.set('token', testToken);
      mockSearchParams.set('email', testEmail);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/auth/patient/magic-link/verify',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: testToken, email: testEmail }),
          }
        );
      });
    });
  });

  describe('Verification Flow', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'valid-token');
      mockSearchParams.set('email', 'test@example.com');
    });

    it('shows "Signing you in..." while verifying', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(pendingPromise);

      render(<VerifyPage />);

      // Should show verifying state initially
      expect(screen.getByText('Signing you in...')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we verify your magic link.')).toBeInTheDocument();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

      // Cleanup: resolve the promise
      resolvePromise!({ ok: true, status: 200 });
    });

    it('calls API with token and email', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/patient/magic-link/verify',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: 'valid-token', email: 'test@example.com' }),
        })
      );
    });

    it('shows success state on successful verification', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      });

      expect(screen.getByText('You have been successfully signed in.')).toBeInTheDocument();
      expect(screen.getByText('Redirecting to dashboard...')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('auto-redirects to /dashboard after 2 seconds on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      });

      // Router push should not be called immediately
      expect(mockPush).not.toHaveBeenCalled();

      // Fast-forward time by 2 seconds
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'some-token');
      mockSearchParams.set('email', 'test@example.com');
    });

    it('shows "Link expired" for 410 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 410,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Link expired')).toBeInTheDocument();
      });

      expect(screen.getByText('This magic link has expired. Please request a new one to sign in.')).toBeInTheDocument();
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
    });

    it('shows "Link already used" for 401 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Link already used')).toBeInTheDocument();
      });

      expect(screen.getByText('This magic link has already been used. Each link can only be used once.')).toBeInTheDocument();
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
    });

    it('shows "Invalid link" for 400 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Invalid link')).toBeInTheDocument();
      });

      expect(screen.getByText('The verification link is invalid or malformed. Please request a new one.')).toBeInTheDocument();
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
    });

    it('shows "Invalid link" for other error status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Invalid link')).toBeInTheDocument();
      });

      expect(screen.getByText('The verification link is invalid or malformed. Please request a new one.')).toBeInTheDocument();
    });

    it('shows "Verification failed" for network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Verification failed')).toBeInTheDocument();
      });

      expect(screen.getByText('Unable to verify your link. Please check your connection and try again.')).toBeInTheDocument();
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('shows "Request new link" button on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 410,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Request new link')).toBeInTheDocument();
      });

      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockSearchParams.set('token', 'expired-token');
      mockSearchParams.set('email', 'test@example.com');
    });

    it('"Request new link" navigates to /auth/login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 410,
      });

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Request new link')).toBeInTheDocument();
      });

      const link = screen.getByTestId('link');
      expect(link).toHaveAttribute('href', '/auth/login');
    });
  });

  describe('Suspense Fallback', () => {
    it('renders the main component wrapped in Suspense', () => {
      mockSearchParams.set('token', 'test-token');
      mockSearchParams.set('email', 'test@example.com');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const { container } = render(<VerifyPage />);

      // The component should render without throwing
      expect(container).toBeTruthy();
    });
  });

  describe('Branding', () => {
    it('displays the MedSpa branding', async () => {
      mockSearchParams.set('token', 'test-token');
      mockSearchParams.set('email', 'test@example.com');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(<VerifyPage />);

      expect(screen.getByText('Glow MedSpa Patient Portal')).toBeInTheDocument();
    });
  });

  describe('Both parameters missing', () => {
    it('shows error when both token and email are missing', async () => {
      // Both params are already cleared in beforeEach

      render(<VerifyPage />);

      await waitFor(() => {
        expect(screen.getByText('Invalid link')).toBeInTheDocument();
      });

      expect(screen.getByText('The verification link is missing required parameters.')).toBeInTheDocument();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
