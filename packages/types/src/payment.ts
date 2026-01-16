/**
 * Payment Types
 */

export type PaymentMethodType = 'card' | 'bank_account' | 'hsa' | 'fsa' | 'apple_pay' | 'google_pay';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'disputed';

export interface PaymentMethod {
  id: string;
  patientId: string;
  type: PaymentMethodType;

  // Card details (if card)
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;

  // Bank details (if bank)
  bankName?: string;
  bankLast4?: string;

  // HSA/FSA details
  hsaFsaProvider?: string;
  hsaFsaAccountLast4?: string;
  hsaFsaVerified?: boolean;

  // Status
  isDefault: boolean;
  active: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  patientId: string;
  appointmentId?: string;
  invoiceId?: string;

  // Amount
  amount: number;
  currency: string;
  tip?: number;

  // Payment details
  paymentMethodId: string;
  paymentMethodType: PaymentMethodType;
  status: PaymentStatus;

  // HSA/FSA specific
  isHsaFsa: boolean;
  hsaFsaEligibleAmount?: number;
  iiasApproved?: boolean; // Inventory Information Approval System

  // Stripe
  stripePaymentIntentId?: string;
  stripeChargeId?: string;

  // Refund
  refundedAmount?: number;
  refundedAt?: string;
  refundReason?: string;

  // Receipt
  receiptUrl?: string;
  receiptSentAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;

  // Items
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;

  // Status
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate?: string;
  paidAt?: string;

  // Related
  paymentIds: string[];

  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  type: 'service' | 'product' | 'package' | 'deposit' | 'adjustment';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxable: boolean;
  hsaFsaEligible: boolean;
}

export interface HsaFsaAccount {
  id: string;
  patientId: string;
  type: 'hsa' | 'fsa';
  provider: string;
  accountLast4: string;
  verified: boolean;
  verifiedAt?: string;
  balance?: number;
  balanceAsOf?: string;
}

export interface AddPaymentMethodRequest {
  type: PaymentMethodType;
  stripePaymentMethodId?: string;
  setDefault?: boolean;
}
