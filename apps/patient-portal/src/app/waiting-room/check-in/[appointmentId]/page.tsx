'use client';

/**
 * Check-In Page
 * Main check-in interface for patients when they arrive at clinic
 */

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  MapPin, 
  Stethoscope, 
  User, 
  Clock, 
  Timer,
  Navigation,
  Info,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { checkInService } from '@/lib/waiting-room/checkInService';
import { CheckInResponse } from '@/lib/waiting-room/types';

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.appointmentId as string;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Mock appointment data - replace with actual data from API/store
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
      setError(null);

      const response: CheckInResponse = await checkInService.checkIn({
        appointmentId: appointment.id,
      });

      if (response.success) {
        setSuccess(true);
        // Redirect to waiting room status after 2 seconds
        setTimeout(() => {
          router.replace('/waiting-room?appointmentId=' + appointment.id);
        }, 2000);
      } else {
        setError(response.error || 'Check-in failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to check in. Please try again or see the front desk.');
    } finally {
      setLoading(false);
    }
  };

  const openDirections = () => {
    // Open maps with clinic address
    const encodedAddress = encodeURIComponent(appointment.address);
    window.open('https://maps.google.com/?q=' + encodedAddress, '_blank');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Checked In Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Please have a seat in the waiting area. We will call you when your room is ready.
            </p>
            <p className="text-sm text-gray-500">Redirecting to waiting room...</p>
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
            <h1 className="text-xl font-bold">Check-In</h1>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600">Ready to check in for your appointment?</p>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Stethoscope className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Service</p>
                <p className="font-medium text-gray-900">{appointment.service}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Provider</p>
                <p className="font-medium text-gray-900">{appointment.provider}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Scheduled Time</p>
                <p className="font-medium text-gray-900">{formatTime(appointment.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Timer className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">{appointment.duration} minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Location</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openDirections}
              className="gap-2"
            >
              <Navigation className="w-4 h-4" />
              Directions
            </Button>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-gray-900 mb-1">{appointment.location}</p>
            <p className="text-gray-600 text-sm">{appointment.address}</p>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Before You Check In</h3>
                <ul className="text-sm text-gray-700 space-y-1.5">
                  <li>Make sure you are at the clinic location</li>
                  <li>Have your ID ready</li>
                  <li>Review any pre-appointment forms</li>
                  <li>Arrive 10-15 minutes early</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Check-In Button */}
        <div className="space-y-4">
          <Button
            onClick={handleCheckIn}
            disabled={loading}
            className={cn(
              'w-full h-14 text-lg font-semibold',
              'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                I&apos;m Here!
              </>
            )}
          </Button>
          
          <p className="text-center text-gray-400 text-sm">
            Or text &quot;HERE&quot; to (555) 123-4567
          </p>
        </div>
      </div>
    </div>
  );
}
