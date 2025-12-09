/**
 * Stripe Client Service
 * Handles payment processing, customer management, and subscriptions
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    // Using test mode key for development
    // Replace with process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in production
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QZyyJDRKF9WxVc9QhzYwXBHDXh3vGTtKXFRB8mPNxBZJHD0XGNcJlFX1YZJKRjVWy5xNPQxOqKFdqZJHD0XGNcJl');
  }
  return stripePromise;
};

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface ChargeDetails {
  amount: number;
  currency?: string;
  description?: string;
  patientId: string;
  patientEmail?: string;
  metadata?: Record<string, string>;
}

export interface RefundDetails {
  chargeId: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface SubscriptionDetails {
  customerId: string;
  priceId: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}

// API functions to communicate with our backend
export const stripeAPI = {
  // Create a payment intent for processing payments
  async createPaymentIntent(details: ChargeDetails): Promise<PaymentIntent> {
    const response = await fetch('/api/stripe/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }
    
    return response.json();
  },

  // Process a quick charge (for walk-ins or simple payments)
  async createCharge(details: ChargeDetails): Promise<any> {
    const response = await fetch('/api/stripe/charge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process charge');
    }
    
    return response.json();
  },

  // Issue a refund
  async createRefund(details: RefundDetails): Promise<any> {
    const response = await fetch('/api/stripe/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process refund');
    }
    
    return response.json();
  },

  // Create or get a Stripe customer
  async createCustomer(patientData: {
    id: string;
    email: string;
    name: string;
    phone?: string;
  }): Promise<any> {
    const response = await fetch('/api/stripe/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create customer');
    }
    
    return response.json();
  },

  // Create a subscription for memberships
  async createSubscription(details: SubscriptionDetails): Promise<any> {
    const response = await fetch('/api/stripe/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }
    
    return response.json();
  },

  // Get payment history for a patient
  async getPaymentHistory(patientId: string): Promise<any[]> {
    const response = await fetch(`/api/stripe/payments?patientId=${patientId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }
    
    return response.json();
  },

  // Verify webhook signature (for security)
  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    const response = await fetch('/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      body: payload,
    });
    
    return response.ok;
  }
};

// Utility functions for formatting
export const formatCurrency = (amount: number, currency = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Stripe amounts are in cents
};

export const formatCardBrand = (brand: string): string => {
  const brands: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
  };
  
  return brands[brand.toLowerCase()] || brand;
};