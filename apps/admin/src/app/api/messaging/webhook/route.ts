/**
 * Twilio Webhook Handler
 * Processes incoming SMS messages and status updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { messagingService } from '@/services/messaging/core';
import { aiEngine, IntentCategory, UrgencyLevel } from '@/services/messaging/ai-engine';
import { generateMessage } from '@/services/messaging/templates';
import twilio from 'twilio';

// Emergency/Complication Routing
import { handleComplicationAlert, type ComplicationAlert } from '@/services/alerts/complicationAlertService';
import { generateComplicationResponse, generateUrgentAcknowledgment } from '@/services/alerts/complicationResponder';
import { findRecentTreatment, findPatientIdByPhone } from '@/lib/data/treatmentLookup';

// Twilio webhook signature validation
const validateTwilioSignature = (request: NextRequest, body: Record<string, any>): boolean => {
  if (process.env.NODE_ENV === 'development') {
    // Skip validation in development
    return true;
  }

  const signature = request.headers.get('X-Twilio-Signature');
  const url = request.url;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!signature || !authToken) {
    return false;
  }

  return twilio.validateRequest(
    authToken,
    signature,
    url,
    body
  );
};

export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const body = Object.fromEntries(formData);
    
    // Validate webhook signature
    if (!validateTwilioSignature(request, body as Record<string, any>)) {
      console.error('Invalid Twilio signature');
      return new NextResponse(null, { status: 403 });
    }
    
    // Handle different webhook types
    const webhookType = body.MessageStatus ? 'status' : 'message';
    
    if (webhookType === 'status') {
      // Handle delivery status updates
      await handleStatusUpdate(body);
    } else {
      // Handle incoming message
      await handleIncomingMessage(body);
    }
    
    // Twilio expects 200 OK with empty body
    return new NextResponse(null, { status: 200 });
    
  } catch (error: any) {
    console.error('Webhook error:', error);
    
    // Still return 200 to prevent Twilio retries on errors
    return new NextResponse(null, { status: 200 });
  }
}

/**
 * Handle incoming SMS message
 */
async function handleIncomingMessage(webhookData: any): Promise<void> {
  const incomingMessage = {
    sid: webhookData.MessageSid,
    from: webhookData.From,
    to: webhookData.To,
    body: webhookData.Body || '',
    numMedia: parseInt(webhookData.NumMedia || '0'),
    mediaUrl: webhookData.MediaUrl0,
    fromCity: webhookData.FromCity,
    fromState: webhookData.FromState,
    fromCountry: webhookData.FromCountry,
    receivedAt: new Date(),
  };
  
  console.log('Incoming message:', {
    from: incomingMessage.from,
    body: incomingMessage.body,
  });
  
  // Find patient by phone number
  const patientId = await findPatientByPhone(incomingMessage.from);
  const patientContext = await getPatientContext(patientId);
  
  // Analyze message with AI
  const analysis = await aiEngine.analyzeMessage(incomingMessage.body, {
    patientId: patientId || 'unknown',
    ...patientContext,
  });
  
  console.log('AI Analysis:', {
    intent: analysis.intent.primary,
    confidence: analysis.intent.confidence,
    urgency: analysis.urgency,
    sentiment: analysis.sentiment,
    requiresHuman: analysis.requiresHuman,
  });
  
  // Store message in conversation
  const conversation = await createOrUpdateConversation({
    patientPhone: incomingMessage.from,
    patientId,
    lastMessage: incomingMessage.body,
    lastMessageAt: incomingMessage.receivedAt,
    channel: 'sms',
    aiAnalysis: analysis,
  });
  
  // Handle based on intent and urgency
  await handleMessageIntent(incomingMessage, analysis, patientContext, conversation);
}

/**
 * Handle message based on AI analysis
 */
async function handleMessageIntent(
  message: any,
  analysis: any,
  context: any,
  conversation: any
): Promise<void> {
  
  // Check for emergency first
  if (analysis.urgency === UrgencyLevel.CRITICAL) {
    await handleEmergency(message, analysis, context);
    return;
  }
  
  // Handle high urgency - check for complications first
  if (analysis.urgency === UrgencyLevel.HIGH || analysis.requiresHuman) {
    // Check if this is a complication or side effect report
    const isComplication =
      analysis.intent.primary === IntentCategory.TREATMENT_CONCERN ||
      analysis.intent.primary === IntentCategory.SIDE_EFFECT_REPORT ||
      analysis.riskFactors?.includes('complication') ||
      analysis.riskFactors?.includes('side_effect') ||
      (analysis.keywords || []).some((k: string) =>
        ['bruising', 'swelling', 'pain', 'redness', 'bump', 'lump', 'asymmetry',
         'drooping', 'infection', 'bleeding', 'numbness'].includes(k.toLowerCase())
      );

    if (isComplication && context.patientId) {
      // Use the new complication-specific handler
      const treatment = findRecentTreatment(context.patientId);

      const complicationAlert: ComplicationAlert = {
        patientId: context.patientId,
        patientName: context.patientName || 'Patient',
        patientPhone: message.from,
        message: message.body,
        keywords: analysis.keywords || [],
        urgency: analysis.urgency === UrgencyLevel.CRITICAL ? 'critical' : 'high',
        treatment: treatment || undefined
      };

      // Handle the complication alert (notifies provider, logs to medical record)
      await handleComplicationAlert(complicationAlert);

      // Generate and send aftercare-aware auto-response
      const autoResponse = generateComplicationResponse(treatment, analysis.keywords || []);
      await sendAutoResponse(message.from, autoResponse, conversation.id);

      console.log('[COMPLICATION] Handled via new routing system:', {
        patientId: context.patientId,
        hasRecentTreatment: !!treatment,
        keywords: analysis.keywords
      });
      return;
    }

    // Regular HIGH urgency (not complication) - use existing staff alert
    await createStaffAlert({
      conversationId: conversation.id,
      patientId: context.patientId,
      urgency: analysis.urgency,
      message: message.body,
      analysis,
    });

    // Send acknowledgment
    const ackMessage = generateUrgentAcknowledgment();
    await sendAutoResponse(message.from, ackMessage, conversation.id);
    return;
  }
  
  // Handle specific intents with auto-response
  let responseMessage = null;
  
  switch (analysis.intent.primary) {
    case IntentCategory.APPOINTMENT_CONFIRMATION:
      responseMessage = await handleAppointmentConfirmation(message, context);
      break;
      
    case IntentCategory.APPOINTMENT_CANCELLATION:
      responseMessage = await handleAppointmentCancellation(message, context);
      break;
      
    case IntentCategory.APPOINTMENT_RESCHEDULING:
      responseMessage = await handleAppointmentReschedule(message, context);
      break;
      
    case IntentCategory.APPOINTMENT_BOOKING:
      responseMessage = await handleAppointmentBooking(message, context, analysis);
      break;
      
    case IntentCategory.TREATMENT_QUESTION:
      if (analysis.intent.confidence > 0.8) {
        responseMessage = analysis.suggestedResponses[0];
      }
      break;
      
    case IntentCategory.PRICING_INQUIRY:
      responseMessage = await handlePricingInquiry(message, analysis);
      break;
      
    case IntentCategory.OPT_OUT_REQUEST:
      await handleOptOut(message.from);
      responseMessage = 'You\'ve been unsubscribed from SMS messages. Reply START to resubscribe.';
      break;
      
    default:
      // For general inquiries during business hours
      if (context.businessHours && analysis.intent.confidence > 0.7) {
        responseMessage = analysis.suggestedResponses[0] || 
          'Thank you for your message. A team member will respond during business hours.';
      }
  }
  
  // Send auto-response if determined
  if (responseMessage) {
    await sendAutoResponse(message.from, responseMessage, conversation.id);
  }
  
  // Log interaction
  await logInteraction({
    conversationId: conversation.id,
    incomingMessage: message.body,
    analysis,
    autoResponse: responseMessage,
    timestamp: new Date(),
  });
}

/**
 * Handle appointment confirmation (Reply C to confirm)
 * This updates both the appointment status and the smsConfirmedAt timestamp
 */
async function handleAppointmentConfirmation(message: any, context: any): Promise<string> {
  const upcomingAppointment = context.patientProfile?.upcomingAppointments?.[0];

  if (upcomingAppointment) {
    // Update appointment status to 'confirmed' and set smsConfirmedAt timestamp
    await updateAppointmentStatus(upcomingAppointment.id, 'confirmed');
    await updateAppointmentConfirmation(upcomingAppointment.id, new Date());

    return `Perfect! Your ${upcomingAppointment.service} appointment on ${
      upcomingAppointment.date.toLocaleDateString()
    } at ${upcomingAppointment.time} is confirmed. See you soon!`;
  }

  return 'Thank you for confirming! We look forward to seeing you.';
}

/**
 * Handle appointment cancellation
 */
async function handleAppointmentCancellation(message: any, context: any): Promise<string> {
  const upcomingAppointment = context.patientProfile?.upcomingAppointments?.[0];
  
  if (upcomingAppointment) {
    // Check cancellation policy (24 hours notice)
    const hoursUntil = (upcomingAppointment.date.getTime() - Date.now()) / (1000 * 60 * 60);
    
    if (hoursUntil < 24) {
      return 'Your appointment is within 24 hours. Please call us at 555-0100 to cancel and avoid a late cancellation fee.';
    }
    
    // Cancel appointment
    await updateAppointmentStatus(upcomingAppointment.id, 'cancelled');
    
    return `Your ${upcomingAppointment.service} appointment on ${
      upcomingAppointment.date.toLocaleDateString()
    } has been cancelled. Would you like to reschedule? Reply YES or call 555-0100.`;
  }
  
  return 'To cancel your appointment, please call us at 555-0100 or visit our online portal.';
}

/**
 * Handle appointment reschedule request
 */
async function handleAppointmentReschedule(message: any, context: any): Promise<string> {
  const extractedInfo = context.analysis?.extractedInfo;
  
  if (extractedInfo?.appointmentDate || extractedInfo?.preferredTimes?.length) {
    // Create reschedule request
    await createRescheduleRequest({
      patientId: context.patientId,
      currentAppointment: context.patientProfile?.upcomingAppointments?.[0],
      requestedDate: extractedInfo.appointmentDate,
      requestedTimes: extractedInfo.preferredTimes,
    });
    
    return 'I\'ve noted your preferred times. Our scheduling team will contact you within 2 hours to confirm your new appointment.';
  }
  
  return 'To reschedule, please let us know your preferred dates and times, or call 555-0100 for immediate assistance.';
}

/**
 * Handle appointment booking request
 */
async function handleAppointmentBooking(message: any, context: any, analysis: any): Promise<string> {
  const extractedInfo = analysis.extractedInfo;
  
  if (extractedInfo?.serviceName) {
    // Check availability
    const availableSlots = await checkAvailability(
      extractedInfo.serviceName,
      extractedInfo.appointmentDate
    );
    
    if (availableSlots.length > 0) {
      const slotsText = availableSlots.slice(0, 3).join(', ');
      return `Great! I have availability for ${extractedInfo.serviceName} on: ${slotsText}. Reply with your preferred time or call 555-0100 to book.`;
    }
    
    return `I'll check availability for ${extractedInfo.serviceName}. Our booking team will text you available times within 1 hour.`;
  }
  
  return 'I\'d be happy to help you book an appointment! What treatment are you interested in, and when works best for you?';
}

/**
 * Handle pricing inquiry
 */
async function handlePricingInquiry(message: any, analysis: any): Promise<string> {
  const extractedService = analysis.extractedInfo?.serviceName;
  
  if (extractedService) {
    const pricing = await getServicePricing(extractedService);
    if (pricing) {
      return `${extractedService} starts at $${pricing.startingPrice}. Exact pricing depends on treatment area. Would you like to book a consultation? Reply YES or call 555-0100.`;
    }
  }
  
  return 'Our pricing varies by treatment and area. For detailed pricing, visit luxemedspa.com/pricing or call 555-0100. We also offer payment plans!';
}

/**
 * Handle emergency messages
 */
async function handleEmergency(message: any, analysis: any, context: any): Promise<void> {
  // Use the new complication alert system for emergencies too
  if (context.patientId) {
    const treatment = findRecentTreatment(context.patientId);

    const emergencyAlert: ComplicationAlert = {
      patientId: context.patientId,
      patientName: context.patientName || 'Patient',
      patientPhone: message.from,
      message: message.body,
      keywords: analysis.keywords || [],
      urgency: 'critical',
      treatment: treatment || undefined
    };

    // Handle as critical complication (will alert provider AND manager)
    await handleComplicationAlert(emergencyAlert);

    // Generate emergency-specific response
    const emergencyResponse = generateComplicationResponse(treatment, analysis.keywords || []);
    await sendAutoResponse(message.from, emergencyResponse);

    console.log('[EMERGENCY] Handled via complication routing:', {
      patientId: context.patientId,
      hasRecentTreatment: !!treatment
    });
  } else {
    // Fallback for unknown patient
    await createEmergencyAlert({
      patientId: context.patientId,
      patientPhone: message.from,
      message: message.body,
      analysis,
      timestamp: new Date(),
    });

    const emergencyResponse = 'This appears to be urgent. If this is a medical emergency, please call 911. ' +
      'Our medical team has been alerted and will contact you immediately.';
    await sendAutoResponse(message.from, emergencyResponse);
  }

  // Trigger phone call if configured
  if (process.env.ENABLE_EMERGENCY_CALLS === 'true') {
    await initiateEmergencyCall(message.from);
  }
}

/**
 * Send auto-response
 */
async function sendAutoResponse(
  to: string,
  message: string,
  conversationId?: string
): Promise<void> {
  try {
    await messagingService.sendSMS({
      to,
      body: message,
      conversationId,
      priority: 'normal',
      metadata: {
        type: 'auto_response',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sending auto-response:', error);
  }
}

/**
 * Handle delivery status updates
 */
async function handleStatusUpdate(webhookData: any): Promise<void> {
  const status = {
    messageSid: webhookData.MessageSid,
    status: webhookData.MessageStatus,
    to: webhookData.To,
    from: webhookData.From,
    errorCode: webhookData.ErrorCode,
    errorMessage: webhookData.ErrorMessage,
    timestamp: new Date(),
  };
  
  console.log('Message status update:', status);
  
  // Update message status in database
  await updateMessageStatus(status.messageSid, status.status, status.errorCode);
  
  // Handle failed messages
  if (status.status === 'failed' || status.status === 'undelivered') {
    await handleFailedMessage(status);
  }
}

/**
 * Handle failed message delivery
 */
async function handleFailedMessage(status: any): Promise<void> {
  console.error('Message delivery failed:', {
    to: status.to,
    errorCode: status.errorCode,
    errorMessage: status.errorMessage,
  });
  
  // Notify staff of delivery failure
  await createDeliveryFailureAlert({
    messageSid: status.messageSid,
    to: status.to,
    errorCode: status.errorCode,
    errorMessage: status.errorMessage,
  });
}

// Database helper functions (mock implementations)

async function findPatientByPhone(phone: string): Promise<string | null> {
  // Mock implementation - in production, query database
  const patients: Record<string, string> = {
    '+15551234567': 'patient_123',
    '+17652500332': 'patient_456',
  };
  return patients[phone] || null;
}

async function getPatientContext(patientId: string | null): Promise<any> {
  if (!patientId) {
    return {
      businessHours: isBusinessHours(),
      staffAvailable: true,
    };
  }
  
  // Mock implementation - in production, query database
  return {
    patientId,
    patientName: 'John Doe',
    patientProfile: {
      isVIP: false,
      membershipTier: 'Gold',
      lastVisit: new Date('2024-01-15'),
      upcomingAppointments: [
        {
          id: 'apt_123',
          date: new Date('2024-02-01'),
          time: '2:00 PM',
          service: 'Botox',
          provider: 'Dr. Smith',
        },
      ],
      recentTreatments: [
        {
          date: new Date('2024-01-15'),
          treatment: 'Hydrafacial',
          provider: 'Sarah RN',
        },
      ],
    },
    businessHours: isBusinessHours(),
    staffAvailable: true,
  };
}

async function createOrUpdateConversation(data: any): Promise<any> {
  // Mock implementation
  return {
    id: `conv_${Date.now()}`,
    patientId: data.patientId,
    patientPhone: data.patientPhone,
    lastMessage: data.lastMessage,
    lastMessageAt: data.lastMessageAt,
    status: 'active',
  };
}

async function updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
  console.log(`Updated appointment ${appointmentId} to ${status}`);
  // TODO: In production, update the database
  // await db.appointments.update({ id: appointmentId }, { status });
}

async function updateAppointmentConfirmation(appointmentId: string, confirmedAt: Date): Promise<void> {
  console.log(`Updated appointment ${appointmentId} confirmation timestamp to ${confirmedAt.toISOString()}`);
  // TODO: In production, update the database
  // await db.appointments.update({ id: appointmentId }, { smsConfirmedAt: confirmedAt });
}

async function createRescheduleRequest(data: any): Promise<void> {
  console.log('Created reschedule request:', data);
}

async function checkAvailability(service: string, date?: string): Promise<string[]> {
  // Mock implementation
  return ['Monday 2:00 PM', 'Tuesday 10:00 AM', 'Wednesday 3:30 PM'];
}

async function getServicePricing(service: string): Promise<any> {
  // Mock pricing data
  const pricing: Record<string, any> = {
    'botox': { startingPrice: 12, unit: 'per unit' },
    'filler': { startingPrice: 650, unit: 'per syringe' },
    'hydrafacial': { startingPrice: 199, unit: 'per session' },
  };
  
  return pricing[service.toLowerCase()];
}

async function createStaffAlert(alert: any): Promise<void> {
  console.log('Staff alert created:', alert);
}

async function createEmergencyAlert(alert: any): Promise<void> {
  console.log('EMERGENCY ALERT:', alert);
}

async function initiateEmergencyCall(phoneNumber: string): Promise<void> {
  console.log('Initiating emergency call to:', phoneNumber);
}

async function handleOptOut(phoneNumber: string): Promise<void> {
  console.log('Opt-out processed for:', phoneNumber);
}

async function logInteraction(interaction: any): Promise<void> {
  console.log('Interaction logged:', interaction);
}

async function updateMessageStatus(sid: string, status: string, errorCode?: string): Promise<void> {
  console.log('Message status updated:', { sid, status, errorCode });
}

async function createDeliveryFailureAlert(failure: any): Promise<void> {
  console.log('Delivery failure alert:', failure);
}

function isBusinessHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  // Monday-Friday 9am-6pm, Saturday 10am-4pm
  if (day === 0) return false; // Sunday
  if (day === 6) return hour >= 10 && hour < 16; // Saturday
  return hour >= 9 && hour < 18; // Weekday
}