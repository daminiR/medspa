// Manufacturer Loyalty Program Integration API
// Hooks for Allergan Allē, Galderma ASPIRE, and other manufacturer programs
//
// Research insight: "Aesthetic Record has direct integration with ASPIRE where
// Galderma inventory is mapped to ASPIRE Galderma Rewards so logging and
// verification is streamlined."

import { NextRequest, NextResponse } from 'next/server';
import {
  LoyaltyProgram,
  LoyaltyProgramConfig,
  LoyaltyTransaction,
} from '@/types/inventory';
import { getProductById } from '@/lib/data/inventory';

// In-memory stores (replace with DB in production)
let loyaltyConfigs: LoyaltyProgramConfig[] = [
  {
    program: 'alle',
    programName: 'Allē Rewards',
    manufacturerName: 'Allergan Aesthetics',
    isEnabled: false,
    supportedProductIds: ['prod-botox', 'prod-juvederm-ultra', 'prod-juvederm-voluma'],
    autoLogTreatments: true,
    autoEnrollPatients: false,
    syncStatus: 'disconnected',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    program: 'aspire',
    programName: 'ASPIRE Galderma Rewards',
    manufacturerName: 'Galderma',
    isEnabled: false,
    supportedProductIds: ['prod-dysport', 'prod-restylane', 'prod-restylane-lyft', 'prod-sculptra'],
    autoLogTreatments: true,
    autoEnrollPatients: false,
    syncStatus: 'disconnected',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    program: 'evolus',
    programName: 'Evolus Rewards',
    manufacturerName: 'Evolus',
    isEnabled: false,
    supportedProductIds: [],
    autoLogTreatments: true,
    autoEnrollPatients: false,
    syncStatus: 'disconnected',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    program: 'merz_aesthetics',
    programName: 'Merz Aesthetics Rewards',
    manufacturerName: 'Merz Aesthetics',
    isEnabled: false,
    supportedProductIds: ['prod-xeomin', 'prod-radiesse'],
    autoLogTreatments: true,
    autoEnrollPatients: false,
    syncStatus: 'disconnected',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let loyaltyTransactions: LoyaltyTransaction[] = [];

// Helper
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET - List loyalty configs or transactions
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const program = searchParams.get('program') as LoyaltyProgram | null;

  if (type === 'transactions') {
    let transactions = [...loyaltyTransactions];

    if (program) {
      transactions = transactions.filter(t => t.program === program);
    }

    const patientId = searchParams.get('patientId');
    if (patientId) {
      transactions = transactions.filter(t => t.patientId === patientId);
    }

    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
      pendingSync: transactions.filter(t => t.syncStatus === 'pending').length,
    });
  }

  // Default: return configs
  let configs = [...loyaltyConfigs];
  if (program) {
    configs = configs.filter(c => c.program === program);
  }

  return NextResponse.json({
    success: true,
    programs: configs,
    enabledCount: configs.filter(c => c.isEnabled).length,
  });
}

// POST - Configure, connect, or log transactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action as 'configure' | 'connect' | 'disconnect' | 'log-treatment' | 'sync' | 'check-patient';

    switch (action) {
      case 'configure':
        return handleConfigure(body);
      case 'connect':
        return handleConnect(body);
      case 'disconnect':
        return handleDisconnect(body);
      case 'log-treatment':
        return handleLogTreatment(body);
      case 'sync':
        return handleSync(body);
      case 'check-patient':
        return handleCheckPatient(body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Loyalty API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Configure a loyalty program
function handleConfigure(body: {
  action: string;
  program: LoyaltyProgram;
  autoLogTreatments?: boolean;
  autoEnrollPatients?: boolean;
}): NextResponse {
  const { program, autoLogTreatments, autoEnrollPatients } = body;

  const configIndex = loyaltyConfigs.findIndex(c => c.program === program);
  if (configIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Program not found' },
      { status: 404 }
    );
  }

  const config = loyaltyConfigs[configIndex];

  if (autoLogTreatments !== undefined) {
    config.autoLogTreatments = autoLogTreatments;
  }
  if (autoEnrollPatients !== undefined) {
    config.autoEnrollPatients = autoEnrollPatients;
  }
  config.updatedAt = new Date();

  loyaltyConfigs[configIndex] = config;

  return NextResponse.json({
    success: true,
    config,
  });
}

// Connect to a loyalty program (simulated)
function handleConnect(body: {
  action: string;
  program: LoyaltyProgram;
  apiKey?: string;
  accountId?: string;
}): NextResponse {
  const { program, apiKey, accountId } = body;

  const configIndex = loyaltyConfigs.findIndex(c => c.program === program);
  if (configIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Program not found' },
      { status: 404 }
    );
  }

  const config = loyaltyConfigs[configIndex];

  // Simulate API connection
  // In production, this would make an actual API call to verify credentials
  config.apiKey = apiKey;
  config.accountId = accountId;
  config.isEnabled = true;
  config.syncStatus = 'connected';
  config.lastSyncAt = new Date();
  config.updatedAt = new Date();

  loyaltyConfigs[configIndex] = config;

  return NextResponse.json({
    success: true,
    config,
    message: `Successfully connected to ${config.programName}`,
  });
}

// Disconnect from a loyalty program
function handleDisconnect(body: {
  action: string;
  program: LoyaltyProgram;
}): NextResponse {
  const { program } = body;

  const configIndex = loyaltyConfigs.findIndex(c => c.program === program);
  if (configIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Program not found' },
      { status: 404 }
    );
  }

  const config = loyaltyConfigs[configIndex];
  config.isEnabled = false;
  config.syncStatus = 'disconnected';
  config.apiKey = undefined;
  config.accountId = undefined;
  config.updatedAt = new Date();

  loyaltyConfigs[configIndex] = config;

  return NextResponse.json({
    success: true,
    config,
    message: `Disconnected from ${config.programName}`,
  });
}

// Log a treatment to the loyalty program
function handleLogTreatment(body: {
  action: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  products: {
    productId: string;
    unitsUsed: number;
    lotNumber: string;
  }[];
  pointsRedeemed?: number;
  rewardApplied?: string;
  discountAmount?: number;
}): NextResponse {
  const {
    appointmentId,
    patientId,
    patientName,
    products,
    pointsRedeemed,
    rewardApplied,
    discountAmount,
  } = body;

  // Determine which programs to log to based on products used
  const programsToLog = new Set<LoyaltyProgram>();

  products.forEach(p => {
    loyaltyConfigs.forEach(config => {
      if (config.isEnabled && config.supportedProductIds.includes(p.productId)) {
        programsToLog.add(config.program);
      }
    });
  });

  if (programsToLog.size === 0) {
    return NextResponse.json({
      success: true,
      message: 'No eligible loyalty programs for these products',
      transactions: [],
    });
  }

  const transactions: LoyaltyTransaction[] = [];

  programsToLog.forEach(program => {
    const config = loyaltyConfigs.find(c => c.program === program);
    if (!config) return;

    // Filter products for this program
    const programProducts = products
      .filter(p => config.supportedProductIds.includes(p.productId))
      .map(p => {
        const product = getProductById(p.productId);
        return {
          productId: p.productId,
          productName: product?.displayName || product?.name || p.productId,
          unitsUsed: p.unitsUsed,
          lotNumber: p.lotNumber,
        };
      });

    const transaction: LoyaltyTransaction = {
      id: generateId('loyalty'),
      program,
      appointmentId,
      patientId,
      patientName,
      products: programProducts,
      pointsEarned: calculatePoints(programProducts, program),
      pointsRedeemed,
      rewardApplied,
      discountAmount,
      syncStatus: config.isEnabled ? 'pending' : 'failed',
      syncError: config.isEnabled ? undefined : 'Program not connected',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    loyaltyTransactions.push(transaction);
    transactions.push(transaction);
  });

  return NextResponse.json({
    success: true,
    transactions,
    message: `Logged to ${transactions.length} loyalty program(s)`,
  });
}

// Sync pending transactions
function handleSync(body: {
  action: string;
  program?: LoyaltyProgram;
}): NextResponse {
  const { program } = body;

  let toSync = loyaltyTransactions.filter(t => t.syncStatus === 'pending');

  if (program) {
    toSync = toSync.filter(t => t.program === program);
  }

  // Simulate syncing
  toSync.forEach(t => {
    const config = loyaltyConfigs.find(c => c.program === t.program);
    if (config?.isEnabled) {
      // In production, would make actual API calls
      t.syncStatus = 'synced';
      t.syncedAt = new Date();
      t.externalTransactionId = generateId('ext');
      t.updatedAt = new Date();
    } else {
      t.syncStatus = 'failed';
      t.syncError = 'Program not connected';
      t.updatedAt = new Date();
    }
  });

  // Update last sync time for configs
  if (program) {
    const configIndex = loyaltyConfigs.findIndex(c => c.program === program);
    if (configIndex !== -1) {
      loyaltyConfigs[configIndex].lastSyncAt = new Date();
      loyaltyConfigs[configIndex].updatedAt = new Date();
    }
  }

  return NextResponse.json({
    success: true,
    synced: toSync.filter(t => t.syncStatus === 'synced').length,
    failed: toSync.filter(t => t.syncStatus === 'failed').length,
    message: `Synced ${toSync.filter(t => t.syncStatus === 'synced').length} transactions`,
  });
}

// Check patient loyalty status
function handleCheckPatient(body: {
  action: string;
  program: LoyaltyProgram;
  patientId: string;
  patientEmail?: string;
  patientPhone?: string;
}): NextResponse {
  const { program, patientId, patientEmail, patientPhone } = body;

  const config = loyaltyConfigs.find(c => c.program === program);
  if (!config) {
    return NextResponse.json(
      { success: false, error: 'Program not found' },
      { status: 404 }
    );
  }

  if (!config.isEnabled) {
    return NextResponse.json({
      success: false,
      error: 'Program not connected',
    });
  }

  // Simulate checking patient status
  // In production, would make actual API call
  const mockPatientStatus = {
    isEnrolled: Math.random() > 0.3, // 70% chance enrolled
    memberId: `${program.toUpperCase()}-${patientId}`,
    pointsBalance: Math.floor(Math.random() * 500),
    availableRewards: [
      { name: '$50 off treatment', pointsCost: 200 },
      { name: '$100 off treatment', pointsCost: 400 },
    ],
    tier: ['Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 3)],
    lastActivity: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
  };

  return NextResponse.json({
    success: true,
    program: config.programName,
    patientStatus: mockPatientStatus,
  });
}

// Helper: Calculate points (simplified)
function calculatePoints(
  products: { productId: string; unitsUsed: number }[],
  program: LoyaltyProgram
): number {
  // Different programs have different point structures
  // This is a simplified calculation
  let points = 0;

  products.forEach(p => {
    const product = getProductById(p.productId);
    if (!product) return;

    switch (program) {
      case 'alle':
        // Allē: Points based on treatment value
        points += Math.floor(p.unitsUsed * product.unitPrice * 0.1);
        break;
      case 'aspire':
        // ASPIRE: Points based on units
        points += p.unitsUsed * 2;
        break;
      default:
        points += p.unitsUsed;
    }
  });

  return points;
}
