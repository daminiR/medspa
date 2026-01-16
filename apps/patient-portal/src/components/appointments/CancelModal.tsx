'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  appointmentId: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
}

const cancellationReasons = [
  { value: 'schedule_conflict', label: 'Schedule conflict' },
  { value: 'illness', label: 'Illness or medical reason' },
  { value: 'transportation', label: 'Transportation issues' },
  { value: 'financial', label: 'Financial reasons' },
  { value: 'found_alternative', label: 'Found another provider' },
  { value: 'other', label: 'Other' },
];

export function CancelModal({
  isOpen,
  onClose,
  onConfirm,
  appointmentId,
  serviceName,
  appointmentDate,
  appointmentTime,
}: CancelModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedReason || !policyAccepted) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onConfirm(selectedReason);
    setIsSubmitting(false);
    
    // Reset form
    setSelectedReason('');
    setPolicyAccepted(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason('');
      setPolicyAccepted(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="relative">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Cancel Appointment
          </CardTitle>
          <CardDescription>
            Are you sure you want to cancel your appointment?
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Appointment Info */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <p className="font-medium text-gray-900">{serviceName}</p>
            <p className="text-sm text-gray-600 mt-1">{appointmentDate} at {appointmentTime}</p>
          </div>

          {/* Cancellation Policy Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Cancellation Policy</p>
                <ul className="text-sm text-amber-700 mt-2 space-y-1">
                  <li>Cancellations made 24+ hours in advance: No fee</li>
                  <li>Cancellations made within 24 hours: 50% fee may apply</li>
                  <li>No-shows: Full service fee may be charged</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
            >
              <option value="">Select a reason</option>
              {cancellationReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Policy Acceptance Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="policy-checkbox"
              checked={policyAccepted}
              onChange={(e) => setPolicyAccepted(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 disabled:opacity-50"
            />
            <label htmlFor="policy-checkbox" className="text-sm text-gray-600">
              I understand and accept the cancellation policy. I acknowledge that a fee may apply depending on the timing of this cancellation.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleSubmit}
              disabled={!selectedReason || !policyAccepted || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
