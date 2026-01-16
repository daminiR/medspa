import { NextResponse } from 'next/server'

// Default quick replies
const DEFAULT_QUICK_REPLIES: Record<string, Array<{
  id: string
  category: string
  content: string
  order: number
  isSystem: boolean
  useCount: number
  lastUsedAt: string | null
  createdAt: string
  updatedAt: string
}>> = {
  appointment: [
    {
      id: 'default-appointment-0',
      category: 'appointment',
      content: 'Your appointment is confirmed. See you soon!',
      order: 0,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-appointment-1',
      category: 'appointment',
      content: 'Please call us at 555-0100 to reschedule.',
      order: 1,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-appointment-2',
      category: 'appointment',
      content: 'Reply C to confirm or R to reschedule your appointment.',
      order: 2,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  postCare: [
    {
      id: 'default-postCare-0',
      category: 'postCare',
      content: "That's normal. Apply ice if needed and keep the area moisturized.",
      order: 0,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-postCare-1',
      category: 'postCare',
      content: 'Some tightness is normal. Use gentle cleanser and moisturize well.',
      order: 1,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-postCare-2',
      category: 'postCare',
      content: 'Avoid sun exposure and use SPF 30+ daily.',
      order: 2,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  general: [
    {
      id: 'default-general-0',
      category: 'general',
      content: "Thank you for your message. We'll respond shortly.",
      order: 0,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-general-1',
      category: 'general',
      content: 'Please call us at 555-0100 for immediate assistance.',
      order: 1,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-general-2',
      category: 'general',
      content: 'Our office hours are Mon-Fri 9AM-6PM, Sat 10AM-4PM.',
      order: 2,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  smsReminderTemplates: [
    {
      id: 'default-smsReminderTemplates-0',
      category: 'smsReminderTemplates',
      content: 'Hi {{firstName}}, reminder: {{serviceName}} tomorrow at {{appointmentTime}} with {{providerName}}. Reply C to confirm, R to reschedule.',
      order: 0,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-smsReminderTemplates-1',
      category: 'smsReminderTemplates',
      content: '{{firstName}}, your {{serviceName}} is in 1 hour! See you soon at {{locationName}}.',
      order: 1,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-smsReminderTemplates-2',
      category: 'smsReminderTemplates',
      content: 'Hi {{firstName}}! Appt confirmed: {{appointmentDate}} at {{appointmentTime}} with {{providerName}}. Questions? {{locationPhone}}',
      order: 2,
      isSystem: true,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DEFAULT_QUICK_REPLIES,
  })
}

export async function POST(request: Request) {
  // For now, just acknowledge - in production this would save to database
  const body = await request.json()
  return NextResponse.json({
    success: true,
    data: {
      id: `new-${Date.now()}`,
      ...body,
      order: 0,
      isSystem: false,
      useCount: 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })
}
