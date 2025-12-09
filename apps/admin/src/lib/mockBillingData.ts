// Mock Billing Data for Medical Spa
import { Invoice, Payment, PaymentMethod, Package, Membership, Product } from '@/types/billing'

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2024-001',
    patientId: 'patient-1',
    patientName: 'Emma Thompson',
    practitionerId: 'prac-1',
    practitionerName: 'Dr. Sarah Chen',
    locationId: 'loc-1',
    locationName: 'Beverly Hills Clinic',
    invoiceDate: new Date('2025-08-26'),
    dueDate: new Date('2025-09-09'),
    serviceDate: new Date('2025-08-26'),
    lineItems: [
      {
        id: 'li-1',
        type: 'unit',
        itemId: 'botox',
        name: 'Botox Treatment',
        description: 'Forehead, Glabella, Crow\'s feet',
        quantity: 50,
        unitPrice: 12,
        unitType: 'unit',
        injectionDetails: {
          product: 'Botox',
          areas: [
            { name: 'Forehead', units: 20 },
            { name: 'Glabella', units: 20 },
            { name: 'Crow\'s feet', units: 10 }
          ],
          lotNumber: 'LOT123456',
          expirationDate: new Date('2025-06-01')
        },
        tax: { rate: 0, amount: 0 },
        lineTotal: 600,
        discountAmount: 0,
        taxAmount: 0,
        total: 600,
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Sarah Chen'
      }
    ],
    subtotal: 600,
    taxTotal: 0,
    discountTotal: 0,
    total: 600,
    payments: [
      {
        id: 'pay-1',
        invoiceId: 'inv-001',
        date: new Date('2025-08-26'),
        amount: 600,
        method: PaymentMethod.CREDIT_CARD,
        status: 'completed',
        cardDetails: {
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025
        },
        processedBy: 'Admin Staff'
      }
    ],
    amountPaid: 600,
    balance: 0,
    status: 'paid',
    createdAt: new Date('2025-08-26'),
    updatedAt: new Date('2025-08-26'),
    createdBy: 'Admin Staff',
    appointmentId: 'apt-1'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2024-002',
    patientId: 'patient-2',
    patientName: 'Michael Rodriguez',
    practitionerId: 'prac-2',
    practitionerName: 'Dr. James Park',
    locationId: 'loc-1',
    locationName: 'Beverly Hills Clinic',
    invoiceDate: new Date('2025-08-25'),
    dueDate: new Date('2025-09-08'),
    serviceDate: new Date('2025-08-25'),
    lineItems: [
      {
        id: 'li-2',
        type: 'service',
        itemId: 'microneedling',
        name: 'Microneedling with PRP',
        description: 'Full face treatment with platelet-rich plasma',
        quantity: 1,
        unitPrice: 800,
        tax: { rate: 0.0875, amount: 70 },
        lineTotal: 800,
        discountAmount: 0,
        taxAmount: 70,
        total: 870,
        practitionerId: 'prac-2',
        practitionerName: 'Dr. James Park'
      }
    ],
    subtotal: 800,
    taxTotal: 70,
    discountTotal: 0,
    total: 870,
    payments: [
      {
        id: 'pay-2',
        invoiceId: 'inv-002',
        date: new Date('2025-08-25'),
        amount: 420,
        method: PaymentMethod.CREDIT_CARD,
        status: 'completed',
        cardDetails: {
          last4: '1234',
          brand: 'Mastercard',
          expiryMonth: 6,
          expiryYear: 2024
        },
        processedBy: 'Admin Staff'
      }
    ],
    amountPaid: 420,
    balance: 450,
    status: 'partially_paid',
    createdAt: new Date('2025-08-25'),
    updatedAt: new Date('2025-08-25'),
    createdBy: 'Admin Staff',
    appointmentId: 'apt-2'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2024-003',
    patientId: 'patient-3',
    patientName: 'Sofia Rodriguez',
    practitionerId: 'prac-1',
    practitionerName: 'Dr. Sarah Chen',
    locationId: 'loc-1',
    locationName: 'Beverly Hills Clinic',
    invoiceDate: new Date('2025-08-24'),
    dueDate: new Date('2025-09-07'),
    serviceDate: new Date('2025-08-24'),
    lineItems: [
      {
        id: 'li-3',
        type: 'unit',
        itemId: 'juvederm',
        name: 'Juvederm Lip Filler',
        description: 'Lip augmentation',
        quantity: 1,
        unitPrice: 650,
        unitType: 'syringe',
        injectionDetails: {
          product: 'Juvederm Ultra XC',
          areas: [
            { name: 'Upper Lip', units: 0.5 },
            { name: 'Lower Lip', units: 0.5 }
          ],
          lotNumber: 'JUV789012',
          expirationDate: new Date('2025-12-01')
        },
        discount: {
          type: 'percentage',
          value: 10,
          reason: 'Member discount'
        },
        tax: { rate: 0, amount: 0 },
        lineTotal: 650,
        discountAmount: 65,
        taxAmount: 0,
        total: 585,
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Sarah Chen'
      }
    ],
    subtotal: 650,
    taxTotal: 0,
    discountTotal: 65,
    total: 585,
    payments: [
      {
        id: 'pay-3',
        invoiceId: 'inv-003',
        date: new Date('2025-08-24'),
        amount: 585,
        method: PaymentMethod.MEMBERSHIP_CREDIT,
        status: 'completed',
        processedBy: 'Admin Staff'
      }
    ],
    amountPaid: 585,
    balance: 0,
    status: 'paid',
    createdAt: new Date('2025-08-24'),
    updatedAt: new Date('2025-08-24'),
    createdBy: 'Admin Staff',
    appointmentId: 'apt-3'
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INV-2024-004',
    patientId: 'patient-4',
    patientName: 'Jennifer Chang',
    practitionerId: 'prac-3',
    practitionerName: 'Jessica Mills',
    locationId: 'loc-1',
    locationName: 'Beverly Hills Clinic',
    invoiceDate: new Date('2024-08-12'),
    dueDate: new Date('2024-08-26'),
    serviceDate: new Date('2024-08-12'),
    lineItems: [
      {
        id: 'li-4',
        type: 'service',
        itemId: 'hydrafacial',
        name: 'HydraFacial Deluxe',
        description: 'Deep cleansing with LED therapy',
        quantity: 1,
        unitPrice: 350,
        tax: { rate: 0.0875, amount: 30.63 },
        lineTotal: 350,
        discountAmount: 0,
        taxAmount: 30.63,
        total: 380.63,
        practitionerId: 'prac-3',
        practitionerName: 'Jessica Mills'
      },
      {
        id: 'li-5',
        type: 'product',
        itemId: 'serum-1',
        name: 'Vitamin C Serum',
        description: 'Take-home skincare',
        quantity: 1,
        unitPrice: 120,
        tax: { rate: 0.0875, amount: 10.50 },
        lineTotal: 120,
        discountAmount: 0,
        taxAmount: 10.50,
        total: 130.50
      }
    ],
    subtotal: 470,
    taxTotal: 41.13,
    discountTotal: 0,
    total: 511.13,
    payments: [],
    amountPaid: 0,
    balance: 511.13,
    status: 'sent',
    createdAt: new Date('2024-08-12'),
    updatedAt: new Date('2024-08-12'),
    createdBy: 'Admin Staff',
    appointmentId: 'apt-4'
  },
  {
    id: 'inv-005',
    invoiceNumber: 'INV-2024-005',
    patientId: 'patient-5',
    patientName: 'Robert Johnson',
    practitionerId: 'prac-1',
    practitionerName: 'Dr. Sarah Chen',
    locationId: 'loc-1',
    locationName: 'Beverly Hills Clinic',
    invoiceDate: new Date('2024-07-25'),
    dueDate: new Date('2024-08-08'),
    serviceDate: new Date('2024-07-25'),
    lineItems: [
      {
        id: 'li-6',
        type: 'package',
        itemId: 'pkg-botox-3',
        name: 'Botox Package - 3 Sessions',
        description: 'Prepaid package for 3 Botox treatments',
        quantity: 1,
        unitPrice: 2500,
        discount: {
          type: 'percentage',
          value: 20,
          reason: 'VIP discount'
        },
        tax: { rate: 0, amount: 0 },
        lineTotal: 2500,
        discountAmount: 500,
        taxAmount: 0,
        total: 2000
      }
    ],
    subtotal: 2500,
    taxTotal: 0,
    discountTotal: 500,
    total: 2000,
    payments: [
      {
        id: 'pay-4',
        invoiceId: 'inv-005',
        date: new Date('2024-07-25'),
        amount: 2000,
        method: PaymentMethod.ACH,
        status: 'completed',
        processedBy: 'Admin Staff'
      }
    ],
    amountPaid: 2000,
    balance: 0,
    status: 'paid',
    createdAt: new Date('2024-07-25'),
    updatedAt: new Date('2024-07-25'),
    createdBy: 'Admin Staff',
    packageId: 'pkg-1'
  },
  {
    id: 'inv-006',
    invoiceNumber: 'INV-2024-006',
    patientId: 'patient-1',
    patientName: 'Emma Thompson',
    practitionerId: 'prac-2',
    practitionerName: 'Dr. James Park',
    locationId: 'loc-1',
    locationName: 'Beverly Hills Clinic',
    invoiceDate: new Date('2025-08-23'),
    dueDate: new Date('2025-09-06'),
    serviceDate: new Date('2025-08-23'),
    lineItems: [
      {
        id: 'li-7',
        type: 'service',
        itemId: 'laser-resurfacing',
        name: 'CO2 Laser Resurfacing',
        description: 'Full face treatment',
        quantity: 1,
        unitPrice: 3500,
        tax: { rate: 0, amount: 0 },
        lineTotal: 3500,
        discountAmount: 0,
        taxAmount: 0,
        total: 3500,
        practitionerId: 'prac-2',
        practitionerName: 'Dr. James Park'
      }
    ],
    subtotal: 3500,
    taxTotal: 0,
    discountTotal: 0,
    total: 3500,
    payments: [
      {
        id: 'pay-5',
        invoiceId: 'inv-006',
        date: new Date('2024-12-23'),
        amount: 1000,
        method: PaymentMethod.CREDIT_CARD,
        status: 'completed',
        cardDetails: {
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025
        },
        processedBy: 'Admin Staff'
      },
      {
        id: 'pay-6',
        invoiceId: 'inv-006',
        date: new Date('2024-12-23'),
        amount: 2500,
        method: PaymentMethod.FINANCING,
        status: 'completed',
        financingDetails: {
          provider: 'carecredit',
          applicationId: 'CC123456',
          approvalCode: 'APPROVED',
          term: 12
        },
        processedBy: 'Admin Staff'
      }
    ],
    amountPaid: 3500,
    balance: 0,
    status: 'paid',
    createdAt: new Date('2025-08-23'),
    updatedAt: new Date('2025-08-23'),
    createdBy: 'Admin Staff',
    appointmentId: 'apt-5'
  }
]

export const mockProducts: Product[] = [
  {
    id: 'botox',
    name: 'Botox',
    category: 'injectable',
    brand: 'Allergan',
    sku: 'BTX-100',
    cost: 5,
    retailPrice: 12,
    injectableDetails: {
      type: 'neurotoxin',
      manufacturer: 'Allergan',
      concentration: '100 units',
      unitType: 'unit',
      unitsPerPackage: 100
    },
    trackInventory: true,
    currentStock: 500,
    reorderPoint: 200,
    reorderQuantity: 500,
    commissionable: true,
    commissionRate: 0.20,
    active: true,
    availableOnline: false,
    description: 'Botulinum toxin type A for cosmetic use',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-08-01')
  },
  {
    id: 'juvederm',
    name: 'Juvederm Ultra XC',
    category: 'injectable',
    brand: 'Allergan',
    sku: 'JUV-XC-1',
    cost: 300,
    retailPrice: 650,
    injectableDetails: {
      type: 'filler',
      manufacturer: 'Allergan',
      concentration: '1ml',
      unitType: 'syringe',
      unitsPerPackage: 1
    },
    trackInventory: true,
    currentStock: 25,
    reorderPoint: 10,
    reorderQuantity: 20,
    commissionable: true,
    commissionRate: 0.20,
    active: true,
    availableOnline: false,
    description: 'Hyaluronic acid dermal filler with lidocaine',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-08-01')
  },
  {
    id: 'serum-1',
    name: 'Vitamin C Serum',
    category: 'skincare',
    brand: 'SkinCeuticals',
    sku: 'SC-VIT-C-30',
    cost: 60,
    retailPrice: 120,
    trackInventory: true,
    currentStock: 15,
    reorderPoint: 5,
    reorderQuantity: 10,
    commissionable: true,
    commissionRate: 0.15,
    active: true,
    availableOnline: true,
    description: '15% L-Ascorbic Acid antioxidant serum',
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-08-01')
  }
]

export const mockPackages: Package[] = [
  {
    id: 'pkg-botox-3',
    name: 'Botox Package - 3 Sessions',
    description: 'Save 20% on 3 Botox treatments (up to 50 units each)',
    imageUrl: 'https://example.com/botox-package.jpg',
    contents: [
      {
        type: 'service',
        itemId: 'botox-50',
        name: 'Botox Treatment (50 units)',
        quantity: 3,
        value: 600
      }
    ],
    regularPrice: 1800,
    salePrice: 1440,
    savings: 360,
    validityDays: 365,
    restrictions: {
      specificPractitioners: ['prac-1'],
      shareable: false,
      transferable: false
    },
    active: true,
    availableForPurchase: true,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-08-01')
  },
  {
    id: 'pkg-laser-6',
    name: 'Laser Hair Removal - 6 Sessions',
    description: 'Complete laser hair removal package for any area',
    imageUrl: 'https://example.com/laser-package.jpg',
    contents: [
      {
        type: 'service',
        itemId: 'laser-hair',
        name: 'Laser Hair Removal',
        quantity: 6,
        value: 400
      }
    ],
    regularPrice: 2400,
    salePrice: 1800,
    savings: 600,
    validityDays: 730,
    restrictions: {
      shareable: false,
      transferable: true
    },
    active: true,
    availableForPurchase: true,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-08-01')
  }
]

export const mockMemberships: Membership[] = [
  {
    id: 'silver-membership',
    name: 'Silver Membership',
    description: 'Entry level membership with basic benefits',
    tier: 'silver',
    billingCycle: 'monthly',
    price: 99,
    benefits: {
      discountPercentage: 10,
      includedServices: [
        {
          serviceId: 'hydrafacial',
          serviceName: 'HydraFacial',
          quantity: 1,
          resetPeriod: 'monthly'
        }
      ],
      includedProducts: [],
      perks: ['Priority booking', '10% off all services']
    },
    minimumTerm: 3,
    cancellationPolicy: '30 days notice required',
    active: true,
    acceptingNewMembers: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-08-01')
  },
  {
    id: 'gold-membership',
    name: 'Gold Membership',
    description: 'Premium membership with enhanced benefits',
    tier: 'gold',
    billingCycle: 'monthly',
    price: 199,
    benefits: {
      discountPercentage: 15,
      includedServices: [
        {
          serviceId: 'hydrafacial',
          serviceName: 'HydraFacial',
          quantity: 1,
          resetPeriod: 'monthly'
        },
        {
          serviceId: 'chemical-peel',
          serviceName: 'Chemical Peel',
          quantity: 1,
          resetPeriod: 'quarterly'
        }
      ],
      includedProducts: [
        {
          productId: 'serum-1',
          productName: 'Vitamin C Serum',
          discountPercentage: 20
        }
      ],
      perks: ['Priority booking', '15% off all services', 'Exclusive events']
    },
    minimumTerm: 6,
    cancellationPolicy: '30 days notice required',
    active: true,
    acceptingNewMembers: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-08-01')
  },
  {
    id: 'platinum-membership',
    name: 'Platinum Membership',
    description: 'VIP membership with maximum benefits',
    tier: 'platinum',
    billingCycle: 'annual',
    price: 5000,
    benefits: {
      discountPercentage: 20,
      includedServices: [
        {
          serviceId: 'botox',
          serviceName: 'Botox (50 units)',
          quantity: 4,
          resetPeriod: 'annual'
        },
        {
          serviceId: 'hydrafacial',
          serviceName: 'HydraFacial',
          quantity: 12,
          resetPeriod: 'annual'
        }
      ],
      includedProducts: [
        {
          productId: 'all-skincare',
          productName: 'All Skincare Products',
          discountPercentage: 25
        }
      ],
      perks: [
        'VIP priority booking',
        '20% off all services',
        'Exclusive VIP events',
        'Complimentary birthday treatment',
        'Personal beauty consultant'
      ]
    },
    cancellationPolicy: 'Non-refundable annual commitment',
    active: true,
    acceptingNewMembers: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-08-01')
  }
]

// Helper functions
export function getInvoiceById(id: string): Invoice | undefined {
  return mockInvoices.find(invoice => invoice.id === id)
}

export function getInvoicesByPatient(patientId: string): Invoice[] {
  return mockInvoices.filter(invoice => invoice.patientId === patientId)
}

export function getOutstandingInvoices(): Invoice[] {
  return mockInvoices.filter(invoice => invoice.balance > 0)
}

export function getTodaysInvoices(): Invoice[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return mockInvoices.filter(invoice => 
    invoice.invoiceDate >= today && invoice.invoiceDate < tomorrow
  )
}

export function calculateDailyRevenue(): number {
  const todaysInvoices = getTodaysInvoices()
  return todaysInvoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0)
}