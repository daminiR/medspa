'use client';

import { useState } from 'react';
import { Check, Sparkles, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { GroupBooking } from '@/lib/groups/groupService';
import {
  availableServices,
  getPaymentModeLabel,
  getNextDiscountTier,
  DISCOUNT_TIERS,
} from '@/lib/groups/groupService';

interface JoinGroupFormProps {
  group: GroupBooking;
  onJoin: (serviceId: string, specialRequests: string) => void;
  isJoining: boolean;
  error?: string;
}

export function JoinGroupForm({ group, onJoin, isJoining, error }: JoinGroupFormProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState('');

  const selectedServiceData = availableServices.find((s) => s.id === selectedService);
  const nextTier = getNextDiscountTier(group.participants.length + 1);

  const formatPrice = (price: number) => {
    return '$' + price.toFixed(0);
  };

  const calculateDiscountedPrice = (price: number) => {
    if (group.discountPercent > 0) {
      return price * (1 - group.discountPercent / 100);
    }
    return price;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService) {
      onJoin(selectedService, specialRequests);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Your Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableServices.map((service) => {
            const discountedPrice = calculateDiscountedPrice(service.price);
            const isSelected = selectedService === service.id;
            
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedService(service.id)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-all',
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {service.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {group.discountPercent > 0 ? (
                          <>
                            <span className="line-through text-gray-400">{formatPrice(service.price)}</span>
                            <span className="text-green-600 font-medium">{formatPrice(discountedPrice)}</span>
                          </>
                        ) : (
                          formatPrice(service.price)
                        )}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discount Tiers Info */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-purple-900">Group Discount Tiers</p>
              <div className="mt-2 space-y-1 text-sm">
                {DISCOUNT_TIERS.map((tier) => (
                  <div
                    key={tier.minSize}
                    className={cn(
                      'flex items-center gap-2',
                      group.participants.length + 1 >= tier.minSize
                        ? 'text-green-700 font-medium'
                        : 'text-gray-600'
                    )}
                  >
                    {group.participants.length + 1 >= tier.minSize && (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{tier.label}</span>
                  </div>
                ))}
              </div>
              {nextTier && (
                <p className="mt-3 text-sm text-purple-700">
                  Add {nextTier.needed} more guest{nextTier.needed !== 1 ? 's' : ''} to unlock {nextTier.discount}% discount!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
          <p className="text-sm text-gray-600">{getPaymentModeLabel(group.paymentMode)}</p>
          {group.depositRequired && (
            <p className="text-sm text-gray-500 mt-1">
              A deposit of ${group.depositAmount} may be required.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Special Requests */}
      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
          Special Requests (optional)
        </label>
        <textarea
          id="specialRequests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Any allergies, preferences, or notes for your appointment..."
          className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Summary & Submit */}
      {selectedServiceData && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Your Selection</h4>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{selectedServiceData.name}</span>
            <span className="text-gray-900">{formatPrice(selectedServiceData.price)}</span>
          </div>
          {group.discountPercent > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Group Discount ({group.discountPercent}%)</span>
              <span>-{formatPrice(selectedServiceData.price * group.discountPercent / 100)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base mt-2 pt-2 border-t border-gray-200">
            <span>Your Total</span>
            <span>{formatPrice(calculateDiscountedPrice(selectedServiceData.price))}</span>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!selectedService || isJoining}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        size="lg"
      >
        {isJoining ? 'Joining...' : 'Join This Group'}
      </Button>
    </form>
  );
}
