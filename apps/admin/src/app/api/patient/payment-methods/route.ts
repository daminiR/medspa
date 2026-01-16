/**
 * GET /api/patient/payment-methods - List payment methods
 * POST /api/patient/payment-methods - Add payment method
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { addPaymentMethodSchema } from '@/lib/validations/patient';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: tokenUser } = authResult;

    // Get patient profile
    const patient = await db.patients.findByUserId(tokenUser.userId);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get payment methods
    const paymentMethods = await db.paymentMethods.findByPatientId(patient.id);

    // Format for response
    const formattedMethods = paymentMethods.map((method) => ({
      id: method.id,
      type: method.type.toLowerCase(),
      // Card details
      cardBrand: method.cardBrand,
      cardLast4: method.cardLast4,
      cardExpMonth: method.cardExpMonth,
      cardExpYear: method.cardExpYear,
      // Bank details
      bankName: method.bankName,
      bankLast4: method.bankLast4,
      // HSA/FSA details
      hsaFsaProvider: method.hsaFsaProvider,
      hsaFsaAccountLast4: method.hsaFsaAccountLast4,
      hsaFsaVerified: method.hsaFsaVerified,
      // Status
      isDefault: method.isDefault,
      active: method.active,
      // Timestamps
      createdAt: method.createdAt.toISOString(),
      updatedAt: method.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      apiSuccess({
        paymentMethods: formattedMethods,
        defaultMethodId: formattedMethods.find((m) => m.isDefault)?.id || null,
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Get payment methods error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while fetching payment methods.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: tokenUser } = authResult;

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = addPaymentMethodSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { type, stripePaymentMethodId, setDefault } = validationResult.data;

    // Get patient profile
    const patient = await db.patients.findByUserId(tokenUser.userId);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // In production, verify the Stripe payment method and get card details
    // For now, we'll simulate this with mock data

    // Generate mock card details based on type
    let cardDetails: {
      cardBrand?: string;
      cardLast4?: string;
      cardExpMonth?: number;
      cardExpYear?: number;
      bankName?: string;
      bankLast4?: string;
      hsaFsaProvider?: string;
      hsaFsaAccountLast4?: string;
    } = {};

    if (type === 'CARD' || type === 'APPLE_PAY' || type === 'GOOGLE_PAY') {
      cardDetails = {
        cardBrand: 'Visa',
        cardLast4: Math.floor(1000 + Math.random() * 9000).toString(),
        cardExpMonth: Math.floor(1 + Math.random() * 12),
        cardExpYear: 2026 + Math.floor(Math.random() * 4),
      };
    } else if (type === 'BANK_ACCOUNT') {
      cardDetails = {
        bankName: 'Chase',
        bankLast4: Math.floor(1000 + Math.random() * 9000).toString(),
      };
    } else if (type === 'HSA' || type === 'FSA') {
      cardDetails = {
        hsaFsaProvider: type === 'HSA' ? 'HealthEquity' : 'WageWorks',
        hsaFsaAccountLast4: Math.floor(1000 + Math.random() * 9000).toString(),
        cardBrand: 'Visa',
        cardLast4: Math.floor(1000 + Math.random() * 9000).toString(),
        cardExpMonth: Math.floor(1 + Math.random() * 12),
        cardExpYear: 2026 + Math.floor(Math.random() * 4),
      };
    }

    // If setDefault, clear existing default
    if (setDefault) {
      await db.paymentMethods.clearDefault(patient.id);
    }

    // Check if this is the first payment method (auto-set as default)
    const existingMethods = await db.paymentMethods.findByPatientId(patient.id);
    const shouldBeDefault = setDefault || existingMethods.length === 0;

    // Create payment method
    const paymentMethod = await db.paymentMethods.create({
      patientId: patient.id,
      type: type as any,
      stripePaymentMethodId,
      stripeCustomerId: `cus_mock_${patient.id}`,
      ...cardDetails,
      hsaFsaVerified: type === 'HSA' || type === 'FSA',
      isDefault: shouldBeDefault,
      active: true,
    });

    return NextResponse.json(
      apiSuccess({
        message: 'Payment method added successfully',
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type.toLowerCase(),
          cardBrand: paymentMethod.cardBrand,
          cardLast4: paymentMethod.cardLast4,
          cardExpMonth: paymentMethod.cardExpMonth,
          cardExpYear: paymentMethod.cardExpYear,
          bankName: paymentMethod.bankName,
          bankLast4: paymentMethod.bankLast4,
          hsaFsaProvider: paymentMethod.hsaFsaProvider,
          hsaFsaAccountLast4: paymentMethod.hsaFsaAccountLast4,
          hsaFsaVerified: paymentMethod.hsaFsaVerified,
          isDefault: paymentMethod.isDefault,
          createdAt: paymentMethod.createdAt.toISOString(),
        },
      }),
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Add payment method error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while adding payment method.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
