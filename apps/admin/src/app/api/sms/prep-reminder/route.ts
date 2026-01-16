import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, formatPhoneNumber } from '@/lib/twilio';
import { getPrepInstructions, getPrepSMSTemplate, PREP_INSTRUCTIONS } from '@/lib/data/preVisitPrep';

interface PrepReminderRequest {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  treatment: string;
  appointmentDate: string;
  appointmentTime: string;
  sendViaSMS?: boolean;
  sendViaEmail?: boolean;
}

interface BatchPrepReminderRequest {
  appointments: PrepReminderRequest[];
}

/**
 * POST /api/sms/prep-reminder
 * Send pre-visit preparation reminders to patients
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if it's a batch request
    if (body.appointments && Array.isArray(body.appointments)) {
      return handleBatchReminders(body as BatchPrepReminderRequest);
    }

    // Single reminder
    return handleSingleReminder(body as PrepReminderRequest);
  } catch (error: any) {
    console.error('Prep Reminder API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle single prep reminder
 */
async function handleSingleReminder(data: PrepReminderRequest) {
  const {
    appointmentId,
    patientId,
    patientName,
    patientPhone,
    treatment,
    appointmentDate,
    appointmentTime,
    sendViaSMS = true,
    sendViaEmail = false,
  } = data;

  // Validate required fields
  if (!appointmentId || !patientPhone || !treatment || !appointmentDate) {
    return NextResponse.json(
      { error: 'Missing required fields: appointmentId, patientPhone, treatment, appointmentDate' },
      { status: 400 }
    );
  }

  // Get prep instructions for this treatment
  const prepInstructions = getPrepInstructions(treatment);

  if (!prepInstructions) {
    return NextResponse.json(
      {
        success: false,
        appointmentId,
        error: `No prep instructions found for treatment: ${treatment}`,
        availableTreatments: Object.keys(PREP_INSTRUCTIONS),
      },
      { status: 404 }
    );
  }

  const results: {
    sms?: { success: boolean; messageId?: string; error?: string };
    email?: { success: boolean; error?: string };
  } = {};

  // Send SMS
  if (sendViaSMS && prepInstructions.smsTemplate) {
    const message = getPrepSMSTemplate(treatment, {
      patientFirstName: patientName.split(' ')[0],
      appointmentDate: formatDateForSMS(appointmentDate),
      appointmentTime,
    });

    if (message) {
      try {
        const smsResult = await sendSMS(formatPhoneNumber(patientPhone), message);
        results.sms = {
          success: smsResult?.success || false,
          messageId: smsResult?.messageId,
          error: smsResult?.error,
        };

        // Log for compliance
        console.log('[PREP_REMINDER_LOG]', {
          timestamp: new Date().toISOString(),
          appointmentId,
          patientId,
          treatment,
          channel: 'sms',
          success: smsResult?.success,
        });
      } catch (error: any) {
        results.sms = { success: false, error: error.message };
      }
    }
  }

  // Send Email (placeholder - would integrate with email service)
  if (sendViaEmail) {
    // TODO: Integrate with email service (SendGrid, SES, etc.)
    results.email = {
      success: false,
      error: 'Email sending not yet implemented',
    };
  }

  return NextResponse.json({
    success: results.sms?.success || results.email?.success || false,
    appointmentId,
    patientId,
    treatment,
    prepInstructionsId: prepInstructions.id,
    instructionCount: prepInstructions.instructions.length,
    results,
  });
}

/**
 * Handle batch prep reminders
 */
async function handleBatchReminders(data: BatchPrepReminderRequest) {
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const appointment of data.appointments) {
    const prepInstructions = getPrepInstructions(appointment.treatment);

    if (!prepInstructions) {
      results.push({
        appointmentId: appointment.appointmentId,
        success: false,
        error: `No prep instructions for: ${appointment.treatment}`,
      });
      failureCount++;
      continue;
    }

    const message = getPrepSMSTemplate(appointment.treatment, {
      patientFirstName: appointment.patientName.split(' ')[0],
      appointmentDate: formatDateForSMS(appointment.appointmentDate),
      appointmentTime: appointment.appointmentTime,
    });

    if (!message) {
      results.push({
        appointmentId: appointment.appointmentId,
        success: false,
        error: 'Failed to generate message from template',
      });
      failureCount++;
      continue;
    }

    try {
      const smsResult = await sendSMS(
        formatPhoneNumber(appointment.patientPhone),
        message
      );

      results.push({
        appointmentId: appointment.appointmentId,
        patientId: appointment.patientId,
        treatment: appointment.treatment,
        success: smsResult?.success || false,
        messageId: smsResult?.messageId,
        error: smsResult?.error,
      });

      if (smsResult?.success) {
        successCount++;
      } else {
        failureCount++;
      }
    } catch (error: any) {
      results.push({
        appointmentId: appointment.appointmentId,
        success: false,
        error: error.message,
      });
      failureCount++;
    }
  }

  return NextResponse.json({
    success: successCount > 0,
    totalProcessed: data.appointments.length,
    successCount,
    failureCount,
    results,
  });
}

/**
 * GET /api/sms/prep-reminder
 * Get appointments that need prep reminders
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const daysAhead = parseInt(searchParams.get('daysAhead') || '3');
  const treatmentFilter = searchParams.get('treatment');

  // In production, this would query the database for appointments
  // that need prep reminders based on:
  // 1. Appointment date is within daysAhead days
  // 2. Treatment has prep instructions
  // 3. Prep reminder hasn't been sent yet
  // 4. Patient has opted in to SMS

  // Mock response for development
  const mockAppointmentsNeedingPrep = [
    {
      appointmentId: 'apt-001',
      patientId: 'p-001',
      patientName: 'Sarah Johnson',
      patientPhone: '555-123-4567',
      treatment: 'Botox',
      appointmentDate: getDatePlusDays(daysAhead),
      appointmentTime: '2:00 PM',
      prepInstructions: getPrepInstructions('botox'),
      prepReminderSent: false,
    },
    {
      appointmentId: 'apt-002',
      patientId: 'p-002',
      patientName: 'Emily Davis',
      patientPhone: '555-234-5678',
      treatment: 'Laser Hair Removal',
      appointmentDate: getDatePlusDays(daysAhead),
      appointmentTime: '10:00 AM',
      prepInstructions: getPrepInstructions('laser_hair_removal'),
      prepReminderSent: false,
    },
    {
      appointmentId: 'apt-003',
      patientId: 'p-003',
      patientName: 'Michael Chen',
      patientPhone: '555-345-6789',
      treatment: 'Chemical Peel',
      appointmentDate: getDatePlusDays(daysAhead + 2),
      appointmentTime: '3:30 PM',
      prepInstructions: getPrepInstructions('chemical_peel'),
      prepReminderSent: false,
    },
  ].filter(apt => {
    if (treatmentFilter) {
      return apt.treatment.toLowerCase().includes(treatmentFilter.toLowerCase());
    }
    return true;
  });

  return NextResponse.json({
    daysAhead,
    treatmentFilter,
    appointmentsNeedingPrep: mockAppointmentsNeedingPrep,
    totalCount: mockAppointmentsNeedingPrep.length,
  });
}

/**
 * Get list of all available prep instruction treatments
 */
export async function OPTIONS() {
  const treatments = Object.values(PREP_INSTRUCTIONS).map(prep => ({
    id: prep.id,
    treatment: prep.treatment,
    category: prep.category,
    timing: prep.timing,
    enabled: prep.enabled,
    instructionCount: prep.instructions.length,
  }));

  return NextResponse.json({
    availableTreatments: treatments,
    totalCount: treatments.length,
    categories: Array.from(new Set(treatments.map(t => t.category))),
  });
}

// Helper functions

function formatDateForSMS(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

function getDatePlusDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
