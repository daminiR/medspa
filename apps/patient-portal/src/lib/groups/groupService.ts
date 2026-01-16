// Group Booking Types (aligned with @medical-spa/types/group)
export type GroupPaymentMode = 'individual' | 'coordinator' | 'split';
export type GroupBookingStatus = 'pending' | 'confirmed' | 'partially_confirmed' | 'cancelled';
export type ParticipantStatus = 'invited' | 'pending' | 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface GroupBookingParticipant {
  patientId: string;
  patientName: string;
  phone?: string;
  email?: string;
  avatar?: string;
  initials?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  practitionerId: string;
  practitionerName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  appointmentId?: string;
  status: ParticipantStatus;
  paymentStatus: PaymentStatus;
  roomId?: string;
  invitedAt?: Date;
  confirmationSentAt?: Date;
  reminderSentAt?: Date;
  smsConfirmedAt?: Date;
  checkedInAt?: Date;
}

export interface GroupChatMessage {
  id: string;
  groupBookingId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  sentAt: Date;
  readBy: string[];
  isCoordinator: boolean;
  isSystemMessage?: boolean;
}

export interface GroupBooking {
  id: string;
  bookingCode: string;
  name: string;
  eventType?: 'bridal' | 'corporate' | 'friends' | 'family' | 'other';
  eventDate?: Date;
  coordinatorPatientId: string;
  coordinatorName: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;
  coordinatorAvatar?: string;
  participants: GroupBookingParticipant[];
  maxParticipants?: number;
  minParticipants: number;
  date: Date;
  schedulingMode: 'simultaneous' | 'staggered_15' | 'staggered_30' | 'custom';
  preferredTimeRange?: {
    start: string;
    end: string;
  };
  discountPercent: number;
  totalOriginalPrice: number;
  totalDiscountAmount: number;
  totalDiscountedPrice: number;
  paymentMode: GroupPaymentMode;
  paymentStatus: PaymentStatus;
  depositRequired: boolean;
  depositAmount?: number;
  depositPaid?: boolean;
  stripePaymentIntentId?: string;
  status: GroupBookingStatus;
  notes?: string;
  locationId?: string;
  locationName?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  inviteLink?: string;
  invitesSent: number;
  invitesAccepted: number;
  lastInviteSentAt?: Date;
  confirmationSentAt?: Date;
  reminderSentAt?: Date;
  messages?: GroupChatMessage[];
  lastMessageAt?: Date;
}

// Available services for group bookings
export interface AvailableService {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export const availableServices: AvailableService[] = [
  { id: 'botox', name: 'Botox', price: 350, duration: 30, description: 'Smooth wrinkles and fine lines' },
  { id: 'fillers', name: 'Dermal Fillers', price: 550, duration: 45, description: 'Add volume and contour' },
  { id: 'hydrafacial', name: 'HydraFacial', price: 200, duration: 60, description: 'Deep cleansing facial' },
  { id: 'microneedling', name: 'Microneedling', price: 350, duration: 45, description: 'Stimulate collagen production' },
  { id: 'chemical-peel', name: 'Chemical Peel', price: 150, duration: 30, description: 'Exfoliate and renew skin' },
  { id: 'lip-filler', name: 'Lip Filler', price: 450, duration: 30, description: 'Enhance lip volume' },
];

// Mock data for current patient
export const currentPatient = {
  id: 'patient-1',
  name: 'Emma Thompson',
  email: 'emma@email.com',
  phone: '(555) 123-4567',
};

// Mock group bookings data
const mockGroupBookings: GroupBooking[] = [
  {
    id: 'group-1',
    bookingCode: 'SARAH2',
    name: "Sarah's Bridal Party",
    eventType: 'bridal',
    eventDate: new Date('2025-01-15'),
    coordinatorPatientId: 'patient-2',
    coordinatorName: 'Sarah Johnson',
    coordinatorPhone: '(555) 234-5678',
    coordinatorEmail: 'sarah@email.com',
    participants: [
      {
        patientId: 'patient-2',
        patientName: 'Sarah Johnson',
        phone: '(555) 234-5678',
        email: 'sarah@email.com',
        serviceId: 'hydrafacial',
        serviceName: 'HydraFacial',
        servicePrice: 200,
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Smith',
        startTime: new Date('2025-01-15T10:00:00'),
        endTime: new Date('2025-01-15T11:00:00'),
        duration: 60,
        status: 'confirmed',
        paymentStatus: 'paid',
      },
      {
        patientId: 'patient-1',
        patientName: 'Emma Thompson',
        phone: '(555) 123-4567',
        email: 'emma@email.com',
        serviceId: 'hydrafacial',
        serviceName: 'HydraFacial',
        servicePrice: 200,
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Smith',
        startTime: new Date('2025-01-15T11:00:00'),
        endTime: new Date('2025-01-15T12:00:00'),
        duration: 60,
        status: 'confirmed',
        paymentStatus: 'pending',
      },
      {
        patientId: 'patient-3',
        patientName: 'Jessica Miller',
        phone: '(555) 345-6789',
        email: 'jess@email.com',
        serviceId: 'botox',
        serviceName: 'Botox',
        servicePrice: 350,
        practitionerId: 'prac-2',
        practitionerName: 'Dr. Chen',
        startTime: new Date('2025-01-15T10:30:00'),
        endTime: new Date('2025-01-15T11:00:00'),
        duration: 30,
        status: 'confirmed',
        paymentStatus: 'paid',
      },
      {
        patientId: 'patient-4',
        patientName: 'Amanda White',
        phone: '(555) 456-7890',
        email: 'amanda@email.com',
        serviceId: 'lip-filler',
        serviceName: 'Lip Filler',
        servicePrice: 450,
        practitionerId: 'prac-2',
        practitionerName: 'Dr. Chen',
        startTime: new Date('2025-01-15T11:00:00'),
        endTime: new Date('2025-01-15T11:30:00'),
        duration: 30,
        status: 'pending',
        paymentStatus: 'pending',
      },
      {
        patientId: 'patient-5',
        patientName: 'Rachel Green',
        phone: '(555) 567-8901',
        email: 'rachel@email.com',
        serviceId: 'hydrafacial',
        serviceName: 'HydraFacial',
        servicePrice: 200,
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Smith',
        startTime: new Date('2025-01-15T12:00:00'),
        endTime: new Date('2025-01-15T13:00:00'),
        duration: 60,
        status: 'confirmed',
        paymentStatus: 'paid',
      },
    ],
    maxParticipants: 8,
    minParticipants: 2,
    date: new Date('2025-01-15'),
    schedulingMode: 'staggered_30',
    preferredTimeRange: { start: '10:00 AM', end: '2:00 PM' },
    discountPercent: 5,
    totalOriginalPrice: 1400,
    totalDiscountAmount: 70,
    totalDiscountedPrice: 1330,
    paymentMode: 'individual',
    paymentStatus: 'pending',
    depositRequired: false,
    status: 'confirmed',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-10'),
    invitesSent: 6,
    invitesAccepted: 5,
    messages: [
      {
        id: 'msg-1',
        groupBookingId: 'group-1',
        senderId: 'patient-2',
        senderName: 'Sarah Johnson',
        message: 'Hey everyone! So excited for the spa day!',
        sentAt: new Date('2025-01-10T14:30:00'),
        readBy: ['patient-2', 'patient-1', 'patient-3'],
        isCoordinator: true,
      },
      {
        id: 'msg-2',
        groupBookingId: 'group-1',
        senderId: 'patient-1',
        senderName: 'Emma Thompson',
        message: 'Cannot wait! Should we get lunch after?',
        sentAt: new Date('2025-01-10T15:00:00'),
        readBy: ['patient-2', 'patient-1'],
        isCoordinator: false,
      },
      {
        id: 'msg-3',
        groupBookingId: 'group-1',
        senderId: 'patient-3',
        senderName: 'Jessica Miller',
        message: 'Yes! Great idea!',
        sentAt: new Date('2025-01-10T15:15:00'),
        readBy: ['patient-2', 'patient-1', 'patient-3'],
        isCoordinator: false,
      },
    ],
    lastMessageAt: new Date('2025-01-10T15:15:00'),
  },
  {
    id: 'group-2',
    bookingCode: 'EMMA01',
    name: "Emma's Birthday Celebration",
    eventType: 'friends',
    eventDate: new Date('2025-02-20'),
    coordinatorPatientId: 'patient-1',
    coordinatorName: 'Emma Thompson',
    coordinatorPhone: '(555) 123-4567',
    coordinatorEmail: 'emma@email.com',
    participants: [
      {
        patientId: 'patient-1',
        patientName: 'Emma Thompson',
        phone: '(555) 123-4567',
        email: 'emma@email.com',
        serviceId: 'fillers',
        serviceName: 'Dermal Fillers',
        servicePrice: 550,
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Smith',
        startTime: new Date('2025-02-20T14:00:00'),
        endTime: new Date('2025-02-20T14:45:00'),
        duration: 45,
        status: 'confirmed',
        paymentStatus: 'paid',
      },
      {
        patientId: 'patient-6',
        patientName: 'Lisa Brown',
        phone: '(555) 678-9012',
        email: 'lisa@email.com',
        serviceId: 'botox',
        serviceName: 'Botox',
        servicePrice: 350,
        practitionerId: 'prac-2',
        practitionerName: 'Dr. Chen',
        startTime: new Date('2025-02-20T14:00:00'),
        endTime: new Date('2025-02-20T14:30:00'),
        duration: 30,
        status: 'confirmed',
        paymentStatus: 'pending',
      },
    ],
    maxParticipants: 6,
    minParticipants: 2,
    date: new Date('2025-02-20'),
    schedulingMode: 'simultaneous',
    preferredTimeRange: { start: '2:00 PM', end: '5:00 PM' },
    discountPercent: 0,
    totalOriginalPrice: 900,
    totalDiscountAmount: 0,
    totalDiscountedPrice: 900,
    paymentMode: 'coordinator',
    paymentStatus: 'pending',
    depositRequired: true,
    depositAmount: 200,
    depositPaid: true,
    status: 'pending',
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-08'),
    invitesSent: 4,
    invitesAccepted: 2,
    messages: [],
  },
  {
    id: 'group-3',
    bookingCode: 'CORP10',
    name: 'Acme Corp Team Retreat',
    eventType: 'corporate',
    eventDate: new Date('2025-03-10'),
    coordinatorPatientId: 'patient-7',
    coordinatorName: 'Michael Scott',
    coordinatorPhone: '(555) 789-0123',
    coordinatorEmail: 'michael@acme.com',
    participants: [
      {
        patientId: 'patient-7',
        patientName: 'Michael Scott',
        phone: '(555) 789-0123',
        serviceId: 'hydrafacial',
        serviceName: 'HydraFacial',
        servicePrice: 200,
        practitionerId: 'prac-1',
        practitionerName: 'Dr. Smith',
        startTime: new Date('2025-03-10T09:00:00'),
        endTime: new Date('2025-03-10T10:00:00'),
        duration: 60,
        status: 'confirmed',
        paymentStatus: 'pending',
      },
    ],
    maxParticipants: 15,
    minParticipants: 2,
    date: new Date('2025-03-10'),
    schedulingMode: 'staggered_15',
    discountPercent: 0,
    totalOriginalPrice: 200,
    totalDiscountAmount: 0,
    totalDiscountedPrice: 200,
    paymentMode: 'split',
    paymentStatus: 'pending',
    depositRequired: false,
    status: 'pending',
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-08'),
    invitesSent: 10,
    invitesAccepted: 1,
    messages: [],
  },
];

// Store for group bookings (in-memory)
let groupBookings = [...mockGroupBookings];

// Discount tiers - Updated per requirements
export const DISCOUNT_TIERS = [
  { minSize: 5, discount: 5, label: '5% off for 5+ guests' },
  { minSize: 8, discount: 10, label: '10% off for 8+ guests' },
  { minSize: 12, discount: 15, label: '15% off for 12+ guests' },
  { minSize: 20, discount: 20, label: '20% off for 20+ guests' },
];

export function calculateDiscount(groupSize: number): number {
  let discount = 0;
  for (const tier of DISCOUNT_TIERS) {
    if (groupSize >= tier.minSize) {
      discount = tier.discount;
    }
  }
  return discount;
}

export function getDiscountLabel(groupSize: number): string {
  for (let i = DISCOUNT_TIERS.length - 1; i >= 0; i--) {
    if (groupSize >= DISCOUNT_TIERS[i].minSize) {
      return DISCOUNT_TIERS[i].label;
    }
  }
  return 'Add more guests to unlock discounts';
}

export function getNextDiscountTier(groupSize: number): { needed: number; discount: number } | null {
  for (const tier of DISCOUNT_TIERS) {
    if (groupSize < tier.minSize) {
      return { needed: tier.minSize - groupSize, discount: tier.discount };
    }
  }
  return null;
}

export function getPatientGroupBookings(patientId: string): GroupBooking[] {
  return groupBookings.filter(
    (group) =>
      group.coordinatorPatientId === patientId ||
      group.participants.some((p) => p.patientId === patientId)
  );
}

export function getGroupBookingById(groupId: string): GroupBooking | null {
  return groupBookings.find((g) => g.id === groupId) || null;
}

export function getGroupByCode(code: string): GroupBooking | null {
  return groupBookings.find((g) => g.bookingCode.toLowerCase() === code.toLowerCase()) || null;
}

export function isPatientInGroup(groupId: string, patientId: string): boolean {
  const group = getGroupBookingById(groupId);
  if (!group) return false;
  return group.participants.some((p) => p.patientId === patientId);
}

export function joinGroup(
  bookingCode: string,
  patientId: string,
  patientName: string,
  patientEmail: string,
  patientPhone: string,
  serviceId: string,
  specialRequests?: string
): { success: boolean; error?: string; group?: GroupBooking } {
  const group = getGroupByCode(bookingCode);

  if (!group) {
    return { success: false, error: 'Invalid booking code. Please check and try again.' };
  }

  if (group.status === 'cancelled') {
    return { success: false, error: 'This group booking has been cancelled.' };
  }

  if (isPatientInGroup(group.id, patientId)) {
    return { success: false, error: 'You are already part of this group.' };
  }

  if (group.maxParticipants && group.participants.length >= group.maxParticipants) {
    return { success: false, error: 'This group is full. Please contact the coordinator.' };
  }

  const service = availableServices.find((s) => s.id === serviceId);
  if (!service) {
    return { success: false, error: 'Invalid service selected.' };
  }

  const lastParticipant = group.participants[group.participants.length - 1];
  let startTime: Date;
  if (group.schedulingMode === 'simultaneous') {
    startTime = new Date(group.participants[0]?.startTime || group.date);
  } else {
    startTime = lastParticipant
      ? new Date(lastParticipant.endTime)
      : new Date(group.date);
  }
  const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);

  const newParticipant: GroupBookingParticipant = {
    patientId,
    patientName,
    phone: patientPhone,
    email: patientEmail,
    serviceId: service.id,
    serviceName: service.name,
    servicePrice: service.price,
    practitionerId: 'prac-1',
    practitionerName: 'Dr. Smith',
    startTime,
    endTime,
    duration: service.duration,
    status: 'pending',
    paymentStatus: 'pending',
    invitedAt: new Date(),
  };

  const groupIndex = groupBookings.findIndex((g) => g.id === group.id);
  if (groupIndex === -1) return { success: false, error: 'Group not found.' };

  const updatedParticipants = [...group.participants, newParticipant];
  const newDiscount = calculateDiscount(updatedParticipants.length);
  const totalOriginal = updatedParticipants.reduce((sum, p) => sum + p.servicePrice, 0);
  const discountAmount = Math.round(totalOriginal * (newDiscount / 100));

  const updatedGroup: GroupBooking = {
    ...group,
    participants: updatedParticipants,
    discountPercent: newDiscount,
    totalOriginalPrice: totalOriginal,
    totalDiscountAmount: discountAmount,
    totalDiscountedPrice: totalOriginal - discountAmount,
    invitesAccepted: group.invitesAccepted + 1,
    updatedAt: new Date(),
  };

  groupBookings[groupIndex] = updatedGroup;

  return { success: true, group: updatedGroup };
}

export function leaveGroup(
  groupId: string,
  patientId: string
): { success: boolean; error?: string } {
  const group = getGroupBookingById(groupId);

  if (!group) {
    return { success: false, error: 'Group not found.' };
  }

  if (group.coordinatorPatientId === patientId) {
    return { success: false, error: 'Coordinators cannot leave their own group. You can cancel the group instead.' };
  }

  if (!isPatientInGroup(groupId, patientId)) {
    return { success: false, error: 'You are not part of this group.' };
  }

  const groupIndex = groupBookings.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) return { success: false, error: 'Group not found.' };

  const updatedParticipants = group.participants.filter((p) => p.patientId !== patientId);
  const newDiscount = calculateDiscount(updatedParticipants.length);
  const totalOriginal = updatedParticipants.reduce((sum, p) => sum + p.servicePrice, 0);
  const discountAmount = Math.round(totalOriginal * (newDiscount / 100));

  groupBookings[groupIndex] = {
    ...group,
    participants: updatedParticipants,
    discountPercent: newDiscount,
    totalOriginalPrice: totalOriginal,
    totalDiscountAmount: discountAmount,
    totalDiscountedPrice: totalOriginal - discountAmount,
    updatedAt: new Date(),
  };

  return { success: true };
}

export function sendGroupMessage(
  groupId: string,
  senderId: string,
  senderName: string,
  message: string
): { success: boolean; error?: string; message?: GroupChatMessage } {
  const group = getGroupBookingById(groupId);

  if (!group) {
    return { success: false, error: 'Group not found.' };
  }

  if (!isPatientInGroup(groupId, senderId)) {
    return { success: false, error: 'You must be a participant to send messages.' };
  }

  const isCoordinator = group.coordinatorPatientId === senderId;

  const newMessage: GroupChatMessage = {
    id: 'msg-' + String(Date.now()),
    groupBookingId: groupId,
    senderId,
    senderName,
    message,
    sentAt: new Date(),
    readBy: [senderId],
    isCoordinator,
  };

  const groupIndex = groupBookings.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) return { success: false, error: 'Group not found.' };

  const currentMessages = groupBookings[groupIndex].messages || [];
  groupBookings[groupIndex] = {
    ...groupBookings[groupIndex],
    messages: [...currentMessages, newMessage],
    lastMessageAt: new Date(),
  };

  return { success: true, message: newMessage };
}

export function getPaymentModeLabel(mode: GroupPaymentMode): string {
  switch (mode) {
    case 'individual':
      return 'Each person pays individually';
    case 'coordinator':
      return 'Coordinator pays for everyone';
    case 'split':
      return 'Cost split evenly among all';
    default:
      return 'Individual payment';
  }
}

export function getStatusStyles(status: ParticipantStatus | string): { bg: string; text: string } {
  switch (status) {
    case 'confirmed':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'arrived':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'completed':
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    case 'cancelled':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'no_show':
      return { bg: 'bg-orange-100', text: 'text-orange-700' };
    case 'invited':
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
