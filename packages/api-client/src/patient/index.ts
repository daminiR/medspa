/**
 * Patient Portal API Client
 * Type-safe API client specifically for patient portal
 */

import { createApiClient, ApiClient, ApiClientConfig } from '../client';

// Re-export types
export * from './types';
export * from './auth';
export * from './appointments';
export * from './profile';
export * from './payments';
export * from './referrals';

// Patient API endpoints
export const patientEndpoints = {
  // Authentication
  auth: {
    register: '/api/patient/auth/register',
    login: '/api/patient/auth/login',
    refresh: '/api/patient/auth/refresh',
    logout: '/api/patient/auth/logout',
    me: '/api/patient/auth/me',
  },

  // Appointments
  appointments: {
    list: '/api/patient/appointments',
    get: (id: string) => `/api/patient/appointments/${id}`,
    book: '/api/patient/appointments/book',
    reschedule: (id: string) => `/api/patient/appointments/${id}/reschedule`,
    cancel: (id: string) => `/api/patient/appointments/${id}`,
    availableSlots: '/api/patient/appointments/available-slots',
  },

  // Profile
  profile: {
    get: '/api/patient/profile',
    update: '/api/patient/profile',
    uploadPhoto: '/api/patient/profile/photo',
  },

  // Payment Methods
  paymentMethods: {
    list: '/api/patient/payment-methods',
    add: '/api/patient/payment-methods',
    get: (id: string) => `/api/patient/payment-methods/${id}`,
    update: (id: string) => `/api/patient/payment-methods/${id}`,
    remove: (id: string) => `/api/patient/payment-methods/${id}`,
  },

  // Payments
  payments: {
    process: '/api/patient/payments/process',
  },

  // Invoices
  invoices: {
    list: '/api/patient/invoices',
    get: (id: string) => `/api/patient/invoices/${id}`,
    download: (id: string) => `/api/patient/invoices/${id}/download`,
  },

  // Referrals
  referrals: {
    program: '/api/patient/referrals/program',
    history: '/api/patient/referrals/history',
    share: '/api/patient/referrals/share',
    apply: '/api/patient/referrals/apply',
    validate: (code: string) => `/api/patient/referrals/validate/${code}`,
  },

  // Wallet
  wallet: {
    generateApplePass: '/api/patient/wallet/generate-apple-pass',
    generateGooglePass: '/api/patient/wallet/generate-google-pass',
    updatePass: '/api/patient/wallet/update-pass',
  },

  // Notifications
  notifications: {
    registerToken: '/api/patient/notifications/register-token',
    preferences: '/api/patient/notifications/preferences',
    history: '/api/patient/notifications/history',
  },

  // Messages
  messages: {
    list: '/api/patient/messages',
    send: '/api/patient/messages/send',
    markRead: (id: string) => `/api/patient/messages/${id}/read`,
  },

  // Photos
  photos: {
    list: '/api/patient/photos',
    upload: '/api/patient/photos/upload',
    delete: (id: string) => `/api/patient/photos/${id}`,
  },
} as const;

/**
 * Create a patient portal API client
 */
export function createPatientApiClient(config: ApiClientConfig) {
  const client = createApiClient(config);

  return {
    ...client,
    endpoints: patientEndpoints,

    // Auth methods
    auth: {
      register: (data: any) => client.post(patientEndpoints.auth.register, data),
      login: (data: any) => client.post(patientEndpoints.auth.login, data),
      refresh: (data: any) => client.post(patientEndpoints.auth.refresh, data),
      logout: () => client.post(patientEndpoints.auth.logout),
      me: () => client.get(patientEndpoints.auth.me),
    },

    // Appointment methods
    appointments: {
      list: (params?: Record<string, any>) =>
        client.get(patientEndpoints.appointments.list, { headers: params }),
      get: (id: string) => client.get(patientEndpoints.appointments.get(id)),
      book: (data: any) => client.post(patientEndpoints.appointments.book, data),
      reschedule: (id: string, data: any) =>
        client.patch(patientEndpoints.appointments.reschedule(id), data),
      cancel: (id: string, data: any) =>
        client.delete(patientEndpoints.appointments.cancel(id), { body: data } as any),
      getAvailableSlots: (params: Record<string, string>) => {
        const queryString = new URLSearchParams(params).toString();
        return client.get(`${patientEndpoints.appointments.availableSlots}?${queryString}`);
      },
    },

    // Profile methods
    profile: {
      get: () => client.get(patientEndpoints.profile.get),
      update: (data: any) => client.patch(patientEndpoints.profile.update, data),
      uploadPhoto: (formData: FormData) =>
        client.post(patientEndpoints.profile.uploadPhoto, formData),
    },

    // Payment methods
    paymentMethods: {
      list: () => client.get(patientEndpoints.paymentMethods.list),
      add: (data: any) => client.post(patientEndpoints.paymentMethods.add, data),
      update: (id: string, data: any) =>
        client.patch(patientEndpoints.paymentMethods.update(id), data),
      remove: (id: string) => client.delete(patientEndpoints.paymentMethods.remove(id)),
    },

    // Payments
    payments: {
      process: (data: any) => client.post(patientEndpoints.payments.process, data),
    },

    // Referrals
    referrals: {
      getProgram: () => client.get(patientEndpoints.referrals.program),
      getHistory: () => client.get(patientEndpoints.referrals.history),
      share: (data: any) => client.post(patientEndpoints.referrals.share, data),
      apply: (data: any) => client.post(patientEndpoints.referrals.apply, data),
    },

    // Notifications
    notifications: {
      registerToken: (data: any) =>
        client.post(patientEndpoints.notifications.registerToken, data),
      getPreferences: () => client.get(patientEndpoints.notifications.preferences),
      updatePreferences: (data: any) =>
        client.patch(patientEndpoints.notifications.preferences, data),
    },
  };
}

export type PatientApiClient = ReturnType<typeof createPatientApiClient>;
