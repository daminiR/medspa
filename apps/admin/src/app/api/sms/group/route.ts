import { NextRequest, NextResponse } from 'next/server'
import {
  sendGroupConfirmationSMS,
  sendGroupReminderSMS,
  sendGroupCheckInRequestSMS,
  sendGroupCancellationSMS,
  sendGroupModificationSMS,
  GroupSMSRecipient
} from '@/lib/twilio'
import { getGroupBookingById } from '@/lib/data'

type SMSType = 'confirmation' | 'reminder' | 'checkin' | 'cancellation' | 'modification'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, type, changeDescription } = body as {
      groupId: string
      type: SMSType
      changeDescription?: string
    }

    // Validate required fields
    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      )
    }

    if (!type || !['confirmation', 'reminder', 'checkin', 'cancellation', 'modification'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid SMS type is required (confirmation, reminder, checkin, cancellation, modification)' },
        { status: 400 }
      )
    }

    // Get group booking data
    const group = getGroupBookingById(groupId)
    if (!group) {
      return NextResponse.json(
        { error: 'Group booking not found' },
        { status: 404 }
      )
    }

    // Build recipients list from group participants
    const recipients: GroupSMSRecipient[] = group.participants.map(participant => ({
      patientId: participant.patientId,
      patientName: participant.patientName,
      phone: participant.phone || '',
      isCoordinator: participant.patientId === group.coordinatorPatientId,
      serviceName: participant.serviceName,
      startTime: participant.startTime
    }))

    // Build options
    const options = {
      groupId: group.id,
      groupName: group.name,
      date: new Date(group.date),
      totalParticipants: group.participants.length,
      totalPrice: group.totalDiscountedPrice,
      discountPercent: group.discountPercent,
      recipients
    }

    let result

    switch (type) {
      case 'confirmation':
        result = await sendGroupConfirmationSMS(options)
        break
      case 'reminder':
        result = await sendGroupReminderSMS(options)
        break
      case 'checkin':
        result = await sendGroupCheckInRequestSMS({ groupName: group.name, recipients })
        break
      case 'cancellation':
        result = await sendGroupCancellationSMS({ groupName: group.name, date: new Date(group.date), recipients })
        break
      case 'modification':
        if (!changeDescription) {
          return NextResponse.json(
            { error: 'Change description is required for modification SMS' },
            { status: 400 }
          )
        }
        result = await sendGroupModificationSMS({ groupName: group.name, recipients, changeDescription })
        break
      default:
        return NextResponse.json(
          { error: 'Invalid SMS type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      groupId: group.id,
      groupName: group.name,
      type,
      ...result
    })
  } catch (error: any) {
    console.error('Group SMS API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to preview SMS messages without sending
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get('groupId')
  const type = searchParams.get('type') as SMSType

  if (!groupId) {
    return NextResponse.json(
      { error: 'Group ID is required' },
      { status: 400 }
    )
  }

  const group = getGroupBookingById(groupId)
  if (!group) {
    return NextResponse.json(
      { error: 'Group booking not found' },
      { status: 404 }
    )
  }

  // Return preview of what would be sent
  const dateStr = new Date(group.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const previews = group.participants.map(participant => {
    const isCoordinator = participant.patientId === group.coordinatorPatientId
    const timeStr = new Date(participant.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

    return {
      patientId: participant.patientId,
      patientName: participant.patientName,
      phone: participant.phone,
      isCoordinator,
      previewMessage: isCoordinator
        ? `Coordinator confirmation for ${group.name} on ${dateStr} with ${group.participants.length} guests. Total: $${group.totalDiscountedPrice.toFixed(2)} (${group.discountPercent}% discount)`
        : `Participant confirmation for ${participant.serviceName} in ${group.name} on ${dateStr} at ${timeStr}`
    }
  })

  return NextResponse.json({
    groupId: group.id,
    groupName: group.name,
    date: dateStr,
    totalParticipants: group.participants.length,
    previews
  })
}
