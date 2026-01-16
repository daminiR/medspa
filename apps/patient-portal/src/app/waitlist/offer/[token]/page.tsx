'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  Timer,
  Loader2,
  CalendarPlus,
  Home,
  Plus,
  ArrowRight,
} from 'lucide-react';

// Types
type OfferStatus = 'loading' | 'valid' | 'expired' | 'invalid' | 'accepted' | 'already_booked';

interface OfferDetails {
  id: string;
  serviceName: string;
  serviceDescription: string;
  providerName: string;
  providerTitle: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  price: number;
  expiresAt: Date;
  appointmentId?: string;
}

// Mock function to fetch offer details
async function fetchOfferDetails(token: string): Promise<{ status: OfferStatus; offer?: OfferDetails }> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock different scenarios based on token
  if (token === 'expired') {
    return { status: 'expired' };
  }
  if (token === 'invalid') {
    return { status: 'invalid' };
  }
  if (token === 'accepted') {
    return {
      status: 'already_booked',
      offer: {
        id: '123',
        serviceName: 'Dermal Fillers',
        serviceDescription: 'Restore volume and contour',
        providerName: 'Dr. Michael Chen',
        providerTitle: 'Dermatologist',
        date: '2025-12-16',
        time: '2:30 PM',
        duration: 45,
        location: '123 Beauty Lane, Suite 100',
        price: 650,
        expiresAt: new Date(),
        appointmentId: 'apt_123456',
      },
    };
  }

  // Default valid offer
  return {
    status: 'valid',
    offer: {
      id: '123',
      serviceName: 'Dermal Fillers',
      serviceDescription: 'Restore volume and contour',
      providerName: 'Dr. Michael Chen',
      providerTitle: 'Dermatologist',
      date: '2025-12-16',
      time: '2:30 PM',
      duration: 45,
      location: '123 Beauty Lane, Suite 100',
      price: 650,
      expiresAt: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes from now
    },
  };
}

function CountdownTimer({ expiresAt, onExpire }: { expiresAt: Date; onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = expiresAt.getTime() - Date.now();
      if (difference <= 0) {
        return null;
      }
      return {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (!newTimeLeft) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (!timeLeft) {
    return <span className="text-red-600">Expired</span>;
  }

  const isUrgent = timeLeft.minutes < 5;

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
      <Timer className="w-5 h-5" />
      <span className="font-mono text-lg font-semibold">
        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-sm">remaining</span>
    </div>
  );
}

export default function OfferAcceptancePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [status, setStatus] = useState<OfferStatus>('loading');
  const [offer, setOffer] = useState<OfferDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadOffer() {
      const result = await fetchOfferDetails(token);
      setStatus(result.status);
      if (result.offer) {
        setOffer(result.offer);
      }
    }
    loadOffer();
  }, [token]);

  const handleAccept = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatus('accepted');
    setIsSubmitting(false);
  };

  const handleDecline = async () => {
    if (confirm('Are you sure you want to decline this offer? You will remain on the waitlist for future openings.')) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/waitlist');
    }
  };

  const handleExpire = () => {
    setStatus('expired');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const generateCalendarUrl = () => {
    if (!offer) return '#';
    const startDate = new Date(`${offer.date} ${offer.time}`);
    const endDate = new Date(startDate.getTime() + offer.duration * 60000);
    const formatForCalendar = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${offer.serviceName} - Medical Spa`,
      dates: `${formatForCalendar(startDate)}/${formatForCalendar(endDate)}`,
      details: `Provider: ${offer.providerName}\nService: ${offer.serviceName}`,
      location: offer.location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Loading State
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Loading Your Offer</h2>
            <p className="text-gray-600">Please wait while we retrieve the appointment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid Token
  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
            <p className="text-gray-600 mb-6">
              This offer link is invalid or has already been used. Please check your messages for the correct link.
            </p>
            <div className="space-y-3">
              <Link href="/waitlist" className="block">
                <Button className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Waitlist Dashboard
                </Button>
              </Link>
              <Link href="/waitlist/join" className="block">
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Join Another Waitlist
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired Offer
  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Offer Expired</h2>
            <p className="text-gray-600 mb-4">
              Sorry, this appointment offer has expired. But do not worry - you are still on the waitlist!
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                We will notify you via SMS when another appointment becomes available that matches your preferences.
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/waitlist" className="block">
                <Button className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Waitlist Dashboard
                </Button>
              </Link>
              <Link href="/waitlist/join" className="block">
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Join Another Waitlist
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already Accepted/Booked
  if (status === 'already_booked' && offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Appointment Confirmed!</h2>
              <p className="text-gray-600">Your appointment has been successfully booked.</p>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold">{offer.serviceName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold">{formatDate(offer.date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Time</span>
                <span className="font-semibold">{offer.time}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold">{offer.duration} minutes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Provider</span>
                <span className="font-semibold">{offer.providerName}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Location</span>
                <span className="font-semibold text-right">{offer.location}</span>
              </div>
            </div>

            <div className="space-y-3">
              <a href={generateCalendarUrl()} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
              </a>
              <Link href="/appointments" className="block">
                <Button className="w-full">
                  View My Appointments
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Accepted (just now)
  if (status === 'accepted' && offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You are All Set!</h2>
              <p className="text-gray-600">Your appointment has been successfully booked.</p>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold">{offer.serviceName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold">{formatDate(offer.date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Time</span>
                <span className="font-semibold">{offer.time}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold">{offer.duration} minutes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Provider</span>
                <span className="font-semibold">{offer.providerName}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Location</span>
                <span className="font-semibold text-right">{offer.location}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                A confirmation has been sent to your phone. Please arrive 10 minutes before your appointment time.
              </p>
            </div>

            <div className="space-y-3">
              <a href={generateCalendarUrl()} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Add to Calendar
                </Button>
              </a>
              <Link href="/appointments" className="block">
                <Button className="w-full">
                  View My Appointments
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid Offer - Main View
  if (status === 'valid' && offer) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Countdown Banner */}
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="font-medium text-orange-800">This offer expires in:</span>
            <CountdownTimer expiresAt={offer.expiresAt} onExpire={handleExpire} />
          </div>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white text-center">
              <h1 className="text-2xl font-bold mb-2">Appointment Available!</h1>
              <p className="text-purple-100">A slot just opened up - act fast to secure it</p>
            </div>

            <CardContent className="p-6">
              {/* Service & Provider Info */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">{offer.serviceName}</h2>
                <p className="text-gray-600">{offer.serviceDescription}</p>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold">{formatDate(offer.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold">{offer.time} ({offer.duration} minutes)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Provider</p>
                    <p className="font-semibold">{offer.providerName}</p>
                    <p className="text-sm text-gray-500">{offer.providerTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold">{offer.location}</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex justify-between items-center py-4 border-t border-b mb-6">
                <span className="text-gray-600">Estimated Price</span>
                <span className="text-2xl font-bold">${offer.price}</span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleAccept}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Book This Appointment
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handleDecline}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  No Thanks
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                By booking, you agree to our cancellation policy. You will remain on the waitlist if you decline.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
