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
  ArrowLeft,
  Percent,
  CreditCard,
  Share2,
  Copy,
  Check,
  MessageSquare,
  Edit2,
  XCircle,
  DollarSign,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ParticipantList, GroupChat } from '@/components/groups';
import { cn } from '@/lib/utils';
import type { GroupBooking } from '@/lib/groups/groupService';
import {
  getGroupBookingById,
  currentPatient,
  isPatientInGroup,
  leaveGroup,
  sendGroupMessage,
  getPaymentModeLabel,
  getNextDiscountTier,
  getStatusStyles,
} from '@/lib/groups/groupService';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const isCoordinator = group?.coordinatorPatientId === currentPatient.id;
  const isMember = group ? isPatientInGroup(group.id, currentPatient.id) : false;

  useEffect(() => {
    const fetchGroup = () => {
      const foundGroup = getGroupBookingById(groupId);
      setGroup(foundGroup);
      setLoading(false);
    };

    fetchGroup();
  }, [groupId]);

  const handleCopyCode = async () => {
    if (group) {
      await navigator.clipboard.writeText(group.bookingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareLink = async () => {
    if (group) {
      const shareUrl = window.location.origin + '/groups/join/' + group.bookingCode;
      if (navigator.share) {
        await navigator.share({
          title: 'Join ' + group.name,
          text: 'Join our group spa day!',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    
    setIsLeaving(true);
    const result = leaveGroup(group.id, currentPatient.id);
    
    if (result.success) {
      router.push('/groups');
    } else {
      alert(result.error || 'Failed to leave group');
    }
    
    setIsLeaving(false);
    setShowLeaveConfirm(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!group) return;
    
    setIsSendingMessage(true);
    const result = sendGroupMessage(
      group.id,
      currentPatient.id,
      currentPatient.name,
      message
    );
    
    if (result.success) {
      // Refresh group data to get new messages
      const refreshedGroup = getGroupBookingById(group.id);
      if (refreshedGroup) {
        setGroup(refreshedGroup);
      }
    }
    
    setIsSendingMessage(false);
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

  const formatPrice = (price: number) => {
    return '$' + price.toFixed(0);
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

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Group Not Found</h2>
            <p className="text-red-700 mb-6">
              This group booking does not exist or has been removed.
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

  const statusStyles = getStatusStyles(group.status);
  const participant = group.participants.find((p) => p.patientId === currentPatient.id);
  const nextTier = getNextDiscountTier(group.participants.length);

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

      {/* Header Card */}
      <Card className="mb-8 overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-200 mb-2">
                <Users className="w-5 h-5" />
                <span>{getEventTypeLabel(group.eventType)}</span>
                {isCoordinator && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    <Crown className="w-3 h-3" />
                    Coordinator
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <span
                className={cn(
                  'inline-block px-3 py-1 rounded-full text-sm font-medium capitalize',
                  'bg-white/20 text-white'
                )}
              >
                {group.status.replace('_', ' ')}
              </span>
            </div>

            {/* Share Actions */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                <span className="text-purple-200 text-sm">Code:</span>
                <span className="font-mono font-bold text-lg">{group.bookingCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 hover:bg-white/10 rounded"
                  title="Copy code"
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-green-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Button
                onClick={handleShareLink}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Invite Link
              </Button>
            </div>
          </div>
        </div>

        {/* Details */}
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left - Event Details */}
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
                  {group.maxParticipants && (
                    <span className="text-gray-400"> / {group.maxParticipants} max</span>
                  )}
                </span>
              </div>
              {group.locationName && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{group.locationName}</span>
                </div>
              )}
              {!isCoordinator && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Crown className="w-5 h-5 text-gray-400" />
                  <span>Organized by {group.coordinatorName}</span>
                </div>
              )}
            </div>

            {/* Right - Pricing */}
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
                    <p className="text-sm text-green-600">Applied to all services</p>
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

          {/* Your Appointment */}
          {participant && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="font-semibold text-purple-900 mb-3">Your Appointment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-purple-600">Service</p>
                  <p className="font-medium text-gray-900">{participant.serviceName}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-600">Time</p>
                  <p className="font-medium text-gray-900">
                    {new Date(participant.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-600">Price</p>
                  <p className="font-medium text-gray-900">
                    {group.discountPercent > 0 ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">
                          {formatPrice(participant.servicePrice)}
                        </span>
                        <span className="text-green-600">
                          {formatPrice(participant.servicePrice * (1 - group.discountPercent / 100))}
                        </span>
                      </>
                    ) : (
                      formatPrice(participant.servicePrice)
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-400" />
            Group Pricing Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({group.participants.length} services)</span>
              <span>{formatPrice(group.totalOriginalPrice)}</span>
            </div>
            {group.discountPercent > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Group Discount ({group.discountPercent}%)</span>
                <span>-{formatPrice(group.totalDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>{formatPrice(group.totalDiscountedPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Participants ({group.participants.length})
          </h2>
          <ParticipantList
            participants={group.participants}
            coordinatorPatientId={group.coordinatorPatientId}
            currentPatientId={currentPatient.id}
            discountPercent={group.discountPercent}
          />
        </CardContent>
      </Card>

      {/* Group Chat */}
      <Card className="mb-8">
        <CardContent className="p-0">
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-900">Group Chat</span>
              {group.messages && group.messages.length > 0 && (
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                  {group.messages.length} message{group.messages.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <span className="text-gray-400">{showChat ? 'Hide' : 'Show'}</span>
          </button>
          
          {showChat && (
            <div className="border-t border-gray-200">
              <GroupChat
                messages={group.messages || []}
                currentPatientId={currentPatient.id}
                onSendMessage={handleSendMessage}
                isSending={isSendingMessage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {isMember && !isCoordinator && group.status !== 'cancelled' && (
        <Card className="border-red-100">
          <CardContent className="p-6">
            {showLeaveConfirm ? (
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Leave this group?</p>
                    <p className="text-sm text-red-700 mt-1">
                      Your appointment will be cancelled and you will no longer have access to the group chat.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleLeaveGroup}
                    disabled={isLeaving}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLeaving ? 'Leaving...' : 'Yes, Leave Group'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLeaveConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowLeaveConfirm(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Group
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Coordinator Actions */}
      {isCoordinator && group.status !== 'cancelled' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Coordinator Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Group
              </Button>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Group
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
