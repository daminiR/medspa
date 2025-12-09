import { 
  HistoryEvent, 
  HistoryEventType, 
  HistoryEventCategory,
  EVENT_CONFIG 
} from '@/types/appointmentHistory'

// Mock function to generate history - replace with API call
export function generateMockHistory(appointmentId: string): HistoryEvent[] {
  const events: HistoryEvent[] = [
    {
      id: '1',
      appointmentId,
      type: 'created',
      category: 'appointment',
      timestamp: new Date('2025-01-15T10:00:00'),
      userId: 'user1',
      userName: 'Sarah Chen',
      description: 'Appointment created for Botox consultation',
      isImportant: true
    },
    {
      id: '2',
      appointmentId,
      type: 'intake_form_sent',
      category: 'documentation',
      timestamp: new Date('2025-01-15T10:05:00'),
      userId: 'system',
      userName: 'System',
      description: 'Medical history intake form sent via email',
      metadata: {
        formId: 'form123',
        formName: 'Medical History & Consent',
        emailId: 'email456'
      }
    },
    {
      id: '3',
      appointmentId,
      type: 'confirmation_sent',
      category: 'communication',
      timestamp: new Date('2025-01-15T10:05:30'),
      userId: 'system',
      userName: 'System',
      description: 'Appointment confirmation sent via SMS',
      metadata: {
        smsId: 'sms789'
      }
    },
    {
      id: '4',
      appointmentId,
      type: 'intake_form_completed',
      category: 'documentation',
      timestamp: new Date('2025-01-16T14:30:00'),
      userId: 'patient1',
      userName: 'John Doe',
      description: 'Patient completed intake form',
      metadata: {
        formId: 'form123',
        formName: 'Medical History & Consent'
      },
      isImportant: true
    },
    {
      id: '5',
      appointmentId,
      type: 'reminder_sent',
      category: 'communication',
      timestamp: new Date('2025-01-19T10:00:00'),
      userId: 'system',
      userName: 'System',
      description: '24-hour reminder sent via SMS and email'
    },
    {
      id: '6',
      appointmentId,
      type: 'modified',
      category: 'appointment',
      timestamp: new Date('2025-01-19T15:00:00'),
      userId: 'user2',
      userName: 'Mike Johnson',
      description: 'Added note: Patient prefers numbing cream',
      metadata: {
        previousValue: null,
        newValue: 'Patient prefers numbing cream',
        notePreview: 'Patient prefers numbing cream'
      }
    }
  ]

  return events
}

// Filter events by category
export function filterEventsByCategory(
  events: HistoryEvent[], 
  categories: HistoryEventCategory[]
): HistoryEvent[] {
  if (categories.length === 0) return events
  return events.filter(event => categories.includes(event.category))
}

// Filter events by date range
export function filterEventsByDateRange(
  events: HistoryEvent[],
  start?: Date,
  end?: Date
): HistoryEvent[] {
  if (!start && !end) return events
  
  return events.filter(event => {
    const eventDate = new Date(event.timestamp)
    if (start && eventDate < start) return false
    if (end && eventDate > end) return false
    return true
  })
}

// Search events
export function searchEvents(
  events: HistoryEvent[],
  searchTerm: string
): HistoryEvent[] {
  if (!searchTerm) return events
  
  const term = searchTerm.toLowerCase()
  return events.filter(event => 
    event.description.toLowerCase().includes(term) ||
    event.userName.toLowerCase().includes(term) ||
    EVENT_CONFIG[event.type].label.toLowerCase().includes(term)
  )
}

// Group events by date for better display
export function groupEventsByDate(events: HistoryEvent[]): Record<string, HistoryEvent[]> {
  const grouped: Record<string, HistoryEvent[]> = {}
  
  events.forEach(event => {
    const date = new Date(event.timestamp)
    const key = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
    
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(event)
  })
  
  return grouped
}

// Get relative time string
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 7) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

// Check if event should trigger notification
export function isNotificationWorthy(event: HistoryEvent): boolean {
  const notificationTypes: HistoryEventType[] = [
    'cancelled',
    'no_show',
    'payment_failed',
    'intake_form_completed',
    'consent_signed'
  ]
  
  return notificationTypes.includes(event.type) || event.isImportant === true
}

// Format event description with metadata
export function formatEventDescription(event: HistoryEvent): string {
  let description = event.description
  
  if (event.metadata) {
    if (event.type === 'payment_processed' && event.metadata.paymentAmount) {
      description += ` - $${event.metadata.paymentAmount}`
    } else if (event.type === 'photos_uploaded' && event.metadata.photoCount) {
      description += ` (${event.metadata.photoCount} photos)`
    } else if (event.type === 'rescheduled' && event.metadata.rescheduleReason) {
      description += ` - Reason: ${event.metadata.rescheduleReason}`
    }
  }
  
  return description
}

// Track new history event (would call API in real implementation)
export async function trackHistoryEvent(
  appointmentId: string,
  type: HistoryEventType,
  userId: string,
  userName: string,
  description: string,
  metadata?: any
): Promise<HistoryEvent> {
  // In real implementation, this would call your API
  const newEvent: HistoryEvent = {
    id: Date.now().toString(),
    appointmentId,
    type,
    category: EVENT_CONFIG[type].category,
    timestamp: new Date(),
    userId,
    userName,
    description,
    metadata,
    isImportant: isNotificationWorthy({ type } as HistoryEvent)
  }
  
  // API call would go here
  console.log('Tracking history event:', newEvent)
  
  return newEvent
}