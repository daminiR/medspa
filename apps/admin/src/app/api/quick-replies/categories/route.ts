import { NextResponse } from 'next/server'

const DEFAULT_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'appointment',
    displayName: 'Appointment',
    description: 'Appointment confirmation and scheduling replies',
    order: 1,
    icon: 'Calendar',
    isSystem: true,
  },
  {
    id: 'cat-2',
    name: 'postCare',
    displayName: 'Post-Care',
    description: 'Post-treatment care instructions and follow-ups',
    order: 2,
    icon: 'Heart',
    isSystem: true,
  },
  {
    id: 'cat-3',
    name: 'general',
    displayName: 'General',
    description: 'General responses and information',
    order: 3,
    icon: 'MessageCircle',
    isSystem: true,
  },
  {
    id: 'cat-4',
    name: 'smsReminderTemplates',
    displayName: 'SMS Reminders',
    description: 'Automated SMS reminder templates with tokens',
    order: 4,
    icon: 'Bell',
    isSystem: true,
  },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    data: DEFAULT_CATEGORIES,
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  return NextResponse.json({
    success: true,
    data: {
      id: `cat-${Date.now()}`,
      ...body,
      order: DEFAULT_CATEGORIES.length + 1,
      icon: null,
      isSystem: false,
    },
  })
}
