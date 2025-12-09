/**
 * Message Templates System
 * Comprehensive template management for Luxe Medical Spa
 */

export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  channel: 'sms' | 'email' | 'both';
  subject?: string; // For emails
  body: string;
  variables: string[];
  tags: string[];
  isActive: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
  compliance: {
    hipaaCompliant: boolean;
    includesOptOut: boolean;
    maxLength?: number;
  };
}

export type TemplateCategory = 
  | 'appointment'
  | 'treatment'
  | 'marketing'
  | 'financial'
  | 'followup'
  | 'emergency'
  | 'administrative'
  | 'membership'
  | 'review';

/**
 * Template variable replacer
 */
export function replaceVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value || ''));
  });
  
  return result;
}

/**
 * Production-ready message templates
 */
export const TEMPLATES: Record<string, MessageTemplate> = {
  // ============= APPOINTMENT TEMPLATES =============
  
  appointment_confirmation: {
    id: 'appointment_confirmation',
    name: 'Appointment Confirmation',
    category: 'appointment',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}! Your appointment at Luxe Medical Spa is confirmed for {{appointmentDate}} at {{appointmentTime}} with {{providerName}} for {{serviceName}}. Reply C to confirm, R to reschedule, or STOP to opt out.',
    variables: ['patientFirstName', 'appointmentDate', 'appointmentTime', 'providerName', 'serviceName'],
    tags: ['appointment', 'confirmation', 'automated'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: true,
      maxLength: 160,
    },
  },
  
  appointment_reminder_48hr: {
    id: 'appointment_reminder_48hr',
    name: '48 Hour Reminder',
    category: 'appointment',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}! Reminder: You have an appointment for {{serviceName}} on {{appointmentDate}} at {{appointmentTime}}. Please avoid alcohol 24hrs before. Reply C to confirm or R to reschedule.',
    variables: ['patientFirstName', 'serviceName', 'appointmentDate', 'appointmentTime'],
    tags: ['appointment', 'reminder', '48hr'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  appointment_reminder_24hr: {
    id: 'appointment_reminder_24hr',
    name: '24 Hour Reminder',
    category: 'appointment',
    channel: 'sms',
    body: 'Tomorrow\'s the day, {{patientFirstName}}! Your {{serviceName}} is at {{appointmentTime}}. Pre-treatment tips: Stay hydrated, avoid blood thinners, arrive makeup-free. See you soon! Reply STOP to opt out.',
    variables: ['patientFirstName', 'serviceName', 'appointmentTime'],
    tags: ['appointment', 'reminder', '24hr'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: true,
      maxLength: 160,
    },
  },
  
  appointment_reminder_2hr: {
    id: 'appointment_reminder_2hr',
    name: '2 Hour Reminder',
    category: 'appointment',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}! See you in 2 hours for your {{serviceName}} at {{appointmentTime}}. Our address: {{clinicAddress}}. Please arrive 10 min early. Can\'t wait to see you!',
    variables: ['patientFirstName', 'serviceName', 'appointmentTime', 'clinicAddress'],
    tags: ['appointment', 'reminder', '2hr'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  appointment_rescheduled: {
    id: 'appointment_rescheduled',
    name: 'Appointment Rescheduled',
    category: 'appointment',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}, your {{serviceName}} appointment has been rescheduled to {{newDate}} at {{newTime}} with {{providerName}}. Please reply C to confirm or call us at {{clinicPhone}}.',
    variables: ['patientFirstName', 'serviceName', 'newDate', 'newTime', 'providerName', 'clinicPhone'],
    tags: ['appointment', 'reschedule'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  appointment_cancelled: {
    id: 'appointment_cancelled',
    name: 'Appointment Cancelled',
    category: 'appointment',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}, your {{serviceName}} appointment on {{appointmentDate}} has been cancelled. To rebook, reply BOOK or call {{clinicPhone}}. We hope to see you soon!',
    variables: ['patientFirstName', 'serviceName', 'appointmentDate', 'clinicPhone'],
    tags: ['appointment', 'cancellation'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  appointment_noshow: {
    id: 'appointment_noshow',
    name: 'No Show Follow-up',
    category: 'appointment',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}, we missed you today! We hope everything is okay. To reschedule your {{serviceName}} appointment, reply YES or call {{clinicPhone}}. We\'re here when you\'re ready!',
    variables: ['patientFirstName', 'serviceName', 'clinicPhone'],
    tags: ['appointment', 'noshow', 'followup'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  appointment_waitlist: {
    id: 'appointment_waitlist',
    name: 'Waitlist Opening',
    category: 'appointment',
    channel: 'sms',
    body: 'Great news {{patientFirstName}}! A {{serviceName}} spot opened up on {{date}} at {{time}}. Reply YES within 30 min to book, or NO to stay on waitlist. First come, first served!',
    variables: ['patientFirstName', 'serviceName', 'date', 'time'],
    tags: ['appointment', 'waitlist'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  // ============= TREATMENT TEMPLATES =============
  
  treatment_followup_24hr: {
    id: 'treatment_followup_24hr',
    name: 'Post-Treatment 24hr Check',
    category: 'treatment',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}! How are you feeling after your {{treatment}} yesterday? Remember: {{aftercareReminder}}. Any concerns? Reply or call {{clinicPhone}}. Your comfort is our priority!',
    variables: ['patientFirstName', 'treatment', 'aftercareReminder', 'clinicPhone'],
    tags: ['treatment', 'followup', '24hr'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  treatment_followup_3day: {
    id: 'treatment_followup_3day',
    name: 'Post-Treatment 3 Day Check',
    category: 'treatment',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}! Quick check-in on your {{treatment}} from 3 days ago. You should start seeing initial results. Any questions? We\'re here to help! Reply or call {{clinicPhone}}.',
    variables: ['patientFirstName', 'treatment', 'clinicPhone'],
    tags: ['treatment', 'followup', '3day'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  treatment_followup_1week: {
    id: 'treatment_followup_1week',
    name: 'Post-Treatment 1 Week Check',
    category: 'treatment',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}! It\'s been a week since your {{treatment}}. How are your results? We\'d love to hear about your experience. Reply with feedback or any questions!',
    variables: ['patientFirstName', 'treatment'],
    tags: ['treatment', 'followup', '1week'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  treatment_followup_2week: {
    id: 'treatment_followup_2week',
    name: 'Post-Treatment 2 Week Check',
    category: 'treatment',
    channel: 'sms',
    body: '{{patientFirstName}}, your {{treatment}} results should be at their peak! 📸 We\'d love to see your transformation. Ready for your next treatment? Book at {{bookingUrl}}',
    variables: ['patientFirstName', 'treatment', 'bookingUrl'],
    tags: ['treatment', 'followup', '2week'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  // Treatment-specific aftercare templates
  
  aftercare_botox: {
    id: 'aftercare_botox',
    name: 'Botox Aftercare',
    category: 'treatment',
    channel: 'sms',
    body: 'Post-Botox care: No lying down 4hrs, avoid exercise 24hrs, no facial massage 2 weeks. Results in 3-7 days, full effect at 2 weeks. Questions? Text us back!',
    variables: [],
    tags: ['treatment', 'aftercare', 'botox'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  aftercare_filler: {
    id: 'aftercare_filler',
    name: 'Filler Aftercare',
    category: 'treatment',
    channel: 'sms',
    body: 'Filler aftercare: Ice for swelling, avoid exercise/alcohol 24hrs, sleep elevated, gentle massage as directed. Swelling normal for 3-5 days. Concerns? Text us!',
    variables: [],
    tags: ['treatment', 'aftercare', 'filler'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  aftercare_chemical_peel: {
    id: 'aftercare_chemical_peel',
    name: 'Chemical Peel Aftercare',
    category: 'treatment',
    channel: 'sms',
    body: 'Peel aftercare: Keep skin moist, use gentle cleanser, SPF 30+ daily, no retinols/acids 1 week, expect peeling days 3-5. Normal healing! Questions? Reply here.',
    variables: [],
    tags: ['treatment', 'aftercare', 'peel'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  aftercare_microneedling: {
    id: 'aftercare_microneedling',
    name: 'Microneedling Aftercare',
    category: 'treatment',
    channel: 'sms',
    body: 'Microneedling care: No makeup 24hrs, gentle products only, avoid sun/exercise 48hrs, use provided serum. Redness normal 2-3 days. We\'re here if you need us!',
    variables: [],
    tags: ['treatment', 'aftercare', 'microneedling'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  aftercare_laser: {
    id: 'aftercare_laser',
    name: 'Laser Treatment Aftercare',
    category: 'treatment',
    channel: 'sms',
    body: 'Laser aftercare: Apply ice if needed, moisturize frequently, SPF 50+ essential, avoid heat/sweating 48hrs. Mild redness/swelling normal. Questions? Text us!',
    variables: [],
    tags: ['treatment', 'aftercare', 'laser'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  // ============= MARKETING TEMPLATES =============
  
  marketing_birthday: {
    id: 'marketing_birthday',
    name: 'Birthday Greeting',
    category: 'marketing',
    channel: 'sms',
    body: 'Happy Birthday {{patientFirstName}}! 🎉 Celebrate with 20% off any treatment this month. Book your birthday glow-up: {{bookingUrl}} Code: BDAY{{birthMonth}}',
    variables: ['patientFirstName', 'bookingUrl', 'birthMonth'],
    tags: ['marketing', 'birthday', 'promotion'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  marketing_vip_offer: {
    id: 'marketing_vip_offer',
    name: 'VIP Exclusive Offer',
    category: 'marketing',
    channel: 'sms',
    body: '{{patientFirstName}}, VIP exclusive! {{offerDetails}} Valid {{validUntil}}. Limited spots! Book: {{bookingUrl}} or reply YES. STOP to opt out.',
    variables: ['patientFirstName', 'offerDetails', 'validUntil', 'bookingUrl'],
    tags: ['marketing', 'vip', 'exclusive'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: true,
      maxLength: 160,
    },
  },
  
  marketing_seasonal: {
    id: 'marketing_seasonal',
    name: 'Seasonal Promotion',
    category: 'marketing',
    channel: 'sms',
    body: '{{season}} Special at Luxe! {{promotionDetails}} Book by {{deadline}}: {{bookingUrl}} Limited availability. Reply STOP to opt out.',
    variables: ['season', 'promotionDetails', 'deadline', 'bookingUrl'],
    tags: ['marketing', 'seasonal', 'promotion'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: true,
      maxLength: 160,
    },
  },
  
  marketing_referral: {
    id: 'marketing_referral',
    name: 'Referral Program',
    category: 'marketing',
    channel: 'sms',
    body: '{{patientFirstName}}, share the glow! Refer a friend and both get $50 off next treatment. Your referral code: {{referralCode}}. Details: {{referralUrl}}',
    variables: ['patientFirstName', 'referralCode', 'referralUrl'],
    tags: ['marketing', 'referral'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  marketing_win_back: {
    id: 'marketing_win_back',
    name: 'Win Back Campaign',
    category: 'marketing',
    channel: 'sms',
    body: 'We miss you {{patientFirstName}}! It\'s been {{monthsSince}} months. Come back for 25% off any treatment. Book: {{bookingUrl}} Offer expires {{expiryDate}}.',
    variables: ['patientFirstName', 'monthsSince', 'bookingUrl', 'expiryDate'],
    tags: ['marketing', 'winback'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  // ============= MEMBERSHIP TEMPLATES =============
  
  membership_welcome: {
    id: 'membership_welcome',
    name: 'Membership Welcome',
    category: 'membership',
    channel: 'sms',
    body: 'Welcome to Luxe VIP, {{patientFirstName}}! Your {{membershipTier}} benefits are active. {{monthlyCredits}} credits added. Book your first VIP treatment: {{bookingUrl}}',
    variables: ['patientFirstName', 'membershipTier', 'monthlyCredits', 'bookingUrl'],
    tags: ['membership', 'welcome'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  membership_credits_added: {
    id: 'membership_credits_added',
    name: 'Monthly Credits Added',
    category: 'membership',
    channel: 'sms',
    body: '{{patientFirstName}}, your {{creditAmount}} monthly credits are here! Balance: {{totalCredits}}. Use by {{expiryDate}}. Book: {{bookingUrl}}',
    variables: ['patientFirstName', 'creditAmount', 'totalCredits', 'expiryDate', 'bookingUrl'],
    tags: ['membership', 'credits'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  membership_credits_expiring: {
    id: 'membership_credits_expiring',
    name: 'Credits Expiring Soon',
    category: 'membership',
    channel: 'sms',
    body: '{{patientFirstName}}, you have {{expiringCredits}} credits expiring on {{expiryDate}}! Don\'t lose them - book now: {{bookingUrl}} or call {{clinicPhone}}',
    variables: ['patientFirstName', 'expiringCredits', 'expiryDate', 'bookingUrl', 'clinicPhone'],
    tags: ['membership', 'credits', 'expiring'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  membership_renewal: {
    id: 'membership_renewal',
    name: 'Membership Renewal',
    category: 'membership',
    channel: 'sms',
    body: '{{patientFirstName}}, your {{membershipTier}} membership renews on {{renewalDate}}. Keep your VIP perks active! Questions? Reply or call {{clinicPhone}}',
    variables: ['patientFirstName', 'membershipTier', 'renewalDate', 'clinicPhone'],
    tags: ['membership', 'renewal'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  // ============= FINANCIAL TEMPLATES =============
  
  financial_payment_reminder: {
    id: 'financial_payment_reminder',
    name: 'Payment Reminder',
    category: 'financial',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}, friendly reminder: Your payment of ${{amount}} for {{service}} is due {{dueDate}}. Pay online: {{paymentUrl}} Questions? Call {{clinicPhone}}',
    variables: ['patientFirstName', 'amount', 'service', 'dueDate', 'paymentUrl', 'clinicPhone'],
    tags: ['financial', 'payment', 'reminder'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  financial_payment_received: {
    id: 'financial_payment_received',
    name: 'Payment Confirmation',
    category: 'financial',
    channel: 'sms',
    body: 'Thank you {{patientFirstName}}! Payment of ${{amount}} received for {{service}}. Receipt: {{receiptUrl}}. See you on {{appointmentDate}}!',
    variables: ['patientFirstName', 'amount', 'service', 'receiptUrl', 'appointmentDate'],
    tags: ['financial', 'payment', 'confirmation'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  financial_package_purchased: {
    id: 'financial_package_purchased',
    name: 'Package Purchase Confirmation',
    category: 'financial',
    channel: 'sms',
    body: 'Congrats {{patientFirstName}}! Your {{packageName}} package ({{sessions}} sessions) is active. Book your first session: {{bookingUrl}} Expires: {{expiryDate}}',
    variables: ['patientFirstName', 'packageName', 'sessions', 'bookingUrl', 'expiryDate'],
    tags: ['financial', 'package', 'confirmation'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  // ============= REVIEW TEMPLATES =============
  
  review_request: {
    id: 'review_request',
    name: 'Review Request',
    category: 'review',
    channel: 'sms',
    body: '{{patientFirstName}}, thank you for choosing Luxe! How was your {{treatment}} experience? Share a quick review: {{reviewUrl}} Your feedback means everything!',
    variables: ['patientFirstName', 'treatment', 'reviewUrl'],
    tags: ['review', 'feedback'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  review_thank_you: {
    id: 'review_thank_you',
    name: 'Review Thank You',
    category: 'review',
    channel: 'sms',
    body: 'Thank you for the amazing review, {{patientFirstName}}! As a thank you, enjoy 10% off your next treatment. Code: THANKS10. Book: {{bookingUrl}}',
    variables: ['patientFirstName', 'bookingUrl'],
    tags: ['review', 'thankyou', 'reward'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  // ============= EMERGENCY TEMPLATES =============
  
  emergency_clinic_closure: {
    id: 'emergency_clinic_closure',
    name: 'Emergency Clinic Closure',
    category: 'emergency',
    channel: 'sms',
    body: 'URGENT: Due to {{reason}}, Luxe Medical Spa is closed {{closureDate}}. Your appointment will be rescheduled. We\'ll contact you soon. Sorry for the inconvenience.',
    variables: ['reason', 'closureDate'],
    tags: ['emergency', 'closure'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  emergency_provider_absence: {
    id: 'emergency_provider_absence',
    name: 'Provider Absence',
    category: 'emergency',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}, {{providerName}} is unexpectedly unavailable for your {{appointmentTime}} appointment. Call {{clinicPhone}} to reschedule or see another provider.',
    variables: ['patientFirstName', 'providerName', 'appointmentTime', 'clinicPhone'],
    tags: ['emergency', 'provider', 'cancellation'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  // ============= ADMINISTRATIVE TEMPLATES =============
  
  admin_forms_reminder: {
    id: 'admin_forms_reminder',
    name: 'Forms Reminder',
    category: 'administrative',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}! Please complete your forms before your {{appointmentDate}} visit: {{formsUrl}} This saves time at check-in. See you soon!',
    variables: ['patientFirstName', 'appointmentDate', 'formsUrl'],
    tags: ['admin', 'forms'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  admin_insurance_update: {
    id: 'admin_insurance_update',
    name: 'Insurance Update Request',
    category: 'administrative',
    channel: 'sms',
    body: '{{patientFirstName}}, we need updated insurance info for your upcoming visit. Update online: {{updateUrl}} or bring new card to your appointment.',
    variables: ['patientFirstName', 'updateUrl'],
    tags: ['admin', 'insurance'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160,
    },
  },
  
  admin_general_update: {
    id: 'admin_general_update',
    name: 'General Update',
    category: 'administrative',
    channel: 'sms',
    body: 'Luxe Medical Spa Update: {{updateMessage}} Questions? Call {{clinicPhone}} or visit {{websiteUrl}}. Reply STOP to opt out.',
    variables: ['updateMessage', 'clinicPhone', 'websiteUrl'],
    tags: ['admin', 'general'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: true,
      maxLength: 160,
    },
  },
};

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): MessageTemplate | undefined {
  return TEMPLATES[templateId];
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): MessageTemplate[] {
  return Object.values(TEMPLATES).filter(t => t.category === category);
}

/**
 * Get active templates
 */
export function getActiveTemplates(): MessageTemplate[] {
  return Object.values(TEMPLATES).filter(t => t.isActive);
}

/**
 * Search templates
 */
export function searchTemplates(query: string): MessageTemplate[] {
  const searchLower = query.toLowerCase();
  return Object.values(TEMPLATES).filter(t => 
    t.name.toLowerCase().includes(searchLower) ||
    t.body.toLowerCase().includes(searchLower) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchLower))
  );
}

/**
 * Validate template variables
 */
export function validateTemplateVariables(
  template: MessageTemplate,
  variables: Record<string, any>
): { valid: boolean; missing: string[] } {
  const missing = template.variables.filter(v => !variables[v]);
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Generate message from template
 */
export function generateMessage(
  templateId: string,
  variables: Record<string, any>
): { success: boolean; message?: string; error?: string } {
  const template = getTemplate(templateId);
  
  if (!template) {
    return { success: false, error: 'Template not found' };
  }
  
  const validation = validateTemplateVariables(template, variables);
  
  if (!validation.valid) {
    return { 
      success: false, 
      error: `Missing variables: ${validation.missing.join(', ')}` 
    };
  }
  
  const message = replaceVariables(template.body, variables);
  
  // Check length for SMS
  if (template.channel === 'sms' && message.length > 160) {
    console.warn(`Message exceeds SMS limit: ${message.length} characters`);
  }
  
  return { success: true, message };
}