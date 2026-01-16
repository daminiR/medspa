/**
 * Shared waitlist entries store
 * Moved out of route.ts to comply with Next.js 15 requirements
 */

import { WaitlistEntry, toWaitlistEntry } from '@/lib/waitlist';
import { mockWaitlistPatients } from '@/lib/data/waitlist';
import { patients } from '@/lib/data';

// In-memory store for waitlist entries (in production, use database)
export let waitlistEntries: WaitlistEntry[] = mockWaitlistPatients.map(patient => {
  const patientHistory = patients.find(p => p.fullName === patient.name);
  return toWaitlistEntry(patient, patientHistory);
});
