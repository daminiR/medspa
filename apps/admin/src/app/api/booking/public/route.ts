/**
 * Public Booking API
 * This is how external websites can embed our booking system
 */

import { NextRequest, NextResponse } from 'next/server';

// Public endpoint - no auth required
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clinicId = searchParams.get('clinicId');
  
  // Return available slots without exposing sensitive data
  return NextResponse.json({
    clinic: {
      name: 'Luxe Medical Spa',
      logo: '/logo.png',
      address: '123 Main St, City, ST 12345',
    },
    services: [
      { id: 1, name: 'Botox', duration: 30, price: 450, description: 'Reduce wrinkles and fine lines' },
      { id: 2, name: 'Dermal Fillers', duration: 45, price: 650, description: 'Restore volume and enhance features' },
      { id: 3, name: 'HydraFacial', duration: 60, price: 199, description: 'Deep cleansing and hydration' },
      { id: 4, name: 'Chemical Peel', duration: 45, price: 250, description: 'Improve skin texture and tone' },
    ],
    providers: [
      { id: 1, name: 'Dr. Sarah Smith', title: 'Medical Director' },
      { id: 2, name: 'Dr. Michael Lee', title: 'Aesthetic Physician' },
      { id: 3, name: 'Any Provider', title: 'First Available' },
    ],
    // Available times for next 30 days
    availability: generateAvailability(),
  });
}

export async function POST(request: NextRequest) {
  const booking = await request.json();
  
  // Validate booking data
  const { service, provider, date, time, patient } = booking;
  
  // In production: 
  // 1. Check if slot is still available
  // 2. Create appointment
  // 3. Send confirmation email/SMS
  // 4. Return confirmation
  
  return NextResponse.json({
    success: true,
    confirmationNumber: `LMS${Date.now()}`,
    appointment: {
      service,
      provider,
      datetime: `${date} ${time}`,
      patient: {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
      },
    },
    message: 'Appointment booked! Check your email for confirmation.',
  });
}

function generateAvailability() {
  // Mock availability - in production, query actual calendar
  const slots = [];
  const today = new Date();
  
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    
    // Skip Sundays
    if (date.getDay() === 0) continue;
    
    // Generate time slots
    const daySlots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let min = 0; min < 60; min += 30) {
        // Random availability (in production, check actual bookings)
        if (Math.random() > 0.3) {
          daySlots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
        }
      }
    }
    
    if (daySlots.length > 0) {
      slots.push({
        date: date.toISOString().split('T')[0],
        times: daySlots,
      });
    }
  }
  
  return slots;
}