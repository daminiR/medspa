/**
 * Configuration for Cloud Functions
 * Medical Spa Platform
 */

import { TaskConfig } from './types';

// Environment-based configuration
const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'medspa-platform';
const location = process.env.FUNCTION_REGION || 'us-central1';

// Cloud Tasks configuration
export const taskConfig: TaskConfig = {
  projectId,
  location,
  queue: 'appointment-reminders',
  serviceAccountEmail: `${projectId}@appspot.gserviceaccount.com`,
  functionUrl: `https://${location}-${projectId}.cloudfunctions.net/sendScheduledReminder`,
};

// Notification messages (HIPAA-compliant - no PHI)
export const notificationMessages = {
  appointmentConfirmed: {
    title: 'Appointment Confirmed',
    body: 'Your appointment has been confirmed. Open the app for details.',
  },
  appointmentCancelled: {
    title: 'Appointment Update',
    body: 'Your appointment has been cancelled. Contact us for questions.',
  },
  reminder24h: {
    title: 'Appointment Reminder',
    body: 'You have an appointment tomorrow. Open the app for details.',
  },
  reminder2h: {
    title: 'Appointment Soon',
    body: 'Your appointment is in 2 hours. Open the app for details.',
  },
  reminderPrep: {
    title: 'Appointment Preparation',
    body: 'Prepare for your upcoming appointment. Open the app for details.',
  },
  newMessage: {
    title: 'New Message',
    body: 'You have a new message. Open the app to view.',
  },
  roomReady: {
    title: 'Your Room is Ready',
    body: 'Please proceed to your room. Open the app for details.',
  },
  checkInReminder: {
    title: 'Check-In Available',
    body: 'Mobile check-in is now available. Open the app to check in.',
  },
};

// Reminder timing configuration (in milliseconds)
export const reminderTiming = {
  '24h': 24 * 60 * 60 * 1000, // 24 hours before
  '2h': 2 * 60 * 60 * 1000,   // 2 hours before
  'prep': 48 * 60 * 60 * 1000, // 48 hours before (for prep instructions)
};

// Function configuration
export const functionConfig = {
  region: location,
  timeoutSeconds: 60,
  memory: '256MB' as const,
  maxInstances: 10,
};
