'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Clock,
  Calendar,
  User,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Bell,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Timer,
} from 'lucide-react';

// Types
interface WaitlistEntry {
  id: string;
  serviceName: string;
  providerName: string | null;
  position: number;
  totalInQueue: number;
  daysWaiting: number;
  availabilityDescription: string;
  createdAt: string;
}

interface PendingOffer {
  id: string;
  token: string;
  serviceName: string;
  providerName: string;
  date: string;
  time: string;
  duration: number;
  expiresAt: Date;
}

interface ActivityItem {
  id: string;
  type: 'offer_sent' | 'offer_accepted' | 'offer_declined' | 'offer_expired' | 'position_updated';
  description: string;
  timestamp: string;
}

// Mock data
const mockWaitlistEntries: WaitlistEntry[] = [
  {
    id: '1',
    serviceName: 'Botox',
    providerName: 'Dr. Sarah Smith',
    position: 3,
    totalInQueue: 12,
    daysWaiting: 5,
    availabilityDescription: 'Monday, Wednesday, Friday - Morning',
    createdAt: '2025-12-09',
  },
  {
    id: '2',
    serviceName: 'Hydrafacial',
    providerName: null,
    position: 1,
    totalInQueue: 4,
    daysWaiting: 2,
    availabilityDescription: 'Anytime this month',
    createdAt: '2025-12-12',
  },
];

const mockPendingOffers: PendingOffer[] = [
  {
    id: '1',
    token: 'abc123xyz',
    serviceName: 'Dermal Fillers',
    providerName: 'Dr. Michael Chen',
    date: '2025-12-16',
    time: '2:30 PM',
    duration: 45,
    expiresAt: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes from now
  },
];

const mockActivityItems: ActivityItem[] = [
  {
    id: '1',
    type: 'offer_sent',
    description: 'New appointment offer for Dermal Fillers',
    timestamp: '2025-12-14T10:30:00',
  },
  {
    id: '2',
    type: 'position_updated',
    description: 'Your position in Botox waitlist moved from #4 to #3',
    timestamp: '2025-12-13T15:00:00',
  },
  {
    id: '3',
    type: 'offer_declined',
    description: 'Declined offer for Hydrafacial on Dec 10',
    timestamp: '2025-12-10T09:00:00',
  },
  {
    id: '4',
    type: 'offer_expired',
    description: 'Offer for Botox expired',
    timestamp: '2025-12-08T14:30:00',
  },
];

function CountdownTimer({ expiresAt }: { expiresAt: Date }) {
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
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!timeLeft) {
    return <span className="text-red-600 font-semibold">Expired</span>;
  }

  const isUrgent = timeLeft.minutes < 5;

  return (
    <span className={`font-mono font-semibold ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
      {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
    </span>
  );
}

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'offer_sent':
      return <Bell className="w-4 h-4 text-purple-600" />;
    case 'offer_accepted':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'offer_declined':
      return <XCircle className="w-4 h-4 text-gray-600" />;
    case 'offer_expired':
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    case 'position_updated':
      return <ChevronRight className="w-4 h-4 text-blue-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
}

function WaitlistDashboardPageContent() {
  const searchParams = useSearchParams();
  const justJoined = searchParams.get('joined') === 'true';

  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>(mockWaitlistEntries);
  const [pendingOffers, setPendingOffers] = useState<PendingOffer[]>(mockPendingOffers);
  const [activityItems] = useState<ActivityItem[]>(mockActivityItems);
  const [showJoinedMessage, setShowJoinedMessage] = useState(justJoined);

  useEffect(() => {
    if (showJoinedMessage) {
      const timer = setTimeout(() => setShowJoinedMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showJoinedMessage]);

  const handleRemoveEntry = (entryId: string) => {
    if (confirm('Are you sure you want to leave this waitlist?')) {
      setWaitlistEntries(prev => prev.filter(e => e.id !== entryId));
    }
  };

  const handleDeclineOffer = (offerId: string) => {
    if (confirm('Are you sure you want to decline this offer? You will remain on the waitlist.')) {
      setPendingOffers(prev => prev.filter(o => o.id !== offerId));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Message */}
      {showJoinedMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800">Successfully joined the waitlist!</p>
            <p className="text-sm text-green-600">We will notify you via SMS when an appointment becomes available.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Waitlist</h1>
          <p className="text-gray-600">Track your waitlist entries and pending offers</p>
        </div>
        <Link href="/waitlist/join">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Join Waitlist
          </Button>
        </Link>
      </div>

      {/* Pending Offers - Highlighted Section */}
      {pendingOffers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            Pending Offers
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingOffers.length}
            </span>
          </h2>
          <div className="space-y-4">
            {pendingOffers.map((offer) => (
              <Card key={offer.id} className="border-2 border-purple-200 bg-purple-50 overflow-hidden">
                <div className="bg-purple-600 px-4 py-2 flex items-center justify-between">
                  <span className="text-white font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Appointment Available!
                  </span>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Timer className="w-4 h-4" />
                    Expires in: <CountdownTimer expiresAt={offer.expiresAt} />
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold">{offer.serviceName}</h3>
                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(offer.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{offer.time} ({offer.duration} minutes)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{offer.providerName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/waitlist/offer/${offer.token}`}>
                        <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Book This Slot
                        </Button>
                      </Link>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleDeclineOffer(offer.id)}
                        className="w-full sm:w-auto"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        No Thanks
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Waitlist Entries */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Active Waitlist Entries</h2>
          {waitlistEntries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Not on Any Waitlists</h3>
                <p className="text-gray-600 mb-4">
                  Join a waitlist to get notified when your preferred appointments become available.
                </p>
                <Link href="/waitlist/join">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Join a Waitlist
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {waitlistEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold">{entry.serviceName}</h3>
                          <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                            <span>#{entry.position}</span>
                            <span className="text-purple-400">of {entry.totalInQueue}</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{entry.providerName || 'Any Available Provider'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{entry.availabilityDescription}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Waiting for {entry.daysWaiting} day{entry.daysWaiting !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveEntry(entry.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Leave
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {activityItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No recent activity</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {activityItems.map((item, index) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {getActivityIcon(item.type)}
                        </div>
                        {index < activityItems.length - 1 && (
                          <div className="w-px h-full bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(item.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Pending Offers Message */}
          {pendingOffers.length === 0 && waitlistEntries.length > 0 && (
            <Card className="mt-4 bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">No Pending Offers</p>
                    <p className="text-sm text-blue-600 mt-1">
                      We will notify you via SMS as soon as an appointment matching your preferences becomes available.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WaitlistDashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <WaitlistDashboardPageContent />
    </Suspense>
  );
}
