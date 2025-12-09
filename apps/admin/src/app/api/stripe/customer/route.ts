import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || '',
  { apiVersion: '2024-12-18.acacia' }
);

export async function POST(request: NextRequest) {
  try {
    const { id, email, name, phone } = await request.json();

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      // Update existing customer
      const customer = await stripe.customers.update(existingCustomers.data[0].id, {
        name,
        phone,
        metadata: {
          patientId: id,
        },
      });
      
      return NextResponse.json(customer);
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        patientId: id,
      },
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Stripe customer error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create/update customer' },
      { status: 500 }
    );
  }
}