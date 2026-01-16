import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || '',
  { apiVersion: '2025-08-27.basil' }
);

export async function POST(request: NextRequest) {
  try {
    const { customerId, priceId, trialDays, metadata } = await request.json();

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
      metadata,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    // Access properties safely (Stripe API v2025 uses different naming)
    const sub = subscription as any;
    return NextResponse.json({
      id: sub.id,
      status: sub.status,
      current_period_start: sub.current_period_start || sub.currentPeriodStart,
      current_period_end: sub.current_period_end || sub.currentPeriodEnd,
      trial_end: sub.trial_end || sub.trialEnd,
      latest_invoice: sub.latest_invoice || sub.latestInvoice,
    });
  } catch (error: any) {
    console.error('Stripe subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
    }

    // Cancel subscription
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    const sub = subscription as any;

    return NextResponse.json({
      id: sub.id,
      status: sub.status,
      canceled_at: sub.canceled_at || sub.canceledAt,
    });
  } catch (error: any) {
    console.error('Stripe subscription cancellation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}