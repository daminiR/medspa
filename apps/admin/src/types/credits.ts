export interface PackageCredit {
  id: string
  packageId: string
  packageName: string
  patientId: string
  patientName: string
  
  // What's included
  services: {
    serviceId: string
    serviceName: string
    totalQuantity: number
    usedQuantity: number
    remainingQuantity: number
  }[]
  
  // Financial
  purchasePrice: number
  purchaseDate: Date
  expiryDate: Date
  
  // Status
  status: 'active' | 'expired' | 'fully-used'
  
  // Usage history
  redemptions: {
    id: string
    serviceId: string
    serviceName: string
    quantity: number
    redeemedDate: Date
    appointmentId: string
    providerId: string
    providerName: string
    notes?: string
  }[]
}

export interface PatientCredits {
  patientId: string
  patientName: string
  
  // Active credits summary
  totalPackageCredits: number
  totalGiftCardBalance: number
  totalMembershipCredits: number
  
  // Detailed credits
  packageCredits: PackageCredit[]
  giftCardBalance: number
  membershipCredits: {
    membershipId: string
    membershipName: string
    includedServices: {
      serviceId: string
      serviceName: string
      remainingThisMonth: number
      resetDate: Date
    }[]
  }[]
  
  // Quick stats
  expiringCredits: {
    type: 'package' | 'gift-card' | 'membership'
    name: string
    expiryDate: Date
    amount: number
  }[]
}