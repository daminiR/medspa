/**
 * OTP Verification Page Tests
 *
 * Comprehensive tests for the OTP verification page covering:
 * - Phone number handling and display
 * - OTP input behavior (digits, auto-advance, backspace, paste)
 * - Auto-submit on complete
 * - Error handling and lockout
 * - Resend code functionality
 * - Navigation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerifyOtpPage from '../page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock sessionStorage
let mockSessionStorageData: Record<string, string> = {};

const sessionStorageMock = {
  getItem: vi.fn((key: string) => mockSessionStorageData[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockSessionStorageData[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockSessionStorageData[key];
  }),
  clear: vi.fn(() => {
    mockSessionStorageData = {};
  }),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

describe('VerifyOtpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // Reset and populate sessionStorage mock
    mockSessionStorageData = { otpPhone: '+15551234567' };
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    mockSessionStorageData = {};
  });

  // ===========================================
  // Phone Number Handling Tests
  // ===========================================
  describe('Phone Number Handling', () => {
    it('redirects to /auth/login if no phone in sessionStorage', async () => {
      mockSessionStorageData = {}; // Clear the phone

      render(<VerifyOtpPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('displays masked phone number (XXX) XXX-1234', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        expect(screen.getByText('(XXX) XXX-4567')).toBeInTheDocument();
      });
    });

    it('shows loading state initially before phone is loaded', () => {
      mockSessionStorageData = {}; // Clear the phone

      render(<VerifyOtpPage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  // ===========================================
  // OTP Input Tests
  // ===========================================
  describe('OTP Input', () => {
    it('renders 6 input boxes', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(6);
      });
    });

    it('each input accepts only digits', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      // Try to enter a letter
      fireEvent.change(inputs[0], { target: { value: 'a' } });
      expect(inputs[0]).toHaveValue('');

      // Try to enter a digit
      fireEvent.change(inputs[0], { target: { value: '5' } });
      expect(inputs[0]).toHaveValue('5');
    });

    it('auto-advances to next input on digit entry', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      // Focus first input and enter digit
      fireEvent.focus(inputs[0]);
      fireEvent.change(inputs[0], { target: { value: '1' } });

      // Check next input receives focus
      await waitFor(() => {
        expect(document.activeElement).toBe(inputs[1]);
      });
    });

    it('backspace moves to previous input when current is empty', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      // Enter digits in first two inputs
      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '2' } });

      // Focus third input and press backspace (empty input)
      fireEvent.focus(inputs[2]);
      fireEvent.keyDown(inputs[2], { key: 'Backspace' });

      // Should move focus to second input
      await waitFor(() => {
        expect(document.activeElement).toBe(inputs[1]);
      });
    });

    it('backspace clears current input when it has value', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      // Enter digit in first input
      fireEvent.change(inputs[0], { target: { value: '5' } });
      expect(inputs[0]).toHaveValue('5');

      // Press backspace on first input (with value)
      fireEvent.focus(inputs[0]);
      fireEvent.keyDown(inputs[0], { key: 'Backspace' });

      // Value should be cleared
      await waitFor(() => {
        expect(inputs[0]).toHaveValue('');
      });
    });

    it('supports paste of full 6-digit code', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');
      const container = inputs[0].parentElement;

      // Mock paste event with 6 digits
      const pasteData = '123456';
      const clipboardData = {
        getData: () => pasteData,
      };

      // Prevent auto-submit by not completing mockFetch setup
      mockFetch.mockImplementation(() => new Promise(() => {}));

      fireEvent.paste(container!, {
        clipboardData,
      });

      await waitFor(() => {
        expect(inputs[0]).toHaveValue('1');
        expect(inputs[1]).toHaveValue('2');
        expect(inputs[2]).toHaveValue('3');
        expect(inputs[3]).toHaveValue('4');
        expect(inputs[4]).toHaveValue('5');
        expect(inputs[5]).toHaveValue('6');
      });
    });

    it('handles paste with non-digit characters (filters them out)', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');
      const container = inputs[0].parentElement;

      // Mock paste with mixed characters
      const pasteData = '1a2b3c4d5e6';
      const clipboardData = {
        getData: () => pasteData,
      };

      mockFetch.mockImplementation(() => new Promise(() => {}));

      fireEvent.paste(container!, {
        clipboardData,
      });

      await waitFor(() => {
        expect(inputs[0]).toHaveValue('1');
        expect(inputs[1]).toHaveValue('2');
        expect(inputs[2]).toHaveValue('3');
        expect(inputs[3]).toHaveValue('4');
        expect(inputs[4]).toHaveValue('5');
        expect(inputs[5]).toHaveValue('6');
      });
    });

    it('arrow left moves focus to previous input', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      fireEvent.focus(inputs[2]);
      fireEvent.keyDown(inputs[2], { key: 'ArrowLeft' });

      expect(document.activeElement).toBe(inputs[1]);
    });

    it('arrow right moves focus to next input', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      fireEvent.focus(inputs[2]);
      fireEvent.keyDown(inputs[2], { key: 'ArrowRight' });

      expect(document.activeElement).toBe(inputs[3]);
    });
  });

  // ===========================================
  // Auto-Submit Tests
  // ===========================================
  describe('Auto-Submit', () => {
    it('automatically submits when 6 digits entered', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      // Enter all 6 digits
      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/auth/patient/sms-otp/verify',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    it('shows loading state during verification', async () => {
      mockFetch.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 1000))
      );

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      // Enter all 6 digits
      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        expect(screen.getByText('Verifying...')).toBeInTheDocument();
      });
    });

    it('redirects to /dashboard on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      // Enter all 6 digits
      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Verified!')).toBeInTheDocument();
      });

      // Advance timer for redirect delay
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('removes phone from sessionStorage on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('otpPhone');
      });
    });
  });

  // ===========================================
  // Error Handling Tests
  // ===========================================
  describe('Error Handling', () => {
    it('clears inputs on wrong code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid code' }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      // Enter all 6 digits
      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        // All inputs should be cleared
        inputs.forEach((input) => {
          expect(input).toHaveValue('');
        });
      });
    });

    it('shows error message on wrong code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid verification code. Please try again.' }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        expect(screen.getByText('Invalid verification code. Please try again.')).toBeInTheDocument();
      });
    });

    it('shows shake animation class on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid code' }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        const container = inputs[0].parentElement;
        expect(container).toHaveClass('otp-shake');
      });
    });

    it('shows lockout message on 429 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ retryAfter: 60 }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        expect(screen.getByText('Too many attempts. Please try again in 60 seconds.')).toBeInTheDocument();
      });
    });

    it('disables inputs during lockout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ retryAfter: 60 }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        inputs.forEach((input) => {
          expect(input).toBeDisabled();
        });
      });
    });

    it('shows generic error message on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // Resend Code Tests
  // ===========================================
  describe('Resend Code', () => {
    it('shows 30-second cooldown after page loads', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        expect(screen.getByText(/Resend in 30s/)).toBeInTheDocument();
      });
    });

    it('shows "Didn\'t receive the code?" text', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        expect(screen.getByText("Didn't receive the code?")).toBeInTheDocument();
      });
    });

    it('hides resend button during cooldown', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        expect(screen.getByText(/Resend in 30s/)).toBeInTheDocument();
      });

      // During cooldown, the button should not be visible
      expect(screen.queryByRole('button', { name: /Resend code/i })).not.toBeInTheDocument();
    });

    it('shows cooldown text with countdown number', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        // The cooldown text should include a number
        const cooldownText = screen.getByText(/Resend in \d+s/);
        expect(cooldownText).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // Navigation Tests
  // ===========================================
  describe('Navigation', () => {
    it('"Use a different number" link navigates to /auth/login', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const link = screen.getByText('Use a different number');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/auth/login');
      });
    });

    it('back arrow link navigates to /auth/login', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: '' });
        expect(backLink).toHaveAttribute('href', '/auth/login');
      });
    });

    it('Terms of Service link is present', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
        expect(termsLink).toHaveAttribute('href', '/terms');
      });
    });

    it('Privacy Policy link is present', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
        expect(privacyLink).toHaveAttribute('href', '/privacy');
      });
    });
  });

  // ===========================================
  // Accessibility Tests
  // ===========================================
  describe('Accessibility', () => {
    it('each input has appropriate aria-label', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input, index) => {
        expect(input).toHaveAttribute('aria-label', `Digit ${index + 1} of 6`);
      });
    });

    it('inputs have numeric inputMode', async () => {
      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input) => {
        expect(input).toHaveAttribute('inputMode', 'numeric');
      });
    });
  });

  // ===========================================
  // Success State Tests
  // ===========================================
  describe('Success State', () => {
    it('shows success icon and message on verification', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        expect(screen.getByText('Verified!')).toBeInTheDocument();
        expect(screen.getByText('Redirecting to your dashboard...')).toBeInTheDocument();
      });
    });

    it('hides OTP inputs after successful verification', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        expect(screen.getByText('Verified!')).toBeInTheDocument();
        // OTP inputs should be hidden
        expect(screen.queryAllByRole('textbox')).toHaveLength(0);
      });
    });
  });

  // ===========================================
  // Lockout State Tests
  // ===========================================
  describe('Lockout State', () => {
    it('shows lock icon during lockout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ retryAfter: 60 }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        expect(screen.getByText(/Account temporarily locked/)).toBeInTheDocument();
      });
    });

    it('hides resend button during lockout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ retryAfter: 60 }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        expect(screen.queryByText(/Didn't receive the code/)).not.toBeInTheDocument();
      });
    });

    it('shows lockout countdown in description', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ retryAfter: 60 }),
      });

      render(<VerifyOtpPage />);

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBe(6);
      });

      const inputs = screen.getAllByRole('textbox');

      for (let i = 0; i < 6; i++) {
        fireEvent.change(inputs[i], { target: { value: String(i + 1) } });
      }

      await waitFor(() => {
        // Should show the lockout message with countdown
        expect(screen.getByText(/Account temporarily locked/)).toBeInTheDocument();
        expect(screen.getByText(/Try again in \d+s/)).toBeInTheDocument();
      });
    });
  });
});
