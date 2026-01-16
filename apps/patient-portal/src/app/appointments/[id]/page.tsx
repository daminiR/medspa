'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, DollarSign, Printer, Download, CheckCircle, FileText, Heart, X } from 'lucide-react';
import { RescheduleModal, CancelModal } from '@/components/appointments';
import { IIASReceipt, HsaFsaBadge } from '@/components/payments';
import { WalletButtons } from '@/components/wallet';
import { paymentService } from '@/lib/payments/paymentService';
import type { IIASReceiptData } from '@/lib/payments/mockData';

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isRescheduled, setIsRescheduled] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [receiptData, setReceiptData] = useState<IIASReceiptData | undefined>(undefined);

  // Check if this appointment has a receipt (mock - past appointments have receipts)
  useEffect(() => {
    const appointmentId = params?.id as string || '1';
    const receipt = paymentService.getReceiptForAppointment(appointmentId);
    setReceiptData(receipt);
  }, [params?.id]);

  // Determine if this is a past appointment (for demo, we'll make it configurable)
  const isPastAppointment = true; // Set to true to show receipt option

  const appointment = {
    id: params?.id as string || '1',
    service: 'Botox - Forehead Lines',
    date: 'December 15, 2025',
    time: '2:00 PM',
    duration: '30 minutes',
    provider: 'Dr. Sarah Smith',
    location: 'Downtown Medical Spa',
    address: '123 Main St, Suite 200',
    price: 350,
    hsaFsaEligible: 240,
    status: isCancelled ? 'cancelled' : 'confirmed',
  };

  const handleRescheduleConfirm = (date: string, time: string, reason?: string) => {
    console.log('Rescheduled to:', date, time, reason);
    setIsRescheduled(true);
    setShowRescheduleModal(false);
    // In a real app, you would update the appointment data here
  };

  const handleCancelConfirm = (reason: string) => {
    console.log('Cancelled with reason:', reason);
    setIsCancelled(true);
    setShowCancelModal(false);
    // In a real app, you would update the appointment status here
  };

  const getStatusBadge = () => {
    if (isCancelled) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          Cancelled
        </span>
      );
    }
    if (isRescheduled) {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          Rescheduled
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
        {appointment.status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Appointment Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Success Messages */}
      {isRescheduled && !isCancelled && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Appointment Rescheduled Successfully</p>
            <p className="text-sm text-green-600">You will receive a confirmation email shortly.</p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Appointment Cancelled</p>
            <p className="text-sm text-red-600">This appointment has been cancelled.</p>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-2xl">{appointment.service}</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{appointment.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-semibold">{appointment.time}</p>
                  <p className="text-sm text-gray-500">{appointment.duration}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="font-semibold">{appointment.provider}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{appointment.location}</p>
                  <p className="text-sm text-gray-500">{appointment.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold text-lg">${appointment.price}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Preparation Instructions</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Avoid blood-thinning medications 24 hours before</li>
              <li>Do not consume alcohol 24 hours before treatment</li>
              <li>Arrive 10 minutes early for check-in</li>
              <li>Bring your insurance card if applicable</li>
            </ul>
          </div>

          {/* HSA/FSA Eligible Amount */}
          {appointment.hsaFsaEligible > 0 && (
            <div className="border-t pt-6">
              <HsaFsaBadge amount={appointment.hsaFsaEligible} />
              <p className="text-sm text-gray-500 mt-2">
                A portion of this service may be eligible for HSA/FSA reimbursement.
              </p>
            </div>
          )}

          {/* Add to Calendar / Wallet Section */}
          {!isCancelled && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Add to Calendar or Wallet</h3>
              <WalletButtons
                appointment={{
                  id: appointment.id,
                  service: appointment.service,
                  provider: appointment.provider,
                  date: appointment.date,
                  time: appointment.time,
                  duration: appointment.duration,
                  location: appointment.location,
                  address: appointment.address,
                  price: appointment.price,
                }}
                showCalendar={true}
                layout="grid"
              />
            </div>
          )}

          {/* IIAS Receipt Section - Show for past appointments */}
          {isPastAppointment && receiptData && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">IIAS Receipt</h3>
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800">
                      IIAS-Compliant Receipt Available
                    </p>
                    <p className="text-sm text-emerald-600">
                      HSA/FSA Eligible: ${receiptData.totals.hsaFsaEligible.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-white hover:bg-emerald-50"
                  onClick={() => setShowReceiptModal(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View IIAS Receipt
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href="/appointments" className="flex-1">
          <Button variant="outline" className="w-full">Back to Appointments</Button>
        </Link>
        {!isCancelled && (
          <>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowRescheduleModal(true)}
            >
              Reschedule
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleRescheduleConfirm}
        appointmentId={appointment.id}
        currentDate={appointment.date}
        currentTime={appointment.time}
        serviceName={appointment.service}
      />

      {/* Cancel Modal */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        appointmentId={appointment.id}
        serviceName={appointment.service}
        appointmentDate={appointment.date}
        appointmentTime={appointment.time}
      />

      {/* IIAS Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReceiptModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-y-auto max-h-[90vh]">
              <IIASReceipt data={receiptData} onClose={() => setShowReceiptModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
