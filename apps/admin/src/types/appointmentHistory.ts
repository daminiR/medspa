// Appointment History Types

export type HistoryEventType = 
  | 'created'
  | 'modified'
  | 'cancelled'
  | 'no_show'
  | 'completed'
  | 'rescheduled'
  | 'reminder_sent'
  | 'confirmation_sent'
  | 'intake_form_sent'
  | 'intake_form_completed'
  | 'consent_signed'
  | 'payment_processed'
  | 'payment_failed'
  | 'note_added'
  | 'photos_uploaded'
  | 'treatment_plan_created'
  | 'follow_up_scheduled'

export type HistoryEventCategory = 
  | 'appointment'
  | 'communication'
  | 'documentation'
  | 'payment'
  | 'clinical'

export interface HistoryEvent {
  id: string
  appointmentId: string
  type: HistoryEventType
  category: HistoryEventCategory
  timestamp: Date
  userId: string // Who performed the action
  userName: string
  description: string
  metadata?: {
    previousValue?: any
    newValue?: any
    formId?: string
    formName?: string
    emailId?: string
    smsId?: string
    paymentAmount?: number
    paymentMethod?: string
    photoCount?: number
    notePreview?: string
    rescheduleReason?: string
    cancellationReason?: string
  }
  isImportant?: boolean
}

export interface AppointmentHistoryState {
  events: HistoryEvent[]
  isLoading: boolean
  filter: {
    categories: HistoryEventCategory[]
    dateRange?: {
      start: Date
      end: Date
    }
    searchTerm?: string
  }
}

// Event configuration for UI
export const EVENT_CONFIG: Record<HistoryEventType, {
  label: string
  icon: string
  color: string
  category: HistoryEventCategory
}> = {
  created: {
    label: 'Appointment Created',
    icon: 'Calendar',
    color: 'green',
    category: 'appointment'
  },
  modified: {
    label: 'Details Updated',
    icon: 'Edit',
    color: 'blue',
    category: 'appointment'
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'XCircle',
    color: 'red',
    category: 'appointment'
  },
  no_show: {
    label: 'No Show',
    icon: 'UserX',
    color: 'orange',
    category: 'appointment'
  },
  completed: {
    label: 'Completed',
    icon: 'CheckCircle',
    color: 'green',
    category: 'appointment'
  },
  rescheduled: {
    label: 'Rescheduled',
    icon: 'Clock',
    color: 'yellow',
    category: 'appointment'
  },
  reminder_sent: {
    label: 'Reminder Sent',
    icon: 'Bell',
    color: 'blue',
    category: 'communication'
  },
  confirmation_sent: {
    label: 'Confirmation Sent',
    icon: 'Mail',
    color: 'blue',
    category: 'communication'
  },
  intake_form_sent: {
    label: 'Intake Form Sent',
    icon: 'FileText',
    color: 'purple',
    category: 'documentation'
  },
  intake_form_completed: {
    label: 'Intake Form Completed',
    icon: 'FileCheck',
    color: 'green',
    category: 'documentation'
  },
  consent_signed: {
    label: 'Consent Signed',
    icon: 'Shield',
    color: 'green',
    category: 'documentation'
  },
  payment_processed: {
    label: 'Payment Processed',
    icon: 'DollarSign',
    color: 'green',
    category: 'payment'
  },
  payment_failed: {
    label: 'Payment Failed',
    icon: 'AlertCircle',
    color: 'red',
    category: 'payment'
  },
  note_added: {
    label: 'Note Added',
    icon: 'MessageSquare',
    color: 'gray',
    category: 'clinical'
  },
  photos_uploaded: {
    label: 'Photos Uploaded',
    icon: 'Camera',
    color: 'purple',
    category: 'clinical'
  },
  treatment_plan_created: {
    label: 'Treatment Plan Created',
    icon: 'Clipboard',
    color: 'indigo',
    category: 'clinical'
  },
  follow_up_scheduled: {
    label: 'Follow-up Scheduled',
    icon: 'CalendarPlus',
    color: 'blue',
    category: 'appointment'
  }
}

// Helper to get category config
export const CATEGORY_CONFIG: Record<HistoryEventCategory, {
  label: string
  color: string
}> = {
  appointment: { label: 'Appointment', color: 'blue' },
  communication: { label: 'Communication', color: 'green' },
  documentation: { label: 'Documentation', color: 'purple' },
  payment: { label: 'Payment', color: 'yellow' },
  clinical: { label: 'Clinical', color: 'pink' }
}