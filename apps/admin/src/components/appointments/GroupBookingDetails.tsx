'use client'

import { useState } from 'react'
import {
  X,
  Users,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  UserPlus,
  Trash2,
  Edit2,
  CheckCircle,
  Send,
  MessageSquare,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UserCheck,
  CreditCard,
  History,
  Activity
} from 'lucide-react'
import moment from 'moment'
import {
  GroupBooking,
  GroupBookingParticipant,
  GroupBookingActivity,
  getGroupBookingById,
  updateGroupBooking,
  removeParticipantFromGroup,
  checkInGroupParticipant,
  checkInGroup,
  cancelGroupBooking,
  updateParticipantPaymentStatus,
  addGroupActivity,
  practitioners,
  patients
} from '@/lib/data'
import GroupPaymentSplit from '@/components/billing/GroupPaymentSplit'

interface GroupBookingDetailsProps {
  groupId: string
  onClose: () => void
  onAddParticipant?: () => void
  onSendSMS?: (type: 'confirmation' | 'reminder' | 'checkin') => void
  onRefresh?: () => void
}

export default function GroupBookingDetails({
  groupId,
  onClose,
  onAddParticipant,
  onSendSMS,
  onRefresh
}: GroupBookingDetailsProps) {
  const [group, setGroup] = useState<GroupBooking | null>(() => getGroupBookingById(groupId) || null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(group?.name || '')
  const [editNotes, setEditNotes] = useState(group?.notes || '')
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showPaymentSplit, setShowPaymentSplit] = useState(false)

  if (!group) {
    return (
      <div className="w-96 h-full bg-white border-l border-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Group not found</p>
      </div>
    )
  }

  const coordinator = patients.find(p => p.id === group.coordinatorPatientId)
  const dateStr = moment(group.date).format('dddd, MMMM D, YYYY')

  const handleSave = () => {
    const updated = updateGroupBooking(groupId, {
      name: editName,
      notes: editNotes
    })
    if (updated) {
      setGroup(updated)
      setIsEditing(false)
    }
  }

  const handleRemoveParticipant = (patientId: string) => {
    if (confirm('Remove this participant from the group? Their appointment will be cancelled.')) {
      const result = removeParticipantFromGroup(groupId, patientId)
      if (result.success) {
        const refreshed = getGroupBookingById(groupId)
        setGroup(refreshed || null)
        onRefresh?.()
      } else {
        alert(result.error || 'Failed to remove participant')
      }
    }
  }

  const handleCheckInParticipant = (patientId: string) => {
    const result = checkInGroupParticipant(groupId, patientId)
    if (result.success) {
      const refreshed = getGroupBookingById(groupId)
      setGroup(refreshed || null)
      onRefresh?.()
    }
  }

  const handleCheckInAll = () => {
    const result = checkInGroup(groupId)
    if (result.success) {
      const refreshed = getGroupBookingById(groupId)
      setGroup(refreshed || null)
      onRefresh?.()
    }
  }

  const handleCancelGroup = () => {
    const result = cancelGroupBooking(groupId, 'Cancelled by staff')
    if (result.success) {
      const refreshed = getGroupBookingById(groupId)
      setGroup(refreshed || null)
      setShowCancelConfirm(false)
      onRefresh?.()
    }
  }

  const handleTogglePayment = (patientId: string, currentStatus: 'pending' | 'paid') => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'
    const result = updateParticipantPaymentStatus(groupId, patientId, newStatus)
    if (result.success) {
      const refreshed = getGroupBookingById(groupId)
      setGroup(refreshed || null)
    }
  }

  const getStatusBadge = (status: GroupBookingParticipant['status']) => {
    const styles: Record<typeof status, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      arrived: { bg: 'bg-green-100', text: 'text-green-700', label: 'Arrived' },
      completed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      no_show: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'No Show' }
    }
    const style = styles[status]
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    )
  }

  return (
    <div className="w-[420px] h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white">
            <Users className="h-5 w-5 mr-2" />
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-white/20 text-white placeholder-white/60 px-2 py-1 rounded text-sm font-semibold"
                  placeholder="Group name..."
                />
              ) : (
                <h2 className="text-lg font-semibold">{group.name}</h2>
              )}
              <p className="text-sm text-indigo-200">
                {group.participants.length} participants
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-white/20 rounded-lg text-white"
                title="Edit group"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditName(group.name)
                    setEditNotes(group.notes || '')
                  }}
                  className="px-3 py-1 hover:bg-white/20 rounded text-white text-sm"
                >
                  Cancel
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {group.status !== 'cancelled' && (
        <div className="p-3 border-b bg-gray-50">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleCheckInAll}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              <UserCheck className="h-4 w-4" />
              Check In All
            </button>
            <button
              onClick={() => setShowPaymentSplit(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              <CreditCard className="h-4 w-4" />
              Process Payments
            </button>
            {onAddParticipant && (
              <button
                onClick={onAddParticipant}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Person
              </button>
            )}
            {onSendSMS && (
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                  SMS
                  <ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10 min-w-[160px]">
                  <button
                    onClick={() => onSendSMS('confirmation')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Send Confirmation
                  </button>
                  <button
                    onClick={() => onSendSMS('reminder')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Send Reminder
                  </button>
                  <button
                    onClick={() => onSendSMS('checkin')}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Check-In Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Cancelled Banner */}
        {group.status === 'cancelled' && (
          <div className="bg-red-50 border-b border-red-200 p-4">
            <div className="flex items-center text-red-700">
              <XCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">This group booking has been cancelled</span>
            </div>
          </div>
        )}

        {/* Group Info */}
        <div className="p-4 space-y-4 border-b">
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">{dateStr}</p>
              <p className="text-gray-500">
                {moment(group.participants[0]?.startTime).format('h:mm A')} -
                {moment(group.participants[group.participants.length - 1]?.endTime).format(' h:mm A')}
              </p>
            </div>
          </div>

          {/* Coordinator Info */}
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Users className="h-4 w-4 text-indigo-600 mr-2" />
              <span className="text-sm font-medium text-indigo-900">Coordinator</span>
            </div>
            <p className="font-medium text-gray-900">{group.coordinatorName}</p>
            {group.coordinatorPhone && (
              <a href={`tel:${group.coordinatorPhone}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                <Phone className="h-3 w-3" />
                {group.coordinatorPhone}
              </a>
            )}
            {group.coordinatorEmail && (
              <a href={`mailto:${group.coordinatorEmail}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                <Mail className="h-3 w-3" />
                {group.coordinatorEmail}
              </a>
            )}
          </div>
        </div>

        {/* Participants List */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
            <span>Participants ({group.participants.length})</span>
            <span className="text-xs text-gray-500">
              {group.participants.filter(p => p.status === 'arrived').length} arrived
            </span>
          </h3>

          <div className="space-y-2">
            {group.participants.map((participant, index) => {
              const isExpanded = expandedParticipant === participant.patientId
              const practitioner = practitioners.find(p => p.id === participant.practitionerId)
              const isCoordinator = participant.patientId === group.coordinatorPatientId

              return (
                <div
                  key={participant.patientId}
                  className={`rounded-lg border transition-all ${
                    participant.status === 'arrived'
                      ? 'border-green-200 bg-green-50'
                      : participant.status === 'cancelled'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <button
                    onClick={() => setExpandedParticipant(isExpanded ? null : participant.patientId)}
                    className="w-full text-left p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          participant.status === 'arrived'
                            ? 'bg-green-200 text-green-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {participant.patientName}
                            </span>
                            {isCoordinator && (
                              <span className="text-xs bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded">
                                Coordinator
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {participant.serviceName} • {moment(participant.startTime).format('h:mm A')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(participant.status)}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between text-gray-600">
                          <span>Service:</span>
                          <span className="font-medium">{participant.serviceName}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Time:</span>
                          <span className="font-medium">
                            {moment(participant.startTime).format('h:mm A')} - {moment(participant.endTime).format('h:mm A')}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Practitioner:</span>
                          <span className="font-medium">{practitioner?.name || participant.practitionerName}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Price:</span>
                          <span className="font-medium">${participant.servicePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Payment:</span>
                          <button
                            onClick={() => handleTogglePayment(participant.patientId, participant.paymentStatus)}
                            className={`font-medium flex items-center gap-1 ${
                              participant.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                            }`}
                          >
                            <CreditCard className="h-3 w-3" />
                            {participant.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </button>
                        </div>
                      </div>

                      {group.status !== 'cancelled' && participant.status !== 'cancelled' && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          {participant.status !== 'arrived' && (
                            <button
                              onClick={() => handleCheckInParticipant(participant.patientId)}
                              className="flex-1 px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200"
                            >
                              <CheckCircle className="h-3 w-3 inline mr-1" />
                              Check In
                            </button>
                          )}
                          {!isCoordinator && (
                            <button
                              onClick={() => handleRemoveParticipant(participant.patientId)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 border-t bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Pricing Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>${group.totalOriginalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Percent className="h-3 w-3" />
                Group Discount ({group.discountPercent}%)
              </span>
              <span>-${group.totalDiscountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span>${group.totalDiscountedPrice.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500">
              Payment: {group.paymentMode === 'individual' ? 'Each pays individually' :
                group.paymentMode === 'coordinator' ? 'Coordinator pays all' : 'Split evenly'}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-4 border-t">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            Notes
          </h3>
          {isEditing ? (
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
              rows={3}
              placeholder="Add notes..."
            />
          ) : group.notes ? (
            <p className="text-sm text-gray-600">{group.notes}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No notes</p>
          )}
        </div>

        {/* Activity History */}
        {group.activities && group.activities.length > 0 && (
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Activity History
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {group.activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    activity.type === 'created' ? 'bg-green-500' :
                    activity.type === 'cancelled' ? 'bg-red-500' :
                    activity.type === 'sms_sent' ? 'bg-blue-500' :
                    activity.type === 'check_in_all' || activity.type === 'checked_in' ? 'bg-purple-500' :
                    activity.type === 'payment_updated' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700">{activity.description}</p>
                    <p className="text-gray-400">
                      {moment(activity.performedAt).format('MMM D, h:mm A')}
                      {activity.performedBy !== 'System' && ` by ${activity.performedBy}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Group */}
        {group.status !== 'cancelled' && (
          <div className="p-4 border-t">
            {showCancelConfirm ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 mb-3">
                  Cancel this entire group booking? All {group.participants.length} appointments will be cancelled.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelGroup}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Yes, Cancel Group
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Keep Group
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                Cancel Entire Group
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payment Split Modal */}
      {showPaymentSplit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <GroupPaymentSplit
              groupId={groupId}
              onClose={() => {
                setShowPaymentSplit(false)
                // Refresh group data after payment changes
                const refreshed = getGroupBookingById(groupId)
                setGroup(refreshed || null)
                onRefresh?.()
              }}
              onPaymentComplete={() => {
                setShowPaymentSplit(false)
                const refreshed = getGroupBookingById(groupId)
                setGroup(refreshed || null)
                onRefresh?.()
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
