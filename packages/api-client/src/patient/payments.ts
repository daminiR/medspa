/**
 * Payments API Functions
 */

import type { ApiClient } from '../client';
import type {
  PaymentMethod,
  AddPaymentMethodRequest,
  ProcessPaymentRequest,
  Payment,
} from './types';
import { patientEndpoints } from './index';

export interface PaymentsApi {
  /**
   * Get list of payment methods
   */
  listMethods(): Promise<{
    paymentMethods: PaymentMethod[];
    defaultMethodId: string | null;
  }>;

  /**
   * Add a new payment method
   */
  addMethod(data: AddPaymentMethodRequest): Promise<{
    message: string;
    paymentMethod: PaymentMethod;
  }>;

  /**
   * Update a payment method (set as default, etc.)
   */
  updateMethod(
    id: string,
    data: { setDefault?: boolean; active?: boolean }
  ): Promise<{
    message: string;
    paymentMethod: PaymentMethod;
  }>;

  /**
   * Remove a payment method
   */
  removeMethod(id: string): Promise<{ message: string }>;

  /**
   * Process a payment
   */
  processPayment(data: ProcessPaymentRequest): Promise<{
    message: string;
    payment: Payment;
  }>;
}

export function createPaymentsApi(client: ApiClient): PaymentsApi {
  return {
    async listMethods() {
      const response = await client.get<{
        data: {
          paymentMethods: PaymentMethod[];
          defaultMethodId: string | null;
        };
      }>(patientEndpoints.paymentMethods.list);
      return response.data;
    },

    async addMethod(data: AddPaymentMethodRequest) {
      const response = await client.post<{
        data: {
          message: string;
          paymentMethod: PaymentMethod;
        };
      }>(patientEndpoints.paymentMethods.add, data);
      return response.data;
    },

    async updateMethod(id: string, data: { setDefault?: boolean; active?: boolean }) {
      const response = await client.patch<{
        data: {
          message: string;
          paymentMethod: PaymentMethod;
        };
      }>(patientEndpoints.paymentMethods.update(id), data);
      return response.data;
    },

    async removeMethod(id: string) {
      const response = await client.delete<{ data: { message: string } }>(
        patientEndpoints.paymentMethods.remove(id)
      );
      return response.data;
    },

    async processPayment(data: ProcessPaymentRequest) {
      const response = await client.post<{
        data: {
          message: string;
          payment: Payment;
        };
      }>(patientEndpoints.payments.process, data);
      return response.data;
    },
  };
}
