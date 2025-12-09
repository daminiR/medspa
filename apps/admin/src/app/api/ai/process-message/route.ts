import { NextRequest, NextResponse } from 'next/server'
import { aiAssistant } from '@/lib/ai-assistant'
import { sendSMS } from '@/lib/twilio'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, patientId, channel = 'sms', autoRespond = false } = body

    if (!message || !patientId) {
      return NextResponse.json(
        { error: 'Message and patientId are required' },
        { status: 400 }
      )
    }

    // Process message with AI
    const result = await aiAssistant.processMessage(message, patientId, channel)

    // Log for audit trail
    console.log('AI Processing Result:', {
      patientId,
      intent: result.intent.type,
      confidence: result.intent.confidence,
      requiresHuman: result.requiresHuman,
      urgency: result.urgency
    })

    // If auto-respond is enabled and doesn't require human intervention
    if (autoRespond && !result.requiresHuman && result.intent.confidence > 0.8) {
      const autoResponse = result.suggestedResponses[0]
      
      if (autoResponse && channel === 'sms') {
        // Send automatic response
        const smsResult = await sendSMS(
          body.patientPhone, // Would need to be passed or fetched
          autoResponse
        )
        
        return NextResponse.json({
          ...result,
          autoResponseSent: true,
          autoResponse,
          smsMessageId: smsResult?.messageId
        })
      }
    }

    // Return AI analysis for staff to review
    return NextResponse.json({
      success: true,
      ...result,
      autoResponseSent: false
    })

  } catch (error: any) {
    console.error('AI Processing Error:', error)
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint for testing AI capabilities
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const testMessage = searchParams.get('message') || 'Can I reschedule my appointment?'
  
  try {
    const result = await aiAssistant.processMessage(testMessage, 'test-patient', 'sms')
    
    return NextResponse.json({
      testMessage,
      ...result
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'AI test failed', details: error.message },
      { status: 500 }
    )
  }
}