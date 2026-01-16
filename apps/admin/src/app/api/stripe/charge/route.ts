import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || '',
  { apiVersion: '2025-08-27.basil' }
);

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', description, patientId, source, metadata } = await request.json();

    // Create a charge directly (for quick payments)
    const charge = await stripe.charges.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || 'Medical Spa Services',
      source: source || 'tok_visa', // Use test token for development
      metadata: {
        patientId,
        ...metadata,
      },
    });

    return NextResponse.json({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      paid: charge.paid,
      receipt_url: charge.receipt_url,
    });
  } catch (error: any) {
    console.error('Stripe charge error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process charge' },
      { status: 500 }
    );
  }
}