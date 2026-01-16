/**
 * API Endpoints
 * Type-safe endpoint paths
 */

export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    magicLink: '/auth/magic-link',
    verifyMagicLink: '/auth/verify-magic-link',
    sendOtp: '/auth/send-otp',
    verifyOtp: '/auth/verify-otp',
    passkey: {
      register: '/auth/passkey/register',
      authenticate: '/auth/passkey/authenticate',
      options: '/auth/passkey/options',
    },
  },

  // Patient/User
  user: {
    me: '/user/me',
    profile: '/user/profile',
    preferences: '/user/preferences',
    notifications: '/user/notifications',
  },

  // Appointments
  appointments: {
    list: '/appointments',
    upcoming: '/appointments/upcoming',
    past: '/appointments/past',
    create: '/appointments',
    get: (id: string) => `/appointments/${id}`,
    update: (id: string) => `/appointments/${id}`,
    cancel: (id: string) => `/appointments/${id}/cancel`,
    reschedule: (id: string) => `/appointments/${id}/reschedule`,
    addToWallet: (id: string) => `/appointments/${id}/wallet`,
  },

  // Services
  services: {
    list: '/services',
    categories: '/services/categories',
    get: (id: string) => `/services/${id}`,
    availability: (id: string) => `/services/${id}/availability`,
  },

  // Providers
  providers: {
    list: '/providers',
    get: (id: string) => `/providers/${id}`,
    availability: (id: string) => `/providers/${id}/availability`,
  },

  // Photos
  photos: {
    list: '/photos',
    upload: '/photos/upload',
    get: (id: string) => `/photos/${id}`,
    delete: (id: string) => `/photos/${id}`,
    sets: '/photos/sets',
    getSet: (id: string) => `/photos/sets/${id}`,
  },

  // Messages
  messages: {
    conversations: '/messages/conversations',
    thread: (id: string) => `/messages/conversations/${id}`,
    send: (conversationId: string) => `/messages/conversations/${conversationId}/send`,
    markRead: (id: string) => `/messages/${id}/read`,
    ai: {
      chat: '/messages/ai/chat',
      suggestions: '/messages/ai/suggestions',
    },
  },

  // Payments
  payments: {
    methods: '/payments/methods',
    addMethod: '/payments/methods',
    removeMethod: (id: string) => `/payments/methods/${id}`,
    setDefault: (id: string) => `/payments/methods/${id}/default`,
    history: '/payments/history',
    hsaFsa: {
      accounts: '/payments/hsa-fsa/accounts',
      verify: '/payments/hsa-fsa/verify',
    },
  },

  // Membership & Rewards
  membership: {
    status: '/membership/status',
    points: '/membership/points',
    history: '/membership/history',
    rewards: '/membership/rewards',
    redeem: (rewardId: string) => `/membership/rewards/${rewardId}/redeem`,
  },

  // Referrals
  referrals: {
    // Patient endpoints
    program: '/referrals/program',
    generate: '/referrals/generate',
    validate: (code: string) => `/referrals/validate/${code}`,
    apply: '/referrals/apply',
    share: '/referrals/share',
    history: '/referrals/history',
    stats: '/referrals/stats',
    rewards: '/referrals/rewards',
    redeem: (rewardId: string) => `/referrals/rewards/${rewardId}/redeem`,
    
    // Admin endpoints
    admin: {
      list: '/admin/referrals',
      get: (id: string) => `/admin/referrals/${id}`,
      update: (id: string) => `/admin/referrals/${id}`,
      analytics: '/admin/referrals/analytics',
      topReferrers: '/admin/referrals/top-referrers',
      export: '/admin/referrals/export',
      settings: {
        get: '/admin/referrals/settings',
        update: '/admin/referrals/settings',
      },
    },
  },

  // Locations
  locations: {
    list: '/locations',
    get: (id: string) => `/locations/${id}`,
  },
} as const;
