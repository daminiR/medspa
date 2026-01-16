'use client';

import Link from 'next/link';
import { Calendar, Clock, Users, ChevronRight, Crown, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { GroupBooking } from '@/lib/groups/groupService';
import { getStatusStyles } from '@/lib/groups/groupService';

interface GroupCardProps {
  group: GroupBooking;
  currentPatientId: string;
}

export function GroupCard({ group, currentPatientId }: GroupCardProps) {
  const isCoordinator = group.coordinatorPatientId === currentPatientId;
  const participant = group.participants.find((p) => p.patientId === currentPatientId);
  const statusStyles = getStatusStyles(group.status);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEventTypeLabel = (type?: string) => {
    switch (type) {
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
  };

  const formatPrice = (price: number) => {
    return '$' + price.toFixed(0);
  };

  const formatDiscountedPrice = (price: number, discount: number) => {
    return '$' + (price * (1 - discount / 100)).toFixed(0);
  };

  return (
    <Link href={'/groups/' + group.id}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
        {isCoordinator && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 flex items-center gap-2">
            <Crown className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">You are the coordinator</span>
          </div>
        )}
        
        <CardContent className={cn('p-6', isCoordinator && 'pt-4')}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">{getEventTypeLabel(group.eventType)}</p>
                </div>
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium capitalize',
                  statusStyles.bg,
                  statusStyles.text
                )}>
                  {group.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(group.date)}</span>
                </div>
                {participant && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Your appointment: {formatTime(participant.startTime)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>
                    {group.participants.length} participant{group.participants.length !== 1 ? 's' : ''}
                    {group.maxParticipants && (
                      <span className="text-gray-400"> / {group.maxParticipants} max</span>
                    )}
                  </span>
                </div>
                {!isCoordinator && (
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-gray-400" />
                    <span>Organized by {group.coordinatorName}</span>
                  </div>
                )}
              </div>

              {group.discountPercent > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <Percent className="w-4 h-4" />
                  {group.discountPercent}% group discount applied
                </div>
              )}

              {participant && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Your service</p>
                  <p className="font-medium text-gray-900">{participant.serviceName}</p>
                  <p className="text-sm text-gray-600">
                    {formatPrice(participant.servicePrice)}
                    {group.discountPercent > 0 && (
                      <span className="text-green-600 ml-2">
                        ({formatDiscountedPrice(participant.servicePrice, group.discountPercent)} after discount)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center text-gray-400 self-center">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
