'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, RefreshCw, Stethoscope, User, HelpCircle, Phone } from 'lucide-react';
import QueuePosition from '@/components/waiting-room/QueuePosition';
import EstimatedWait from '@/components/waiting-room/EstimatedWait';
import { waitingRoomService } from '@/lib/services/waitingRoomService';
import { PatientQueueStatus } from '@/lib/types/waiting-room';

export default function WaitingStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || '';
  
  const [queueStatus, setQueueStatus] = useState<PatientQueueStatus | null>(null);
  const [loading, setLoading] = useState(true);

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
    try {
      const status = await waitingRoomService.getPatientQueueStatus(appointmentId);
      setQueueStatus(status);
    } catch (error) {
      console.error('Error fetching queue status:', error);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchQueueStatus();
    const cleanup = waitingRoomService.pollQueueStatus(appointmentId, setQueueStatus, 10000);
    return () => { cleanup.then((fn) => fn()); };
  }, [appointmentId, fetchQueueStatus]);

  const getStatusInfo = () => {
    if (!queueStatus || !queueStatus.isInQueue) {
      return {
        icon: 'check-circle',
        color: 'text-green-600 bg-green-50',
        title: 'Checked In',
        subtitle: "We'll call you when your room is ready",
      };
    }

    switch (queueStatus.status) {
      case 'room_ready':
        return {
          icon: 'zap',
          color: 'text-amber-600 bg-amber-50',
          title: 'Room Ready!',
          subtitle: 'Please proceed to ' + appointment.roomNumber,
        };
      default:
        return {
          icon: 'clock',
          color: 'text-blue-600 bg-blue-50',
          title: 'Waiting',
          subtitle: 'Please wait to be called',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Waiting Room</h1>
          <button onClick={fetchQueueStatus} className="p-2 hover:bg-white/10 rounded-lg">
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className={'rounded-2xl p-8 shadow-md text-center ' + statusInfo.color}>
          <div className="text-6xl mb-4">{statusInfo.icon === 'check-circle' ? '✓' : statusInfo.icon === 'zap' ? '⚡' : '⏰'}</div>
          <h2 className="text-2xl font-bold mb-2">{statusInfo.title}</h2>
          <p className="text-lg">{statusInfo.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Appointment</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">{appointment.service}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">{appointment.provider}</span>
            </div>
          </div>
        </div>

        {queueStatus?.isInQueue && queueStatus.position && (
          <QueuePosition position={queueStatus.position} totalWaiting={queueStatus.position + 2} />
        )}

        {queueStatus?.estimatedWaitMinutes !== undefined && (
          <EstimatedWait estimatedMinutes={queueStatus.estimatedWaitMinutes} scheduledTime={appointment.date} />
        )}

        <div className="bg-white rounded-2xl p-6 shadow-md text-center">
          <HelpCircle className="w-6 h-6 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Assistance?</h3>
          <p className="text-gray-600 mb-4">
            If you need to reschedule or have questions, please speak with the front desk staff.
          </p>
          <button className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-purple-600 font-semibold py-2 px-4 rounded-lg">
            <Phone className="w-5 h-5" />
            Call Front Desk
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4" />
          <span>Status updates automatically every 10 seconds</span>
        </div>
      </div>
    </div>
  );
}
