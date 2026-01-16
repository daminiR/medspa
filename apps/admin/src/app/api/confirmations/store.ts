/**
 * Shared confirmation requests store
 * Moved out of route.ts to comply with Next.js 15 requirements
 */

import { ConfirmationRequest } from '@/types/confirmation';
import { mockConfirmationRequests } from '@/lib/data/confirmations';

// In-memory store for confirmation requests
export let confirmationRequests: ConfirmationRequest[] = [...mockConfirmationRequests];
