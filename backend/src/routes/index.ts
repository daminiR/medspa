/**
 * API Routes Index
 *
 * Aggregates all route modules
 */

import { Hono } from 'hono';
import health from './health';
import auth from './auth';
import staffAuth from './staff-auth';
import patientAuth from './patient-auth';
import kioskAuth from './kiosk-auth';
import expressBooking from './express-booking';
import patients from './patients';
import appointments from './appointments';
import recurring from './recurring';
import calendar from './calendar';
import services from './services';
import providers from './providers';
import waitlist from './waitlist';
import groupBookings from './group-bookings';
import treatments from './treatments';
import photos from './photos';
import formSubmissions, { consents, patientConsents } from './form-submissions';
import forms from './forms';
import treatmentTemplates from './treatment-templates';
import chartingSettings from './charting-settings.prisma';
import packages from './packages';
import giftCards from './gift-cards';
import invoices, { patientInvoices } from './invoices';
import memberships from './memberships';
import financialReports from './financial-reports';
import payments from './payments.prisma';
import products from './products';
import purchaseOrders from './purchase-orders';
import inventoryLots from './inventory-lots';
import inventoryAdjustments from './inventory-adjustments';
import inventoryReports from './inventory-reports';
import messagingConsent from './messaging-consent';
import messagingTemplates from './messaging-templates';
import messagingReminders from './messaging-reminders';
import messagingCampaigns from './messaging-campaigns';
import messagingWebhooks from './messaging-webhooks';
import messaging from './messaging';
import quickReplies from './quick-replies';
import notifications from './notifications';
import cron from './cron';

// Create main API router
const api = new Hono();

// Health routes (no /api prefix)
// These are registered separately in main app

// Auth routes
api.route('/auth', auth);
api.route('/auth/staff', staffAuth);
api.route('/auth/patient', patientAuth);

// Kiosk routes
api.route('/kiosk', kioskAuth);

// Express Booking routes
api.route('/express-booking', expressBooking);

// Resource routes
api.route('/patients', patients);
api.route('/appointments', appointments);
api.route('/recurring', recurring);
api.route('/calendar', calendar);
api.route('/services', services);
api.route('/providers', providers);
api.route('/waitlist', waitlist);
api.route('/groups', groupBookings);
api.route('/treatments', treatments);
api.route('/photos', photos);
api.route('/forms', forms);
api.route('/form-submissions', formSubmissions);
api.route('/consents', consents);
api.route('/treatment-templates', treatmentTemplates);
api.route('/charting-settings', chartingSettings);
api.route('/packages', packages);
api.route('/gift-cards', giftCards);
api.route('/invoices', invoices);
api.route('/memberships', memberships);
api.route('/reports', financialReports);
api.route('/payments', payments);
api.route('/products', products);
api.route('/purchase-orders', purchaseOrders);
api.route('/vendors', purchaseOrders);
api.route('/inventory', inventoryLots);
api.route('/inventory', inventoryAdjustments);
api.route('/inventory/reports', inventoryReports);
api.route('/inventory', inventoryReports); // Also mount at /inventory/metrics

// Messaging consent (TCPA compliance)
api.route('/consent', messagingConsent);

// Messaging templates
api.route('/templates', messagingTemplates);

// Quick replies (canned responses for SMS)
api.route('/quick-replies', quickReplies);

// Messaging reminders
api.route('/reminders', messagingReminders);

// Messaging campaigns
api.route('/campaigns', messagingCampaigns);

// Messaging webhooks (Twilio callbacks)
api.route('/webhooks', messagingWebhooks);

// Core messaging API
api.route('/', messaging); // Mounts /conversations and /messages routes

// Notifications API
api.route('/notifications', notifications);

// Cron jobs API (scheduled maintenance tasks)
api.route('/cron', cron);

// Patient consents nested under patients
// Note: This adds /:patientId/consents route to patients
// Access via /api/patients/:patientId/consents
api.route('/patients', patientConsents);

// Patient invoices nested under patients
// Access via /api/patients/:patientId/invoices
api.route('/patients', patientInvoices);

// TODO: Add more routes as they're implemented
// api.route('/referrals', referrals);
// api.route('/settings', settings);

// Webhooks (external service callbacks)
// api.route('/webhooks', webhooks);

export { api, health };
