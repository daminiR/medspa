/**
 * User & Patient Types
 */

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  createdAt: string;
  updatedAt: string;
}

export interface Patient extends User {
  medicalHistory?: MedicalHistory;
  consentForms: ConsentForm[];
  emergencyContact?: EmergencyContact;
  preferredLocation?: string;
  preferredProvider?: string;
  marketingOptIn: boolean;
  smsOptIn: boolean;
  membershipId?: string;
}

export interface MedicalHistory {
  allergies: string[];
  medications: string[];
  conditions: string[];
  previousTreatments: PreviousTreatment[];
  lastUpdated: string;
}

export interface PreviousTreatment {
  name: string;
  date: string;
  provider?: string;
  notes?: string;
}

export interface ConsentForm {
  id: string;
  type: 'hipaa' | 'treatment' | 'photo' | 'marketing';
  signedAt: string;
  version: string;
  ipAddress?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface PasskeyCredential {
  id: string;
  publicKey: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt?: string;
}
