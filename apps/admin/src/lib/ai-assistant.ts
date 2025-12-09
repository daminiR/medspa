import { sendSMS, smsTemplates } from './twilio'

// AI Assistant Configuration
export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'local'
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

// Conversation Context
export interface ConversationContext {
  patientId: string
  conversationId: string
  messages: Message[]
  patientInfo: PatientInfo
  appointmentHistory: Appointment[]
  currentIntent?: Intent
  suggestedActions?: Action[]
  metadata?: Record<string, any>
}

export interface Message {
  id: string
  role: 'patient' | 'assistant' | 'staff'
  content: string
  timestamp: Date
  channel: 'sms' | 'email' | 'portal'
  metadata?: {
    sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent'
    intent?: Intent
    entities?: Entity[]
  }
}

export interface PatientInfo {
  id: string
  name: string
  phone: string
  email?: string
  preferredChannel: 'sms' | 'email' | 'both'
  lastAppointment?: Appointment
  nextAppointment?: Appointment
  treatments: string[]
  allergies?: string[]
  notes?: string
  vipStatus?: boolean
  credits?: number
  packages?: Package[]
}

export interface Appointment {
  id: string
  date: Date
  service: string
  provider: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'no-show' | 'cancelled'
  notes?: string
}

export interface Package {
  id: string
  name: string
  sessionsRemaining: number
  expiryDate: Date
}

// Intent Detection
export interface Intent {
  type: IntentType
  confidence: number
  parameters?: Record<string, any>
  suggestedResponse?: string
  requiresHumanReview?: boolean
}

export enum IntentType {
  // Appointment Related
  BOOK_APPOINTMENT = 'book_appointment',
  RESCHEDULE_APPOINTMENT = 'reschedule_appointment',
  CANCEL_APPOINTMENT = 'cancel_appointment',
  CONFIRM_APPOINTMENT = 'confirm_appointment',
  CHECK_AVAILABILITY = 'check_availability',
  
  // Information Requests
  PRICING_INQUIRY = 'pricing_inquiry',
  SERVICE_INFO = 'service_info',
  HOURS_LOCATION = 'hours_location',
  
  // Post-Treatment
  POST_TREATMENT_CONCERN = 'post_treatment_concern',
  SIDE_EFFECT_REPORT = 'side_effect_report',
  AFTERCARE_QUESTION = 'aftercare_question',
  
  // Administrative
  INSURANCE_QUESTION = 'insurance_question',
  PAYMENT_INQUIRY = 'payment_inquiry',
  PACKAGE_STATUS = 'package_status',
  
  // General
  GREETING = 'greeting',
  THANK_YOU = 'thank_you',
  COMPLAINT = 'complaint',
  EMERGENCY = 'emergency',
  UNKNOWN = 'unknown'
}

// Entity Extraction
export interface Entity {
  type: 'date' | 'time' | 'service' | 'provider' | 'symptom' | 'body_part'
  value: string
  confidence: number
}

// Suggested Actions for Staff
export interface Action {
  type: ActionType
  label: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  automatable: boolean
  handler?: () => Promise<void>
}

export enum ActionType {
  SEND_MESSAGE = 'send_message',
  SCHEDULE_APPOINTMENT = 'schedule_appointment',
  CALL_PATIENT = 'call_patient',
  ESCALATE_TO_PROVIDER = 'escalate_to_provider',
  SEND_AFTERCARE = 'send_aftercare',
  APPLY_CREDIT = 'apply_credit',
  UPDATE_NOTES = 'update_notes',
  FLAG_FOR_REVIEW = 'flag_for_review'
}

// AI Assistant Core
export class MedicalSpaAIAssistant {
  private config: AIConfig
  private conversationCache: Map<string, ConversationContext> = new Map()

  constructor(config: AIConfig) {
    this.config = config
  }

  /**
   * Process incoming message and generate AI-powered suggestions
   */
  async processMessage(
    message: string,
    patientId: string,
    channel: 'sms' | 'email' | 'portal' = 'sms'
  ): Promise<{
    intent: Intent
    suggestedResponses: string[]
    suggestedActions: Action[]
    requiresHuman: boolean
    urgency: 'high' | 'medium' | 'low'
  }> {
    // Get or create conversation context
    const context = await this.getConversationContext(patientId)
    
    // Detect intent
    const intent = await this.detectIntent(message, context)
    
    // Generate suggested responses
    const suggestedResponses = await this.generateResponses(intent, context)
    
    // Determine suggested actions
    const suggestedActions = await this.determineSuggestedActions(intent, context)
    
    // Check if human intervention required
    const requiresHuman = this.requiresHumanIntervention(intent, message)
    
    // Determine urgency
    const urgency = this.determineUrgency(intent, message)
    
    // Update conversation context
    context.messages.push({
      id: Date.now().toString(),
      role: 'patient',
      content: message,
      timestamp: new Date(),
      channel,
      metadata: { intent }
    })
    context.currentIntent = intent
    context.suggestedActions = suggestedActions
    
    return {
      intent,
      suggestedResponses,
      suggestedActions,
      requiresHuman,
      urgency
    }
  }

  /**
   * Detect intent from message using AI or rule-based system
   */
  private async detectIntent(message: string, context: ConversationContext): Promise<Intent> {
    const lowerMessage = message.toLowerCase()
    
    // Emergency detection (highest priority)
    if (this.containsEmergencyKeywords(lowerMessage)) {
      return {
        type: IntentType.EMERGENCY,
        confidence: 1.0,
        requiresHumanReview: true
      }
    }
    
    // Appointment confirmations
    if (lowerMessage.match(/^(c|confirm|yes|y)$/)) {
      return {
        type: IntentType.CONFIRM_APPOINTMENT,
        confidence: 0.95
      }
    }
    
    // Rescheduling
    if (lowerMessage.match(/^(r|reschedule|change)$/) || 
        lowerMessage.includes('reschedule') || 
        lowerMessage.includes('change') && lowerMessage.includes('appointment')) {
      return {
        type: IntentType.RESCHEDULE_APPOINTMENT,
        confidence: 0.9
      }
    }
    
    // Cancellation
    if (lowerMessage.includes('cancel')) {
      return {
        type: IntentType.CANCEL_APPOINTMENT,
        confidence: 0.9
      }
    }
    
    // Booking
    if (lowerMessage.includes('book') || 
        lowerMessage.includes('schedule') || 
        lowerMessage.includes('appointment')) {
      return {
        type: IntentType.BOOK_APPOINTMENT,
        confidence: 0.85
      }
    }
    
    // Post-treatment concerns
    if (context.patientInfo.lastAppointment && 
        this.isWithin24Hours(context.patientInfo.lastAppointment.date) &&
        (lowerMessage.includes('hurt') || 
         lowerMessage.includes('pain') || 
         lowerMessage.includes('swell') || 
         lowerMessage.includes('bruise'))) {
      return {
        type: IntentType.POST_TREATMENT_CONCERN,
        confidence: 0.9,
        requiresHumanReview: true
      }
    }
    
    // Pricing
    if (lowerMessage.includes('cost') || 
        lowerMessage.includes('price') || 
        lowerMessage.includes('how much')) {
      return {
        type: IntentType.PRICING_INQUIRY,
        confidence: 0.85
      }
    }
    
    // Service information
    if (lowerMessage.includes('botox') || 
        lowerMessage.includes('filler') || 
        lowerMessage.includes('laser') ||
        lowerMessage.includes('what is')) {
      return {
        type: IntentType.SERVICE_INFO,
        confidence: 0.8
      }
    }
    
    // Default to unknown with AI processing needed
    return {
      type: IntentType.UNKNOWN,
      confidence: 0.3,
      requiresHumanReview: true
    }
  }

  /**
   * Generate AI-powered response suggestions
   */
  private async generateResponses(intent: Intent, context: ConversationContext): Promise<string[]> {
    const responses: string[] = []
    const patientName = context.patientInfo.name.split(' ')[0]
    
    switch (intent.type) {
      case IntentType.CONFIRM_APPOINTMENT:
        if (context.patientInfo.nextAppointment) {
          responses.push(`Perfect! Your ${context.patientInfo.nextAppointment.service} appointment is confirmed for ${format(context.patientInfo.nextAppointment.date, 'EEEE, MMMM d at h:mm a')}. See you then!`)
          responses.push(`Thank you for confirming, ${patientName}! We'll see you on ${format(context.patientInfo.nextAppointment.date, 'M/d at h:mm a')}. Please arrive 10 minutes early.`)
        }
        break
        
      case IntentType.RESCHEDULE_APPOINTMENT:
        responses.push(`I'll help you reschedule. What date and time works best for you? You can also call us at 555-0100 or book online at [link].`)
        responses.push(`No problem! Please call us at 555-0100 to find a new time that works for you, or visit our online booking at [link].`)
        break
        
      case IntentType.POST_TREATMENT_CONCERN:
        const treatment = context.patientInfo.lastAppointment?.service || 'treatment'
        responses.push(`I understand your concern. Some discomfort after ${treatment} is normal. If symptoms worsen or you're worried, please call us immediately at 555-0100.`)
        responses.push(`Thank you for letting us know. Dr. ${context.patientInfo.lastAppointment?.provider || 'Smith'} would like to check on you. Can we call you shortly?`)
        break
        
      case IntentType.PRICING_INQUIRY:
        responses.push(`I'd be happy to discuss pricing! Our consultations are complimentary. Would you like to schedule one? Call 555-0100 or book online.`)
        responses.push(`Pricing varies by treatment and individual needs. We offer free consultations to provide accurate quotes. When would you like to come in?`)
        break
        
      case IntentType.BOOK_APPOINTMENT:
        responses.push(`I'd love to help you book an appointment! Please visit [booking link] or call us at 555-0100. What service are you interested in?`)
        responses.push(`Great! You can book online at [link] or call 555-0100. Our popular services include Botox, fillers, and laser treatments.`)
        break
        
      case IntentType.EMERGENCY:
        responses.push(`This sounds urgent. Please call us immediately at 555-0100 or if it's a medical emergency, call 911.`)
        break
        
      default:
        responses.push(`Thank you for your message. A team member will respond shortly during business hours.`)
        responses.push(`We've received your message and will get back to you soon. For immediate assistance, please call 555-0100.`)
    }
    
    return responses
  }

  /**
   * Determine suggested actions for staff
   */
  private async determineSuggestedActions(intent: Intent, context: ConversationContext): Promise<Action[]> {
    const actions: Action[] = []
    
    switch (intent.type) {
      case IntentType.EMERGENCY:
      case IntentType.POST_TREATMENT_CONCERN:
        actions.push({
          type: ActionType.CALL_PATIENT,
          label: 'Call Patient Immediately',
          priority: 'high',
          automatable: false
        })
        actions.push({
          type: ActionType.ESCALATE_TO_PROVIDER,
          label: 'Alert Provider',
          description: `Notify ${context.patientInfo.lastAppointment?.provider || 'on-call provider'}`,
          priority: 'high',
          automatable: true
        })
        break
        
      case IntentType.RESCHEDULE_APPOINTMENT:
        actions.push({
          type: ActionType.SCHEDULE_APPOINTMENT,
          label: 'Open Scheduler',
          description: 'Help patient find new appointment time',
          priority: 'medium',
          automatable: false
        })
        break
        
      case IntentType.CONFIRM_APPOINTMENT:
        actions.push({
          type: ActionType.UPDATE_NOTES,
          label: 'Mark as Confirmed',
          description: 'Update appointment status',
          priority: 'low',
          automatable: true
        })
        break
        
      case IntentType.PRICING_INQUIRY:
      case IntentType.SERVICE_INFO:
        actions.push({
          type: ActionType.SEND_MESSAGE,
          label: 'Send Information',
          description: 'Share service details and pricing',
          priority: 'medium',
          automatable: true
        })
        actions.push({
          type: ActionType.SCHEDULE_APPOINTMENT,
          label: 'Offer Consultation',
          priority: 'medium',
          automatable: false
        })
        break
    }
    
    // Always include option to send custom message
    actions.push({
      type: ActionType.SEND_MESSAGE,
      label: 'Send Custom Message',
      priority: 'low',
      automatable: false
    })
    
    return actions
  }

  /**
   * Check if human intervention is required
   */
  private requiresHumanIntervention(intent: Intent, message: string): boolean {
    // Always require human for certain intents
    if ([
      IntentType.EMERGENCY,
      IntentType.POST_TREATMENT_CONCERN,
      IntentType.COMPLAINT,
      IntentType.SIDE_EFFECT_REPORT
    ].includes(intent.type)) {
      return true
    }
    
    // Require human if confidence is low
    if (intent.confidence < 0.7) {
      return true
    }
    
    // Check for sensitive keywords
    const sensitiveKeywords = ['lawsuit', 'lawyer', 'infection', 'emergency', 'bleeding', 'can\'t breathe']
    const lowerMessage = message.toLowerCase()
    if (sensitiveKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return true
    }
    
    return false
  }

  /**
   * Determine message urgency
   */
  private determineUrgency(intent: Intent, message: string): 'high' | 'medium' | 'low' {
    if (intent.type === IntentType.EMERGENCY) return 'high'
    if (intent.type === IntentType.POST_TREATMENT_CONCERN) return 'high'
    if (intent.type === IntentType.SIDE_EFFECT_REPORT) return 'high'
    if (intent.type === IntentType.COMPLAINT) return 'medium'
    if (intent.type === IntentType.RESCHEDULE_APPOINTMENT && this.isAppointmentSoon(message)) return 'medium'
    return 'low'
  }

  /**
   * Get or create conversation context
   */
  private async getConversationContext(patientId: string): Promise<ConversationContext> {
    if (this.conversationCache.has(patientId)) {
      return this.conversationCache.get(patientId)!
    }
    
    // In production, fetch from database
    const context: ConversationContext = {
      patientId,
      conversationId: `conv-${Date.now()}`,
      messages: [],
      patientInfo: await this.fetchPatientInfo(patientId),
      appointmentHistory: await this.fetchAppointmentHistory(patientId)
    }
    
    this.conversationCache.set(patientId, context)
    return context
  }

  /**
   * Fetch patient information (mock for now)
   */
  private async fetchPatientInfo(patientId: string): Promise<PatientInfo> {
    // In production, fetch from database
    return {
      id: patientId,
      name: 'Sarah Johnson',
      phone: '+15551234567',
      email: 'sarah@email.com',
      preferredChannel: 'sms',
      treatments: ['Botox', 'Filler'],
      lastAppointment: {
        id: 'apt-1',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        service: 'Botox',
        provider: 'Dr. Smith',
        status: 'completed'
      },
      nextAppointment: {
        id: 'apt-2',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        service: 'Follow-up',
        provider: 'Dr. Smith',
        status: 'scheduled'
      },
      packages: [{
        id: 'pkg-1',
        name: 'Botox Package',
        sessionsRemaining: 2,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }]
    }
  }

  /**
   * Fetch appointment history (mock for now)
   */
  private async fetchAppointmentHistory(patientId: string): Promise<Appointment[]> {
    // In production, fetch from database
    return []
  }

  // Helper methods
  private containsEmergencyKeywords(message: string): boolean {
    const emergencyKeywords = [
      'emergency', 'urgent', 'help', '911',
      'can\'t breathe', 'severe pain', 'bleeding',
      'allergic reaction', 'infection'
    ]
    return emergencyKeywords.some(keyword => message.includes(keyword))
  }

  private isWithin24Hours(date: Date): boolean {
    const hoursSince = (Date.now() - date.getTime()) / (1000 * 60 * 60)
    return hoursSince <= 24
  }

  private isAppointmentSoon(message: string): boolean {
    return message.includes('today') || message.includes('tomorrow') || message.includes('urgent')
  }
}

// Export singleton instance
export const aiAssistant = new MedicalSpaAIAssistant({
  provider: 'openai', // Can switch to 'anthropic' or 'local'
  temperature: 0.3, // Lower temperature for medical consistency
  maxTokens: 150
})

// Format date helper
function format(date: Date, formatStr: string): string {
  // Simple date formatting - in production use date-fns
  return date.toLocaleString()
}