/**
 * Checkout Thank You API Route
 * Triggered after successful payment to send post-checkout messages
 * Endpoint: POST /api/checkout/thank-you
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkoutMessagingService, CheckoutDataSchema, type CheckoutData } from '@/services/checkout/messaging';
import { z } from 'zod';

// Request validation schema
const ThankYouRequestSchema = z.object({
  // Patient Info
  patientId: z.string().min(1, 'Patient ID required'),
  patientName: z.string().min(1, 'Patient name required'),
  patientPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  patientEmail: z.string().email().optional(),

  // Invoice Info
  invoiceId: z.string().min(1, 'Invoice ID required'),
  invoiceNumber: z.string().min(1, 'Invoice number required'),
  receiptUrl: z.string().url().optional(),
  receiptLink: z.string().url().optional(),

  // Payment Details
  total: z.number().positive('Total must be positive'),
  amountPaid: z.number().positive('Amount paid must be positive'),
  balance: z.number().min(0, 'Balance cannot be negative'),
  paymentMethod: z.string().min(1, 'Payment method required'),
  transactionId: z.string().optional(),

  // Treatment Services
  services: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().positive(),
      price: z.number().positive(),
      type: z.enum(['botox', 'filler', 'laser', 'chemical_peel', 'microneedling', 'other']).optional(),
    }),
    { message: 'Services array required with at least one service' }
  ),

  // Retail Products (optional)
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().positive(),
        price: z.number().positive(),
        category: z.enum(['skincare', 'supplement', 'other']).optional(),
      })
    )
    .optional(),

  // Next Appointment (optional)
  nextAppointmentId: z.string().optional(),
  nextAppointmentDate: z.string().datetime().optional(),
  nextAppointmentTime: z.string().optional(),
  nextAppointmentService: z.string().optional(),

  // Loyalty Program (optional)
  loyaltyPointsEarned: z.number().min(0).optional(),
  loyaltyPointsBalance: z.number().min(0).optional(),
  loyaltyTier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),

  // Communication Preferences
  smsOptIn: z.boolean().optional().default(true),
  emailOptIn: z.boolean().optional().default(true),
  hasPhotoConsent: z.boolean().optional().default(false),
});

type ThankYouRequest = z.infer<typeof ThankYouRequestSchema>;

/**
 * POST /api/checkout/thank-you
 * Trigger post-checkout messaging sequence
 *
 * Expected request body:
 * {
 *   "patientId": "p123",
 *   "patientName": "John Doe",
 *   "patientPhone": "+15551234567",
 *   "patientEmail": "john@example.com",
 *   "invoiceId": "inv_456",
 *   "invoiceNumber": "INV-2024-001",
 *   "receiptLink": "https://app.luxemedspa.com/receipt/inv_456",
 *   "total": 850.00,
 *   "amountPaid": 850.00,
 *   "balance": 0,
 *   "paymentMethod": "credit_card",
 *   "transactionId": "txn_78910",
 *   "services": [
 *     {
 *       "name": "Botox - 52 units",
 *       "quantity": 1,
 *       "price": 520.00,
 *       "type": "botox"
 *     },
 *     {
 *       "name": "Juvederm Filler - 1 syringe",
 *       "quantity": 1,
 *       "price": 330.00,
 *       "type": "filler"
 *     }
 *   ],
 *   "products": [
 *     {
 *       "name": "Hydrating Face Cream SPF 30",
 *       "quantity": 1,
 *       "price": 85.00,
 *       "category": "skincare"
 *     }
 *   ],
 *   "nextAppointmentDate": "2024-02-15T14:00:00Z",
 *   "nextAppointmentTime": "2:00 PM",
 *   "nextAppointmentService": "Botox Touch-up",
 *   "loyaltyPointsEarned": 85,
 *   "loyaltyPointsBalance": 350,
 *   "loyaltyTier": "silver",
 *   "smsOptIn": true,
 *   "emailOptIn": true
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Log incoming request
    console.log('[THANK_YOU_API_REQUEST]', {
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    // Parse and validate request body
    const body = await request.json();

    console.log('[THANK_YOU_REQUEST_BODY]', {
      patientId: body.patientId,
      invoiceId: body.invoiceId,
      total: body.total,
    });

    // Validate using schema
    const validated = ThankYouRequestSchema.parse(body);

    // Convert ISO string dates to Date objects if present
    const checkoutData: CheckoutData = {
      ...validated,
      nextAppointmentDate: validated.nextAppointmentDate
        ? new Date(validated.nextAppointmentDate)
        : undefined,
    };

    // Validate against checkout schema
    const finalValidation = CheckoutDataSchema.parse(checkoutData);

    console.log('[THANK_YOU_REQUEST_VALIDATED]', {
      patientId: finalValidation.patientId,
      invoiceId: finalValidation.invoiceId,
      servicesCount: finalValidation.services.length,
      productsCount: finalValidation.products?.length || 0,
    });

    // Send checkout messaging sequence
    const result = await checkoutMessagingService.sendCheckoutSequence(finalValidation);

    const duration = Date.now() - startTime;

    // Log completion
    console.log('[THANK_YOU_API_COMPLETE]', {
      patientId: finalValidation.patientId,
      invoiceId: finalValidation.invoiceId,
      success: result.success,
      messagesSent: result.messagesSent,
      errorsCount: result.errors.length,
      durationMs: duration,
    });

    // Return success response
    return NextResponse.json(
      {
        success: result.success,
        invoiceId: finalValidation.invoiceId,
        messagesSent: result.messagesSent,
        errors: result.errors.length > 0 ? result.errors : undefined,
        timestamp: new Date().toISOString(),
        processingTimeMs: duration,
      },
      { status: result.success ? 200 : 207 } // 207 if partial success
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.error('[THANK_YOU_API_ERROR]', {
      error: error.message,
      stack: error.stack,
      durationMs: duration,
    });

    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error('[VALIDATION_ERROR]', {
        issues: error.issues,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Handle generic errors
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process checkout thank you messages',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
