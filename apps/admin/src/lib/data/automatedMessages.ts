/**
 * Mock data and default templates for automated messages
 * Supports both email and SMS templates for various event types
 */

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms';
  eventType: string;
  subject?: string; // Only for emails
  body: string;
  variables: string[];
  enabled: boolean;
  category: 'appointment' | 'reminder' | 'confirmation' | 'marketing' | 'followup';
  description: string;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  enabled: boolean;
  timing: number; // hours before appointment
  type: 'email' | 'sms';
  template: string; // template ID
}

// Default email templates
export const defaultEmailTemplates: MessageTemplate[] = [
  // Appointment Confirmation Emails
  {
    id: 'appointment_booked_email',
    name: 'Appointment Confirmation Email',
    type: 'email',
    eventType: 'appointment_booked',
    subject: 'Appointment Confirmed - {{date}} at {{time}}',
    body: `Hi {{firstName}},

Your appointment has been confirmed!

📅 Date: {{date}}
🕐 Time: {{time}}
👤 Provider: {{providerName}}
💆 Service: {{serviceName}}
⏱️ Duration: {{duration}} minutes
📍 Location: {{locationName}}

{{#if notes}}
Special Notes: {{notes}}
{{/if}}

Need to make changes? Click here to reschedule or cancel:
{{rescheduleLink}}

We look forward to seeing you!

Best regards,
{{clinicName}}
{{clinicPhone}}`,
    variables: ['firstName', 'lastName', 'date', 'time', 'providerName', 'serviceName', 'duration', 'locationName', 'notes', 'rescheduleLink', 'clinicName', 'clinicPhone'],
    enabled: true,
    category: 'appointment',
    description: 'Sent immediately when a patient books an appointment'
  },
  {
    id: 'appointment_canceled_email',
    name: 'Appointment Cancellation Email',
    type: 'email',
    eventType: 'appointment_canceled',
    subject: 'Appointment Canceled - {{date}} at {{time}}',
    body: `Hi {{firstName}},

Your appointment has been canceled as requested.

Canceled Appointment Details:
📅 Date: {{date}}
🕐 Time: {{time}}
💆 Service: {{serviceName}}

We're sorry we won't see you this time. If you'd like to reschedule, please call us at {{clinicPhone}} or book online:
{{bookingLink}}

Thank you,
{{clinicName}}`,
    variables: ['firstName', 'date', 'time', 'serviceName', 'clinicPhone', 'bookingLink', 'clinicName'],
    enabled: true,
    category: 'appointment',
    description: 'Sent when an appointment is canceled'
  },
  {
    id: 'appointment_rescheduled_email',
    name: 'Appointment Rescheduled Email',
    type: 'email',
    eventType: 'appointment_rescheduled',
    subject: 'Appointment Rescheduled - New Time: {{newDate}} at {{newTime}}',
    body: `Hi {{firstName}},

Your appointment has been successfully rescheduled.

Previous Appointment:
📅 {{oldDate}} at {{oldTime}}

New Appointment:
📅 {{newDate}} at {{newTime}}
👤 Provider: {{providerName}}
💆 Service: {{serviceName}}
📍 Location: {{locationName}}

Need to make additional changes?
{{rescheduleLink}}

See you soon!
{{clinicName}}`,
    variables: ['firstName', 'oldDate', 'oldTime', 'newDate', 'newTime', 'providerName', 'serviceName', 'locationName', 'rescheduleLink', 'clinicName'],
    enabled: true,
    category: 'appointment',
    description: 'Sent when an appointment is rescheduled to a new time'
  },

  // Reminder Emails
  {
    id: 'reminder_24hr_email',
    name: '24-Hour Reminder Email',
    type: 'email',
    eventType: 'reminder_24hr',
    subject: 'Reminder: Appointment Tomorrow at {{time}}',
    body: `Hi {{firstName}},

This is a friendly reminder about your appointment tomorrow!

📅 Date: {{date}} (Tomorrow)
🕐 Time: {{time}}
👤 Provider: {{providerName}}
💆 Service: {{serviceName}}
📍 Location: {{locationName}}
{{addressLine1}}
{{city}}, {{state}} {{zip}}

{{#if prepInstructions}}
⚠️ Important Pre-Appointment Instructions:
{{prepInstructions}}
{{/if}}

Please arrive 10 minutes early to complete any necessary paperwork.

Need to reschedule? Click here:
{{rescheduleLink}}

Questions? Call us at {{clinicPhone}}

Looking forward to seeing you!
{{clinicName}}`,
    variables: ['firstName', 'date', 'time', 'providerName', 'serviceName', 'locationName', 'addressLine1', 'city', 'state', 'zip', 'prepInstructions', 'rescheduleLink', 'clinicPhone', 'clinicName'],
    enabled: true,
    category: 'reminder',
    description: 'Sent 24 hours before appointment'
  },
  {
    id: 'reminder_2hr_email',
    name: '2-Hour Reminder Email',
    type: 'email',
    eventType: 'reminder_2hr',
    subject: 'Reminder: Appointment Today at {{time}}',
    body: `Hi {{firstName}},

Your appointment is coming up soon!

🕐 Time: {{time}} (in 2 hours)
👤 Provider: {{providerName}}
💆 Service: {{serviceName}}
📍 {{locationName}}

We'll see you shortly!

{{clinicName}}
{{clinicPhone}}`,
    variables: ['firstName', 'time', 'providerName', 'serviceName', 'locationName', 'clinicName', 'clinicPhone'],
    enabled: true,
    category: 'reminder',
    description: 'Sent 2 hours before appointment'
  },

  // Follow-up Emails
  {
    id: 'followup_thankyou_email',
    name: 'Post-Appointment Thank You Email',
    type: 'email',
    eventType: 'followup_thankyou',
    subject: 'Thank You for Your Visit!',
    body: `Hi {{firstName}},

Thank you for choosing {{clinicName}} for your {{serviceName}} treatment!

We hope you had a wonderful experience with {{providerName}}. Your satisfaction is our top priority.

📸 How are you feeling?
We'd love to see your results! Share your experience on social media and tag us @{{socialHandle}}

⭐ Leave us a review
Your feedback helps us serve you better:
{{reviewLink}}

💆 Book your next appointment
Continue your treatment plan:
{{bookingLink}}

Questions or concerns? We're here to help!
Call: {{clinicPhone}}
Email: {{clinicEmail}}

Thank you for being a valued patient!

{{clinicName}}`,
    variables: ['firstName', 'serviceName', 'providerName', 'socialHandle', 'reviewLink', 'bookingLink', 'clinicPhone', 'clinicEmail', 'clinicName'],
    enabled: true,
    category: 'followup',
    description: 'Sent after appointment completion'
  },
  {
    id: 'followup_care_instructions_email',
    name: 'Post-Treatment Care Instructions',
    type: 'email',
    eventType: 'followup_care',
    subject: 'Your Post-Treatment Care Instructions',
    body: `Hi {{firstName}},

Here are your personalized care instructions following your {{serviceName}} treatment:

{{careInstructions}}

⚠️ Important Reminders:
• Avoid direct sunlight for 24-48 hours
• Stay hydrated
• Avoid touching or massaging treated area
• Contact us immediately if you experience any unusual symptoms

📅 Follow-up Appointment
{{#if followupDate}}
Your next appointment is scheduled for {{followupDate}} at {{followupTime}}
{{else}}
We recommend scheduling a follow-up in {{recommendedFollowupWeeks}} weeks.
Book now: {{bookingLink}}
{{/if}}

Questions? We're here to help!
{{clinicPhone}}

Wishing you beautiful results!
{{clinicName}}`,
    variables: ['firstName', 'serviceName', 'careInstructions', 'followupDate', 'followupTime', 'recommendedFollowupWeeks', 'bookingLink', 'clinicPhone', 'clinicName'],
    enabled: true,
    category: 'followup',
    description: 'Sent with post-treatment care instructions'
  },

  // Marketing Emails
  {
    id: 'birthday_email',
    name: 'Birthday Email',
    type: 'email',
    eventType: 'birthday',
    subject: '🎉 Happy Birthday {{firstName}}! Special Gift Inside',
    body: `Happy Birthday {{firstName}}! 🎂🎉

To celebrate your special day, we'd like to give you a gift:

🎁 {{birthdayOffer}}

This offer is valid for {{validDays}} days and can be used on any of our services.

Book your birthday treatment:
{{bookingLink}}

We hope you have a wonderful birthday!

With love,
The {{clinicName}} Team`,
    variables: ['firstName', 'birthdayOffer', 'validDays', 'bookingLink', 'clinicName'],
    enabled: true,
    category: 'marketing',
    description: 'Sent on patient birthday'
  },
  {
    id: 'winback_email',
    name: 'Win-Back Email',
    type: 'email',
    eventType: 'winback',
    subject: 'We Miss You, {{firstName}}!',
    body: `Hi {{firstName}},

We noticed it's been a while since your last visit to {{clinicName}}, and we miss you!

It's been {{daysSinceLastVisit}} days since we've seen you. We'd love to welcome you back with a special offer:

💝 {{winbackOffer}}

{{#if lastService}}
Ready to continue your {{lastService}} treatments? We have availability with {{lastProvider}}.
{{/if}}

Book your comeback appointment:
{{bookingLink}}

Or call us at {{clinicPhone}}

We can't wait to see you again!

Warmly,
{{clinicName}}`,
    variables: ['firstName', 'daysSinceLastVisit', 'winbackOffer', 'lastService', 'lastProvider', 'bookingLink', 'clinicPhone', 'clinicName'],
    enabled: false,
    category: 'marketing',
    description: 'Sent to patients who haven\'t visited in 90+ days'
  }
];

// Default SMS templates
export const defaultSMSTemplates: MessageTemplate[] = [
  {
    id: 'appointment_booked_sms',
    name: 'Appointment Confirmation SMS',
    type: 'sms',
    eventType: 'appointment_booked',
    body: '{{clinicName}}: Hi {{firstName}}! Your appointment is confirmed for {{date}} at {{time}} with {{providerName}}. Reply CANCEL to cancel or visit {{rescheduleLink}}',
    variables: ['firstName', 'date', 'time', 'providerName', 'rescheduleLink', 'clinicName'],
    enabled: true,
    category: 'confirmation',
    description: 'SMS confirmation sent when appointment is booked'
  },
  {
    id: 'appointment_canceled_sms',
    name: 'Appointment Cancellation SMS',
    type: 'sms',
    eventType: 'appointment_canceled',
    body: '{{clinicName}}: Your appointment on {{date}} at {{time}} has been canceled. To rebook, visit {{bookingLink}} or call {{clinicPhone}}',
    variables: ['date', 'time', 'bookingLink', 'clinicPhone', 'clinicName'],
    enabled: true,
    category: 'confirmation',
    description: 'SMS sent when appointment is canceled'
  },
  {
    id: 'appointment_rescheduled_sms',
    name: 'Appointment Rescheduled SMS',
    type: 'sms',
    eventType: 'appointment_rescheduled',
    body: '{{clinicName}}: Hi {{firstName}}! Your appointment has been moved from {{oldDate}} {{oldTime}} to {{newDate}} {{newTime}}. See you then!',
    variables: ['firstName', 'oldDate', 'oldTime', 'newDate', 'newTime', 'clinicName'],
    enabled: true,
    category: 'confirmation',
    description: 'SMS sent when appointment is rescheduled'
  },
  {
    id: 'reminder_24hr_sms',
    name: '24-Hour Reminder SMS',
    type: 'sms',
    eventType: 'reminder_24hr',
    body: '{{clinicName}}: Reminder - Tomorrow {{date}} at {{time}} - {{serviceName}} with {{providerName}}. Reply CONFIRM or CANCEL. Questions? Call {{clinicPhone}}',
    variables: ['date', 'time', 'serviceName', 'providerName', 'clinicPhone', 'clinicName'],
    enabled: true,
    category: 'reminder',
    description: 'SMS reminder sent 24 hours before appointment'
  },
  {
    id: 'reminder_2hr_sms',
    name: '2-Hour Reminder SMS',
    type: 'sms',
    eventType: 'reminder_2hr',
    body: '{{clinicName}}: Hi {{firstName}}! Your appointment is in 2 hours at {{time}}. See you soon at {{locationName}}!',
    variables: ['firstName', 'time', 'locationName', 'clinicName'],
    enabled: true,
    category: 'reminder',
    description: 'SMS reminder sent 2 hours before appointment'
  },
  {
    id: 'checkin_reminder_sms',
    name: 'Check-In Reminder SMS',
    type: 'sms',
    eventType: 'checkin_reminder',
    body: '{{clinicName}}: Hi {{firstName}}! Your appointment is in 15 minutes. Check in now: {{checkinLink}}',
    variables: ['firstName', 'checkinLink', 'clinicName'],
    enabled: true,
    category: 'reminder',
    description: 'SMS sent 15 minutes before to prompt check-in'
  },
  {
    id: 'waitlist_available_sms',
    name: 'Waitlist Spot Available SMS',
    type: 'sms',
    eventType: 'waitlist_available',
    body: '{{clinicName}}: Great news {{firstName}}! A spot opened up on {{date}} at {{time}} for {{serviceName}}. Claim it now: {{claimLink}} (expires in 2 hours)',
    variables: ['firstName', 'date', 'time', 'serviceName', 'claimLink', 'clinicName'],
    enabled: true,
    category: 'appointment',
    description: 'SMS sent when waitlist spot becomes available'
  },
  {
    id: 'followup_thankyou_sms',
    name: 'Thank You SMS',
    type: 'sms',
    eventType: 'followup_thankyou',
    body: '{{clinicName}}: Thank you for visiting us today {{firstName}}! We hope you loved your {{serviceName}} treatment. Leave us a review: {{reviewLink}}',
    variables: ['firstName', 'serviceName', 'reviewLink', 'clinicName'],
    enabled: true,
    category: 'followup',
    description: 'SMS sent after appointment completion'
  },
  {
    id: 'payment_reminder_sms',
    name: 'Payment Reminder SMS',
    type: 'sms',
    eventType: 'payment_reminder',
    body: '{{clinicName}}: Hi {{firstName}}, you have an outstanding balance of ${{amount}}. Pay now: {{paymentLink}} or call {{clinicPhone}}',
    variables: ['firstName', 'amount', 'paymentLink', 'clinicPhone', 'clinicName'],
    enabled: false,
    category: 'confirmation',
    description: 'SMS sent for outstanding payment reminders'
  },
  {
    id: 'birthday_sms',
    name: 'Birthday SMS',
    type: 'sms',
    eventType: 'birthday',
    body: '🎉 Happy Birthday {{firstName}}! Treat yourself to {{birthdayOffer}}. Book now: {{bookingLink}} - {{clinicName}}',
    variables: ['firstName', 'birthdayOffer', 'bookingLink', 'clinicName'],
    enabled: true,
    category: 'marketing',
    description: 'SMS sent on patient birthday'
  }
];

// Combine all templates
export const defaultTemplates: MessageTemplate[] = [
  ...defaultEmailTemplates,
  ...defaultSMSTemplates
];

// Default reminder schedule configurations
export const defaultReminderSchedule: ReminderSchedule[] = [
  {
    id: 'reminder_72hr_email',
    name: '3-Day Email Reminder',
    enabled: false,
    timing: 72, // 72 hours before
    type: 'email',
    template: 'reminder_24hr_email' // Reuse 24hr template with different timing
  },
  {
    id: 'reminder_24hr_email',
    name: '24-Hour Email Reminder',
    enabled: true,
    timing: 24,
    type: 'email',
    template: 'reminder_24hr_email'
  },
  {
    id: 'reminder_24hr_sms',
    name: '24-Hour SMS Reminder',
    enabled: true,
    timing: 24,
    type: 'sms',
    template: 'reminder_24hr_sms'
  },
  {
    id: 'reminder_2hr_email',
    name: '2-Hour Email Reminder',
    enabled: false,
    timing: 2,
    type: 'email',
    template: 'reminder_2hr_email'
  },
  {
    id: 'reminder_2hr_sms',
    name: '2-Hour SMS Reminder',
    enabled: true,
    timing: 2,
    type: 'sms',
    template: 'reminder_2hr_sms'
  },
  {
    id: 'checkin_15min_sms',
    name: '15-Minute Check-In SMS',
    enabled: true,
    timing: 0.25, // 15 minutes
    type: 'sms',
    template: 'checkin_reminder_sms'
  }
];

// Sample variable values for template preview
export const sampleVariableValues: Record<string, string> = {
  // Patient info
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@email.com',
  phone: '(555) 123-4567',

  // Appointment details
  date: 'Monday, January 15, 2026',
  time: '2:00 PM',
  oldDate: 'Monday, January 15, 2026',
  oldTime: '2:00 PM',
  newDate: 'Tuesday, January 16, 2026',
  newTime: '3:30 PM',
  duration: '60',

  // Service details
  serviceName: 'Botox Treatment',
  serviceCategory: 'Injectables',

  // Provider details
  providerName: 'Dr. Emily Chen',
  providerTitle: 'MD, Medical Director',

  // Location details
  locationName: 'Radiance Medical Spa - Downtown',
  addressLine1: '123 Main Street, Suite 200',
  city: 'San Francisco',
  state: 'CA',
  zip: '94105',

  // Clinic details
  clinicName: 'Radiance Medical Spa',
  clinicPhone: '(555) 987-6543',
  clinicEmail: 'info@radiancemedspa.com',
  socialHandle: '@RadianceMedSpa',

  // Links
  rescheduleLink: 'https://radiancemedspa.com/reschedule/abc123',
  bookingLink: 'https://radiancemedspa.com/book',
  checkinLink: 'https://radiancemedspa.com/checkin/abc123',
  claimLink: 'https://radiancemedspa.com/waitlist/claim/xyz789',
  reviewLink: 'https://g.page/r/RadianceMedSpa/review',
  paymentLink: 'https://radiancemedspa.com/pay/invoice123',

  // Additional details
  notes: 'Please arrive 15 minutes early for paperwork',
  prepInstructions: 'Avoid blood thinners 24 hours before treatment. Stay hydrated.',
  careInstructions: 'Avoid touching treated area for 24 hours. Apply ice if swelling occurs. No strenuous exercise for 24 hours.',

  // Marketing
  birthdayOffer: '20% off any treatment',
  winbackOffer: '$50 credit toward your next visit',
  validDays: '30',
  daysSinceLastVisit: '120',
  lastService: 'Botox Treatment',
  lastProvider: 'Dr. Emily Chen',

  // Follow-up
  followupDate: 'Monday, February 12, 2026',
  followupTime: '2:00 PM',
  recommendedFollowupWeeks: '4',

  // Payment
  amount: '250.00',
  balanceDue: '125.00',
  paymentMethod: 'Visa ****1234'
};

// Helper function to get template by ID
export function getTemplateById(id: string): MessageTemplate | undefined {
  return defaultTemplates.find(template => template.id === id);
}

// Helper function to get templates by type
export function getTemplatesByType(type: 'email' | 'sms'): MessageTemplate[] {
  return defaultTemplates.filter(template => template.type === type);
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: MessageTemplate['category']): MessageTemplate[] {
  return defaultTemplates.filter(template => template.category === category);
}

// Helper function to get enabled templates
export function getEnabledTemplates(): MessageTemplate[] {
  return defaultTemplates.filter(template => template.enabled);
}

// Helper function to preview template with sample values
export function previewTemplate(templateId: string, customValues?: Record<string, string>): string {
  const template = getTemplateById(templateId);
  if (!template) return '';

  const values = { ...sampleVariableValues, ...customValues };
  let preview = template.subject ? `${template.subject}\n\n${template.body}` : template.body;

  // Simple variable replacement (basic implementation)
  Object.keys(values).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    preview = preview.replace(regex, values[key]);
  });

  // Handle conditional blocks (simple implementation)
  preview = preview.replace(/{{#if \w+}}[\s\S]*?{{\/if}}/g, '');
  preview = preview.replace(/{{else}}[\s\S]*?(?={{\/if}})/g, '');

  return preview.trim();
}

// Export default config object
export const automatedMessagesConfig = {
  templates: defaultTemplates,
  emailTemplates: defaultEmailTemplates,
  smsTemplates: defaultSMSTemplates,
  reminderSchedule: defaultReminderSchedule,
  sampleValues: sampleVariableValues
};

export default automatedMessagesConfig;
