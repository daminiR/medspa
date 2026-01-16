'use client';

import { CreditCard, Check, Trash2 } from 'lucide-react';
import HsaFsaBadge from './HsaFsaBadge';
import type { PaymentMethod } from '@/lib/payments/mockData';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSetDefault: (id: string) => void;
  onToggleHsaFsa: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PaymentMethodCard({
  method,
  onSetDefault,
  onToggleHsaFsa,
  onDelete
}: PaymentMethodCardProps) {
  const brandColors: Record<string, string> = {
    visa: 'from-blue-500 to-blue-600',
    mastercard: 'from-red-500 to-orange-500',
    amex: 'from-blue-700 to-blue-800',
    discover: 'from-orange-500 to-orange-600'
  };

  const brandNames: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Card Visual */}
      <div
        className={`bg-gradient-to-br ${brandColors[method.brand] || 'from-gray-700 to-gray-800'} rounded-lg p-6 text-white mb-4`}
      >
        <div className="flex justify-between items-start mb-8">
          <CreditCard className="w-8 h-8" />
          <div className="flex items-center gap-2">
            {method.isHsaFsa && (
              <span className="bg-emerald-500/30 px-2 py-1 rounded-full text-xs font-medium">
                HSA/FSA
              </span>
            )}
            {method.isDefault && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                Default
              </span>
            )}
          </div>
        </div>
        <div className="text-2xl tracking-wider mb-4 font-mono">
          &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {method.last4}
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-70">Cardholder</p>
            <p className="text-sm font-medium">{method.cardholderName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Expires</p>
            <p className="text-sm font-medium">
              {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70 uppercase">{brandNames[method.brand]}</p>
          </div>
        </div>
      </div>

      {/* HSA/FSA Badge */}
      {method.isHsaFsa && (
        <div className="mb-4">
          <HsaFsaBadge showAmount={false} size="small" />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {!method.isDefault && (
          <button
            onClick={() => onSetDefault(method.id)}
            className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
          >
            <Check className="w-4 h-4 inline mr-1" />
            Set as Default
          </button>
        )}

        <button
          onClick={() => onToggleHsaFsa(method.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            method.isHsaFsa
              ? 'bg-green-50 text-green-600 hover:bg-green-100'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {method.isHsaFsa ? 'HSA/FSA Enabled' : 'Enable HSA/FSA'}
        </button>

        <button
          onClick={() => onDelete(method.id)}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 ml-auto transition-colors"
        >
          <Trash2 className="w-4 h-4 inline mr-1" />
          Delete
        </button>
      </div>
    </div>
  );
}
