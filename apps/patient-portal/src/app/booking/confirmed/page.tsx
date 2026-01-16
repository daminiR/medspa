'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, Download, Heart, Calculator, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { HsaFsaBadge } from '@/components/payments';
import { paymentService } from '@/lib/payments/paymentService';
import { WalletButtons } from '@/components/wallet';

export default function BookingConfirmedPage() {
  const [bookingData, setBookingData] = useState<{
    service: string;
    duration: string;
    price: number;
    provider: string;
    date: string;
    time: string;
  } | null>(null);
  const [showSavingsDetails, setShowSavingsDetails] = useState(false);
  const [hasHsaFsa, setHasHsaFsa] = useState(false);

  useEffect(() => {
    // Load booking data from sessionStorage
    const storedData = sessionStorage.getItem('bookingData');
    if (storedData) {
      setBookingData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    const hsaFsaMethods = paymentService.getHsaFsaPaymentMethods();
    setHasHsaFsa(hsaFsaMethods.length > 0);
  }, []);

  // Mock booking details with HSA/FSA eligibility
  const booking = {
    id: 'booking-' + Date.now(),
    service: bookingData?.service || 'Botox Treatment',
    date: bookingData?.date ? new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'December 15, 2025',
    time: bookingData?.time || '2:00 PM',
    duration: bookingData?.duration || '30 minutes',
    provider: bookingData?.provider || 'Dr. Smith',
    location: 'Glow Medical Spa',
    address: '123 Wellness Way, San Francisco, CA 94102',
    total: bookingData?.price || 350,
    hsaFsaEligible: 240,
  };

  // Estimated tax savings (25% tax bracket + 5% state + 7.65% FICA)
  const estimatedTaxBracket = 0.25;
  const estimatedStateTax = 0.05;
  const estimatedFICA = 0.0765;
  const totalTaxRate = estimatedTaxBracket + estimatedStateTax + estimatedFICA;
  const estimatedSavings = booking.hsaFsaEligible * totalTaxRate;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">Your appointment has been successfully booked</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Service</span>
            <span className="font-semibold">{booking.service}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Date</span>
            <span className="font-semibold">{booking.date}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Time</span>
            <span className="font-semibold">{booking.time}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Provider</span>
            <span className="font-semibold">{booking.provider}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Total</span>
            <span className="font-semibold text-lg">${booking.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* HSA/FSA Savings Estimate */}
      {booking.hsaFsaEligible > 0 && (
        <Card className="mb-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Heart className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">HSA/FSA Eligible Service</h3>
                <p className="text-sm text-emerald-700">
                  ${booking.hsaFsaEligible.toFixed(2)} of this service may qualify for pre-tax payment
                </p>
              </div>
            </div>

            {hasHsaFsa ? (
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Estimated Tax Savings</span>
                  <span className="text-xl font-bold text-emerald-600">
                    ${estimatedSavings.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setShowSavingsDetails(!showSavingsDetails)}
                  className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  {showSavingsDetails ? (
                    <>
                      Hide details <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show calculation <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>

                {showSavingsDetails && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>HSA/FSA Eligible:</span>
                      <span>${booking.hsaFsaEligible.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>Federal Tax (25%):</span>
                      <span>-${(booking.hsaFsaEligible * estimatedTaxBracket).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>State Tax (~5%):</span>
                      <span>-${(booking.hsaFsaEligible * estimatedStateTax).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>FICA (7.65%):</span>
                      <span>-${(booking.hsaFsaEligible * estimatedFICA).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Your Effective Cost:</span>
                      <span className="text-purple-600">
                        ${(booking.hsaFsaEligible - estimatedSavings).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Save up to ${estimatedSavings.toFixed(2)} with HSA/FSA
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Add an HSA/FSA card to pay for eligible medical expenses with pre-tax dollars.
                    </p>
                    <Link href="/profile/payment-methods">
                      <Button variant="outline" size="sm" className="bg-white">
                        Add HSA/FSA Card
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-emerald-700 mt-3">
              * Actual savings depend on your tax bracket. An IIAS-compliant receipt will be available after your appointment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add to Calendar / Wallet */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Add to Your Calendar or Wallet</h3>
          <WalletButtons
            appointment={{
              id: booking.id,
              service: booking.service,
              provider: booking.provider,
              date: booking.date,
              time: booking.time,
              duration: booking.duration,
              location: booking.location,
              address: booking.address,
              price: booking.total,
            }}
            showCalendar={true}
            layout="vertical"
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button className="w-full" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Confirmation
        </Button>
        <Link href="/dashboard" className="block">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
