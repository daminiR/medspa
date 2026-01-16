/**
 * Chat Escalation API Route
 * Handles emergency and urgent message escalation to staff
 *
 * HIPAA COMPLIANCE NOTE:
 * - No PHI stored in logs (only conversation IDs)
 * - Session-only storage (no server persistence)
 * - Production requires Google Cloud BAA + Vertex AI
 * - This mock implementation is for UI development only
 */

import { NextRequest, NextResponse } from 'next/server';
import { PatientIntent, UrgencyLevel } from '@/lib/ai/patient-intents';

/**
 * Escalation request body
 */
interface EscalationRequest {
  conversationId: string;
  message: string;
  intent: PatientIntent;
  urgency: UrgencyLevel;
  timestamp: string;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
}

/**
 * Escalation response
 */
interface EscalationResponse {
  escalationId: string;
  status: 'received' | 'processing' | 'assigned' | 'resolved';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedResponseTime: string;
  assignedTo?: string;
  message: string;
}

/**
 * In-memory store for escalations (mock)
 * Production would use a real notification queue
 */
const escalationQueue: Map<string, EscalationResponse & { request: EscalationRequest }> = new Map();

/**
 * POST /api/chat/escalate
 * Escalate a conversation to staff
 */
export async function POST(request: NextRequest): Promise<NextResponse<EscalationResponse | { error: string }>> {
  try {
    const body: EscalationRequest = await request.json();

    // Validate request
    if (!body.conversationId || !body.message) {
      return NextResponse.json(
        { error: 'conversationId and message are required' },
        { status: 400 }
      );
    }

    // Generate escalation ID
    const escalationId = `esc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Determine priority based on urgency and intent
    const priority = determinePriority(body.urgency, body.intent);

    // Get estimated response time based on priority
    const estimatedResponseTime = getEstimatedResponseTime(priority);

    // Mock staff assignment for high-priority issues
    const assignedTo = priority === 'critical' || priority === 'high'
      ? 'On-Call Nurse - Dr. Sarah Johnson'
      : undefined;

    // Build response
    const escalationResponse: EscalationResponse = {
      escalationId,
      status: assignedTo ? 'assigned' : 'received',
      priority,
      estimatedResponseTime,
      assignedTo,
      message: getEscalationMessage(priority, assignedTo),
    };

    // Store in queue (mock)
    escalationQueue.set(escalationId, {
      ...escalationResponse,
      request: body,
    });

    // Log escalation (in production, this would trigger notifications)
    logEscalation(escalationId, body, escalationResponse);

    // For critical issues, trigger immediate notification
    if (priority === 'critical') {
      await triggerImmediateNotification(body, escalationResponse);
    }

    return NextResponse.json(escalationResponse);
  } catch (error) {
    console.error('Escalation API error:', error);

    return NextResponse.json(
      { error: 'Failed to process escalation. Please contact us directly at (555) 123-4567.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/escalate
 * Get escalation queue status (for internal use)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Get escalation ID from query params
  const { searchParams } = new URL(request.url);
  const escalationId = searchParams.get('id');

  if (escalationId) {
    const escalation = escalationQueue.get(escalationId);
    if (!escalation) {
      return NextResponse.json(
        { error: 'Escalation not found' },
        { status: 404 }
      );
    }

    // Return status without sensitive request data
    return NextResponse.json({
      escalationId: escalation.escalationId,
      status: escalation.status,
      priority: escalation.priority,
      estimatedResponseTime: escalation.estimatedResponseTime,
      assignedTo: escalation.assignedTo,
    });
  }

  // Return queue summary
  return NextResponse.json({
    service: 'escalation-queue',
    activeEscalations: escalationQueue.size,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Determine priority based on urgency level and intent
 */
function determinePriority(
  urgency: UrgencyLevel,
  intent: PatientIntent
): 'critical' | 'high' | 'medium' | 'low' {
  // Critical: Emergency medical situations
  if (
    urgency === UrgencyLevel.CRITICAL ||
    intent === PatientIntent.EMERGENCY_MEDICAL
  ) {
    return 'critical';
  }

  // High: Urgent concerns, side effects
  if (
    urgency === UrgencyLevel.HIGH ||
    intent === PatientIntent.SIDE_EFFECT_REPORT ||
    intent === PatientIntent.URGENT_CONCERN
  ) {
    return 'high';
  }

  // Medium: General issues needing follow-up
  if (urgency === UrgencyLevel.MEDIUM) {
    return 'medium';
  }

  return 'low';
}

/**
 * Get estimated response time based on priority
 */
function getEstimatedResponseTime(priority: 'critical' | 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'critical':
      return 'Immediate - within 5 minutes';
    case 'high':
      return 'Within 30 minutes';
    case 'medium':
      return 'Within 2 hours';
    case 'low':
    default:
      return 'Within 24 hours';
  }
}

/**
 * Get escalation confirmation message
 */
function getEscalationMessage(
  priority: 'critical' | 'high' | 'medium' | 'low',
  assignedTo?: string
): string {
  if (priority === 'critical') {
    return `Your message has been flagged as urgent and our medical team has been immediately notified. ${
      assignedTo ? `${assignedTo} will contact you shortly.` : 'Someone will contact you within 5 minutes.'
    } If this is a life-threatening emergency, please call 911.`;
  }

  if (priority === 'high') {
    return `Your concern has been escalated to our team. ${
      assignedTo ? `${assignedTo} will reach out to you` : 'A staff member will contact you'
    } within 30 minutes.`;
  }

  if (priority === 'medium') {
    return 'Your message has been sent to our team. We will follow up with you within 2 hours during business hours.';
  }

  return 'Your message has been received. Our team will respond within 24 hours.';
}

/**
 * Log escalation for audit trail
 */
function logEscalation(
  escalationId: string,
  request: EscalationRequest,
  response: EscalationResponse
): void {
  // HIPAA Compliance: Only log non-PHI data
  console.log('[ESCALATION]', {
    escalationId,
    conversationId: request.conversationId,
    intent: request.intent,
    urgency: request.urgency,
    priority: response.priority,
    status: response.status,
    timestamp: new Date().toISOString(),
    // Note: Do NOT log message content, patientId, patientName, or phone
  });
}

/**
 * Trigger immediate notification for critical issues
 * In production, this would integrate with PagerDuty, SMS, etc.
 */
async function triggerImmediateNotification(
  request: EscalationRequest,
  response: EscalationResponse
): Promise<void> {
  // Mock immediate notification
  console.log('[CRITICAL ALERT]', {
    escalationId: response.escalationId,
    conversationId: request.conversationId,
    priority: 'CRITICAL',
    timestamp: new Date().toISOString(),
    // In production: Send to PagerDuty, SMS to on-call staff, etc.
  });

  // Simulate notification delay
  await new Promise((resolve) => setTimeout(resolve, 100));
}
