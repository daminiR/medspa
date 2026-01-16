'use client';

/**
 * Check-In Card Component
 * Shows on dashboard when patient has an appointment today
 */

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Stethoscope, User, Clock, CheckCircle, Zap, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WaitingRoomStatus } from '@/lib/waiting-room/types';

interface CheckInCardProps {
  appointmentId: string;
  service: string;
  provider: string;
  time: Date;
  canCheckIn: boolean;
  isCheckedIn?: boolean;
  waitingStatus?: WaitingRoomStatus;
}

export function CheckInCard({
  appointmentId,
  service,
  provider,
  time,
  canCheckIn,
  isCheckedIn = false,
  waitingStatus,
}: CheckInCardProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeUntilAppointment = () => {
    const now = new Date();
    const diffMs = time.getTime() - now.getTime();
    const diffInMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffInMinutes < 0) {
      return 'Now';
    } else if (diffInMinutes < 60) {
      return `In ${diffInMinutes} min`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const mins = diffInMinutes % 60;
      return `In ${hours}h ${mins}m`;
    }
  };

  const getStatusInfo = () => {
    if (waitingStatus === 'room_ready') {
      return {
        text: 'Room Ready!',
        icon: Zap,
        gradient: 'from-amber-500 to-orange-500',
        buttonStyle: 'bg-white/20 hover:bg-white/30',
      };
    }
    if (isCheckedIn) {
      return {
        text: 'View Status',
        icon: Timer,
        gradient: 'from-blue-500 to-indigo-500',
        buttonStyle: 'bg-white/20 hover:bg-white/30',
      };
    }
    if (canCheckIn) {
      return {
        text: 'Check In',
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-green-500',
        buttonStyle: 'bg-white/20 hover:bg-white/30',
      };
    }
    return {
      text: 'Check in soon',
      icon: Clock,
      gradient: 'from-gray-500 to-gray-600',
      buttonStyle: 'bg-white/10',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const href = isCheckedIn 
    ? `/waiting-room?appointmentId=${appointmentId}`
    : `/waiting-room/check-in/${appointmentId}`;

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className={cn('p-6 bg-gradient-to-br text-white', statusInfo.gradient)}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">
                {isCheckedIn ? 'Checked In' : "Today's Appointment"}
              </h3>
              <p className="text-white/90 text-sm font-medium">
                {getTimeUntilAppointment()}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium">{service}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium">{provider}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-white/80" />
              <span className="text-sm font-medium">{formatTime(time)}</span>
            </div>
          </div>

          {/* Action Button */}
          <Link href={href} className="block">
            <Button
              className={cn(
                'w-full justify-between text-white border-0',
                statusInfo.buttonStyle,
                (!canCheckIn && !isCheckedIn) && 'opacity-60 cursor-not-allowed'
              )}
              variant="outline"
              disabled={!canCheckIn && !isCheckedIn}
            >
              <span className="font-semibold">{statusInfo.text}</span>
              <StatusIcon className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default CheckInCard;
