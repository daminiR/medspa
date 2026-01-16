export interface NavItem {
  title: string
  href: string
  icon?: string
  status?: 'complete' | 'in-progress' | 'planned'
  items?: NavItem[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/', icon: 'home' },
      { title: 'Quick Start Guide', href: '/getting-started/quick-start', icon: 'rocket' },
      { title: 'System Requirements', href: '/getting-started/requirements', icon: 'settings' },
      { title: 'Account Setup', href: '/getting-started/account-setup', icon: 'user' },
    ],
  },
  {
    title: 'Core Features',
    items: [
      {
        title: 'Dashboard',
        href: '/features/dashboard',
        icon: 'layout-dashboard',
        status: 'complete',
      },
      {
        title: 'Calendar & Scheduling',
        href: '/features/calendar',
        icon: 'calendar',
        status: 'complete',
        items: [
          { title: 'Day/Week/Month Views', href: '/features/calendar/views', status: 'complete' },
          { title: 'Appointments', href: '/features/calendar/appointments', status: 'complete' },
          { title: 'Time Blocks & Breaks', href: '/features/calendar/blocks', status: 'in-progress' },
          { title: 'Drag & Drop', href: '/features/calendar/drag-drop', status: 'complete' },
          { title: 'Waitlist Management', href: '/features/calendar/waitlist', status: 'complete' },
        ]
      },
      {
        title: 'Patient Management',
        href: '/features/patients',
        icon: 'users',
        status: 'complete',
        items: [
          { title: 'Patient Profiles', href: '/features/patients/profiles', status: 'complete' },
          { title: 'Search & Filters', href: '/features/patients/search', status: 'complete' },
          { title: 'Appointment History', href: '/features/patients/history', status: 'complete' },
          { title: 'Medical Profile', href: '/features/patients/medical', status: 'complete' },
          { title: 'Family Linking', href: '/features/patients/family', status: 'complete' },
          { title: 'Document Storage', href: '/features/patients/documents', status: 'in-progress' },
        ]
      },
      {
        title: 'Messaging & SMS',
        href: '/features/messaging',
        icon: 'message-circle',
        status: 'complete',
        items: [
          { title: 'Two-Way Texting', href: '/features/messaging/two-way-texting', status: 'complete' },
          { title: 'Two-Way SMS', href: '/features/messaging/sms', status: 'complete' },
          { title: 'AI Reply Suggestions', href: '/features/messaging/ai-suggestions', status: 'complete' },
          { title: 'Appointment Reminders', href: '/features/messaging/reminders', status: 'complete' },
          { title: 'Quick Replies', href: '/features/messaging/quick-replies', status: 'complete' },
          { title: 'SMS Campaigns', href: '/features/messaging/campaigns', status: 'complete' },
          { title: 'SMS Settings', href: '/features/messaging/settings', status: 'complete' },
          { title: 'Message Templates', href: '/features/messaging/templates', status: 'complete' },
        ]
      },
      {
        title: 'Billing & Payments',
        href: '/features/billing',
        icon: 'credit-card',
        status: 'in-progress',
        items: [
          { title: 'POS Checkout', href: '/features/billing/checkout', status: 'in-progress' },
          { title: 'Packages & Memberships', href: '/features/billing/packages', status: 'complete' },
          { title: 'Payment Processing', href: '/features/billing/payments', status: 'in-progress' },
          { title: 'Invoices', href: '/features/billing/invoices', status: 'planned' },
        ]
      },
      {
        title: 'Reports & Analytics',
        href: '/features/reports',
        icon: 'bar-chart',
        status: 'complete',
        items: [
          { title: 'Overview', href: '/features/reports', status: 'complete' },
          { title: 'Referral Analytics', href: '/features/reports/referrals', status: 'complete' },
          { title: 'Patient Acquisition', href: '/features/reports/acquisition', status: 'complete' },
          { title: 'Sales Reports', href: '/features/reports/sales', status: 'complete' },
          { title: 'Appointment Analytics', href: '/features/reports/appointments', status: 'complete' },
          { title: 'Treatment Outcomes', href: '/features/reports/outcomes', status: 'complete' },
          { title: 'Cash Reconciliation', href: '/features/reports/cash', status: 'complete' },
          { title: 'KPI Glossary', href: '/features/reports/glossary', status: 'complete' },
          { title: 'Best Practices', href: '/features/reports/best-practices', status: 'complete' },
        ]
      },
      {
        title: 'Settings',
        href: '/features/settings',
        icon: 'settings',
        status: 'complete',
        items: [
          { title: 'User Management', href: '/features/settings/users', status: 'complete' },
          { title: 'Role Permissions', href: '/features/settings/users', status: 'complete' },
          { title: 'Clinic Settings', href: '/features/settings', status: 'complete' },
        ]
      },
      {
        title: 'Staff Management',
        href: '/features/staff',
        icon: 'user-cog',
        status: 'complete',
        items: [
          { title: 'Staff Directory', href: '/features/staff', status: 'complete' },
          { title: 'Shift Approvals', href: '/features/staff', status: 'complete' },
          { title: 'Schedule Templates', href: '/features/staff', status: 'complete' },
        ]
      },
    ],
  },
  {
    title: 'Advanced Features',
    items: [
      {
        title: 'Waiting Room',
        href: '/features/waiting-room',
        icon: 'clock',
        status: 'complete',
        items: [
          { title: 'SMS Check-In', href: '/features/waiting-room/check-in', status: 'complete' },
          { title: 'Queue Management', href: '/features/waiting-room/queue', status: 'complete' },
          { title: 'Status Updates', href: '/features/waiting-room/status', status: 'complete' },
        ]
      },
      {
        title: 'Express Booking',
        href: '/features/express-booking',
        icon: 'zap',
        status: 'complete',
        items: [
          { title: 'SMS Quick Book', href: '/features/express-booking/sms', status: 'complete' },
          { title: 'Card on File', href: '/features/express-booking/payment', status: 'in-progress' },
          { title: 'Booking Links', href: '/features/express-booking/links', status: 'complete' },
        ]
      },
      {
        title: 'Group Booking',
        href: '/features/group-booking',
        icon: 'users-2',
        status: 'in-progress',
        items: [
          { title: 'Creating Groups', href: '/features/group-booking/create', status: 'complete' },
          { title: 'Group Discounts', href: '/features/group-booking/discounts', status: 'complete' },
          { title: 'Coordinator Management', href: '/features/group-booking/coordinator', status: 'in-progress' },
        ]
      },
      {
        title: 'Treatment Series',
        href: '/features/series',
        icon: 'repeat',
        status: 'complete',
        items: [
          { title: 'Repeating Appointments', href: '/features/series/repeating', status: 'complete' },
          { title: 'Package Pricing', href: '/features/series/pricing', status: 'complete' },
          { title: 'Progress Tracking', href: '/features/series/progress', status: 'complete' },
        ]
      },
      {
        title: 'Charting',
        href: '/features/charting',
        icon: 'file-text',
        status: 'in-progress',
        items: [
          { title: 'SOAP Notes', href: '/features/charting/soap', status: 'in-progress' },
          { title: 'Injectable Tracking', href: '/features/charting/injectables', status: 'in-progress' },
          { title: 'Photo Documentation', href: '/features/charting/photos', status: 'planned' },
        ]
      },
      {
        title: 'Inventory Management',
        href: '/features/inventory',
        icon: 'package',
        status: 'in-progress',
        items: [
          { title: 'Open Vial Tracking', href: '/features/inventory/vials', status: 'complete' },
          { title: 'Provider Analytics', href: '/features/inventory/analytics', status: 'complete' },
          { title: 'Auto-Deduction', href: '/features/inventory/charting', status: 'complete' },
          { title: 'Lot & Expiration', href: '/features/inventory/lots', status: 'complete' },
          { title: 'Allē & ASPIRE', href: '/features/inventory/loyalty', status: 'in-progress' },
        ]
      },
      {
        title: 'Patient Portal (Web)',
        href: '/features/patient-portal',
        icon: 'smartphone',
        status: 'complete',
        items: [
          { title: 'Overview', href: '/features/patient-portal', status: 'complete' },
          { title: 'Authentication', href: '/features/patient-portal/authentication', status: 'complete' },
          { title: 'Booking Flow', href: '/features/patient-portal/booking', status: 'complete' },
          { title: 'Photo Gallery', href: '/features/patient-portal/photos', status: 'complete' },
          { title: 'Messaging', href: '/features/patient-portal/messaging', status: 'complete' },
          { title: 'Deployment', href: '/features/patient-portal/deployment', status: 'complete' },
        ]
      },
    ],
  },
  {
    title: 'AI Features',
    items: [
      {
        title: 'Voice AI',
        href: '/features/voice-ai',
        icon: 'mic',
        status: 'planned',
        items: [
          { title: 'Phone Booking Assistant', href: '/features/voice-ai/phone-booking', status: 'planned' },
          { title: 'Charting Dictation', href: '/features/voice-ai/dictation', status: 'planned' },
        ]
      },
      {
        title: 'Smart SMS',
        href: '/features/smart-sms',
        icon: 'sparkles',
        status: 'complete',
        items: [
          { title: 'AI Reply Suggestions', href: '/features/messaging/ai-suggestions', status: 'complete' },
          { title: 'Intent Detection', href: '/features/smart-sms/intent', status: 'complete' },
        ]
      },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { title: 'Stripe Payments', href: '/integrations/stripe', icon: 'credit-card', status: 'in-progress' },
      { title: 'Twilio SMS', href: '/integrations/twilio', icon: 'message-square', status: 'complete' },
      { title: 'QuickBooks', href: '/integrations/quickbooks', icon: 'book', status: 'planned' },
      { title: 'Zapier', href: '/integrations/zapier', icon: 'zap', status: 'planned' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { title: 'Overview', href: '/api/overview', icon: 'code' },
      { title: 'Authentication', href: '/api/authentication', icon: 'key' },
      { title: 'Appointments', href: '/api/appointments', icon: 'calendar' },
      { title: 'Patients', href: '/api/patients', icon: 'users' },
      { title: 'Webhooks', href: '/api/webhooks', icon: 'webhook' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { title: 'FAQ', href: '/guides/faq', icon: 'help-circle' },
      { title: 'Best Practices', href: '/guides/best-practices', icon: 'lightbulb' },
      { title: 'Pricing', href: '/pricing', icon: 'tag' },
      { title: 'Support', href: '/support', icon: 'life-buoy' },
    ],
  },
]

export const featureStatus = {
  'dashboard': { completion: 100, label: 'Dashboard' },
  'calendar': { completion: 78, label: 'Scheduling & Calendar' },
  'patients': { completion: 100, label: 'Patient CRM' },
  'messaging': { completion: 100, label: 'Two-Way SMS' },
  'billing': { completion: 72, label: 'POS & Checkout' },
  'reports': { completion: 82, label: 'Reports & Analytics' },
  'packages': { completion: 85, label: 'Packages & Memberships' },
  'waiting-room': { completion: 85, label: 'Virtual Waiting Room' },
  'express-booking': { completion: 95, label: 'Express Booking' },
  'group-booking': { completion: 60, label: 'Group Booking' },
  'series': { completion: 90, label: 'Treatment Series' },
  'charting': { completion: 45, label: 'Charting' },
  'inventory': { completion: 75, label: 'Inventory Management' },
  'patient-portal': { completion: 85, label: 'Patient Portal (Web)' },
  'settings': { completion: 85, label: 'Settings & User Management' },
  'staff': { completion: 90, label: 'Staff Management' },
  'api': { completion: 10, label: 'API & Webhooks' },
}
