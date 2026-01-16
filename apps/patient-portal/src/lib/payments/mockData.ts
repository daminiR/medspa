// Mock payment methods data

export interface PaymentMethod {
  id: string;
  type: 'card';
  brand: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  isHsaFsa: boolean;
  cardholderName: string;
}

export interface IIASService {
  name: string;
  description: string;
  units?: number;
  pricePerUnit?: number;
  amount: number;
  hsaFsaEligible: boolean;
  medicalNecessity?: string;
}

export interface IIASReceiptData {
  receiptNumber: string;
  provider: {
    name: string;
    taxId: string;
    licenseNumber: string;
    address: string;
    phone: string;
  };
  patient: {
    name: string;
    dateOfService: string;
  };
  services: IIASService[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
    hsaFsaEligible: number;
  };
  payment: {
    method: string;
    date: string;
    transactionId: string;
  };
  substantiation: string;
}

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
    isHsaFsa: false,
    cardholderName: 'Sarah Johnson'
  },
  {
    id: 'pm_2',
    type: 'card',
    brand: 'mastercard',
    last4: '5555',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
    isHsaFsa: true,
    cardholderName: 'Sarah Johnson'
  },
  {
    id: 'pm_3',
    type: 'card',
    brand: 'amex',
    last4: '3782',
    expiryMonth: 3,
    expiryYear: 2027,
    isDefault: false,
    isHsaFsa: true,
    cardholderName: 'Sarah Johnson'
  }
];

export const mockIIASReceipt: IIASReceiptData = {
  receiptNumber: 'IIAS-2024-001',
  provider: {
    name: 'Glow Medical Spa',
    taxId: '12-3456789',
    licenseNumber: 'CA-MED-12345',
    address: '123 Wellness Way, San Francisco, CA 94102',
    phone: '(555) 123-4567'
  },
  patient: {
    name: 'Sarah Johnson',
    dateOfService: 'December 15, 2024'
  },
  services: [
    {
      name: 'Botox - Glabella (Frown Lines)',
      description: 'Botulinum toxin injection for chronic migraine treatment',
      units: 20,
      pricePerUnit: 12,
      amount: 240,
      hsaFsaEligible: true,
      medicalNecessity: 'Chronic migraine treatment (ICD-10: G43.909)'
    },
    {
      name: 'Dermal Filler - Nasolabial Folds',
      description: 'Hyaluronic acid filler for facial volume restoration',
      units: 1,
      pricePerUnit: 650,
      amount: 650,
      hsaFsaEligible: false,
      medicalNecessity: 'Cosmetic enhancement'
    },
    {
      name: 'Consultation Fee',
      description: 'Medical consultation and treatment planning',
      amount: 75,
      hsaFsaEligible: true,
      medicalNecessity: 'Medical evaluation required for treatment'
    }
  ],
  totals: {
    subtotal: 965,
    tax: 0,
    total: 965,
    hsaFsaEligible: 315
  },
  payment: {
    method: 'Mastercard ending in 5555 (HSA)',
    date: 'December 15, 2024',
    transactionId: 'TXN-20241215-001234'
  },
  substantiation: 'This receipt substantiates that the itemized medical expenses listed above were incurred for medical care as defined in IRS Code Section 213(d) and are eligible for reimbursement from your Health Savings Account (HSA) or Flexible Spending Account (FSA). This meets IIAS-90 requirements for auto-substantiation of qualified medical expenses.'
};

// Mock appointments with receipt data
export const mockAppointmentReceipts: Record<string, IIASReceiptData> = {
  '1': mockIIASReceipt,
  '2': {
    ...mockIIASReceipt,
    receiptNumber: 'IIAS-2024-002',
    patient: {
      name: 'Sarah Johnson',
      dateOfService: 'November 28, 2024'
    },
    services: [
      {
        name: 'Chemical Peel - Medium Depth',
        description: 'Glycolic acid peel for skin texture improvement',
        amount: 250,
        hsaFsaEligible: false,
        medicalNecessity: 'Cosmetic procedure'
      }
    ],
    totals: {
      subtotal: 250,
      tax: 0,
      total: 250,
      hsaFsaEligible: 0
    },
    payment: {
      method: 'Visa ending in 4242',
      date: 'November 28, 2024',
      transactionId: 'TXN-20241128-005678'
    }
  }
};
