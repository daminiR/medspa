// Mock CRUD operations for payment methods
import { mockPaymentMethods, mockAppointmentReceipts, PaymentMethod, IIASReceiptData } from './mockData';

// In-memory store for payment methods
let paymentMethods = [...mockPaymentMethods];

export const paymentService = {
  // Get all payment methods
  getPaymentMethods: (): PaymentMethod[] => {
    return [...paymentMethods];
  },

  // Get a single payment method by ID
  getPaymentMethod: (id: string): PaymentMethod | undefined => {
    return paymentMethods.find(pm => pm.id === id);
  },

  // Add a new payment method
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>): PaymentMethod => {
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm_${Date.now()}`,
    };

    // If this is the first card or marked as default, set it as default
    if (paymentMethods.length === 0 || newMethod.isDefault) {
      paymentMethods = paymentMethods.map(pm => ({ ...pm, isDefault: false }));
      newMethod.isDefault = true;
    }

    paymentMethods.push(newMethod);
    return newMethod;
  },

  // Update a payment method
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>): PaymentMethod | null => {
    const index = paymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) return null;

    paymentMethods[index] = { ...paymentMethods[index], ...updates };
    return paymentMethods[index];
  },

  // Delete a payment method
  deletePaymentMethod: (id: string): boolean => {
    const initialLength = paymentMethods.length;
    const methodToDelete = paymentMethods.find(pm => pm.id === id);

    paymentMethods = paymentMethods.filter(pm => pm.id !== id);

    // If deleted method was default, make first remaining card default
    if (methodToDelete?.isDefault && paymentMethods.length > 0) {
      paymentMethods[0].isDefault = true;
    }

    return paymentMethods.length < initialLength;
  },

  // Set a payment method as default
  setDefaultPaymentMethod: (id: string): PaymentMethod | null => {
    const method = paymentMethods.find(pm => pm.id === id);
    if (!method) return null;

    paymentMethods = paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    }));

    return paymentMethods.find(pm => pm.id === id) || null;
  },

  // Toggle HSA/FSA status
  toggleHsaFsa: (id: string): PaymentMethod | null => {
    const index = paymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) return null;

    // Use immutable pattern to avoid direct mutation
    paymentMethods[index] = {
      ...paymentMethods[index],
      isHsaFsa: !paymentMethods[index].isHsaFsa
    };
    return paymentMethods[index];
  },

  // Get HSA/FSA payment methods only
  getHsaFsaPaymentMethods: (): PaymentMethod[] => {
    return paymentMethods.filter(pm => pm.isHsaFsa);
  },

  // Get default payment method
  getDefaultPaymentMethod: (): PaymentMethod | undefined => {
    return paymentMethods.find(pm => pm.isDefault);
  },

  // Calculate total HSA/FSA eligible amount from methods
  getHsaFsaMethodCount: (): number => {
    return paymentMethods.filter(pm => pm.isHsaFsa).length;
  },

  // Get IIAS receipt for an appointment
  getReceiptForAppointment: (appointmentId: string): IIASReceiptData | undefined => {
    return mockAppointmentReceipts[appointmentId];
  },

  // Reset to mock data (useful for testing)
  resetToMockData: (): void => {
    paymentMethods = [...mockPaymentMethods];
  }
};

// Export types
export type { PaymentMethod, IIASReceiptData };
