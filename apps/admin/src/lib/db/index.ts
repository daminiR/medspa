/**
 * Database Service Layer
 * Provides abstraction over data storage with in-memory implementation
 * Can be easily replaced with Prisma client in production
 */

import {
  patients,
  practitioners,
  services,
  appointments,
  locations,
  Patient,
  Practitioner,
  Service,
  Appointment,
  Location,
} from '../data';

// ============================================================================
// IN-MEMORY DATA STORES
// ============================================================================

// User store (extends beyond existing patient data)
export interface User {
  id: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  role: 'PATIENT' | 'STAFF' | 'PROVIDER' | 'ADMIN';
  emailVerified: boolean;
  phoneVerified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface PatientProfile {
  id: string;
  userId: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  preferredLocationId?: string;
  preferredProviderId?: string;
  marketingOptIn: boolean;
  smsOptIn: boolean;
  membershipId?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  addressCountry?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  deviceName?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethodRecord {
  id: string;
  patientId: string;
  type: 'CARD' | 'BANK_ACCOUNT' | 'HSA' | 'FSA' | 'APPLE_PAY' | 'GOOGLE_PAY';
  stripePaymentMethodId?: string;
  stripeCustomerId?: string;
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  bankName?: string;
  bankLast4?: string;
  hsaFsaProvider?: string;
  hsaFsaAccountLast4?: string;
  hsaFsaVerified: boolean;
  isDefault: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralProgramRecord {
  id: string;
  patientId: string;
  referralCode: string;
  shareUrl: string;
  totalReferrals: number;
  pendingReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  availableCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  refereeId?: string;
  refereeEmail?: string;
  refereePhone?: string;
  refereeName?: string;
  status: 'PENDING' | 'SIGNED_UP' | 'FIRST_VISIT' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  referrerReward: number;
  refereeReward: number;
  statusChangedAt?: Date;
  firstAppointmentDate?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferencesRecord {
  id: string;
  patientId: string;
  enabled: boolean;
  appointmentReminders: boolean;
  appointmentReminder24h: boolean;
  appointmentReminder2h: boolean;
  promotions: boolean;
  rewards: boolean;
  messages: boolean;
  sound: boolean;
  badge: boolean;
  vibration: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PushTokenRecord {
  id: string;
  userId: string;
  token: string;
  platform: 'IOS' | 'ANDROID' | 'WEB';
  deviceModel?: string;
  deviceOS?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ANALYTICS DATA STORES
// ============================================================================

export interface ReferralShareRecord {
  id: string;
  referralProgramId: string;
  patientId: string;
  referralCode: string;
  method: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'COPY' | 'QR_CODE';
  trackingUrl: string;
  clickCount: number;
  conversions: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralClickRecord {
  id: string;
  shareId: string;
  referralCode: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  convertedToSignup: boolean;
  signupId?: string;
  clickedAt: Date;
}

export interface PatientAcquisitionRecord {
  id: string;
  patientId: string;
  source: 'referral' | 'walk_in' | 'online_booking' | 'waitlist' | 'social_media' | 'google_ads' | 'google_organic' | 'instagram' | 'facebook' | 'yelp' | 'direct' | 'phone' | 'other';
  sourceDetail?: string;
  campaignId?: string;
  referralCode?: string;
  firstVisitDate?: Date;
  firstVisitRevenue: number;
  lifetimeValue: number;
  visitCount: number;
  lastVisitDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortalActivityRecord {
  id: string;
  patientId: string;
  userId?: string;
  sessionId?: string;
  activityType: 'login' | 'logout' | 'profile_view' | 'profile_update' | 'photo_upload' | 'photo_view' | 'message_sent' | 'message_read' | 'form_started' | 'form_completed' | 'booking_started' | 'booking_completed' | 'appointment_view' | 'waitlist_join' | 'referral_share' | 'reward_redeem';
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  platform?: 'web' | 'mobile_ios' | 'mobile_android';
  createdAt: Date;
}

export interface ReferralMilestoneRecord {
  id: string;
  patientId: string;
  referralProgramId: string;
  milestoneCount: number;
  bonusAmount: number;
  achieved: boolean;
  achievedAt?: Date;
  rewardStatus: 'PENDING' | 'APPROVED' | 'PAID' | 'EXPIRED';
  createdAt: Date;
  updatedAt: Date;
}

// In-memory stores
const users: Map<string, User> = new Map();
const patientProfiles: Map<string, PatientProfile> = new Map();
const sessions: Map<string, Session> = new Map();
const paymentMethods: Map<string, PaymentMethodRecord> = new Map();
const referralPrograms: Map<string, ReferralProgramRecord> = new Map();
const referrals: Map<string, ReferralRecord> = new Map();
const notificationPreferences: Map<string, NotificationPreferencesRecord> = new Map();
const pushTokens: Map<string, PushTokenRecord> = new Map();

// Analytics stores
const referralShares: Map<string, ReferralShareRecord> = new Map();
const referralClicks: Map<string, ReferralClickRecord> = new Map();
const patientAcquisitions: Map<string, PatientAcquisitionRecord> = new Map();
const portalActivities: Map<string, PortalActivityRecord> = new Map();
const referralMilestones: Map<string, ReferralMilestoneRecord> = new Map();

// Initialize with some mock users from existing patient data
function initializeMockUsers() {
  patients.forEach((patient, index) => {
    const userId = `user-${patient.id}`;
    const user: User = {
      id: userId,
      email: patient.email || `patient${index}@example.com`,
      phone: patient.phone,
      firstName: patient.firstName,
      lastName: patient.lastName,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      role: 'PATIENT',
      emailVerified: true,
      phoneVerified: true,
      active: true,
      createdAt: patient.createdAt,
      updatedAt: new Date(),
    };
    users.set(userId, user);

    const profile: PatientProfile = {
      id: patient.id,
      userId,
      allergies: patient.allergies || [],
      medications: [],
      conditions: [],
      marketingOptIn: false,
      smsOptIn: true,
      addressStreet: patient.address?.street,
      addressCity: patient.address?.city,
      addressState: patient.address?.state,
      addressZipCode: patient.address?.zipCode,
      createdAt: patient.createdAt,
      updatedAt: new Date(),
    };
    patientProfiles.set(patient.id, profile);
  });
}

// Initialize on module load
initializeMockUsers();

// ============================================================================
// DATABASE SERVICE
// ============================================================================

export const db = {
  // Users
  users: {
    findById: async (id: string): Promise<User | null> => {
      return users.get(id) || null;
    },

    findByEmail: async (email: string): Promise<User | null> => {
      for (const user of Array.from(users.values())) {
        if (user.email.toLowerCase() === email.toLowerCase()) {
          return user;
        }
      }
      return null;
    },

    findByPhone: async (phone: string): Promise<User | null> => {
      for (const user of Array.from(users.values())) {
        if (user.phone === phone) {
          return user;
        }
      }
      return null;
    },

    create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
      const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const user: User = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      users.set(id, user);
      return user;
    },

    update: async (id: string, data: Partial<User>): Promise<User | null> => {
      const user = users.get(id);
      if (!user) return null;

      const updated = {
        ...user,
        ...data,
        updatedAt: new Date(),
      };
      users.set(id, updated);
      return updated;
    },

    delete: async (id: string): Promise<boolean> => {
      return users.delete(id);
    },
  },

  // Patient Profiles
  patients: {
    findById: async (id: string): Promise<PatientProfile | null> => {
      return patientProfiles.get(id) || null;
    },

    findByUserId: async (userId: string): Promise<PatientProfile | null> => {
      for (const profile of Array.from(patientProfiles.values())) {
        if (profile.userId === userId) {
          return profile;
        }
      }
      return null;
    },

    create: async (data: Omit<PatientProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientProfile> => {
      const id = `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const profile: PatientProfile = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      patientProfiles.set(id, profile);
      return profile;
    },

    update: async (id: string, data: Partial<PatientProfile>): Promise<PatientProfile | null> => {
      const profile = patientProfiles.get(id);
      if (!profile) return null;

      const updated = {
        ...profile,
        ...data,
        updatedAt: new Date(),
      };
      patientProfiles.set(id, updated);
      return updated;
    },
  },

  // Sessions
  sessions: {
    findByAccessToken: async (token: string): Promise<Session | null> => {
      for (const session of Array.from(sessions.values())) {
        if (session.accessToken === token) {
          return session;
        }
      }
      return null;
    },

    findByRefreshToken: async (token: string): Promise<Session | null> => {
      for (const session of Array.from(sessions.values())) {
        if (session.refreshToken === token) {
          return session;
        }
      }
      return null;
    },

    create: async (data: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> => {
      const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const session: Session = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      sessions.set(id, session);
      return session;
    },

    delete: async (id: string): Promise<boolean> => {
      return sessions.delete(id);
    },

    deleteByUserId: async (userId: string): Promise<number> => {
      let count = 0;
      for (const [id, session] of Array.from(sessions.entries())) {
        if (session.userId === userId) {
          sessions.delete(id);
          count++;
        }
      }
      return count;
    },

    deleteByAccessToken: async (token: string): Promise<boolean> => {
      for (const [id, session] of Array.from(sessions.entries())) {
        if (session.accessToken === token) {
          sessions.delete(id);
          return true;
        }
      }
      return false;
    },
  },

  // Payment Methods
  paymentMethods: {
    findByPatientId: async (patientId: string): Promise<PaymentMethodRecord[]> => {
      const methods: PaymentMethodRecord[] = [];
      for (const method of Array.from(paymentMethods.values())) {
        if (method.patientId === patientId && method.active) {
          methods.push(method);
        }
      }
      return methods;
    },

    findById: async (id: string): Promise<PaymentMethodRecord | null> => {
      return paymentMethods.get(id) || null;
    },

    create: async (data: Omit<PaymentMethodRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethodRecord> => {
      const id = `pm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const method: PaymentMethodRecord = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      paymentMethods.set(id, method);
      return method;
    },

    update: async (id: string, data: Partial<PaymentMethodRecord>): Promise<PaymentMethodRecord | null> => {
      const method = paymentMethods.get(id);
      if (!method) return null;

      const updated = {
        ...method,
        ...data,
        updatedAt: new Date(),
      };
      paymentMethods.set(id, updated);
      return updated;
    },

    delete: async (id: string): Promise<boolean> => {
      const method = paymentMethods.get(id);
      if (!method) return false;

      // Soft delete
      method.active = false;
      method.updatedAt = new Date();
      return true;
    },

    clearDefault: async (patientId: string): Promise<void> => {
      for (const method of Array.from(paymentMethods.values())) {
        if (method.patientId === patientId && method.isDefault) {
          method.isDefault = false;
          method.updatedAt = new Date();
        }
      }
    },
  },

  // Referral Programs
  referralPrograms: {
    findByPatientId: async (patientId: string): Promise<ReferralProgramRecord | null> => {
      for (const program of Array.from(referralPrograms.values())) {
        if (program.patientId === patientId) {
          return program;
        }
      }
      return null;
    },

    findByCode: async (code: string): Promise<ReferralProgramRecord | null> => {
      for (const program of Array.from(referralPrograms.values())) {
        if (program.referralCode.toUpperCase() === code.toUpperCase()) {
          return program;
        }
      }
      return null;
    },

    create: async (data: Omit<ReferralProgramRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReferralProgramRecord> => {
      const id = `rp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const program: ReferralProgramRecord = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      referralPrograms.set(id, program);
      return program;
    },

    update: async (id: string, data: Partial<ReferralProgramRecord>): Promise<ReferralProgramRecord | null> => {
      const program = referralPrograms.get(id);
      if (!program) return null;

      const updated = {
        ...program,
        ...data,
        updatedAt: new Date(),
      };
      referralPrograms.set(id, updated);
      return updated;
    },
  },

  // Referrals
  referrals: {
    findByReferrerId: async (referrerId: string): Promise<ReferralRecord[]> => {
      const records: ReferralRecord[] = [];
      for (const referral of Array.from(referrals.values())) {
        if (referral.referrerId === referrerId) {
          records.push(referral);
        }
      }
      return records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    create: async (data: Omit<ReferralRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReferralRecord> => {
      const id = `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const referral: ReferralRecord = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      referrals.set(id, referral);
      return referral;
    },

    update: async (id: string, data: Partial<ReferralRecord>): Promise<ReferralRecord | null> => {
      const referral = referrals.get(id);
      if (!referral) return null;

      const updated = {
        ...referral,
        ...data,
        updatedAt: new Date(),
      };
      referrals.set(id, updated);
      return updated;
    },
  },

  // Notification Preferences
  notificationPreferences: {
    findByPatientId: async (patientId: string): Promise<NotificationPreferencesRecord | null> => {
      for (const prefs of Array.from(notificationPreferences.values())) {
        if (prefs.patientId === patientId) {
          return prefs;
        }
      }
      return null;
    },

    upsert: async (patientId: string, data: Partial<NotificationPreferencesRecord>): Promise<NotificationPreferencesRecord> => {
      let prefs = await db.notificationPreferences.findByPatientId(patientId);

      if (prefs) {
        // Update
        const updated = {
          ...prefs,
          ...data,
          updatedAt: new Date(),
        };
        notificationPreferences.set(prefs.id, updated);
        return updated;
      } else {
        // Create
        const id = `np-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();
        prefs = {
          id,
          patientId,
          enabled: true,
          appointmentReminders: true,
          appointmentReminder24h: true,
          appointmentReminder2h: true,
          promotions: true,
          rewards: true,
          messages: true,
          sound: true,
          badge: true,
          vibration: true,
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          createdAt: now,
          updatedAt: now,
          ...data,
        };
        notificationPreferences.set(id, prefs);
        return prefs;
      }
    },
  },

  // Push Tokens
  pushTokens: {
    findByUserId: async (userId: string): Promise<PushTokenRecord[]> => {
      const tokens: PushTokenRecord[] = [];
      for (const token of Array.from(pushTokens.values())) {
        if (token.userId === userId && token.active) {
          tokens.push(token);
        }
      }
      return tokens;
    },

    findByToken: async (tokenValue: string): Promise<PushTokenRecord | null> => {
      for (const token of Array.from(pushTokens.values())) {
        if (token.token === tokenValue) {
          return token;
        }
      }
      return null;
    },

    upsert: async (data: Omit<PushTokenRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PushTokenRecord> => {
      // Check if token exists
      let existing = await db.pushTokens.findByToken(data.token);

      if (existing) {
        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };
        pushTokens.set(existing.id, updated);
        return updated;
      }

      const id = `pt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const token: PushTokenRecord = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      pushTokens.set(id, token);
      return token;
    },

    deactivate: async (tokenValue: string): Promise<boolean> => {
      for (const [id, token] of Array.from(pushTokens.entries())) {
        if (token.token === tokenValue) {
          token.active = false;
          token.updatedAt = new Date();
          return true;
        }
      }
      return false;
    },
  },

  // Use existing data from data.ts
  practitioners: {
    findAll: async (): Promise<Practitioner[]> => practitioners,
    findById: async (id: string): Promise<Practitioner | undefined> =>
      practitioners.find((p) => p.id === id),
    findActive: async (): Promise<Practitioner[]> =>
      practitioners.filter((p) => p.status === 'active'),
  },

  services: {
    findAll: async (): Promise<Service[]> => services,
    findById: async (id: string): Promise<Service | undefined> =>
      services.find((s) => s.id === id),
    findActive: async (): Promise<Service[]> =>
      services.filter((s) => s.isActive),
    findByPractitioner: async (practitionerId: string): Promise<Service[]> =>
      services.filter((s) => s.practitionerIds.includes(practitionerId) && s.isActive),
  },

  locations: {
    findAll: async (): Promise<Location[]> => locations,
    findById: async (id: string): Promise<Location | undefined> =>
      locations.find((l) => l.id === id),
  },

  appointments: {
    findAll: async (): Promise<Appointment[]> => appointments,
    findById: async (id: string): Promise<Appointment | undefined> =>
      appointments.find((a) => a.id === id),
    findByPatientId: async (patientId: string): Promise<Appointment[]> =>
      appointments.filter((a) => a.patientId === patientId),
    findByPractitionerId: async (practitionerId: string): Promise<Appointment[]> =>
      appointments.filter((a) => a.practitionerId === practitionerId),
    findByDateRange: async (start: Date, end: Date): Promise<Appointment[]> =>
      appointments.filter((a) => a.startTime >= start && a.startTime <= end),
    create: async (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
      const id = `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const appointment: Appointment = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      appointments.push(appointment);
      return appointment;
    },
    update: async (id: string, data: Partial<Appointment>): Promise<Appointment | null> => {
      const index = appointments.findIndex((a) => a.id === id);
      if (index === -1) return null;

      appointments[index] = {
        ...appointments[index],
        ...data,
        updatedAt: new Date(),
      };
      return appointments[index];
    },
  },

  // ============================================================================
  // ANALYTICS DATA ACCESS
  // ============================================================================

  // Referral Shares (for tracking share events)
  referralShares: {
    findAll: async (): Promise<ReferralShareRecord[]> => {
      return Array.from(referralShares.values());
    },

    findByPatientId: async (patientId: string): Promise<ReferralShareRecord[]> => {
      const shares: ReferralShareRecord[] = [];
      for (const share of Array.from(referralShares.values())) {
        if (share.patientId === patientId) {
          shares.push(share);
        }
      }
      return shares.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    findByMethod: async (method: ReferralShareRecord['method']): Promise<ReferralShareRecord[]> => {
      const shares: ReferralShareRecord[] = [];
      for (const share of Array.from(referralShares.values())) {
        if (share.method === method) {
          shares.push(share);
        }
      }
      return shares;
    },

    findByDateRange: async (start: Date, end: Date): Promise<ReferralShareRecord[]> => {
      const shares: ReferralShareRecord[] = [];
      for (const share of Array.from(referralShares.values())) {
        if (share.createdAt >= start && share.createdAt <= end) {
          shares.push(share);
        }
      }
      return shares.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    create: async (data: Omit<ReferralShareRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReferralShareRecord> => {
      const id = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const share: ReferralShareRecord = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      referralShares.set(id, share);
      return share;
    },

    update: async (id: string, data: Partial<ReferralShareRecord>): Promise<ReferralShareRecord | null> => {
      const share = referralShares.get(id);
      if (!share) return null;

      const updated = {
        ...share,
        ...data,
        updatedAt: new Date(),
      };
      referralShares.set(id, updated);
      return updated;
    },

    incrementClicks: async (id: string): Promise<ReferralShareRecord | null> => {
      const share = referralShares.get(id);
      if (!share) return null;

      share.clickCount += 1;
      share.updatedAt = new Date();
      return share;
    },

    getAggregatedByMethod: async (): Promise<Array<{ method: string; shares: number; clicks: number; conversions: number; revenue: number }>> => {
      const aggregated = new Map<string, { shares: number; clicks: number; conversions: number; revenue: number }>();

      for (const share of Array.from(referralShares.values())) {
        const existing = aggregated.get(share.method) || { shares: 0, clicks: 0, conversions: 0, revenue: 0 };
        aggregated.set(share.method, {
          shares: existing.shares + 1,
          clicks: existing.clicks + share.clickCount,
          conversions: existing.conversions + share.conversions,
          revenue: existing.revenue + share.revenue,
        });
      }

      return Array.from(aggregated.entries()).map(([method, data]) => ({ method, ...data }));
    },
  },

  // Referral Clicks (for tracking click events)
  referralClicks: {
    findAll: async (): Promise<ReferralClickRecord[]> => {
      return Array.from(referralClicks.values());
    },

    findByShareId: async (shareId: string): Promise<ReferralClickRecord[]> => {
      const clicks: ReferralClickRecord[] = [];
      for (const click of Array.from(referralClicks.values())) {
        if (click.shareId === shareId) {
          clicks.push(click);
        }
      }
      return clicks.sort((a, b) => b.clickedAt.getTime() - a.clickedAt.getTime());
    },

    findByReferralCode: async (code: string): Promise<ReferralClickRecord[]> => {
      const clicks: ReferralClickRecord[] = [];
      for (const click of Array.from(referralClicks.values())) {
        if (click.referralCode.toUpperCase() === code.toUpperCase()) {
          clicks.push(click);
        }
      }
      return clicks;
    },

    create: async (data: Omit<ReferralClickRecord, 'id'>): Promise<ReferralClickRecord> => {
      const id = `click-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const click: ReferralClickRecord = {
        ...data,
        id,
      };
      referralClicks.set(id, click);
      return click;
    },

    markAsConverted: async (id: string, signupId: string): Promise<ReferralClickRecord | null> => {
      const click = referralClicks.get(id);
      if (!click) return null;

      click.convertedToSignup = true;
      click.signupId = signupId;
      return click;
    },
  },

  // Patient Acquisition (for source tracking)
  patientAcquisitions: {
    findAll: async (): Promise<PatientAcquisitionRecord[]> => {
      return Array.from(patientAcquisitions.values());
    },

    findByPatientId: async (patientId: string): Promise<PatientAcquisitionRecord | null> => {
      for (const record of Array.from(patientAcquisitions.values())) {
        if (record.patientId === patientId) {
          return record;
        }
      }
      return null;
    },

    findBySource: async (source: PatientAcquisitionRecord['source']): Promise<PatientAcquisitionRecord[]> => {
      const records: PatientAcquisitionRecord[] = [];
      for (const record of Array.from(patientAcquisitions.values())) {
        if (record.source === source) {
          records.push(record);
        }
      }
      return records;
    },

    findByDateRange: async (start: Date, end: Date): Promise<PatientAcquisitionRecord[]> => {
      const records: PatientAcquisitionRecord[] = [];
      for (const record of Array.from(patientAcquisitions.values())) {
        if (record.createdAt >= start && record.createdAt <= end) {
          records.push(record);
        }
      }
      return records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    create: async (data: Omit<PatientAcquisitionRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PatientAcquisitionRecord> => {
      const id = `acq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const record: PatientAcquisitionRecord = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      patientAcquisitions.set(id, record);
      return record;
    },

    update: async (id: string, data: Partial<PatientAcquisitionRecord>): Promise<PatientAcquisitionRecord | null> => {
      const record = patientAcquisitions.get(id);
      if (!record) return null;

      const updated = {
        ...record,
        ...data,
        updatedAt: new Date(),
      };
      patientAcquisitions.set(id, updated);
      return updated;
    },

    getAggregatedBySource: async (): Promise<Array<{ source: string; count: number; revenue: number; avgLTV: number }>> => {
      const aggregated = new Map<string, { count: number; totalRevenue: number; totalLTV: number }>();

      for (const record of Array.from(patientAcquisitions.values())) {
        const existing = aggregated.get(record.source) || { count: 0, totalRevenue: 0, totalLTV: 0 };
        aggregated.set(record.source, {
          count: existing.count + 1,
          totalRevenue: existing.totalRevenue + record.firstVisitRevenue,
          totalLTV: existing.totalLTV + record.lifetimeValue,
        });
      }

      return Array.from(aggregated.entries()).map(([source, data]) => ({
        source,
        count: data.count,
        revenue: data.totalRevenue,
        avgLTV: data.count > 0 ? data.totalLTV / data.count : 0,
      }));
    },

    getChurnRisk: async (): Promise<{ atRisk30: number; atRisk60: number; atRisk90: number; atRisk120: number }> => {
      const now = new Date();
      let atRisk30 = 0, atRisk60 = 0, atRisk90 = 0, atRisk120 = 0;

      for (const record of Array.from(patientAcquisitions.values())) {
        if (record.lastVisitDate) {
          const daysSinceVisit = Math.floor((now.getTime() - record.lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceVisit >= 120) atRisk120++;
          else if (daysSinceVisit >= 90) atRisk90++;
          else if (daysSinceVisit >= 60) atRisk60++;
          else if (daysSinceVisit >= 30) atRisk30++;
        }
      }

      return { atRisk30, atRisk60, atRisk90, atRisk120 };
    },
  },

  // Portal Activities (for engagement tracking)
  portalActivities: {
    findAll: async (): Promise<PortalActivityRecord[]> => {
      return Array.from(portalActivities.values());
    },

    findByPatientId: async (patientId: string): Promise<PortalActivityRecord[]> => {
      const activities: PortalActivityRecord[] = [];
      for (const activity of Array.from(portalActivities.values())) {
        if (activity.patientId === patientId) {
          activities.push(activity);
        }
      }
      return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    findByType: async (activityType: PortalActivityRecord['activityType']): Promise<PortalActivityRecord[]> => {
      const activities: PortalActivityRecord[] = [];
      for (const activity of Array.from(portalActivities.values())) {
        if (activity.activityType === activityType) {
          activities.push(activity);
        }
      }
      return activities;
    },

    findByDateRange: async (start: Date, end: Date): Promise<PortalActivityRecord[]> => {
      const activities: PortalActivityRecord[] = [];
      for (const activity of Array.from(portalActivities.values())) {
        if (activity.createdAt >= start && activity.createdAt <= end) {
          activities.push(activity);
        }
      }
      return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    create: async (data: Omit<PortalActivityRecord, 'id' | 'createdAt'>): Promise<PortalActivityRecord> => {
      const id = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const activity: PortalActivityRecord = {
        ...data,
        id,
        createdAt: new Date(),
      };
      portalActivities.set(id, activity);
      return activity;
    },

    getActivityCounts: async (start: Date, end: Date): Promise<Record<string, number>> => {
      const counts: Record<string, number> = {};

      for (const activity of Array.from(portalActivities.values())) {
        if (activity.createdAt >= start && activity.createdAt <= end) {
          counts[activity.activityType] = (counts[activity.activityType] || 0) + 1;
        }
      }

      return counts;
    },

    getUniqueActiveUsers: async (start: Date, end: Date): Promise<number> => {
      const uniquePatients = new Set<string>();

      for (const activity of Array.from(portalActivities.values())) {
        if (activity.createdAt >= start && activity.createdAt <= end) {
          uniquePatients.add(activity.patientId);
        }
      }

      return uniquePatients.size;
    },
  },

  // Referral Milestones
  referralMilestones: {
    findByPatientId: async (patientId: string): Promise<ReferralMilestoneRecord[]> => {
      const milestones: ReferralMilestoneRecord[] = [];
      for (const milestone of Array.from(referralMilestones.values())) {
        if (milestone.patientId === patientId) {
          milestones.push(milestone);
        }
      }
      return milestones.sort((a, b) => a.milestoneCount - b.milestoneCount);
    },

    create: async (data: Omit<ReferralMilestoneRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReferralMilestoneRecord> => {
      const id = `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      const milestone: ReferralMilestoneRecord = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      referralMilestones.set(id, milestone);
      return milestone;
    },

    markAchieved: async (id: string): Promise<ReferralMilestoneRecord | null> => {
      const milestone = referralMilestones.get(id);
      if (!milestone) return null;

      milestone.achieved = true;
      milestone.achievedAt = new Date();
      milestone.updatedAt = new Date();
      return milestone;
    },

    updateRewardStatus: async (id: string, status: ReferralMilestoneRecord['rewardStatus']): Promise<ReferralMilestoneRecord | null> => {
      const milestone = referralMilestones.get(id);
      if (!milestone) return null;

      milestone.rewardStatus = status;
      milestone.updatedAt = new Date();
      return milestone;
    },
  },
};

export default db;
