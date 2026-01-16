'use client';

import { useState, useMemo } from 'react';
import {
  Calendar, DollarSign, Clock, CheckCircle, AlertCircle, XCircle,
  Plus, Search, Filter, ChevronDown, ChevronRight, User, Phone,
  Mail, CreditCard, RefreshCw, MoreVertical, Eye, Edit, Trash2,
  Send, FileText, TrendingUp
} from 'lucide-react';
import { format, addMonths, isPast, isFuture, differenceInDays } from 'date-fns';

// Types
type PaymentPlanStatus = 'active' | 'completed' | 'defaulted' | 'cancelled' | 'paused';
type InstallmentStatus = 'pending' | 'paid' | 'overdue' | 'waived';

interface Installment {
  id: string;
  dueDate: Date;
  amount: number;
  status: InstallmentStatus;
  paidDate?: Date;
  paidAmount?: number;
  paymentMethod?: string;
}

interface PaymentPlan {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  invoiceId: string;
  invoiceTotal: number;
  downPayment: number;
  downPaymentPaid: boolean;
  remainingBalance: number;
  installmentCount: number;
  installmentAmount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  status: PaymentPlanStatus;
  installments: Installment[];
  notes?: string;
  createdAt: Date;
  services: string[];
}

// Mock data
const mockPaymentPlans: PaymentPlan[] = [
  {
    id: 'pp-001',
    patientId: 'p-101',
    patientName: 'Sarah Johnson',
    patientEmail: 'sarah.j@email.com',
    patientPhone: '(555) 123-4567',
    invoiceId: 'inv-2024-001',
    invoiceTotal: 3600,
    downPayment: 600,
    downPaymentPaid: true,
    remainingBalance: 1200,
    installmentCount: 6,
    installmentAmount: 500,
    frequency: 'monthly',
    startDate: new Date(2024, 9, 1),
    endDate: new Date(2025, 2, 1),
    status: 'active',
    services: ['Full Face Botox Treatment', 'Lip Fillers'],
    installments: [
      { id: 'inst-1', dueDate: new Date(2024, 9, 1), amount: 500, status: 'paid', paidDate: new Date(2024, 9, 1), paidAmount: 500, paymentMethod: 'Credit Card' },
      { id: 'inst-2', dueDate: new Date(2024, 10, 1), amount: 500, status: 'paid', paidDate: new Date(2024, 10, 3), paidAmount: 500, paymentMethod: 'Credit Card' },
      { id: 'inst-3', dueDate: new Date(2024, 11, 1), amount: 500, status: 'paid', paidDate: new Date(2024, 11, 1), paidAmount: 500, paymentMethod: 'Credit Card' },
      { id: 'inst-4', dueDate: new Date(2025, 0, 1), amount: 500, status: 'pending' },
      { id: 'inst-5', dueDate: new Date(2025, 1, 1), amount: 500, status: 'pending' },
      { id: 'inst-6', dueDate: new Date(2025, 2, 1), amount: 500, status: 'pending' },
    ],
    notes: 'Preferred payment date: 1st of month',
    createdAt: new Date(2024, 8, 15),
  },
  {
    id: 'pp-002',
    patientId: 'p-102',
    patientName: 'Michael Chen',
    patientEmail: 'michael.chen@email.com',
    patientPhone: '(555) 234-5678',
    invoiceId: 'inv-2024-002',
    invoiceTotal: 4800,
    downPayment: 800,
    downPaymentPaid: true,
    remainingBalance: 2400,
    installmentCount: 4,
    installmentAmount: 1000,
    frequency: 'monthly',
    startDate: new Date(2024, 10, 1),
    endDate: new Date(2025, 1, 1),
    status: 'active',
    services: ['Full Body Laser Treatment Package'],
    installments: [
      { id: 'inst-7', dueDate: new Date(2024, 10, 1), amount: 1000, status: 'paid', paidDate: new Date(2024, 10, 2), paidAmount: 1000, paymentMethod: 'Debit Card' },
      { id: 'inst-8', dueDate: new Date(2024, 11, 1), amount: 1000, status: 'overdue' },
      { id: 'inst-9', dueDate: new Date(2025, 0, 1), amount: 1000, status: 'pending' },
      { id: 'inst-10', dueDate: new Date(2025, 1, 1), amount: 1000, status: 'pending' },
    ],
    createdAt: new Date(2024, 9, 20),
  },
  {
    id: 'pp-003',
    patientId: 'p-103',
    patientName: 'Emily Rodriguez',
    patientEmail: 'emily.r@email.com',
    patientPhone: '(555) 345-6789',
    invoiceId: 'inv-2024-003',
    invoiceTotal: 2400,
    downPayment: 400,
    downPaymentPaid: true,
    remainingBalance: 0,
    installmentCount: 4,
    installmentAmount: 500,
    frequency: 'biweekly',
    startDate: new Date(2024, 8, 1),
    endDate: new Date(2024, 9, 15),
    status: 'completed',
    services: ['Chemical Peel Series', 'Microneedling'],
    installments: [
      { id: 'inst-11', dueDate: new Date(2024, 8, 1), amount: 500, status: 'paid', paidDate: new Date(2024, 8, 1), paidAmount: 500, paymentMethod: 'Credit Card' },
      { id: 'inst-12', dueDate: new Date(2024, 8, 15), amount: 500, status: 'paid', paidDate: new Date(2024, 8, 15), paidAmount: 500, paymentMethod: 'Credit Card' },
      { id: 'inst-13', dueDate: new Date(2024, 9, 1), amount: 500, status: 'paid', paidDate: new Date(2024, 9, 1), paidAmount: 500, paymentMethod: 'Credit Card' },
      { id: 'inst-14', dueDate: new Date(2024, 9, 15), amount: 500, status: 'paid', paidDate: new Date(2024, 9, 15), paidAmount: 500, paymentMethod: 'Credit Card' },
    ],
    createdAt: new Date(2024, 7, 20),
  },
];

// Helper functions
const getStatusColor = (status: PaymentPlanStatus) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    case 'defaulted': return 'bg-red-100 text-red-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    case 'paused': return 'bg-yellow-100 text-yellow-800';
  }
};

const getInstallmentStatusColor = (status: InstallmentStatus) => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-blue-100 text-blue-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    case 'waived': return 'bg-gray-100 text-gray-800';
  }
};

const calculateProgress = (plan: PaymentPlan): number => {
  const paidInstallments = plan.installments.filter(i => i.status === 'paid').length;
  return Math.round((paidInstallments / plan.installmentCount) * 100);
};

export default function PaymentPlanManagement() {
  const [plans, setPlans] = useState<PaymentPlan[]>(mockPaymentPlans);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentPlanStatus>('all');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    let filtered = plans;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      // Sort by status priority, then by next due date
      const statusPriority = { active: 0, paused: 1, defaulted: 2, completed: 3, cancelled: 4 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [plans, statusFilter, searchQuery]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // Stats
  const stats = useMemo(() => {
    const active = plans.filter(p => p.status === 'active').length;
    const totalOutstanding = plans
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.remainingBalance, 0);
    const overdue = plans.filter(p =>
      p.installments.some(i => i.status === 'overdue')
    ).length;
    const collected = plans.reduce((sum, p) => {
      const paidAmount = p.installments
        .filter(i => i.status === 'paid')
        .reduce((s, i) => s + (i.paidAmount || 0), 0);
      return sum + (p.downPaymentPaid ? p.downPayment : 0) + paidAmount;
    }, 0);

    return { active, totalOutstanding, overdue, collected };
  }, [plans]);

  // Mark installment as paid
  const handleMarkAsPaid = (planId: string, installmentId: string) => {
    setPlans(prev => prev.map(plan => {
      if (plan.id !== planId) return plan;

      const updatedInstallments = plan.installments.map(inst => {
        if (inst.id !== installmentId) return inst;
        return {
          ...inst,
          status: 'paid' as InstallmentStatus,
          paidDate: new Date(),
          paidAmount: inst.amount,
          paymentMethod: 'Credit Card'
        };
      });

      const newPaidAmount = updatedInstallments
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.paidAmount || 0), 0);

      const newRemainingBalance = plan.invoiceTotal - plan.downPayment - newPaidAmount;
      const allPaid = updatedInstallments.every(i => i.status === 'paid' || i.status === 'waived');

      return {
        ...plan,
        installments: updatedInstallments,
        remainingBalance: Math.max(0, newRemainingBalance),
        status: allPaid ? 'completed' as PaymentPlanStatus : plan.status
      };
    }));
  };

  // Send reminder
  const handleSendReminder = (planId: string) => {
    alert('Payment reminder sent!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Plans</h2>
          <p className="text-gray-600">Manage patient financing and installment plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Payment Plan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Active Plans</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Outstanding</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.totalOutstanding.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Overdue</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.overdue}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Collected</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.collected.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name, email, or plan ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="defaulted">Defaulted</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPlans.map((plan) => {
            const progress = calculateProgress(plan);
            const nextInstallment = plan.installments.find(i => i.status === 'pending' || i.status === 'overdue');
            const hasOverdue = plan.installments.some(i => i.status === 'overdue');

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`bg-white rounded-xl border p-6 cursor-pointer transition-all ${
                  selectedPlanId === plan.id
                    ? 'border-purple-500 ring-2 ring-purple-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{plan.patientName}</h3>
                      <p className="text-sm text-gray-500">Plan #{plan.id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-semibold text-gray-900">${plan.invoiceTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Remaining</p>
                    <p className="font-semibold text-gray-900">${plan.remainingBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Frequency</p>
                    <p className="font-semibold text-gray-900 capitalize">{plan.frequency}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        hasOverdue ? 'bg-red-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Next Payment */}
                {nextInstallment && plan.status === 'active' && (
                  <div className={`flex items-center justify-between p-3 rounded-lg ${
                    nextInstallment.status === 'overdue'
                      ? 'bg-red-50 border border-red-100'
                      : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${
                        nextInstallment.status === 'overdue' ? 'text-red-500' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm ${
                        nextInstallment.status === 'overdue' ? 'text-red-700 font-medium' : 'text-gray-700'
                      }`}>
                        {nextInstallment.status === 'overdue' ? 'Overdue: ' : 'Next: '}
                        {format(nextInstallment.dueDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">${nextInstallment.amount}</span>
                  </div>
                )}
              </div>
            );
          })}

          {filteredPlans.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment plans found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create a new payment plan to get started'}
              </p>
            </div>
          )}
        </div>

        {/* Selected Plan Details */}
        <div className="lg:col-span-1">
          {selectedPlan ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Plan Details</h3>
                <button
                  onClick={() => setSelectedPlanId(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Patient Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{selectedPlan.patientName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">{selectedPlan.patientEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">{selectedPlan.patientPhone}</span>
                </div>
              </div>

              {/* Services */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPlan.services.map((service) => (
                    <span key={service} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Installment Schedule */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Schedule</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedPlan.installments.map((inst, index) => (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            ${inst.amount}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(inst.dueDate, 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getInstallmentStatusColor(inst.status)}`}>
                          {inst.status}
                        </span>
                        {(inst.status === 'pending' || inst.status === 'overdue') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsPaid(selectedPlan.id, inst.id);
                            }}
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            title="Mark as paid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleSendReminder(selectedPlan.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                  Send Payment Reminder
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <CreditCard className="w-4 h-4" />
                  Record Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a payment plan to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
