/**
 * POST /api/patient/payments/process
 * Process a payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { processPaymentSchema } from '@/lib/validations/patient';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { services } from '@/lib/data';

// In-memory payment store (would be in db in production)
const payments: Map<string, any> = new Map();

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
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
    const validationResult = processPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const {
      appointmentId,
      invoiceId,
      paymentMethodId,
      amount,
      tip,
      isHsaFsa,
    } = validationResult.data;

    // Get patient profile
    const patient = await db.patients.findByUserId(tokenUser.userId);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Verify payment method
    const paymentMethod = await db.paymentMethods.findById(paymentMethodId);
    if (!paymentMethod) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Payment method not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    if (paymentMethod.patientId !== patient.id) {
      return NextResponse.json(
        apiError(ErrorCodes.FORBIDDEN, 'You do not have access to this payment method'),
        { status: 403, headers: corsHeaders() }
      );
    }

    // Validate HSA/FSA if applicable
    let hsaFsaEligibleAmount = 0;
    if (isHsaFsa) {
      // Check if payment method is HSA/FSA verified
      if (!paymentMethod.hsaFsaVerified && paymentMethod.type !== 'HSA' && paymentMethod.type !== 'FSA') {
        return NextResponse.json(
          apiError(
            ErrorCodes.INVALID_PAYMENT_METHOD,
            'This payment method is not HSA/FSA verified'
          ),
          { status: 400, headers: corsHeaders() }
        );
      }

      // If appointment, calculate HSA/FSA eligible amount
      if (appointmentId) {
        const appointment = await db.appointments.findById(appointmentId);
        if (appointment) {
          const service = services.find((s) => s.name === appointment.serviceName);
          // Most medical spa services are HSA/FSA eligible when prescribed
          hsaFsaEligibleAmount = amount; // In production, verify against service eligibility
        }
      }
    }

    // Create payment record
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const totalAmount = amount + (tip || 0);

    // In production, process with Stripe:
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(totalAmount * 100), // cents
    //   currency: 'usd',
    //   customer: paymentMethod.stripeCustomerId,
    //   payment_method: paymentMethod.stripePaymentMethodId,
    //   confirm: true,
    //   metadata: {
    //     appointment_id: appointmentId,
    //     invoice_id: invoiceId,
    //     patient_id: patient.id,
    //     mcc_code: '8099', // Medical services
    //   },
    // });

    // Mock payment processing
    const payment = {
      id: paymentId,
      patientId: patient.id,
      appointmentId,
      invoiceId,
      paymentMethodId,
      amount,
      tip: tip || 0,
      totalAmount,
      currency: 'USD',
      status: 'SUCCEEDED',
      isHsaFsa,
      hsaFsaEligibleAmount,
      iiasApproved: isHsaFsa,
      stripePaymentIntentId: `pi_mock_${paymentId}`,
      stripeChargeId: `ch_mock_${paymentId}`,
      receiptUrl: `https://receipt.luxemedspa.com/${paymentId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    payments.set(paymentId, payment);

    // If appointment payment, update appointment status
    if (appointmentId) {
      await db.appointments.update(appointmentId, {
        depositPaid: true,
        // If this is full payment, mark as paid
        // Otherwise, partial payment
      });
    }

    return NextResponse.json(
      apiSuccess({
        message: 'Payment processed successfully',
        payment: {
          id: payment.id,
          amount: payment.amount,
          tip: payment.tip,
          totalAmount: payment.totalAmount,
          currency: payment.currency,
          status: payment.status,
          isHsaFsa: payment.isHsaFsa,
          hsaFsaEligibleAmount: payment.hsaFsaEligibleAmount,
          receiptUrl: payment.receiptUrl,
          createdAt: payment.createdAt.toISOString(),
        },
      }),
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Process payment error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while processing payment.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
