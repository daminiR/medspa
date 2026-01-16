'use client';

import { Clock, Crown, CheckCircle, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GroupBookingParticipant } from '@/lib/groups/groupService';
import { getStatusStyles, getInitials } from '@/lib/groups/groupService';

interface ParticipantListProps {
  participants: GroupBookingParticipant[];
  coordinatorPatientId: string;
  currentPatientId: string;
  discountPercent: number;
}

export function ParticipantList({
  participants,
  coordinatorPatientId,
  currentPatientId,
  discountPercent,
}: ParticipantListProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatPrice = (price: number) => {
    return '$' + price.toFixed(0);
  };

  const getDiscountedPrice = (price: number) => {
    if (discountPercent > 0) {
      return price * (1 - discountPercent / 100);
    }
    return price;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'arrived':
        return 'Checked In';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no_show':
        return 'No Show';
      case 'invited':
        return 'Invited';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-3">
      {participants.map((participant, index) => {
        const isCoordinator = participant.patientId === coordinatorPatientId;
        const isCurrentUser = participant.patientId === currentPatientId;
        const statusStyles = getStatusStyles(participant.status);

        return (
          <div
            key={participant.patientId}
            className={cn(
              'p-4 rounded-lg border transition-all',
              isCurrentUser
                ? 'border-purple-200 bg-purple-50'
                : 'border-gray-200 bg-white'
            )}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                  isCoordinator
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                )}
              >
                {getInitials(participant.patientName)}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">
                    {participant.patientName}
                    {isCurrentUser && <span className="text-purple-600 ml-1">(You)</span>}
                  </span>
                  {isCoordinator && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full">
                      <Crown className="w-3 h-3" />
                      Coordinator
                    </span>
                  )}
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      statusStyles.bg,
                      statusStyles.text
                    )}
                  >
                    {getStatusLabel(participant.status)}
                  </span>
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">{participant.serviceName}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(participant.startTime)}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    {discountPercent > 0 ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">
                          {formatPrice(participant.servicePrice)}
                        </span>
                        <span className="text-green-600 font-medium">
                          {formatPrice(getDiscountedPrice(participant.servicePrice))}
                        </span>
                      </>
                    ) : (
                      formatPrice(participant.servicePrice)
                    )}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1',
                      participant.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                    )}
                  >
                    {participant.paymentStatus === 'paid' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Paid
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        Payment Pending
                      </>
                    )}
                  </span>
                </div>

                {participant.practitionerName && (
                  <p className="mt-1 text-xs text-gray-500">
                    with {participant.practitionerName}
                  </p>
                )}
              </div>

              {/* Position Number */}
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {index + 1}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
