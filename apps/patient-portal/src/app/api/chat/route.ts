/**
 * Chat API Route
 * Main endpoint for patient support AI chatbot
 *
 * HIPAA COMPLIANCE NOTE:
 * - No PHI stored in logs (only conversation IDs)
 * - Session-only storage (no server persistence)
 * - Production requires Google Cloud BAA + Vertex AI
 * - This mock implementation is for UI development only
 */

import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, type ConversationContext, type AIResponse } from '@/lib/ai/gemini-client';

/**
 * Request body schema
 */
interface ChatRequest {
  message: string;
  conversationId?: string;
  patientName?: string;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * Response body schema
 */
interface ChatResponse extends AIResponse {
  conversationId: string;
  timestamp: string;
  modelInfo: {
    modelId: string;
    provider: string;
  };
}

/**
 * Generate unique conversation ID
 */
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * POST /api/chat
 * Process patient message and return AI response
 */
export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse | { error: string }>> {
  try {
    const body: ChatRequest = await request.json();

    // Validate request
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Limit message length for safety
    if (body.message.length > 2000) {
      return NextResponse.json(
        { error: 'Message exceeds maximum length of 2000 characters' },
        { status: 400 }
      );
    }

    // Build conversation context
    const conversationId = body.conversationId || generateConversationId();
    const context: ConversationContext = {
      conversationId,
      timestamp: new Date().toISOString(),
      patientName: body.patientName,
      previousMessages: body.previousMessages?.slice(-5), // Only use last 5 messages for context
    };

    // Generate AI response
    const response = await geminiClient.generateResponse(body.message, context);

    // Handle emergency escalation (fire and forget - don't block response)
    if (response.escalate) {
      // In production, this would call a real escalation service
      // For now, we just log it (async, non-blocking)
      escalateToStaff(conversationId, body.message, response).catch(console.error);
    }

    // Build response
    const chatResponse: ChatResponse = {
      ...response,
      conversationId,
      timestamp: new Date().toISOString(),
      modelInfo: {
        modelId: geminiClient.getModelInfo().modelId,
        provider: geminiClient.getModelInfo().provider,
      },
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error('Chat API error:', error);

    // Don't expose internal errors
    return NextResponse.json(
      { error: 'An error occurred while processing your message. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    service: 'patient-chat',
    model: geminiClient.getModelInfo(),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Escalate conversation to staff (non-blocking)
 * In production, this would integrate with staff notification systems
 */
async function escalateToStaff(
  conversationId: string,
  message: string,
  response: AIResponse
): Promise<void> {
  try {
    // Call the escalation endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    await fetch(`${baseUrl}/api/chat/escalate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        message,
        intent: response.intent,
        urgency: response.urgency,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    // Log but don't throw - escalation failure shouldn't block patient response
    console.error('Failed to escalate conversation:', error);
  }
}
