/**
 * Send SMS API Route
 * Production endpoint for sending messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { messagingService } from '@/services/messaging/core';
import { aiEngine } from '@/services/messaging/ai-engine';
import { z } from 'zod';

// Request validation
const SendMessageSchema = z.object({
  to: z.string().min(1),
  message: z.string().min(1).max(1600),
  patientId: z.string().optional(),
  conversationId: z.string().optional(),
  templateId: z.string().optional(),
  variables: z.record(z.any()).optional(),
  mediaUrl: z.array(z.string().url()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validated = SendMessageSchema.parse(body);
    
    // Check if message should be analyzed by AI first
    if (validated.patientId && !validated.templateId) {
      const analysis = await aiEngine.analyzeMessage(validated.message, {
        patientId: validated.patientId,
      });
      
      // Log AI analysis for monitoring
      console.log('Message analysis:', {
        intent: analysis.intent.primary,
        urgency: analysis.urgency,
        sentiment: analysis.sentiment,
      });
    }
    
    // Send message
    const result = await messagingService.sendSMS({
      to: validated.to,
      body: validated.message,
      patientId: validated.patientId,
      conversationId: validated.conversationId,
      mediaUrl: validated.mediaUrl,
      scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : undefined,
      metadata: {
        templateId: validated.templateId,
        variables: validated.variables,
        sentBy: 'staff', // Track who sent it
        timestamp: new Date().toISOString(),
      },
    });
    
    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status,
      to: result.to,
      deliveredAt: result.deliveredAt,
    });
    
  } catch (error: any) {
    console.error('Send SMS error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('Rate limit')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.' 
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send message' 
      },
      { status: 500 }
    );
  }
}