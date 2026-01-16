/**
 * Stripe Payment Service for HSA/FSA Support
 * 
 * Features:
 * - Add payment methods with Stripe
 * - Process payments with MCC 8099 (medical services)
 * - Generate IIAS-compliant receipts
 * - HSA/FSA card support
 */

import type { PaymentMethod, AddPaymentMethodRequest, Payment } from '@medical-spa/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_KEY || '';

// MCC 8099 = Medical Services and Health Practitioners, Not Elsewhere Classified
const MEDICAL_MCC_CODE = '8099';

interface CardDetails {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name: string;
  addressZip: string;
}

interface ProcessPaymentRequest {
  appointmentId: string;
  amount: number;
  paymentMethodId: string;
  isHsaFsa?: boolean;
  hsaFsaEligibleAmount?: number;
}

interface IIASReceiptData {
  appointmentId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  providerTaxId: string;
  providerAddress: string;
  serviceDate: string;
  services: Array<{
    name: string;
    description: string;
    amount: number;
    hsaFsaEligible: boolean;
  }>;
  totalAmount: number;
  hsaFsaEligibleAmount: number;
  paymentId: string;
}

class PaymentService {
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all payment methods for the current user
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.fetchWithAuth(`${API_URL}/payments/methods`);
  }

  /**
   * Create a Stripe PaymentMethod and save it
   * 
   * In production, use @stripe/stripe-react-native for secure card tokenization
   */
  async addPaymentMethod(cardDetails: CardDetails, isHsaFsa: boolean = false): Promise<PaymentMethod> {
    try {
      // Step 1: Create Stripe PaymentMethod (in production, use Stripe SDK)
      // This is a simplified example - actual implementation should use Stripe Elements
      const stripePaymentMethod = await this.createStripePaymentMethod(cardDetails);
      
      // Step 2: Save to backend
      const request: AddPaymentMethodRequest = {
        type: isHsaFsa ? 'hsa' : 'card',
        stripePaymentMethodId: stripePaymentMethod.id,
        setDefault: false,
      };

      const paymentMethod = await this.fetchWithAuth(`${API_URL}/payments/methods`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      // Step 3: Mark as HSA/FSA if needed
      if (isHsaFsa) {
        await this.toggleHsaFsa(paymentMethod.id, true);
      }

      return paymentMethod;
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      throw new Error(error.message || 'Failed to add payment method');
    }
  }

  /**
   * Create Stripe PaymentMethod
   * 
   * NOTE: In production, this should be done client-side using Stripe SDK
   * to ensure PCI compliance. Never send raw card details to your backend.
   */
  private async createStripePaymentMethod(cardDetails: CardDetails): Promise<any> {
    // This is a placeholder for Stripe SDK integration
    // In production: import { createPaymentMethod } from '@stripe/stripe-react-native'
    
    const response = await fetch(`${API_URL}/payments/stripe/create-payment-method`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      },
      body: JSON.stringify({
        cardDetails,
        mccCode: MEDICAL_MCC_CODE, // Medical services
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment method with Stripe');
    }

    return response.json();
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId: string): Promise<void> {
    await this.fetchWithAuth(`${API_URL}/payments/methods/${methodId}/default`, {
      method: 'PUT',
    });
  }

  /**
   * Toggle HSA/FSA status for a payment method
   */
  async toggleHsaFsa(methodId: string, isHsaFsa: boolean): Promise<void> {
    await this.fetchWithAuth(`${API_URL}/payments/methods/${methodId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        hsaFsaVerified: isHsaFsa,
        type: isHsaFsa ? 'hsa' : 'card',
      }),
    });
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    await this.fetchWithAuth(`${API_URL}/payments/methods/${methodId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Process payment for an appointment
   * 
   * Includes proper MCC code for HSA/FSA eligibility
   */
  async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    const payment = await this.fetchWithAuth(`${API_URL}/payments/process`, {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        mccCode: MEDICAL_MCC_CODE, // Critical for HSA/FSA approval
        metadata: {
          service_type: 'medical_spa',
          hsa_fsa_eligible: request.isHsaFsa,
        },
      }),
    });

    // Generate IIAS receipt if HSA/FSA payment
    if (request.isHsaFsa && payment.id) {
      await this.generateIIASReceipt(payment.id);
    }

    return payment;
  }

  /**
   * Generate IIAS-compliant receipt
   * 
   * IIAS (Inventory Information Approval System) requires:
   * - Service provider name, tax ID, address
   * - Date of service
   * - Description of medical services
   * - Itemized charges
   * - Provider signature
   * - IIAS-90 substantiation statement
   */
  async generateIIASReceipt(paymentId: string): Promise<string> {
    const response = await this.fetchWithAuth(`${API_URL}/payments/${paymentId}/receipt/iias`, {
      method: 'POST',
    });
    
    return response.receiptUrl;
  }

  /**
   * Get IIAS receipt for a payment
   */
  async getIIASReceipt(paymentId: string): Promise<IIASReceiptData> {
    return this.fetchWithAuth(`${API_URL}/payments/${paymentId}/receipt/iias`);
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(filters?: {
    startDate?: string;
    endDate?: string;
    hsaFsaOnly?: boolean;
  }): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.hsaFsaOnly) params.append('hsaFsaOnly', 'true');

    const queryString = params.toString();
    const url = queryString ? `${API_URL}/payments?${queryString}` : `${API_URL}/payments`;
    return this.fetchWithAuth(url);
  }

  /**
   * Calculate HSA/FSA eligible amount for services
   */
  calculateHsaFsaEligibleAmount(items: Array<{ hsaFsaEligible: boolean; total: number }>): number {
    return items
      .filter(item => item.hsaFsaEligible)
      .reduce((sum, item) => sum + item.total, 0);
  }

  /**
   * Validate HSA/FSA card (checks if MCC is accepted)
   */
  async validateHsaFsaCard(paymentMethodId: string): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(
        `${API_URL}/payments/methods/${paymentMethodId}/validate-hsa-fsa`,
        { method: 'POST' }
      );
      return response.valid;
    } catch (error) {
      console.error('HSA/FSA validation error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
