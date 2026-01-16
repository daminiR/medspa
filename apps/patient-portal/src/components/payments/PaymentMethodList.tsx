'use client';

import PaymentMethodCard from './PaymentMethodCard';
import type { PaymentMethod } from '@/lib/payments/mockData';

interface PaymentMethodListProps {
  methods: PaymentMethod[];
  onSetDefault: (id: string) => void;
  onToggleHsaFsa: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PaymentMethodList({
  methods,
  onSetDefault,
  onToggleHsaFsa,
  onDelete
}: PaymentMethodListProps) {
  if (methods.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Methods</h3>
        <p className="text-gray-500">Add a card to get started with payments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {methods.map((method) => (
        <PaymentMethodCard
          key={method.id}
          method={method}
          onSetDefault={onSetDefault}
          onToggleHsaFsa={onToggleHsaFsa}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
