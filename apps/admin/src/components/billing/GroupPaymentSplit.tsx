'use client';

import { useState, useMemo } from 'react';
import {
  DollarSign, Users, Percent, CheckCircle, XCircle, AlertCircle,
  CreditCard, Send, Calculator, ChevronDown, ChevronUp, User,
  Phone, Mail, RefreshCw, Wallet, Split, UserCheck
} from 'lucide-react';
import moment from 'moment';
import {
  GroupBooking,
  GroupBookingParticipant,
  GroupPaymentMode,
  getGroupBookingById,
  updateParticipantPaymentStatus
} from '@/lib/data';

interface GroupPaymentSplitProps {
  groupId: string;
  onClose?: () => void;
  onPaymentComplete?: () => void;
}

type PaymentSplitType = 'equal' | 'byService' | 'custom';

interface ParticipantPayment {
  patientId: string;
  patientName: string;
  phone?: string;
  email?: string;
  serviceName: string;
  servicePrice: number;
  paymentStatus: 'pending' | 'paid';
  calculatedAmount: number;
  customAmount: number;
  includeInSplit: boolean;
}

export default function GroupPaymentSplit({ groupId, onClose, onPaymentComplete }: GroupPaymentSplitProps) {
  const [group, setGroup] = useState<GroupBooking | null>(() => getGroupBookingById(groupId) || null);
  const [splitType, setSplitType] = useState<PaymentSplitType>('byService');
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  // Initialize participant payments
  const [participantPayments, setParticipantPayments] = useState<ParticipantPayment[]>(() => {
    if (!group) return [];
    return group.participants.map(p => ({
      patientId: p.patientId,
      patientName: p.patientName,
      phone: p.phone,
      email: p.email,
      serviceName: p.serviceName,
      servicePrice: p.servicePrice,
      paymentStatus: p.paymentStatus,
      calculatedAmount: p.servicePrice,
      customAmount: p.servicePrice,
      includeInSplit: true
    }));
  });

  if (!group) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Group not found</p>
      </div>
    );
  }

  // Calculate split amounts based on type
  const calculateSplits = () => {
    const includedParticipants = participantPayments.filter(p => p.includeInSplit && p.paymentStatus !== 'paid');
    const totalToPay = includedParticipants.reduce((sum, p) => sum + p.servicePrice, 0);
    const discountedTotal = totalToPay * (1 - group.discountPercent / 100);

    setParticipantPayments(prev => prev.map(p => {
      if (!p.includeInSplit || p.paymentStatus === 'paid') {
        return { ...p, calculatedAmount: p.servicePrice };
      }

      switch (splitType) {
        case 'equal':
          return { ...p, calculatedAmount: discountedTotal / includedParticipants.length };
        case 'byService':
          const proportion = p.servicePrice / totalToPay;
          return { ...p, calculatedAmount: discountedTotal * proportion };
        case 'custom':
          return { ...p, calculatedAmount: p.customAmount };
        default:
          return p;
      }
    }));
  };

  // Stats
  const stats = useMemo(() => {
    const total = group.totalDiscountedPrice;
    const paid = participantPayments
      .filter(p => p.paymentStatus === 'paid')
      .reduce((sum, p) => sum + p.servicePrice * (1 - group.discountPercent / 100), 0);
    const pending = total - paid;
    const paidCount = participantPayments.filter(p => p.paymentStatus === 'paid').length;
    const totalCount = participantPayments.length;

    return { total, paid, pending, paidCount, totalCount };
  }, [participantPayments, group]);

  // Mark as paid
  const handleMarkAsPaid = async (patientId: string) => {
    setProcessingPayment(patientId);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = updateParticipantPaymentStatus(groupId, patientId, 'paid');
    if (result.success) {
      setParticipantPayments(prev => prev.map(p =>
        p.patientId === patientId ? { ...p, paymentStatus: 'paid' } : p
      ));

      // Refresh group data
      const refreshed = getGroupBookingById(groupId);
      if (refreshed) setGroup(refreshed);
    }

    setProcessingPayment(null);
  };

  // Send payment request
  const handleSendPaymentRequest = (participant: ParticipantPayment) => {
    alert(`Payment request sent to ${participant.patientName} at ${participant.phone || participant.email}`);
  };

  // Update custom amount
  const updateCustomAmount = (patientId: string, amount: number) => {
    setParticipantPayments(prev => prev.map(p =>
      p.patientId === patientId ? { ...p, customAmount: amount, calculatedAmount: amount } : p
    ));
  };

  const getPaymentModeLabel = (mode: GroupPaymentMode) => {
    switch (mode) {
      case 'individual': return 'Each Pays Individually';
      case 'coordinator': return 'Coordinator Pays All';
      case 'split': return 'Split Evenly';
      default: return mode;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold mb-1">{group.name}</h2>
            <p className="text-purple-100 text-sm">
              {moment(group.date).format('MMMM D, YYYY')} | {group.participants.length} participants
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">${stats.total.toFixed(2)}</p>
            <p className="text-purple-100 text-sm">Total Amount</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-purple-100">Payment Progress</span>
            <span className="font-medium">{stats.paidCount}/{stats.totalCount} paid</span>
          </div>
          <div className="h-3 bg-purple-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(stats.paid / stats.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Payment Mode & Stats */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">${stats.paid.toFixed(2)}</p>
            <p className="text-xs text-green-600">Paid</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-700">${stats.pending.toFixed(2)}</p>
            <p className="text-xs text-orange-600">Pending</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-700">{group.discountPercent}%</p>
            <p className="text-xs text-purple-600">Discount</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">Payment Mode:</span>
          </div>
          <span className="font-medium text-gray-900">{getPaymentModeLabel(group.paymentMode)}</span>
        </div>
      </div>

      {/* Split Calculator */}
      <div className="p-6 border-b border-gray-100">
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">Split Calculator</span>
          </div>
          {showCalculator ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {showCalculator && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => { setSplitType('equal'); calculateSplits(); }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  splitType === 'equal'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Split className="w-4 h-4 inline mr-1" />
                Equal Split
              </button>
              <button
                onClick={() => { setSplitType('byService'); calculateSplits(); }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  splitType === 'byService'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-1" />
                By Service
              </button>
              <button
                onClick={() => setSplitType('custom')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  splitType === 'custom'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calculator className="w-4 h-4 inline mr-1" />
                Custom
              </button>
            </div>

            <p className="text-sm text-gray-600">
              {splitType === 'equal' && `Total split equally: $${(stats.pending / participantPayments.filter(p => p.paymentStatus !== 'paid').length || 0).toFixed(2)} each`}
              {splitType === 'byService' && 'Each pays proportionally based on their service price'}
              {splitType === 'custom' && 'Enter custom amounts for each participant'}
            </p>
          </div>
        )}
      </div>

      {/* Participant List */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Participants
        </h3>

        <div className="space-y-3">
          {participantPayments.map((participant) => (
            <div
              key={participant.patientId}
              className={`border rounded-xl overflow-hidden transition-all ${
                participant.paymentStatus === 'paid'
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-purple-200'
              }`}
            >
              <div
                onClick={() => setSelectedParticipant(
                  selectedParticipant === participant.patientId ? null : participant.patientId
                )}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      participant.paymentStatus === 'paid' ? 'bg-green-200' : 'bg-purple-100'
                    }`}>
                      {participant.paymentStatus === 'paid' ? (
                        <UserCheck className="w-5 h-5 text-green-700" />
                      ) : (
                        <User className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{participant.patientName}</p>
                      <p className="text-sm text-gray-500">{participant.serviceName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      ${(participant.calculatedAmount * (1 - group.discountPercent / 100)).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      participant.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {participant.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedParticipant === participant.patientId && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Service Price</p>
                      <p className="font-medium">${participant.servicePrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">After Discount ({group.discountPercent}%)</p>
                      <p className="font-medium text-green-600">
                        ${(participant.servicePrice * (1 - group.discountPercent / 100)).toFixed(2)}
                      </p>
                    </div>
                    {participant.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{participant.phone}</span>
                      </div>
                    )}
                    {participant.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{participant.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Custom Amount Input */}
                  {splitType === 'custom' && participant.paymentStatus !== 'paid' && (
                    <div className="mb-4">
                      <label className="block text-sm text-gray-600 mb-1">Custom Amount</label>
                      <input
                        type="number"
                        value={participant.customAmount}
                        onChange={(e) => updateCustomAmount(participant.patientId, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  {participant.paymentStatus !== 'paid' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkAsPaid(participant.patientId)}
                        disabled={processingPayment === participant.patientId}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                      >
                        {processingPayment === participant.patientId ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Mark as Paid
                      </button>
                      <button
                        onClick={() => handleSendPaymentRequest(participant)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Send Request
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <div className="flex gap-3">
          <button
            onClick={() => {
              participantPayments
                .filter(p => p.paymentStatus !== 'paid')
                .forEach(p => handleSendPaymentRequest(p));
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Send All Payment Requests
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
