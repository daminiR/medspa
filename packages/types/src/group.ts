/**
 * Group Booking Types
 * Shared types for Group Booking functionality across mobile and web platforms
 * Aligned with admin's GroupBooking data structure
 */

// ============================================================================
// CORE GROUP TYPES
// ============================================================================

export type GroupPaymentMode = 'individual' | 'coordinator' | 'split';
export type GroupBookingStatus = 'pending' | 'confirmed' | 'partially_confirmed' | 'cancelled';
export type ParticipantStatus = 'invited' | 'pending' | 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no_show';
export type GroupPaymentStatus = 'pending' | 'paid' | 'refunded';

export interface GroupBookingParticipant {
  patientId: string;
  patientName: string;
  phone?: string;
  email?: string;
  avatar?: string;
  initials?: string;

  // Service details
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  practitionerId: string;
  practitionerName: string;

  // Timing
  startTime: Date;
  endTime: Date;
  duration: number;

  // Status
  appointmentId?: string;
  status: ParticipantStatus;
  paymentStatus: GroupPaymentStatus;
  roomId?: string;

  // Tracking
  invitedAt?: Date;
  confirmationSentAt?: Date;
  reminderSentAt?: Date;
  smsConfirmedAt?: Date;
  checkedInAt?: Date;
}

export interface GroupBooking {
  id: string;
  bookingCode: string; // 6-character code (e.g., "SARAH2")
  name: string; // e.g., "Sarah's Bridal Party"
  eventType?: 'bridal' | 'corporate' | 'friends' | 'family' | 'other';
  eventDate?: Date;

  // Coordinator
  coordinatorPatientId: string;
  coordinatorName: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;
  coordinatorAvatar?: string;

  // Participants
  participants: GroupBookingParticipant[];
  maxParticipants?: number;
  minParticipants: number; // Usually 2

  // Scheduling
  date: Date;
  schedulingMode: 'simultaneous' | 'staggered_15' | 'staggered_30' | 'custom';
  preferredTimeRange?: {
    start: string; // "9:00 AM"
    end: string; // "5:00 PM"
  };

  // Pricing
  discountPercent: number;
  totalOriginalPrice: number;
  totalDiscountAmount: number;
  totalDiscountedPrice: number;

  // Payment
  paymentMode: GroupPaymentMode;
  paymentStatus: GroupPaymentStatus;
  depositRequired: boolean;
  depositAmount?: number;
  depositPaid?: boolean;
  stripePaymentIntentId?: string;

  // Status
  status: GroupBookingStatus;

  // Metadata
  notes?: string;
  locationId?: string;
  locationName?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;

  // Invite tracking
  inviteLink?: string;
  invitesSent: number;
  invitesAccepted: number;
  lastInviteSentAt?: Date;

  // SMS tracking
  confirmationSentAt?: Date;
  reminderSentAt?: Date;

  // Activity history
  activities?: GroupBookingActivity[];

  // Chat
  messages?: GroupChatMessage[];
  lastMessageAt?: Date;
}

// ============================================================================
// ACTIVITY & CHAT
// ============================================================================

export type GroupActivityType =
  | 'created'
  | 'participant_invited'
  | 'participant_joined'
  | 'participant_confirmed'
  | 'participant_removed'
  | 'sms_sent'
  | 'checked_in'
  | 'check_in_all'
  | 'payment_updated'
  | 'rescheduled'
  | 'cancelled'
  | 'notes_updated'
  | 'status_changed';

export interface GroupBookingActivity {
  id: string;
  groupBookingId: string;
  type: GroupActivityType;
  description: string;
  performedBy: string;
  performedByName?: string;
  performedAt: Date;
  metadata?: {
    participantId?: string;
    participantName?: string;
    smsType?: string;
    oldValue?: string;
    newValue?: string;
  };
}

export interface GroupChatMessage {
  id: string;
  groupBookingId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  sentAt: Date;
  readBy: string[]; // Array of patientIds who read the message
  isCoordinator: boolean;
  isSystemMessage?: boolean;
}

// ============================================================================
// GROUP DISCOUNT TIERS
// ============================================================================

export const GROUP_DISCOUNT_TIERS = [
  { minSize: 2, maxSize: 2, discount: 5, label: '5% off for 2' },
  { minSize: 3, maxSize: 4, discount: 10, label: '10% off for 3-4' },
  { minSize: 5, maxSize: 9, discount: 15, label: '15% off for 5-9' },
  { minSize: 10, maxSize: Infinity, discount: 20, label: '20% off for 10+' },
] as const;

export function calculateGroupDiscount(groupSize: number): number {
  const tier = GROUP_DISCOUNT_TIERS.find(t => groupSize >= t.minSize && groupSize <= t.maxSize);
  return tier?.discount ?? 0;
}

export function getDiscountLabel(groupSize: number): string {
  const tier = GROUP_DISCOUNT_TIERS.find(t => groupSize >= t.minSize && groupSize <= t.maxSize);
  return tier?.label ?? 'No discount';
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateGroupBookingRequest {
  name: string;
  eventType?: GroupBooking['eventType'];
  eventDate?: Date;
  coordinatorPatientId: string;
  date: Date;
  schedulingMode: GroupBooking['schedulingMode'];
  preferredTimeRange?: GroupBooking['preferredTimeRange'];
  maxParticipants?: number;
  paymentMode: GroupPaymentMode;
  depositRequired: boolean;
  locationId?: string;
  notes?: string;

  // Initial participants (at least coordinator)
  participants: Array<{
    patientId: string;
    serviceId: string;
    practitionerId?: string;
    startTime?: Date;
  }>;
}

export interface JoinGroupBookingRequest {
  bookingCode: string;
  patientId: string;
  serviceId: string;
  practitionerId?: string;
  preferredTime?: Date;
}

export interface UpdateGroupBookingRequest {
  name?: string;
  notes?: string;
  paymentMode?: GroupPaymentMode;
  paymentStatus?: GroupPaymentStatus;
  maxParticipants?: number;
}

export interface AddParticipantRequest {
  groupBookingId: string;
  patientId: string;
  patientName: string;
  phone?: string;
  email?: string;
  serviceId: string;
  practitionerId?: string;
  startTime?: Date;
}

export interface RemoveParticipantRequest {
  groupBookingId: string;
  patientId: string;
  reason?: string;
}

export interface SendGroupInviteRequest {
  groupBookingId: string;
  recipients: Array<{
    name: string;
    phone?: string;
    email?: string;
  }>;
  message?: string;
}

export interface RescheduleGroupRequest {
  groupBookingId: string;
  newDate: Date;
  preserveTimeOffsets?: boolean;
}

export interface GroupChatMessageRequest {
  groupBookingId: string;
  senderId: string;
  message: string;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface GroupBookingStepData {
  step: 1 | 2 | 3 | 4;
  stepName: 'details' | 'services' | 'invites' | 'confirm';
  isComplete: boolean;
  canProceed: boolean;
}

export interface GroupMemberCardData {
  participant: GroupBookingParticipant;
  isCoordinator: boolean;
  canRemove: boolean;
  canEdit: boolean;
}

export interface GroupTimelineEvent {
  id: string;
  time: Date;
  participants: GroupBookingParticipant[];
  duration: number;
  room?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function generateBookingCode(coordinatorName: string): string {
  // Generate 6-character code: First name + 1 digit
  const firstName = coordinatorName.split(' ')[0].toUpperCase().slice(0, 5);
  const randomDigit = Math.floor(Math.random() * 10);
  return `${firstName}${randomDigit}`.padEnd(6, 'X').slice(0, 6);
}

export function getParticipantInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: ParticipantStatus): string {
  switch (status) {
    case 'invited':
      return '#9CA3AF'; // Gray
    case 'pending':
      return '#F59E0B'; // Yellow
    case 'confirmed':
      return '#10B981'; // Green
    case 'arrived':
      return '#3B82F6'; // Blue
    case 'completed':
      return '#8B5CF6'; // Purple
    case 'cancelled':
      return '#EF4444'; // Red
    case 'no_show':
      return '#DC2626'; // Dark Red
    default:
      return '#6B7280';
  }
}

export function getStatusLabel(status: ParticipantStatus): string {
  switch (status) {
    case 'invited':
      return 'Invited';
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'arrived':
      return 'Checked In';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'no_show':
      return 'No Show';
    default:
      return 'Unknown';
  }
}

export function formatGroupPrice(price: number): string {
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getEventTypeIcon(eventType?: GroupBooking['eventType']): string {
  switch (eventType) {
    case 'bridal':
      return 'heart-outline';
    case 'corporate':
      return 'briefcase-outline';
    case 'friends':
      return 'people-outline';
    case 'family':
      return 'home-outline';
    default:
      return 'calendar-outline';
  }
}

export function getEventTypeLabel(eventType?: GroupBooking['eventType']): string {
  switch (eventType) {
    case 'bridal':
      return 'Bridal Party';
    case 'corporate':
      return 'Corporate Event';
    case 'friends':
      return 'Friends Group';
    case 'family':
      return 'Family Event';
    default:
      return 'Group Event';
  }
}
