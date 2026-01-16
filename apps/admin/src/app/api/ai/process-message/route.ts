/**
 * AI Message Processing API Endpoint
 *
 * Processes incoming messages with Gemini AI and stores suggestions in Firestore.
 * Supports both the new proactive system and legacy aiAssistant.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processIncomingMessage } from '@/services/ai/gemini-messaging-service';
import { storeAIResponse } from '@/lib/firestore/ai-responses';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds max for AI processing

interface ProcessMessageRequest {
  // New proactive system fields
  messageId?: string;
  phoneNumber?: string;
  messageText?: string;
  conversationId?: string;
  recentMessages?: Array<{
    sender: string;
    text: string;
    time?: string;
  }>;
  // Legacy fields (for backward compatibility)
  message?: string;
  patientId?: string;
  channel?: 'sms' | 'email' | 'chat';
  autoRespond?: boolean;
  patientPhone?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ProcessMessageRequest = await request.json();

    // Determine if using new or legacy format
    const isNewFormat = !!(body.messageId || body.phoneNumber || body.messageText);

    if (isNewFormat) {
      // ============ New Proactive AI System ============
      const messageId = body.messageId || `msg-${Date.now()}`;
      const phoneNumber = body.phoneNumber || body.patientPhone || '';
      const messageText = body.messageText || body.message || '';

      if (!messageText) {
        return NextResponse.json(
          { success: false, error: 'Missing required field: messageText (or message)' },
          { status: 400 }
        );
      }

      // Convert recent messages to proper format
      const recentMessages = body.recentMessages?.map(m => ({
        sender: m.sender,
        text: m.text,
        time: m.time ? new Date(m.time) : undefined,
      })) || [];

      // Process with Gemini AI
      const result = await processIncomingMessage(
        messageId,
        phoneNumber,
        messageText,
        recentMessages
      );

      // Generate conversation ID if not provided
      const conversationId = body.conversationId ||
        (phoneNumber ? `conv-${phoneNumber.replace(/\D/g, '').slice(-10)}` : `conv-${messageId}`);

      // Store in Firestore for real-time UI updates
      try {
        await storeAIResponse(conversationId, result);
      } catch (firestoreError) {
        // Log but don't fail - Firestore might not be configured
        console.warn('Failed to store AI response in Firestore:', firestoreError);
      }

      const totalTime = Date.now() - startTime;

      // Log for audit trail
      console.log('AI Processing Complete:', {
        messageId: result.messageId,
        patientId: result.patientId,
        intent: result.analysis.intent,
        urgency: result.analysis.urgency,
        requiresHuman: result.analysis.requiresHuman,
        responseCount: result.responses.length,
        processingTimeMs: result.processingTimeMs,
        totalTimeMs: totalTime,
      });

      return NextResponse.json({
        success: true,
        // New format response
        result: {
          messageId: result.messageId,
          patientId: result.patientId,
          patientName: result.patientName,
          analysis: result.analysis,
          responses: result.responses,
          processingTimeMs: result.processingTimeMs,
          totalTimeMs: totalTime,
          conversationId,
        },
        // Legacy format fields for backward compatibility
        intent: {
          type: result.analysis.intent,
          confidence: result.responses[0]?.confidence || 0.5,
        },
        urgency: result.analysis.urgency.toLowerCase(),
        sentiment: result.analysis.sentiment.toLowerCase(),
        requiresHuman: result.analysis.requiresHuman,
        suggestedResponses: result.responses.map(r => r.text),
        suggestedActions: [],
        autoResponseSent: false,
      });

    } else {
      // ============ Legacy Format (backward compatibility) ============
      const { message, patientId, channel = 'sms' } = body;

      if (!message || !patientId) {
        return NextResponse.json(
          { error: 'Message and patientId are required' },
          { status: 400 }
        );
      }

      // Use new system but return legacy format
      const result = await processIncomingMessage(
        `legacy-${Date.now()}`,
        body.patientPhone || '',
        message,
        []
      );

      // Log for audit trail
      console.log('AI Processing Result (legacy):', {
        patientId,
        intent: result.analysis.intent,
        confidence: result.responses[0]?.confidence || 0.5,
        requiresHuman: result.analysis.requiresHuman,
        urgency: result.analysis.urgency,
      });

      // Return legacy format response
      return NextResponse.json({
        success: true,
        intent: {
          type: result.analysis.intent,
          confidence: result.responses[0]?.confidence || 0.5,
        },
        urgency: result.analysis.urgency.toLowerCase(),
        sentiment: result.analysis.sentiment.toLowerCase(),
        requiresHuman: result.analysis.requiresHuman,
        suggestedResponses: result.responses.map(r => r.text),
        suggestedActions: [],
        autoResponseSent: false,
      });
    }

  } catch (error) {
    console.error('AI Processing Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing AI capabilities
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testMessage = searchParams.get('message') || 'Can I reschedule my appointment?';
  const testPhone = searchParams.get('phone') || '+15551234567';

  try {
    const result = await processIncomingMessage(
      `test-${Date.now()}`,
      testPhone,
      testMessage,
      []
    );

    return NextResponse.json({
      status: 'ok',
      testMessage,
      analysis: result.analysis,
      responses: result.responses,
      processingTimeMs: result.processingTimeMs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'AI test failed',
      },
      { status: 500 }
    );
  }
}
