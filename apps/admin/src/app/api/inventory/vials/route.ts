// Open Vial API - Multi-Patient Vial Tracking
// THE DIFFERENTIATOR: Track one Botox/filler vial across multiple patients
// Competitors like Mangomint can't even track half syringes

import { NextRequest, NextResponse } from 'next/server';
import {
  OpenVialSession,
  OpenVialStatus,
  VialUsageRecord,
  OpenVialRequest,
  OpenVialResponse,
  UseFromVialRequest,
  UseFromVialResponse,
} from '@/types/inventory';
import { inventoryLots, products, getProductById } from '@/lib/data/inventory';

// In-memory store for open vial sessions (replace with DB in production)
let openVialSessions: OpenVialSession[] = [];

// Helper: Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper: Calculate stability hours remaining
function calculateStabilityRemaining(session: OpenVialSession): number {
  if (!session.reconstitutedAt) return session.stabilityHoursTotal;
  const now = new Date();
  const hoursElapsed = (now.getTime() - session.reconstitutedAt.getTime()) / (1000 * 60 * 60);
  return Math.max(0, session.stabilityHoursTotal - hoursElapsed);
}

// Helper: Check if vial is expired
function isVialExpired(session: OpenVialSession): boolean {
  const now = new Date();
  return now > session.expiresAt;
}

// GET - List open vial sessions
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') as OpenVialStatus | null;
  const productId = searchParams.get('productId');
  const locationId = searchParams.get('locationId');
  const activeOnly = searchParams.get('activeOnly') === 'true';

  let sessions = [...openVialSessions];

  // Filter by status
  if (status) {
    sessions = sessions.filter(s => s.status === status);
  } else if (activeOnly) {
    sessions = sessions.filter(s => s.status === 'active');
  }

  // Filter by product
  if (productId) {
    sessions = sessions.filter(s => s.productId === productId);
  }

  // Filter by location
  if (locationId) {
    sessions = sessions.filter(s => s.locationId === locationId);
  }

  // Update stability hours and expired status
  sessions = sessions.map(session => ({
    ...session,
    stabilityHoursRemaining: calculateStabilityRemaining(session),
    isExpired: isVialExpired(session),
  }));

  // Sort by stability remaining (most urgent first)
  sessions.sort((a, b) => a.stabilityHoursRemaining - b.stabilityHoursRemaining);

  return NextResponse.json({
    success: true,
    sessions,
    count: sessions.length,
    activeCount: sessions.filter(s => s.status === 'active').length,
  });
}

// POST - Open a new vial or use from existing vial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action as 'open' | 'use' | 'close' | 'waste';

    switch (action) {
      case 'open':
        return handleOpenVial(body);
      case 'use':
        return handleUseFromVial(body);
      case 'close':
        return handleCloseVial(body);
      case 'waste':
        return handleRecordWaste(body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: open, use, close, or waste' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Vial API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Open a new vial from a lot
async function handleOpenVial(body: OpenVialRequest & { action: string }): Promise<NextResponse> {
  const { lotId, vialNumber, diluentType, diluentVolume, reconstitutedBy, locationId } = body;

  // Find the lot
  const lot = inventoryLots.find(l => l.id === lotId);
  if (!lot) {
    return NextResponse.json(
      { success: false, error: 'Lot not found' },
      { status: 404 }
    );
  }

  // Find the product
  const product = getProductById(lot.productId);
  if (!product) {
    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    );
  }

  // Check lot has available quantity
  if (lot.availableQuantity < product.unitsPerPackage) {
    return NextResponse.json(
      { success: false, error: 'Insufficient quantity in lot' },
      { status: 400 }
    );
  }

  // Count existing vials from this lot
  const existingVialsFromLot = openVialSessions.filter(s => s.lotId === lotId).length;
  const newVialNumber = vialNumber || existingVialsFromLot + 1;

  // Calculate stability hours (from product or default)
  const stabilityHours = product.injectableDetails?.maxHoursAfterReconstitution || 24;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + stabilityHours * 60 * 60 * 1000);

  // Calculate cost per unit from lot
  const costPerUnit = lot.purchaseCost / lot.initialQuantity;
  const vialCost = costPerUnit * product.unitsPerPackage;

  // Create the session
  const session: OpenVialSession = {
    id: generateId('vial'),
    lotId: lot.id,
    lotNumber: lot.lotNumber,
    productId: product.id,
    productName: product.displayName || product.name,

    vialNumber: newVialNumber,
    originalUnits: product.unitsPerPackage,
    currentUnits: product.unitsPerPackage,
    usedUnits: 0,
    wastedUnits: 0,

    reconstitutedAt: product.injectableDetails?.reconstitutionRequired ? now : undefined,
    reconstitutedBy: product.injectableDetails?.reconstitutionRequired ? reconstitutedBy : undefined,
    reconstitutedByName: product.injectableDetails?.reconstitutionRequired ? 'Staff' : undefined, // TODO: Get from users
    diluentType: diluentType || product.injectableDetails?.dilutionRatio?.split(' ')[1] || 'preservative-free saline',
    diluentVolume: diluentVolume || product.injectableDetails?.defaultDilution,
    concentration: product.injectableDetails?.concentration,

    expiresAt,
    stabilityHoursTotal: stabilityHours,
    stabilityHoursRemaining: stabilityHours,
    isExpired: false,

    usageRecords: [],
    totalPatients: 0,

    locationId,
    locationName: lot.locationName,
    storageLocation: lot.storageLocation,

    status: 'active',

    vialCost,
    costPerUnitUsed: 0,
    revenueGenerated: 0,
    profitMargin: 0,

    createdAt: now,
    updatedAt: now,
    createdBy: reconstitutedBy,
    lastUpdatedBy: reconstitutedBy,
  };

  openVialSessions.push(session);

  // Note: In production, also deduct from lot.currentQuantity

  const response: OpenVialResponse = {
    success: true,
    session,
    expiresAt,
    stabilityHoursRemaining: stabilityHours,
  };

  return NextResponse.json(response);
}

// Use units from an open vial
async function handleUseFromVial(body: UseFromVialRequest & { action: string }): Promise<NextResponse> {
  const {
    openVialSessionId,
    unitsToUse,
    patientId,
    appointmentId,
    practitionerId,
    areasInjected,
    chartId,
    notes,
  } = body;

  // Find the session
  const sessionIndex = openVialSessions.findIndex(s => s.id === openVialSessionId);
  if (sessionIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Open vial session not found' },
      { status: 404 }
    );
  }

  const session = openVialSessions[sessionIndex];

  // Check if vial is still active
  if (session.status !== 'active') {
    return NextResponse.json(
      { success: false, error: `Vial is ${session.status}. Cannot use.` },
      { status: 400 }
    );
  }

  // Check if expired
  if (isVialExpired(session)) {
    // Auto-close as expired
    session.status = 'expired';
    session.closedAt = new Date();
    session.closedReason = 'stability_exceeded';
    openVialSessions[sessionIndex] = session;

    return NextResponse.json(
      { success: false, error: 'Vial has expired (stability exceeded). Please open a new vial.' },
      { status: 400 }
    );
  }

  // Check sufficient quantity (supports fractional)
  if (session.currentUnits < unitsToUse) {
    return NextResponse.json(
      {
        success: false,
        error: `Insufficient units. Available: ${session.currentUnits}, Requested: ${unitsToUse}`,
      },
      { status: 400 }
    );
  }

  // Create usage record
  const usageRecord: VialUsageRecord = {
    id: generateId('usage'),
    timestamp: new Date(),
    patientId,
    patientName: 'Patient', // TODO: Get from patients
    appointmentId,
    practitionerId,
    practitionerName: 'Provider', // TODO: Get from staff
    unitsUsed: unitsToUse,
    areasInjected,
    chartId,
    notes,
  };

  // Update session
  session.usageRecords.push(usageRecord);
  session.currentUnits = Math.round((session.currentUnits - unitsToUse) * 100) / 100; // Handle floating point
  session.usedUnits = Math.round((session.usedUnits + unitsToUse) * 100) / 100;
  session.totalPatients = new Set(session.usageRecords.map(r => r.patientId)).size;
  session.stabilityHoursRemaining = calculateStabilityRemaining(session);
  session.updatedAt = new Date();
  session.lastUpdatedBy = practitionerId;

  // Update cost analytics
  if (session.usedUnits > 0) {
    session.costPerUnitUsed = session.vialCost / session.usedUnits;
  }

  // Check if depleted
  const isDepleted = session.currentUnits <= 0;
  if (isDepleted) {
    session.status = 'depleted';
    session.closedAt = new Date();
    session.closedReason = 'depleted';
  }

  openVialSessions[sessionIndex] = session;

  const response: UseFromVialResponse = {
    success: true,
    usageRecord,
    remainingUnits: session.currentUnits,
    isVialDepleted: isDepleted,
    stabilityHoursRemaining: session.stabilityHoursRemaining,
    alerts: session.currentUnits < 10 && session.currentUnits > 0
      ? [{
          id: generateId('alert'),
          type: 'low_stock' as const,
          severity: 'warning' as const,
          status: 'active' as const,
          productId: session.productId,
          productName: session.productName,
          lotId: session.lotId,
          lotNumber: session.lotNumber,
          locationId: session.locationId,
          locationName: session.locationName,
          title: `Low units remaining in open vial`,
          message: `Only ${session.currentUnits} units remaining in ${session.productName} vial. Consider preparing next vial.`,
          notificationSent: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]
      : undefined,
  };

  return NextResponse.json(response);
}

// Close an open vial manually
async function handleCloseVial(body: {
  action: string;
  openVialSessionId: string;
  closedBy: string;
  reason: 'depleted' | 'expired' | 'stability_exceeded' | 'contamination' | 'manual_close';
  wasteUnits?: number;
  wasteReason?: string;
}): Promise<NextResponse> {
  const { openVialSessionId, closedBy, reason, wasteUnits, wasteReason } = body;

  const sessionIndex = openVialSessions.findIndex(s => s.id === openVialSessionId);
  if (sessionIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Open vial session not found' },
      { status: 404 }
    );
  }

  const session = openVialSessions[sessionIndex];

  // Record remaining units as waste if applicable
  if (wasteUnits && wasteUnits > 0) {
    session.wastedUnits += wasteUnits;
    session.currentUnits = Math.max(0, session.currentUnits - wasteUnits);
  } else if (session.currentUnits > 0) {
    // Auto-record remaining as waste
    session.wastedUnits += session.currentUnits;
    session.currentUnits = 0;
  }

  session.status = reason === 'contamination' ? 'discarded' : (reason === 'depleted' ? 'depleted' : 'expired');
  session.closedAt = new Date();
  session.closedBy = closedBy;
  session.closedReason = reason;
  session.updatedAt = new Date();
  session.lastUpdatedBy = closedBy;

  // Calculate final cost analytics
  if (session.usedUnits > 0) {
    session.costPerUnitUsed = session.vialCost / session.usedUnits;
  }

  openVialSessions[sessionIndex] = session;

  return NextResponse.json({
    success: true,
    session,
    wasteRecorded: {
      units: session.wastedUnits,
      value: session.wastedUnits * (session.vialCost / session.originalUnits),
    },
  });
}

// Record waste from a vial
async function handleRecordWaste(body: {
  action: string;
  openVialSessionId: string;
  unitsWasted: number;
  reason: string;
  recordedBy: string;
  practitionerId?: string;
}): Promise<NextResponse> {
  const { openVialSessionId, unitsWasted, reason, recordedBy, practitionerId } = body;

  const sessionIndex = openVialSessions.findIndex(s => s.id === openVialSessionId);
  if (sessionIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Open vial session not found' },
      { status: 404 }
    );
  }

  const session = openVialSessions[sessionIndex];

  if (session.currentUnits < unitsWasted) {
    return NextResponse.json(
      { success: false, error: `Cannot waste ${unitsWasted} units. Only ${session.currentUnits} remaining.` },
      { status: 400 }
    );
  }

  session.wastedUnits += unitsWasted;
  session.currentUnits = Math.round((session.currentUnits - unitsWasted) * 100) / 100;
  session.updatedAt = new Date();
  session.lastUpdatedBy = recordedBy;

  // Check if depleted after waste
  if (session.currentUnits <= 0) {
    session.status = 'depleted';
    session.closedAt = new Date();
    session.closedReason = 'depleted';
  }

  openVialSessions[sessionIndex] = session;

  const wasteValue = unitsWasted * (session.vialCost / session.originalUnits);

  return NextResponse.json({
    success: true,
    wasteRecorded: {
      units: unitsWasted,
      value: wasteValue,
      reason,
      practitionerId,
    },
    remainingUnits: session.currentUnits,
    totalWasteFromVial: {
      units: session.wastedUnits,
      value: session.wastedUnits * (session.vialCost / session.originalUnits),
    },
  });
}
