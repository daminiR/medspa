'use client';

/**
 * Waiting Room Status Page
 * Shows patient's position in queue and estimated wait time
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  Zap,
  Stethoscope,
  User,
  HelpCircle,
  Phone,
  RotateCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QueuePosition, EstimatedWait } from '@/components/waiting-room';
import { checkInService } from '@/lib/waiting-room/checkInService';
import { PatientQueueStatus } from '@/lib/waiting-room/types';

function WaitingRoomPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || '';
  
  const [queueStatus, setQueueStatus] = useState<PatientQueueStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRoomReadyAlert, setShowRoomReadyAlert] = useState(false);

  // Mock appointment data - replace with actual data from API/store
  const appointment = {
    id: appointmentId,
    service: 'Botox - Full Face',
    provider: 'Dr. Sarah Chen',
    date: new Date(),
    duration: 45,
    location: 'Beverly Hills Medical Spa',
    roomNumber: 'Suite 3',
  };

  const fetchQueueStatus = useCallback(async () => {
    if (!appointmentId) return;
    
    try {
      const status = await checkInService.getPatientQueueStatus(appointmentId);
      setQueueStatus(status);

      // Check if room is ready
      if (status.status === 'room_ready' && !showRoomReadyAlert) {
        setShowRoomReadyAlert(true);
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appointmentId, showRoomReadyAlert]);

  useEffect(() => {
    fetchQueueStatus();

    // Set up polling for real-time updates (every 10 seconds)
    if (appointmentId) {
      const cleanup = checkInService.pollQueueStatus(
        appointmentId,
        (status) => {
          setQueueStatus(status);

          // Notify when room is ready
          if (status.status === 'room_ready' && status.roomReadyNotifiedAt) {
            const timeSinceNotification = Date.now() - status.roomReadyNotifiedAt.getTime();
            // Only show alert if notification was sent in last 5 seconds
            if (timeSinceNotification < 5000) {
              setShowRoomReadyAlert(true);
            }
          }
        },
        10000 // Poll every 10 seconds
      );

      return cleanup;
    }
  }, [appointmentId, fetchQueueStatus]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQueueStatus();
  }, [fetchQueueStatus]);

  const getStatusInfo = () => {
    if (!queueStatus || !queueStatus.isInQueue) {
      return {
        icon: CheckCircle,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-500',
        title: 'Checked In',
        subtitle: "We'll call you when your room is ready",
      };
    }

    switch (queueStatus.status) {
      case 'in_car':
        return {
          icon: Clock,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-500',
          title: 'In Waiting Room',
          subtitle: 'Please wait to be called',
        };
      case 'room_ready':
        return {
          icon: Zap,
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-500',
          title: 'Room Ready!',
          subtitle: 'Please proceed to ' + appointment.roomNumber,
        };
      case 'checked_in':
        return {
          icon: CheckCircle,
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-500',
          title: 'Checked In',
          subtitle: 'Your provider will see you shortly',
        };
      default:
        return {
          icon: Clock,
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-500',
          title: 'Waiting',
          subtitle: 'Please wait to be called',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (!appointmentId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Appointment Selected</h2>
            <p className="text-gray-600 mb-6">
              Please select an appointment to view your waiting room status.
            </p>
            <Link href="/appointments">
              <Button>View Appointments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Waiting Room</h1>
            <button 
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className={cn('w-6 h-6', refreshing && 'animate-spin')} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Room Ready Alert */}
        {showRoomReadyAlert && queueStatus?.status === 'room_ready' && (
          <Card className="border-2 border-amber-400 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800">Your Room is Ready!</h3>
                  <p className="text-amber-700">
                    Please proceed to {appointment.roomNumber}. Your provider will see you shortly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Card */}
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <div className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5',
              statusInfo.iconBg
            )}>
              <StatusIcon className={cn('w-12 h-12', statusInfo.iconColor)} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{statusInfo.title}</h2>
            <p className="text-gray-600">{statusInfo.subtitle}</p>
          </CardContent>
        </Card>

        {/* Appointment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Your Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">{appointment.service}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">{appointment.provider}</span>
            </div>
          </CardContent>
        </Card>

        {/* Queue Position */}
        {queueStatus?.isInQueue && queueStatus.position && (
          <QueuePosition
            position={queueStatus.position}
            totalWaiting={queueStatus.position + 2} // Mock total
          />
        )}

        {/* Estimated Wait Time */}
        {queueStatus?.estimatedWaitMinutes !== undefined && (
          <EstimatedWait
            estimatedMinutes={queueStatus.estimatedWaitMinutes}
            scheduledTime={appointment.date}
          />
        )}

        {/* Help Section */}
        <Card>
          <CardContent className="p-6 text-center">
            <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Assistance?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you need to reschedule or have questions, please speak with the
              front desk staff.
            </p>
            <Button variant="outline" className="gap-2">
              <Phone className="w-4 h-4" />
              Call Front Desk
            </Button>
          </CardContent>
        </Card>

        {/* Auto-Update Notice */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-4">
          <RotateCw className="w-4 h-4" />
          <span>Status updates automatically every 10 seconds</span>
        </div>
      </div>
    </div>
  );
}

export default function WaitingRoomPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center">
              <h1 className="text-xl font-bold">Waiting Room</h1>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <WaitingRoomPageContent />
    </Suspense>
  );
}
