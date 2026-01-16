/**
 * Group Booking Service
 * Handles all group booking API calls and business logic
 */

import {
  GroupBooking,
  GroupBookingParticipant,
  CreateGroupBookingRequest,
  JoinGroupBookingRequest,
  UpdateGroupBookingRequest,
  AddParticipantRequest,
  RemoveParticipantRequest,
  SendGroupInviteRequest,
  RescheduleGroupRequest,
  GroupChatMessageRequest,
  GroupChatMessage,
  GroupBookingActivity,
  calculateGroupDiscount,
  generateBookingCode,
  getParticipantInitials,
} from '@medical-spa/types';

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

const MOCK_GROUPS: GroupBooking[] = [
  {
    id: 'group-1',
    bookingCode: 'SARAH2',
    name: "Sarah's Bridal Party",
    eventType: 'bridal',
    eventDate: new Date('2025-12-20'),
    coordinatorPatientId: 'p1',
    coordinatorName: 'Sarah Johnson',
    coordinatorPhone: '(555) 123-4567',
    coordinatorEmail: 'sarah.j@email.com',
    participants: [
      {
        patientId: 'p1',
        patientName: 'Sarah Johnson',
        phone: '(555) 123-4567',
        email: 'sarah.j@email.com',
        initials: 'SJ',
        serviceId: 's3',
        serviceName: 'Bridal Makeup',
        servicePrice: 450,
        practitionerId: 'pr1',
        practitionerName: 'Dr. Sarah Chen',
        startTime: new Date('2025-12-20T09:00:00'),
        endTime: new Date('2025-12-20T10:30:00'),
        duration: 90,
        status: 'confirmed',
        paymentStatus: 'paid',
      },
      {
        patientId: 'p2',
        patientName: 'Emily Rodriguez',
        phone: '(555) 234-5678',
        email: 'emily.r@email.com',
        initials: 'ER',
        serviceId: 's3',
        serviceName: 'Bridal Makeup',
        servicePrice: 450,
        practitionerId: 'pr1',
        practitionerName: 'Dr. Sarah Chen',
        startTime: new Date('2025-12-20T10:30:00'),
        endTime: new Date('2025-12-20T12:00:00'),
        duration: 90,
        status: 'confirmed',
        paymentStatus: 'pending',
      },
      {
        patientId: 'p3',
        patientName: 'Jessica Martinez',
        phone: '(555) 345-6789',
        initials: 'JM',
        serviceId: 's3',
        serviceName: 'Bridal Makeup',
        servicePrice: 450,
        practitionerId: 'pr1',
        practitionerName: 'Dr. Sarah Chen',
        startTime: new Date('2025-12-20T12:00:00'),
        endTime: new Date('2025-12-20T13:30:00'),
        duration: 90,
        status: 'pending',
        paymentStatus: 'pending',
      },
    ],
    maxParticipants: 8,
    minParticipants: 2,
    date: new Date('2025-12-20'),
    schedulingMode: 'staggered_30',
    discountPercent: 10,
    totalOriginalPrice: 1350,
    totalDiscountAmount: 135,
    totalDiscountedPrice: 1215,
    paymentMode: 'coordinator',
    paymentStatus: 'pending',
    depositRequired: true,
    depositAmount: 243,
    depositPaid: false,
    status: 'partially_confirmed',
    invitesSent: 5,
    invitesAccepted: 2,
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-05'),
    activities: [],
    messages: [],
  },
];

// ============================================================================
// API SERVICE
// ============================================================================

class GroupBookingService {
  private baseUrl = '/api/groups';
  private mockMode = true;

  async createGroupBooking(request: CreateGroupBookingRequest): Promise<GroupBooking> {
    if (this.mockMode) {
      await this.delay(1000);
      const bookingCode = generateBookingCode(request.coordinatorPatientId);
      const discount = calculateGroupDiscount(request.participants.length);
      const totalOriginalPrice = request.participants.reduce((sum, p) => sum + 450, 0);

      const newGroup: GroupBooking = {
        id: 'group-' + Date.now(),
        bookingCode,
        name: request.name,
        eventType: request.eventType,
        eventDate: request.eventDate,
        coordinatorPatientId: request.coordinatorPatientId,
        coordinatorName: 'Current User',
        coordinatorPhone: '',
        coordinatorEmail: '',
        participants: request.participants.map((p, index) => ({
          patientId: p.patientId,
          patientName: 'Participant ' + (index + 1),
          serviceId: p.serviceId,
          serviceName: 'Service Name',
          servicePrice: 450,
          practitionerId: p.practitionerId || 'pr1',
          practitionerName: 'Provider Name',
          startTime: p.startTime || request.date,
          endTime: new Date((p.startTime || request.date).getTime() + 90 * 60000),
          duration: 90,
          status: 'pending',
          paymentStatus: 'pending',
          initials: getParticipantInitials('Participant ' + (index + 1)),
        })),
        maxParticipants: request.maxParticipants,
        minParticipants: 2,
        date: request.date,
        schedulingMode: request.schedulingMode,
        preferredTimeRange: request.preferredTimeRange,
        discountPercent: discount,
        totalOriginalPrice,
        totalDiscountAmount: (totalOriginalPrice * discount) / 100,
        totalDiscountedPrice: totalOriginalPrice - (totalOriginalPrice * discount) / 100,
        paymentMode: request.paymentMode,
        paymentStatus: 'pending',
        depositRequired: request.depositRequired,
        status: 'pending',
        invitesSent: 0,
        invitesAccepted: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        locationId: request.locationId,
        notes: request.notes,
        activities: [],
        messages: [],
      };

      MOCK_GROUPS.push(newGroup);
      return newGroup;
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error('Failed to create group booking');
    return response.json();
  }

  async getGroupBooking(groupId: string): Promise<GroupBooking | null> {
    if (this.mockMode) {
      await this.delay(500);
      return MOCK_GROUPS.find(g => g.id === groupId) || null;
    }

    const response = await fetch(this.baseUrl + '/' + groupId);
    if (!response.ok) return null;
    return response.json();
  }

  async getGroupBookingByCode(code: string): Promise<GroupBooking | null> {
    if (this.mockMode) {
      await this.delay(500);
      return MOCK_GROUPS.find(g => g.bookingCode === code.toUpperCase()) || null;
    }

    const response = await fetch(this.baseUrl + '/code/' + code);
    if (!response.ok) return null;
    return response.json();
  }

  async getMyGroups(patientId: string): Promise<GroupBooking[]> {
    if (this.mockMode) {
      await this.delay(500);
      return MOCK_GROUPS.filter(
        g =>
          g.coordinatorPatientId === patientId ||
          g.participants.some(p => p.patientId === patientId)
      );
    }

    const response = await fetch(this.baseUrl + '/my-groups/' + patientId);
    if (!response.ok) return [];
    return response.json();
  }

  async joinGroupBooking(request: JoinGroupBookingRequest): Promise<GroupBooking> {
    if (this.mockMode) {
      await this.delay(1000);
      const group = MOCK_GROUPS.find(g => g.bookingCode === request.bookingCode.toUpperCase());
      if (!group) throw new Error('Group not found');

      const newParticipant: GroupBookingParticipant = {
        patientId: request.patientId,
        patientName: 'New Member',
        serviceId: request.serviceId,
        serviceName: 'Service Name',
        servicePrice: 450,
        practitionerId: request.practitionerId || 'pr1',
        practitionerName: 'Provider Name',
        startTime: request.preferredTime || group.date,
        endTime: new Date((request.preferredTime || group.date).getTime() + 90 * 60000),
        duration: 90,
        status: 'pending',
        paymentStatus: 'pending',
        initials: getParticipantInitials('New Member'),
      };

      group.participants.push(newParticipant);
      group.invitesAccepted += 1;

      const discount = calculateGroupDiscount(group.participants.length);
      group.discountPercent = discount;
      group.totalOriginalPrice = group.participants.reduce((sum, p) => sum + p.servicePrice, 0);
      group.totalDiscountAmount = (group.totalOriginalPrice * discount) / 100;
      group.totalDiscountedPrice = group.totalOriginalPrice - group.totalDiscountAmount;
      group.updatedAt = new Date();

      return group;
    }

    const response = await fetch(this.baseUrl + '/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error('Failed to join group');
    return response.json();
  }

  async sendGroupInvites(request: SendGroupInviteRequest): Promise<void> {
    if (this.mockMode) {
      await this.delay(1000);
      const group = MOCK_GROUPS.find(g => g.id === request.groupBookingId);
      if (group) {
        group.invitesSent += request.recipients.length;
        group.lastInviteSentAt = new Date();
        group.updatedAt = new Date();
      }
      return;
    }

    const response = await fetch(this.baseUrl + '/' + request.groupBookingId + '/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error('Failed to send invites');
  }

  getInviteLink(bookingCode: string): string {
    return 'https://app.medspa.com/group/' + bookingCode;
  }

  async sendChatMessage(request: GroupChatMessageRequest): Promise<GroupChatMessage> {
    if (this.mockMode) {
      await this.delay(300);
      const group = MOCK_GROUPS.find(g => g.id === request.groupBookingId);

      const message: GroupChatMessage = {
        id: 'msg-' + Date.now(),
        groupBookingId: request.groupBookingId,
        senderId: request.senderId,
        senderName: 'Current User',
        message: request.message,
        sentAt: new Date(),
        readBy: [request.senderId],
        isCoordinator: group?.coordinatorPatientId === request.senderId,
      };

      if (group) {
        group.messages = [...(group.messages || []), message];
        group.lastMessageAt = new Date();
      }

      return message;
    }

    const response = await fetch(this.baseUrl + '/' + request.groupBookingId + '/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  }

  async getChatMessages(groupId: string): Promise<GroupChatMessage[]> {
    if (this.mockMode) {
      await this.delay(300);
      const group = MOCK_GROUPS.find(g => g.id === groupId);
      return group?.messages || [];
    }

    const response = await fetch(this.baseUrl + '/' + groupId + '/messages');
    if (!response.ok) return [];
    return response.json();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const groupService = new GroupBookingService();
export default groupService;
