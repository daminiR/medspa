'use client';

import { useState } from 'react';

export default function PatientCheckIn() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/waiting-room/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          message: 'HERE' // Simulate SMS with "HERE"
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setAppointmentDetails(data.appointment);
        setError(null);
      } else {
        setError(data.error || 'Failed to check in');
        setSuccess(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setSuccess(false);
      console.error('Check-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {!success ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏥</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Check In</h1>
              <p className="text-gray-600">
                Enter your phone number to let us know you've arrived
              </p>
            </div>

            <form onSubmit={handleCheckIn} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length < 10}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Checking in...' : 'Check In'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Alternative Check-In Methods:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">📱</span>
                  <span>Text <strong>"HERE"</strong> to <strong>(555) 100-0000</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">💬</span>
                  <span>Let the front desk know you've arrived</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Checked In!</h2>
            <p className="text-gray-600 mb-6">
              Thanks for letting us know you're here, {appointmentDetails?.patientName?.split(' ')[0]}!
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Service</div>
                  <div className="font-semibold text-gray-900">{appointmentDetails?.serviceName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Scheduled Time</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(appointmentDetails?.scheduledTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Please wait in your car.</strong> We'll text you when your room is ready.
              </p>
            </div>

            <button
              onClick={() => {
                setSuccess(false);
                setPhone('');
                setAppointmentDetails(null);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Check in another patient
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
