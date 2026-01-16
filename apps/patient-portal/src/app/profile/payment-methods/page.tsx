'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, CreditCard, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PaymentMethodList,
  AddPaymentMethodModal,
  TaxSavingsCalculator
} from '@/components/payments';
import { paymentService } from '@/lib/payments/paymentService';
import type { PaymentMethod } from '@/lib/payments/mockData';

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    // Load payment methods on mount
    setPaymentMethods(paymentService.getPaymentMethods());
  }, []);

  const handleSetDefault = (id: string) => {
    paymentService.setDefaultPaymentMethod(id);
    setPaymentMethods(paymentService.getPaymentMethods());
  };

  const handleToggleHsaFsa = (id: string) => {
    paymentService.toggleHsaFsa(id);
    setPaymentMethods(paymentService.getPaymentMethods());
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      paymentService.deletePaymentMethod(deleteConfirmId);
      setPaymentMethods(paymentService.getPaymentMethods());
      setDeleteConfirmId(null);
    }
  };

  const handleAddMethod = (method: Omit<PaymentMethod, 'id'>) => {
    paymentService.addPaymentMethod(method);
    setPaymentMethods(paymentService.getPaymentMethods());
  };

  const hsaFsaMethods = paymentMethods.filter((m) => m.isHsaFsa);
  const hasHsaFsa = hsaFsaMethods.length > 0;

  // Mock eligible amount for calculator (in a real app, this would come from API)
  const mockEligibleAmount = 315;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/profile"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
            <p className="text-gray-500 mt-1">Manage your cards and HSA/FSA accounts</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      {/* HSA/FSA Summary */}
      {hasHsaFsa && (
        <div className="mb-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Heart className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">HSA/FSA Cards</h2>
              <p className="text-gray-600">
                You have {hsaFsaMethods.length} HSA/FSA enabled{' '}
                {hsaFsaMethods.length === 1 ? 'card' : 'cards'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hsaFsaMethods.map((method) => (
              <div
                key={method.id}
                className="bg-white rounded-lg p-4 flex items-center gap-3"
              >
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ending in{' '}
                    {method.last4}
                  </p>
                  <p className="text-sm text-emerald-600 font-medium">HSA/FSA Enabled</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Payment Methods</h2>
        <PaymentMethodList
          methods={paymentMethods}
          onSetDefault={handleSetDefault}
          onToggleHsaFsa={handleToggleHsaFsa}
          onDelete={handleDelete}
        />
      </div>

      {/* Tax Savings Calculator */}
      {hasHsaFsa && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Estimate Your Savings
          </h2>
          <TaxSavingsCalculator eligibleAmount={mockEligibleAmount} />
        </div>
      )}

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMethod}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Payment Method?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this card? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
