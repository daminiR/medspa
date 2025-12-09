'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Clock, User, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface BookingDetails {
  id: string;
  patientFirstName: string;
  phone: string;
  serviceName: string;
  practitionerName: string;
  startTime: string;
  endTime: string;
  duration: number;
  requireDeposit: boolean;
  depositAmount: number;
  expiresAt: string;
}

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  cancellationPolicy: string;
}

export default function ExpressBookingPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  // Time remaining
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [token]);

  useEffect(() => {
    if (booking?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const expires = new Date(booking.expiresAt);
        const diff = expires.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining('Expired');
          setError('This booking link has expired');
          setErrorCode('EXPIRED');
          clearInterval(interval);
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [booking?.expiresAt]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/express-booking/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load booking');
        setErrorCode(data.code);
        setLoading(false);
        return;
      }

      setBooking(data.booking);
      setClinic(data.clinic);
      setFirstName(data.booking.patientFirstName || '');
      setPhone(data.booking.phone || '');
      setLoading(false);
    } catch (err) {
      setError('Failed to load booking details');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedPolicy) {
      alert('Please accept the cancellation policy to continue');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/express-booking/${token}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          acceptedPolicy,
          // paymentMethodId would come from Stripe Elements in production
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to complete booking');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your booking...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (errorCode === 'EXPIRED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-600 mb-6">This booking link has expired. Please contact us to reschedule.</p>
          <a
            href={`tel:${clinic?.phone || '555-100-0000'}`}
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
          >
            Call to Reschedule
          </a>
        </div>
      </div>
    );
  }

  if (errorCode === 'NOT_FOUND') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find this booking. It may have been cancelled or already completed.</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're All Set!</h1>
          <p className="text-gray-600 mb-6">Your appointment has been confirmed.</p>

          <div className="bg-gray-50 rounded-xl p-6 text-left mb-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">
                    {booking && new Date(booking.startTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-medium">
                    {booking && new Date(booking.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Service</div>
                  <div className="font-medium">{booking?.serviceName}</div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">A confirmation text has been sent to your phone.</p>
        </div>
      </div>
    );
  }

  // Booking form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{clinic?.name}</h1>
          <p className="text-gray-600">Complete Your Booking</p>
        </div>

        {/* Timer */}
        {timeRemaining && timeRemaining !== 'Expired' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-center justify-center">
            <Clock className="h-4 w-4 text-amber-600 mr-2" />
            <span className="text-amber-800 text-sm font-medium">
              Link expires in {timeRemaining}
            </span>
          </div>
        )}

        {/* Appointment Summary Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Appointment Details</h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 text-purple-600 mr-3" />
              <span className="text-gray-600">
                {booking && new Date(booking.startTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-purple-600 mr-3" />
              <span className="text-gray-600">
                {booking && new Date(booking.startTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })} ({booking?.duration} min)
              </span>
            </div>
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 text-purple-600 mr-3" />
              <span className="text-gray-600">{booking?.serviceName} with {booking?.practitionerName}</span>
            </div>
            {booking?.requireDeposit && booking.depositAmount > 0 && (
              <div className="flex items-center text-sm">
                <CreditCard className="h-4 w-4 text-purple-600 mr-3" />
                <span className="text-gray-600">Deposit: ${(booking.depositAmount / 100).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Your Information</h2>

          {error && !errorCode && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Cancellation Policy */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 text-sm mb-2">Cancellation Policy</h3>
              <p className="text-gray-600 text-sm mb-3">{clinic?.cancellationPolicy}</p>
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedPolicy}
                  onChange={(e) => setAcceptedPolicy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  I have read and accept the cancellation policy
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !acceptedPolicy}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Confirming...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Questions? Call us at {clinic?.phone}
        </p>
      </div>
    </div>
  );
}
