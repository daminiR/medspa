'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Phone, User, Calendar, ArrowLeft, CheckCircle, RefreshCw, Maximize2, Minimize2, Clock, Search, QrCode, Smartphone } from 'lucide-react';
import { appointments as allAppointments, patients } from '@/lib/data';
import moment from 'moment';
import QRScanner from '@/components/kiosk/QRScanner';
import QRDisplay from '@/components/kiosk/QRDisplay';

type LookupMethod = 'phone' | 'name' | 'dob' | 'qr-scan' | 'qr-display';

interface AppointmentResult {
  id: string;
  patientId: string;
  patientName: string;
  serviceName: string;
  scheduledTime: Date;
  practitionerName: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function KioskCheckIn() {
  const [lookupMethod, setLookupMethod] = useState<LookupMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentResult | null>(null);
  const [matchingAppointments, setMatchingAppointments] = useState<AppointmentResult[]>([]);
  const [showAppointmentList, setShowAppointmentList] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoResetSeconds, setAutoResetSeconds] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // Auto-reset after successful check-in
  const startAutoReset = useCallback(() => {
    setAutoResetSeconds(15);
  }, []);

  useEffect(() => {
    if (autoResetSeconds === null) return;

    if (autoResetSeconds === 0) {
      handleReset();
      return;
    }

    const timer = setTimeout(() => {
      setAutoResetSeconds(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoResetSeconds]);

  // Reset to home screen
  const handleReset = useCallback(() => {
    setLookupMethod(null);
    setPhone('');
    setFirstName('');
    setLastName('');
    setDob('');
    setSuccess(false);
    setError(null);
    setAppointmentDetails(null);
    setMatchingAppointments([]);
    setShowAppointmentList(false);
    setAutoResetSeconds(null);
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Find today's appointments for a patient
  const findTodaysAppointments = useCallback((searchParams: {
    phone?: string;
    firstName?: string;
    lastName?: string;
    dob?: string;
  }): AppointmentResult[] => {
    const today = moment().startOf('day');
    const todayEnd = moment().endOf('day');

    // Filter appointments for today
    const todaysAppointments = allAppointments.filter(apt => {
      const aptDate = moment(apt.startTime);
      return aptDate.isSameOrAfter(today) && aptDate.isSameOrBefore(todayEnd) &&
             apt.status !== 'cancelled' && apt.status !== 'completed';
    });

    // Match by search criteria
    return todaysAppointments.filter(apt => {
      if (searchParams.phone) {
        const normalizedPhone = searchParams.phone.replace(/\D/g, '');
        const aptPhone = (apt.phone || '').replace(/\D/g, '');
        if (aptPhone.includes(normalizedPhone) || normalizedPhone.includes(aptPhone.slice(-10))) {
          return true;
        }
      }

      if (searchParams.firstName && searchParams.lastName) {
        const patientFirstName = apt.patientName.split(' ')[0].toLowerCase();
        const patientLastName = apt.patientName.split(' ').slice(-1)[0].toLowerCase();
        if (patientFirstName.includes(searchParams.firstName.toLowerCase()) &&
            patientLastName.includes(searchParams.lastName.toLowerCase())) {
          return true;
        }
      }

      // DOB matching would require patient data with DOB field
      if (searchParams.dob) {
        // For demo, just match by last name and DOB month/day pattern
        const patient = patients.find(p => p.id === apt.patientId);
        if (patient && patient.dateOfBirth) {
          const patientDob = moment(patient.dateOfBirth).format('YYYY-MM-DD');
          if (patientDob === searchParams.dob) {
            return true;
          }
        }
      }

      return false;
    }).map(apt => ({
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      serviceName: apt.serviceName,
      scheduledTime: apt.startTime,
      practitionerName: 'Provider'
    }));
  }, []);

  // Handle search/lookup
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let searchParams: { phone?: string; firstName?: string; lastName?: string; dob?: string } = {};

      if (lookupMethod === 'phone') {
        searchParams.phone = phone;
      } else if (lookupMethod === 'name') {
        searchParams.firstName = firstName;
        searchParams.lastName = lastName;
      } else if (lookupMethod === 'dob') {
        searchParams.dob = dob;
      }

      const matches = findTodaysAppointments(searchParams);

      if (matches.length === 0) {
        setError('No appointments found for today. Please check with the front desk.');
      } else if (matches.length === 1) {
        // Direct check-in for single match
        await performCheckIn(matches[0]);
      } else {
        // Show list for multiple matches
        setMatchingAppointments(matches);
        setShowAppointmentList(true);
      }
    } catch (err) {
      setError('An error occurred. Please try again or see the front desk.');
    } finally {
      setLoading(false);
    }
  }, [lookupMethod, phone, firstName, lastName, dob, findTodaysAppointments]);

  // Perform actual check-in
  const performCheckIn = async (appointment: AppointmentResult) => {
    setLoading(true);
    try {
      const response = await fetch('/api/waiting-room/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          source: 'kiosk'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setAppointmentDetails(appointment);
        startAutoReset();
      } else {
        setError(data.error || 'Check-in failed. Please see the front desk.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Select appointment from list
  const handleSelectAppointment = (appointment: AppointmentResult) => {
    performCheckIn(appointment);
  };

  // Handle successful check-in from any method
  const handleCheckIn = (appointment: AppointmentResult | { id: string; patientName: string; serviceName: string; checkedInAt?: string }) => {
    const result: AppointmentResult = {
      id: appointment.id,
      patientId: 'patientId' in appointment ? appointment.patientId : '',
      patientName: appointment.patientName,
      serviceName: appointment.serviceName,
      scheduledTime: 'scheduledTime' in appointment ? appointment.scheduledTime : new Date(),
      practitionerName: 'practitionerName' in appointment ? appointment.practitionerName : 'Provider'
    };
    setSuccess(true);
    setAppointmentDetails(result);
    startAutoReset();
  };

  // Handle QR code scanned
  const handleQRScanned = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      // Validate token first
      const validateRes = await fetch(`${API_URL}/api/kiosk/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!validateRes.ok) {
        const data = await validateRes.json();
        throw new Error(data.message || 'Invalid QR code');
      }

      // Check in
      const checkInRes = await fetch(`${API_URL}/api/kiosk/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!checkInRes.ok) {
        const data = await checkInRes.json();
        throw new Error(data.message || 'Check-in failed');
      }

      const result = await checkInRes.json();
      handleCheckIn(result.appointment);
    } catch (err: any) {
      setError(err.message || 'QR scan failed');
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    if (lookupMethod === 'phone') {
      return phone.replace(/\D/g, '').length >= 10;
    }
    if (lookupMethod === 'name') {
      return firstName.trim().length >= 2 && lastName.trim().length >= 2;
    }
    if (lookupMethod === 'dob') {
      return dob.length === 10;
    }
    return false;
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex items-center justify-center p-4"
    >
      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
      </button>

      <div className="w-full max-w-2xl">
        {/* Success Screen */}
        {success && appointmentDetails && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center animate-fade-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">You're Checked In!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Welcome, {appointmentDetails.patientName.split(' ')[0]}!
            </p>

            <div className="bg-gray-50 rounded-2xl p-8 mb-8 text-left">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Service</div>
                  <div className="text-xl font-semibold text-gray-900">{appointmentDetails.serviceName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Scheduled Time</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {moment(appointmentDetails.scheduledTime).format('h:mm A')}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-lg text-blue-900 font-medium">
                Please wait in your car. We'll text you when your room is ready.
              </p>
            </div>

            {autoResetSeconds !== null && (
              <div className="text-gray-500 mb-4">
                Returning to home screen in {autoResetSeconds} seconds...
              </div>
            )}

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-semibold text-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Check In Another Patient
            </button>
          </div>
        )}

        {/* Appointment Selection List */}
        {showAppointmentList && !success && (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <button
              onClick={() => setShowAppointmentList(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Select Your Appointment</h2>
            <p className="text-gray-600 text-center mb-8">Multiple appointments found. Please select yours.</p>

            <div className="space-y-4">
              {matchingAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => handleSelectAppointment(apt)}
                  disabled={loading}
                  className="w-full p-6 bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 rounded-2xl text-left transition-all disabled:opacity-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">{apt.patientName}</div>
                      <div className="text-lg text-gray-600 mt-1">{apt.serviceName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {moment(apt.scheduledTime).format('h:mm A')}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lookup Method Selection */}
        {!lookupMethod && !success && !showAppointmentList && (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome!</h1>
              <p className="text-xl text-gray-600">How would you like to check in?</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setLookupMethod('phone')}
                className="w-full flex items-center gap-6 p-6 bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 rounded-2xl text-left transition-all group"
              >
                <div className="w-16 h-16 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
                  <Phone className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">Phone Number</div>
                  <div className="text-gray-600">Enter your mobile phone number</div>
                </div>
              </button>

              <button
                onClick={() => setLookupMethod('name')}
                className="w-full flex items-center gap-6 p-6 bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 rounded-2xl text-left transition-all group"
              >
                <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">Name</div>
                  <div className="text-gray-600">Enter your first and last name</div>
                </div>
              </button>

              <button
                onClick={() => setLookupMethod('dob')}
                className="w-full flex items-center gap-6 p-6 bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 rounded-2xl text-left transition-all group"
              >
                <div className="w-16 h-16 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">Date of Birth</div>
                  <div className="text-gray-600">Enter your birthdate</div>
                </div>
              </button>

              <button
                onClick={() => setLookupMethod('qr-scan')}
                className="w-full flex items-center gap-6 p-6 bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 rounded-2xl text-left transition-all group"
              >
                <div className="w-16 h-16 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
                  <QrCode className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">Scan QR Code</div>
                  <div className="text-gray-600">From your confirmation email</div>
                </div>
              </button>

              <button
                onClick={() => setLookupMethod('qr-display')}
                className="w-full flex items-center gap-6 p-6 bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 rounded-2xl text-left transition-all group"
              >
                <div className="w-16 h-16 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center transition-colors">
                  <Smartphone className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900">Use My Phone</div>
                  <div className="text-gray-600">Scan this screen to check in</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Lookup Forms */}
        {lookupMethod && lookupMethod !== 'qr-scan' && lookupMethod !== 'qr-display' && !success && !showAppointmentList && (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <button
              onClick={() => setLookupMethod(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {lookupMethod === 'phone' && 'Enter Your Phone Number'}
                {lookupMethod === 'name' && 'Enter Your Name'}
                {lookupMethod === 'dob' && 'Enter Your Date of Birth'}
              </h2>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-6">
              {lookupMethod === 'phone' && (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  autoFocus
                  className="w-full px-6 py-5 text-2xl text-center border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                />
              )}

              {lookupMethod === 'name' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    autoFocus
                    className="w-full px-6 py-5 text-2xl text-center border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full px-6 py-5 text-2xl text-center border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                  />
                </div>
              )}

              {lookupMethod === 'dob' && (
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  autoFocus
                  className="w-full px-6 py-5 text-2xl text-center border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                />
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl text-lg text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="w-full bg-purple-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    Find My Appointment
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* QR Scanner */}
        {lookupMethod === 'qr-scan' && !success && !showAppointmentList && (
          <div className="w-full max-w-2xl">
            <button
              onClick={() => setLookupMethod(null)}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-6 text-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Scan Your QR Code</h2>
              <p className="text-xl text-white/80">Hold the QR code from your confirmation email up to the camera</p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl text-lg text-center mb-6">
                {error}
              </div>
            )}

            <QRScanner
              onScan={handleQRScanned}
              onError={(errorMsg) => {
                if (errorMsg === 'manual_entry_requested') {
                  setLookupMethod('phone');
                } else {
                  setError(errorMsg);
                }
              }}
              disabled={loading}
            />
          </div>
        )}

        {/* QR Display - Mobile Check-in */}
        {lookupMethod === 'qr-display' && !success && !showAppointmentList && (
          <QRDisplay
            onCheckInComplete={handleCheckIn}
            onCancel={() => setLookupMethod(null)}
            kioskId="kiosk-001"
          />
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-white/70">
          <p>Need help? Please ask our front desk staff.</p>
        </div>
      </div>
    </div>
  );
}
