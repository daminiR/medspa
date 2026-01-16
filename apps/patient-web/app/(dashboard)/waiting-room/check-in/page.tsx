'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Stethoscope, User, Clock, Hourglass, Navigation, Info, ArrowLeft } from 'lucide-react';
import CheckInButton from '@/components/waiting-room/CheckInButton';
import { waitingRoomService } from '@/lib/services/waitingRoomService';

export default function CheckInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || '';
  
  const [loading, setLoading] = useState(false);

  // Mock appointment data
  const appointment = {
    id: appointmentId,
    service: 'Botox - Full Face',
    provider: 'Dr. Sarah Chen',
    date: new Date(),
    duration: 45,
    location: 'Beverly Hills Medical Spa',
    address: '123 Rodeo Drive, Beverly Hills, CA 90210',
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const response = await waitingRoomService.checkIn({ appointmentId });

      if (response.success) {
        alert('Checked in successfully!');
        router.push('/waiting-room/status?appointmentId=' + appointmentId);
      }
    } catch (error: any) {
      alert('Check-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Check-In</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-md text-center">
          <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600">Ready to check in for your appointment?</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Stethoscope className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="text-base font-medium text-gray-900">{appointment.service}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Provider</p>
                <p className="text-base font-medium text-gray-900">{appointment.provider}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Scheduled Time</p>
                <p className="text-base font-medium text-gray-900">{formatTime(appointment.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Hourglass className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-base font-medium text-gray-900">{appointment.duration} minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Location</h3>
            <button className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium">
              <Navigation className="w-4 h-4" />
              <span>Directions</span>
            </button>
          </div>
          <p className="font-semibold text-gray-900 mb-1">{appointment.location}</p>
          <p className="text-gray-600">{appointment.address}</p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Before You Check In</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Make sure you're at the clinic location</li>
                <li>• Have your ID ready</li>
                <li>• Review any pre-appointment forms</li>
                <li>• Arrive 10-15 minutes early</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <CheckInButton onPress={handleCheckIn} loading={loading} />
          <p className="text-center text-sm text-gray-500">
            Or text "HERE" to (555) 123-4567
          </p>
        </div>
      </div>
    </div>
  );
}
