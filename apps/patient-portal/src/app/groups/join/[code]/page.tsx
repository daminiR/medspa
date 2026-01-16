'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Users,
  Crown,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Percent,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JoinGroupForm, ParticipantList } from '@/components/groups';
import { cn } from '@/lib/utils';
import type { GroupBooking } from '@/lib/groups/groupService';
import {
  getGroupByCode,
  joinGroup,
  currentPatient,
  isPatientInGroup,
  getPaymentModeLabel,
  getNextDiscountTier,
} from '@/lib/groups/groupService';

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [group, setGroup] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    const fetchGroup = () => {
      const foundGroup = getGroupByCode(code);
      setGroup(foundGroup);
      
      if (foundGroup && isPatientInGroup(foundGroup.id, currentPatient.id)) {
        setAlreadyMember(true);
      }
      
      setLoading(false);
    };

    fetchGroup();
  }, [code]);

  const handleJoin = async (serviceId: string, specialRequests: string) => {
    setIsJoining(true);
    setJoinError('');

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = joinGroup(
      code,
      currentPatient.id,
      currentPatient.name,
      currentPatient.email,
      currentPatient.phone,
      serviceId,
      specialRequests
    );

    if (result.success && result.group) {
      setGroup(result.group);
      setJoinSuccess(true);
    } else {
      setJoinError(result.error || 'Failed to join group');
    }

    setIsJoining(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeRange = (range?: { start: string; end: string }) => {
    if (!range) return 'Flexible';
    return range.start + ' - ' + range.end;
  };

  const getEventTypeLabel = (type?: string) => {
    switch (type) {
      case 'bridal':
        return 'Bridal Party';
      case 'corporate':
        return 'Corporate Event';
      case 'friends':
        return 'Friends Group';
      case 'family':
        return 'Family Event';
      default:
        return 'Group Event';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Invalid code
  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Invalid Group Code</h2>
            <p className="text-red-700 mb-6">
              The code <span className="font-mono font-bold">{code}</span> does not match any active group booking.
              Please check the code and try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/groups">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Groups
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group cancelled
  if (group.status === 'cancelled') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-orange-900 mb-2">Group Cancelled</h2>
            <p className="text-orange-700 mb-6">
              Unfortunately, this group booking has been cancelled.
              Please contact the coordinator for more information.
            </p>
            <Link href="/groups">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Groups
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already a member - redirect or show message
  if (alreadyMember && !joinSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Already a Member</h2>
            <p className="text-blue-700 mb-6">
              You are already part of <span className="font-semibold">{group.name}</span>.
            </p>
            <Link href={'/groups/' + group.id}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                View Group Details
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (joinSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-green-200 bg-green-50 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-semibold">Successfully Joined!</span>
            </div>
          </div>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to {group.name}!
            </h2>
            <p className="text-gray-600 mb-6">
              You have been added to the group. The coordinator has been notified.
            </p>
            
            <div className="bg-white rounded-lg p-4 mb-6 text-left border border-green-100">
              <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  View your appointment details in the group page
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Connect with other participants in the group chat
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Complete payment if required
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={'/groups/' + group.id}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  View Group Details
                </Button>
              </Link>
              <Link href="/groups">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  All Groups
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Join form
  const nextTier = getNextDiscountTier(group.participants.length);
  const spotsLeft = group.maxParticipants
    ? group.maxParticipants - group.participants.length
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/groups"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Groups
      </Link>

      {/* Group Header */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8 text-white">
          <div className="flex items-center gap-2 text-purple-200 mb-2">
            <Users className="w-5 h-5" />
            <span>{getEventTypeLabel(group.eventType)}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
          <p className="text-purple-100">
            Organized by {group.coordinatorName}
          </p>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>{formatDate(group.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>{formatTimeRange(group.preferredTimeRange)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="w-5 h-5 text-gray-400" />
                <span>
                  {group.participants.length} participant{group.participants.length !== 1 ? 's' : ''}
                  {spotsLeft !== null && (
                    <span className={cn(
                      'ml-2',
                      spotsLeft <= 2 ? 'text-orange-600 font-medium' : 'text-gray-500'
                    )}>
                      ({spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left)
                    </span>
                  )}
                </span>
              </div>
              {group.locationName && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{group.locationName}</span>
                </div>
              )}
            </div>

            {/* Right Column - Pricing Info */}
            <div className="space-y-4">
              {group.discountPercent > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-700">
                      {group.discountPercent}% Group Discount
                    </p>
                    <p className="text-sm text-green-600">
                      Applied to all services
                    </p>
                  </div>
                </div>
              )}
              
              {nextTier && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-700">
                    Add {nextTier.needed} more guest{nextTier.needed !== 1 ? 's' : ''} to unlock{' '}
                    <span className="font-semibold">{nextTier.discount}% discount!</span>
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900">
                    {getPaymentModeLabel(group.paymentMode)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Participants */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Current Participants ({group.participants.length})
          </h2>
          <ParticipantList
            participants={group.participants}
            coordinatorPatientId={group.coordinatorPatientId}
            currentPatientId=""
            discountPercent={group.discountPercent}
          />
        </CardContent>
      </Card>

      {/* Join Form */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Join This Group
          </h2>
          <JoinGroupForm
            group={group}
            onJoin={handleJoin}
            isJoining={isJoining}
            error={joinError}
          />
        </CardContent>
      </Card>
    </div>
  );
}
