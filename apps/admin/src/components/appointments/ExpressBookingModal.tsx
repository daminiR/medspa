'use client';

import { useState } from 'react';
import { X, Send, Clock, User, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import moment from 'moment';

interface ExpressBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  practitioner: {
    id: string;
    name: string;
    initials: string;
  };
  selectedDate: Date;
  startTime: {
    hour: number;
    minute: number;
  };
  onSuccess?: (bookingData: any) => void;
}

// Services list (simplified)
const services = [
  { id: '1', name: 'Botox Treatment', duration: 30, price: 350, deposit: 100 },
  { id: '2', name: 'Lip Filler', duration: 45, price: 650, deposit: 150 },
  { id: '3', name: 'Chemical Peel', duration: 60, price: 200, deposit: 50 },
  { id: '4', name: 'Laser Hair Removal', duration: 30, price: 150, deposit: 50 },
  { id: '5', name: 'IPL Photo Facial', duration: 45, price: 300, deposit: 75 },
  { id: '6', name: 'Microneedling', duration: 60, price: 350, deposit: 75 },
  { id: '7', name: 'Consultation', duration: 30, price: 0, deposit: 0 },
];

export default function ExpressBookingModal({
  isOpen,
  onClose,
  practitioner,
  selectedDate,
  startTime,
  onSuccess,
}: ExpressBookingModalProps) {
  const [patientFirstName, setPatientFirstName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);

  if (!isOpen) return null;

  const appointmentDateTime = new Date(selectedDate);
  appointmentDateTime.setHours(startTime.hour, startTime.minute, 0, 0);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientPhone(formatPhoneNumber(e.target.value));
  };

  const handleSend = async () => {
    if (!patientFirstName.trim()) {
      setError('Please enter patient first name');
      return;
    }
    if (patientPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!selectedService) {
      setError('Please select a service');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/express-booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientFirstName: patientFirstName.trim(),
          patientPhone: patientPhone,
          practitionerId: practitioner.id,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          startTime: appointmentDateTime.toISOString(),
          duration: selectedService.duration,
          requireDeposit: requireDeposit,
          depositAmount: requireDeposit ? selectedService.deposit * 100 : 0, // cents
          expiryMinutes: expiryMinutes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send booking link');
        setSending(false);
        return;
      }

      setBookingResult(data);
      setSuccess(true);
      setSending(false);

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSending(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setPatientFirstName('');
    setPatientPhone('');
    setSelectedService(null);
    setRequireDeposit(false);
    setExpiryMinutes(30);
    setSending(false);
    setSuccess(false);
    setError(null);
    setBookingResult(null);
    onClose();
  };

  // Success view
  if (success && bookingResult) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Link Sent!</h2>
            <p className="text-gray-600 mb-4">
              {patientFirstName} will receive an SMS to complete their booking.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
              <div className="text-sm space-y-2">
                <div><strong>Service:</strong> {selectedService?.name}</div>
                <div><strong>Provider:</strong> {practitioner.name}</div>
                <div><strong>Date:</strong> {moment(appointmentDateTime).format('ddd, MMM D @ h:mm A')}</div>
                <div><strong>Link expires:</strong> {expiryMinutes} minutes</div>
              </div>
            </div>

            {!bookingResult.sms.sent && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm mb-4">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                SMS not sent (Twilio not configured). Link: {bookingResult.bookingLink}
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Express Booking</h2>
            <p className="text-sm text-gray-500">Send patient a link to complete booking</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Appointment Info Banner */}
        <div className="bg-purple-50 px-4 py-3 border-b">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-purple-900">
              <Clock className="h-4 w-4 mr-2" />
              {moment(appointmentDateTime).format('ddd, MMM D @ h:mm A')}
            </div>
            <div className="flex items-center text-purple-900">
              <User className="h-4 w-4 mr-2" />
              {practitioner.name}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient First Name *
            </label>
            <input
              type="text"
              value={patientFirstName}
              onChange={(e) => setPatientFirstName(e.target.value)}
              placeholder="Sarah"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={patientPhone}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                maxLength={14}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service *
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    selectedService?.id === service.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.duration} min</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${service.price}</div>
                      {service.deposit > 0 && (
                        <div className="text-xs text-gray-500">${service.deposit} deposit</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {/* Require Deposit */}
            {selectedService && selectedService.deposit > 0 && (
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">Require Deposit</div>
                  <div className="text-sm text-gray-500">${selectedService.deposit} via credit card</div>
                </div>
                <input
                  type="checkbox"
                  checked={requireDeposit}
                  onChange={(e) => setRequireDeposit(e.target.checked)}
                  className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </label>
            )}

            {/* Link Expiry */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="block font-medium text-gray-900 mb-2">Link Expires In</label>
              <div className="flex gap-2">
                {[15, 30, 60, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setExpiryMinutes(mins)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      expiryMinutes === mins
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleSend}
            disabled={sending || !patientFirstName || patientPhone.replace(/\D/g, '').length < 10 || !selectedService}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {sending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Send Booking Link via SMS
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-500 mt-2">
            Patient will receive a link to complete their booking
          </p>
        </div>
      </div>
    </div>
  );
}
