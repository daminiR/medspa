/**
 * Memberships API Tests
 *
 * Comprehensive tests for:
 * - List membership tiers (public and authenticated)
 * - Get single membership tier
 * - Create membership tier (admin only)
 * - Update membership tier
 * - Deactivate membership tier
 * - Enroll patient in membership
 * - Get patient membership
 * - Update patient membership (upgrade/downgrade)
 * - Cancel membership
 * - Pause/Resume membership
 * - Benefits tracking
 * - Redeem included services
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import memberships, {
  clearStores,
  getTiersStore,
  getMembershipStore,
  getRedemptionsStore,
  addMockTier,
  addMockMembership,
  MembershipTier,
  PatientMembership,
  MOCK_PATIENT_ID,
} from '../src/routes/memberships';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/memberships', memberships);
app.onError(errorHandler);

// Mock session for authentication
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockSessionToken = 'test-session-token-12345';
const mockSessionId = 'test-session-id';

function setupMockSession(role: string = 'admin') {
  sessionStore.set(mockSessionId, {
    id: mockSessionId,
    token: mockSessionToken,
    userId: mockUserId,
    email: 'test@example.com',
    role,
    permissions: ['membership:read', 'membership:create', 'membership:update', 'membership:delete'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    lastActivityAt: new Date(),
  });
}

function setupMockStaffSession() {
  const staffToken = 'staff-session-token-67890';
  const staffSessionId = 'staff-session-id';
  sessionStore.set(staffSessionId, {
    id: staffSessionId,
    token: staffToken,
    userId: 'staff-user-001',
    email: 'staff@example.com',
    role: 'staff',
    permissions: ['membership:read'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });
  return staffToken;
}

// Helper to make authenticated requests
async function request(
  method: string,
  path: string,
  body?: object,
  headers?: Record<string, string>
) {
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mockSessionToken}`,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return app.fetch(req);
}

// Helper to make unauthenticated requests
async function unauthenticatedRequest(
  method: string,
  path: string,
  body?: object
) {
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return app.fetch(req);
}

// Valid tier data for creation
const validTierData = {
  name: 'Test Tier',
  description: 'A test membership tier',
  tier: 'silver' as const,
  billingCycle: 'monthly' as const,
  price: 19900,
  setupFee: 0,
  benefits: {
    discountPercentage: 15,
    includedServices: [
      { serviceId: 'service-1', serviceName: 'Test Service', quantity: 2 },
    ],
    productDiscount: 10,
    priorityBooking: true,
    guestPasses: 1,
    perks: ['Test perk 1', 'Test perk 2'],
  },
  minimumTermMonths: 6,
  cancellationNoticeDays: 30,
  isActive: true,
  acceptingNewMembers: true,
  displayOrder: 5,
};

describe('Memberships API', () => {
  beforeEach(() => {
    // Clear all stores and reinitialize mock data between tests
    clearStores();
    sessionStore.clear();
    setupMockSession();
  });

  // ===================
  // List Membership Tiers Tests
  // ===================
  describe('List Membership Tiers - GET /api/memberships', () => {
    it('should return list of active tiers without authentication', async () => {
      const res = await unauthenticatedRequest('GET', '/api/memberships');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      // All returned tiers should be active
      data.items.forEach((tier: any) => {
        expect(tier.isActive).toBe(true);
      });
    });

    it('should return all tiers including inactive for authenticated users', async () => {
      const res = await request('GET', '/api/memberships?activeOnly=false');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      // Should include inactive tier
      expect(data.items.some((t: any) => !t.isActive)).toBe(true);
    });

    it('should filter by accepting new members', async () => {
      const res = await unauthenticatedRequest('GET', '/api/memberships?acceptingNew=true');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((t: any) => t.acceptingNewMembers === true)).toBe(true);
    });
  });

  // ===================
  // Get Single Tier Tests
  // ===================
  describe('Get Membership Tier - GET /api/memberships/:id', () => {
    it('should return single tier by ID', async () => {
      const tiers = Array.from(getTiersStore().values());
      const tier = tiers.find(t => t.isActive);

      if (!tier) throw new Error('No active tier found');

      const res = await unauthenticatedRequest('GET', `/api/memberships/${tier.id}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.tier).toBeDefined();
      expect(data.tier.id).toBe(tier.id);
      expect(data.tier.name).toBe(tier.name);
      expect(data.tier.benefits).toBeDefined();
    });

    it('should return 404 for non-existent tier', async () => {
      const fakeId = crypto.randomUUID();
      const res = await unauthenticatedRequest('GET', `/api/memberships/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should return 404 for inactive tier when not authenticated', async () => {
      const tiers = Array.from(getTiersStore().values());
      const inactiveTier = tiers.find(t => !t.isActive);

      if (!inactiveTier) throw new Error('No inactive tier found');

      const res = await unauthenticatedRequest('GET', `/api/memberships/${inactiveTier.id}`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Create Tier Tests
  // ===================
  describe('Create Membership Tier - POST /api/memberships', () => {
    it('should create tier with valid data (admin)', async () => {
      const res = await request('POST', '/api/memberships', validTierData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.tier).toBeDefined();
      expect(data.tier.id).toBeDefined();
      expect(data.tier.name).toBe(validTierData.name);
      expect(data.tier.price).toBe(validTierData.price);
      expect(data.tier.benefits.discountPercentage).toBe(15);
      expect(data.message).toBe('Membership tier created successfully');
    });

    it('should reject creation without authentication', async () => {
      const res = await unauthenticatedRequest('POST', '/api/memberships', validTierData);

      expect(res.status).toBe(401);
    });

    it('should reject creation for non-admin users', async () => {
      const staffToken = setupMockStaffSession();

      const req = new Request('http://localhost/api/memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${staffToken}`,
        },
        body: JSON.stringify(validTierData),
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(403);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'Test',
        // Missing required fields
      };

      const res = await request('POST', '/api/memberships', invalidData);

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Tier Tests
  // ===================
  describe('Update Membership Tier - PUT /api/memberships/:id', () => {
    it('should update tier with valid data', async () => {
      const tiers = Array.from(getTiersStore().values());
      const tier = tiers[0];

      const updateData = {
        name: 'Updated Tier Name',
        price: 29900,
      };

      const res = await request('PUT', `/api/memberships/${tier.id}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.tier.name).toBe('Updated Tier Name');
      expect(data.tier.price).toBe(29900);
      expect(data.message).toBe('Membership tier updated successfully');
    });

    it('should return 404 for non-existent tier', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('PUT', `/api/memberships/${fakeId}`, { name: 'Test' });

      expect(res.status).toBe(404);
    });

    it('should reject update for non-admin users', async () => {
      const staffToken = setupMockStaffSession();
      const tiers = Array.from(getTiersStore().values());
      const tier = tiers[0];

      const req = new Request(`http://localhost/api/memberships/${tier.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${staffToken}`,
        },
        body: JSON.stringify({ name: 'Updated' }),
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(403);
    });
  });

  // ===================
  // Delete/Deactivate Tier Tests
  // ===================
  describe('Deactivate Membership Tier - DELETE /api/memberships/:id', () => {
    it('should deactivate tier (soft delete)', async () => {
      const tiers = Array.from(getTiersStore().values());
      const tier = tiers.find(t => t.isActive);

      if (!tier) throw new Error('No active tier found');

      const res = await request('DELETE', `/api/memberships/${tier.id}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Membership tier deactivated successfully');

      // Verify tier is deactivated
      const deactivatedTier = getTiersStore().get(tier.id);
      expect(deactivatedTier?.isActive).toBe(false);
      expect(deactivatedTier?.acceptingNewMembers).toBe(false);
    });

    it('should return 404 for non-existent tier', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('DELETE', `/api/memberships/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Enroll Patient Tests
  // ===================
  describe('Enroll Patient - POST /api/memberships/:id/enroll', () => {
    it('should enroll patient in membership', async () => {
      const tiers = Array.from(getTiersStore().values());
      const tier = tiers.find(t => t.isActive && t.acceptingNewMembers);

      if (!tier) throw new Error('No enrollable tier found');

      const patientId = crypto.randomUUID();
      const enrollData = {
        patientId,
        paymentMethodId: 'pm_test_123',
      };

      const res = await request('POST', `/api/memberships/${tier.id}/enroll`, enrollData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.membership).toBeDefined();
      expect(data.membership.patientId).toBe(patientId);
      expect(data.membership.tierId).toBe(tier.id);
      expect(data.membership.tierName).toBe(tier.name);
      expect(data.membership.status).toBe('active');
      expect(data.membership.currentPeriodBenefits).toBeDefined();
      expect(data.message).toBe('Patient enrolled successfully');
    });

    it('should reject enrollment for non-existent tier', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('POST', `/api/memberships/${fakeId}/enroll`, {
        patientId: crypto.randomUUID(),
      });

      expect(res.status).toBe(404);
    });

    it('should reject enrollment for inactive tier', async () => {
      const tiers = Array.from(getTiersStore().values());
      const inactiveTier = tiers.find(t => !t.isActive);

      if (!inactiveTier) throw new Error('No inactive tier found');

      const res = await request('POST', `/api/memberships/${inactiveTier.id}/enroll`, {
        patientId: crypto.randomUUID(),
      });

      expect(res.status).toBe(400);
    });

    it('should reject duplicate enrollment', async () => {
      const tiers = Array.from(getTiersStore().values());
      const tier = tiers.find(t => t.isActive && t.acceptingNewMembers);

      if (!tier) throw new Error('No enrollable tier found');

      const patientId = crypto.randomUUID();

      // First enrollment
      await request('POST', `/api/memberships/${tier.id}/enroll`, { patientId });

      // Second enrollment should fail
      const res = await request('POST', `/api/memberships/${tier.id}/enroll`, { patientId });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toBe('CONFLICT');
    });
  });

  // ===================
  // Get Patient Membership Tests
  // ===================
  describe('Get Patient Membership - GET /api/memberships/patients/:patientId/membership', () => {
    it('should return patient active membership', async () => {
      // Use the mock patient from initMockData
      const res = await request('GET', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.membership).toBeDefined();
      expect(data.membership.patientId).toBe(MOCK_PATIENT_ID);
      expect(data.membership.status).toBe('active');
      expect(data.tier).toBeDefined();
    });

    it('should return 404 for patient without membership', async () => {
      const fakePatientId = crypto.randomUUID();
      const res = await request('GET', `/api/memberships/patients/${fakePatientId}/membership`);

      expect(res.status).toBe(404);
    });

    it('should require authentication', async () => {
      const res = await unauthenticatedRequest('GET', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership`);

      expect(res.status).toBe(401);
    });
  });

  // ===================
  // Cancel Membership Tests
  // ===================
  describe('Cancel Membership - POST /api/memberships/patients/:patientId/membership/cancel', () => {
    it('should cancel active membership', async () => {
      const res = await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/cancel`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.membership.status).toBe('cancelled');
      expect(data.membership.cancelledAt).toBeDefined();
      expect(data.message).toBe('Membership cancelled successfully');
    });

    it('should return 404 for patient without membership', async () => {
      const fakePatientId = crypto.randomUUID();
      const res = await request('POST', `/api/memberships/patients/${fakePatientId}/membership/cancel`);

      expect(res.status).toBe(404);
    });

    it('should reject cancelling already cancelled membership', async () => {
      // Cancel first
      await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/cancel`);

      // Try to cancel again
      const res = await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/cancel`);

      expect(res.status).toBe(404); // Already cancelled, so no active membership
    });
  });

  // ===================
  // Pause/Resume Membership Tests
  // ===================
  describe('Pause Membership - POST /api/memberships/patients/:patientId/membership/pause', () => {
    it('should pause active membership', async () => {
      const res = await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/pause`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.membership.status).toBe('paused');
      expect(data.membership.pausedAt).toBeDefined();
      expect(data.message).toBe('Membership paused successfully');
    });

    it('should reject pausing already paused membership', async () => {
      // Pause first
      await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/pause`);

      // Try to pause again
      const res = await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/pause`);

      expect(res.status).toBe(400);
    });

    it('should return 404 for patient without membership', async () => {
      const fakePatientId = crypto.randomUUID();
      const res = await request('POST', `/api/memberships/patients/${fakePatientId}/membership/pause`);

      expect(res.status).toBe(404);
    });

    it('should reject pausing cancelled membership', async () => {
      // Cancel first
      await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/cancel`);

      // Try to pause - should fail since cancelled is not active
      const res = await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/pause`);

      expect(res.status).toBe(404); // No active membership found
    });
  });

  describe('Resume Membership - POST /api/memberships/patients/:patientId/membership/resume', () => {
    it('should resume paused membership', async () => {
      // First pause
      await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/pause`);

      // Then resume
      const res = await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/resume`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.membership.status).toBe('active');
      expect(data.membership.pausedAt).toBeUndefined();
      expect(data.message).toBe('Membership resumed successfully');
    });

    it('should return 404 when no paused membership exists', async () => {
      // Try to resume without pausing first
      const res = await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/resume`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Benefits Tracking Tests
  // ===================
  describe('Get Benefits - GET /api/memberships/patients/:patientId/membership/benefits', () => {
    it('should return available benefits', async () => {
      const res = await request('GET', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/benefits`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.membershipId).toBeDefined();
      expect(data.status).toBe('active');
      expect(data.includedServices).toBeDefined();
      expect(Array.isArray(data.includedServices)).toBe(true);
      expect(data.discountPercentage).toBeDefined();
      expect(data.productDiscount).toBeDefined();
    });

    it('should show correct benefit quantities', async () => {
      const res = await request('GET', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/benefits`);

      expect(res.status).toBe(200);
      const data = await res.json();

      // Check one of the included services
      const facialBenefit = data.includedServices.find(
        (s: any) => s.serviceId === 'service-facial'
      );
      expect(facialBenefit).toBeDefined();
      expect(facialBenefit.quantityIncluded).toBeGreaterThan(0);
      expect(facialBenefit.quantityRemaining).toBeDefined();
    });

    it('should return 404 for patient without membership', async () => {
      const fakePatientId = crypto.randomUUID();
      const res = await request('GET', `/api/memberships/patients/${fakePatientId}/membership/benefits`);

      expect(res.status).toBe(404);
    });

    it('should require authentication', async () => {
      const res = await unauthenticatedRequest('GET', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/benefits`);

      expect(res.status).toBe(401);
    });
  });

  // ===================
  // Redeem Service Tests
  // ===================
  describe('Redeem Service - POST /api/memberships/patients/:patientId/membership/redeem', () => {
    it('should redeem included service', async () => {
      const redeemData = {
        serviceId: 'service-facial',
        appointmentId: crypto.randomUUID(),
      };

      const res = await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/redeem`, redeemData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.redemption).toBeDefined();
      expect(data.redemption.serviceId).toBe('service-facial');
      expect(data.benefit.quantityUsed).toBeGreaterThan(0);
      expect(data.message).toBe('Service redeemed successfully');
    });

    it('should reject redeeming non-included service', async () => {
      const redeemData = {
        serviceId: 'service-not-included',
      };

      const res = await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/redeem`, redeemData);

      expect(res.status).toBe(400);
    });

    it('should reject when no remaining uses', async () => {
      // Exhaust all uses of a service
      const membership = getMembershipStore().values().next().value as PatientMembership;
      const peelBenefit = membership.currentPeriodBenefits.find(
        b => b.serviceId === 'service-peel'
      );
      if (peelBenefit) {
        peelBenefit.quantityUsed = peelBenefit.quantityIncluded;
        peelBenefit.quantityRemaining = 0;
        getMembershipStore().set(membership.id, membership);
      }

      const res = await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/redeem`, {
        serviceId: 'service-peel',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('No remaining uses');
    });

    it('should track redemption history', async () => {
      const redeemData = {
        serviceId: 'service-peel',
        appointmentId: crypto.randomUUID(),
      };

      await request('POST', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership/redeem`, redeemData);

      const redemptions = Array.from(getRedemptionsStore().values());
      expect(redemptions.length).toBeGreaterThan(0);
      const redemption = redemptions.find(r => r.serviceId === 'service-peel');
      expect(redemption).toBeDefined();
      expect(redemption?.appointmentId).toBe(redeemData.appointmentId);
    });
  });

  // ===================
  // Update Patient Membership Tests
  // ===================
  describe('Update Patient Membership - PUT /api/memberships/patients/:patientId/membership', () => {
    it('should upgrade membership to higher tier', async () => {
      const tiers = Array.from(getTiersStore().values());
      const platinumTier = tiers.find(t => t.tier === 'platinum' && t.isActive);

      if (!platinumTier) throw new Error('No platinum tier found');

      const updateData = {
        tierId: platinumTier.id,
      };

      const res = await request('PUT', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.membership.tierId).toBe(platinumTier.id);
      expect(data.membership.tierName).toBe(platinumTier.name);
    });

    it('should update payment method', async () => {
      const updateData = {
        paymentMethodId: 'pm_new_payment_method',
      };

      const res = await request('PUT', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.membership.paymentMethodId).toBe('pm_new_payment_method');
    });

    it('should reject upgrade to inactive tier', async () => {
      const tiers = Array.from(getTiersStore().values());
      const inactiveTier = tiers.find(t => !t.isActive);

      if (!inactiveTier) throw new Error('No inactive tier found');

      const res = await request('PUT', `/api/memberships/patients/${MOCK_PATIENT_ID}/membership`, {
        tierId: inactiveTier.id,
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Edge Cases Tests
  // ===================
  describe('Edge Cases', () => {
    it('should handle invalid UUID for tier ID', async () => {
      const res = await request('GET', '/api/memberships/invalid-uuid');

      expect(res.status).toBe(400);
    });

    it('should handle invalid UUID for patient ID', async () => {
      const res = await request('GET', '/api/memberships/patients/invalid-uuid/membership');

      expect(res.status).toBe(400);
    });

    it('should handle tier with no included services', async () => {
      const tierData = {
        ...validTierData,
        name: 'No Services Tier',
        benefits: {
          discountPercentage: 10,
          includedServices: [],
          productDiscount: 5,
          priorityBooking: false,
          guestPasses: 0,
          perks: [],
        },
      };

      const createRes = await request('POST', '/api/memberships', tierData);
      expect(createRes.status).toBe(201);
      const createData = await createRes.json();

      // Enroll patient
      const patientId = crypto.randomUUID();
      const enrollRes = await request('POST', `/api/memberships/${createData.tier.id}/enroll`, {
        patientId,
      });

      expect(enrollRes.status).toBe(201);
      const enrollData = await enrollRes.json();
      expect(enrollData.membership.currentPeriodBenefits).toEqual([]);
    });
  });
});
