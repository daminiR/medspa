/**
 * PATCH /api/patient/payment-methods/[id] - Update payment method
 * DELETE /api/patient/payment-methods/[id] - Remove payment method
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { updatePaymentMethodSchema } from '@/lib/validations/patient';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: tokenUser } = authResult;

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = updatePaymentMethodSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { setDefault, active } = validationResult.data;

    // Get patient profile
    const patient = await db.patients.findByUserId(tokenUser.userId);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get payment method
    const paymentMethod = await db.paymentMethods.findById(id);
    if (!paymentMethod) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Payment method not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Verify ownership
    if (paymentMethod.patientId !== patient.id) {
      return NextResponse.json(
        apiError(ErrorCodes.FORBIDDEN, 'You do not have access to this payment method'),
        { status: 403, headers: corsHeaders() }
      );
    }

    // If setting as default, clear existing default
    if (setDefault) {
      await db.paymentMethods.clearDefault(patient.id);
    }

    // Update payment method
    const updates: Record<string, any> = {};
    if (setDefault !== undefined) updates.isDefault = setDefault;
    if (active !== undefined) updates.active = active;

    const updatedMethod = await db.paymentMethods.update(id, updates);

    return NextResponse.json(
      apiSuccess({
        message: 'Payment method updated successfully',
        paymentMethod: {
          id: updatedMethod?.id,
          type: updatedMethod?.type.toLowerCase(),
          cardBrand: updatedMethod?.cardBrand,
          cardLast4: updatedMethod?.cardLast4,
          cardExpMonth: updatedMethod?.cardExpMonth,
          cardExpYear: updatedMethod?.cardExpYear,
          bankName: updatedMethod?.bankName,
          bankLast4: updatedMethod?.bankLast4,
          hsaFsaProvider: updatedMethod?.hsaFsaProvider,
          hsaFsaAccountLast4: updatedMethod?.hsaFsaAccountLast4,
          hsaFsaVerified: updatedMethod?.hsaFsaVerified,
          isDefault: updatedMethod?.isDefault,
          active: updatedMethod?.active,
          updatedAt: updatedMethod?.updatedAt.toISOString(),
        },
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Update payment method error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while updating payment method.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get payment method
    const paymentMethod = await db.paymentMethods.findById(id);
    if (!paymentMethod) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Payment method not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Verify ownership
    if (paymentMethod.patientId !== patient.id) {
      return NextResponse.json(
        apiError(ErrorCodes.FORBIDDEN, 'You do not have access to this payment method'),
        { status: 403, headers: corsHeaders() }
      );
    }

    // In production, also remove from Stripe
    // await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);

    // Delete (soft delete) payment method
    await db.paymentMethods.delete(id);

    // If this was the default, set another one as default
    if (paymentMethod.isDefault) {
      const remainingMethods = await db.paymentMethods.findByPatientId(patient.id);
      if (remainingMethods.length > 0) {
        await db.paymentMethods.update(remainingMethods[0].id, { isDefault: true });
      }
    }

    return NextResponse.json(
      apiSuccess({
        message: 'Payment method removed successfully',
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Delete payment method error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while removing payment method.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
