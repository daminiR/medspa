'use client';

import { useState, useMemo } from 'react';
import { X, CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PaymentMethod } from '@/lib/payments/mockData';
import {
  luhnCheck,
  detectCardType,
  validateCardPayment,
  formatCardNumber,
  validateExpiry,
  CARD_TYPES
} from '@/lib/validations/cardValidation';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (method: Omit<PaymentMethod, 'id'>) => void;
}

interface ValidationErrors {
  cardNumber?: string;
  cardholderName?: string;
  expiry?: string;
  cvv?: string;
}

export default function AddPaymentMethodModal({
  isOpen,
  onClose,
  onAdd
}: AddPaymentMethodModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [isHsaFsa, setIsHsaFsa] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Detect card type from number
  const detectedCardType = useMemo(() => {
    const cleaned = cardNumber.replace(/\D/g, '');
    return detectCardType(cleaned);
  }, [cardNumber]);

  // Real-time card number validation
  const cardNumberValidation = useMemo(() => {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length === 0) return { isValid: null, message: '' };
    if (cleaned.length < 13) return { isValid: null, message: `${13 - cleaned.length} more digits needed` };
    const valid = luhnCheck(cleaned);
    return {
      isValid: valid,
      message: valid ? 'Valid card number' : 'Invalid card number'
    };
  }, [cardNumber]);

  // Check if form is valid enough to submit
  const isFormValid = useMemo(() => {
    const cleaned = cardNumber.replace(/\D/g, '');
    return (
      cleaned.length >= 13 &&
      luhnCheck(cleaned) &&
      cardholderName.trim().length >= 2 &&
      expiryMonth &&
      expiryYear &&
      cvv.replace(/\D/g, '').length >= 3
    );
  }, [cardNumber, cardholderName, expiryMonth, expiryYear, cvv]);

  if (!isOpen) return null;

  const detectBrand = (number: string): PaymentMethod['brand'] => {
    const type = detectCardType(number.replace(/\D/g, ''));
    if (type === 'visa' || type === 'mastercard' || type === 'amex' || type === 'discover') {
      return type;
    }
    return 'visa'; // Default fallback
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Run comprehensive validation
    const validation = validateCardPayment({
      cardNumber,
      cardholderName,
      expiryMonth,
      expiryYear,
      cvv
    });

    if (!validation.isValid) {
      setErrors({
        cardNumber: validation.errors.cardNumber,
        cardholderName: validation.errors.cardholderName,
        expiry: validation.errors.expiry || validation.errors.expiryMonth || validation.errors.expiryYear,
        cvv: validation.errors.cvv
      });
      setTouched({ cardNumber: true, cardholderName: true, expiry: true, cvv: true });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Simulate API call delay
    setTimeout(() => {
      const cleanedNumber = cardNumber.replace(/\s/g, '');
      const newMethod: Omit<PaymentMethod, 'id'> = {
        type: 'card',
        brand: detectBrand(cleanedNumber),
        last4: cleanedNumber.slice(-4),
        expiryMonth: parseInt(expiryMonth),
        expiryYear: parseInt(expiryYear),
        isDefault,
        isHsaFsa,
        cardholderName
      };

      onAdd(newMethod);
      setIsSubmitting(false);
      resetForm();
      onClose();
    }, 500);
  };

  const resetForm = () => {
    setCardNumber('');
    setCardholderName('');
    setExpiryMonth('');
    setExpiryYear('');
    setCvv('');
    setIsHsaFsa(false);
    setIsDefault(false);
    setErrors({});
    setTouched({});
  };

  // Clear specific error when field changes
  const handleFieldChange = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold">Add Payment Method</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Card Number */}
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative mt-1">
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  setCardNumber(formatCardNumber(e.target.value));
                  handleFieldChange('cardNumber');
                }}
                onBlur={() => setTouched(prev => ({ ...prev, cardNumber: true }))}
                maxLength={19}
                required
                className={`pr-10 ${errors.cardNumber && touched.cardNumber ? 'border-red-500 focus:ring-red-500' : ''} ${cardNumberValidation.isValid === true ? 'border-green-500' : ''}`}
                aria-invalid={!!errors.cardNumber}
                aria-describedby={errors.cardNumber ? 'cardNumber-error' : undefined}
              />
              {/* Card type indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {detectedCardType && (
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {CARD_TYPES[detectedCardType]?.displayName || detectedCardType}
                  </span>
                )}
                {cardNumberValidation.isValid === true && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {cardNumberValidation.isValid === false && touched.cardNumber && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            {/* Validation message */}
            {cardNumberValidation.message && cardNumber.length > 0 && (
              <p className={`mt-1 text-xs ${cardNumberValidation.isValid === false ? 'text-red-500' : cardNumberValidation.isValid === true ? 'text-green-600' : 'text-gray-500'}`}>
                {cardNumberValidation.message}
              </p>
            )}
            {errors.cardNumber && touched.cardNumber && (
              <p id="cardNumber-error" className="mt-1 text-xs text-red-500" role="alert">
                {errors.cardNumber}
              </p>
            )}
          </div>

          {/* Cardholder Name */}
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => {
                setCardholderName(e.target.value);
                handleFieldChange('cardholderName');
              }}
              onBlur={() => setTouched(prev => ({ ...prev, cardholderName: true }))}
              required
              className={`mt-1 ${errors.cardholderName && touched.cardholderName ? 'border-red-500 focus:ring-red-500' : ''}`}
              aria-invalid={!!errors.cardholderName}
            />
            {errors.cardholderName && touched.cardholderName && (
              <p className="mt-1 text-xs text-red-500" role="alert">{errors.cardholderName}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expiryMonth">Month</Label>
              <select
                id="expiryMonth"
                value={expiryMonth}
                onChange={(e) => setExpiryMonth(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {String(month).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="expiryYear">Year</Label>
              <select
                id="expiryYear"
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">YY</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => {
                  setCvv(e.target.value.replace(/\D/g, '').substring(0, 4));
                  handleFieldChange('cvv');
                }}
                onBlur={() => setTouched(prev => ({ ...prev, cvv: true }))}
                maxLength={4}
                required
                className={`mt-1 ${errors.cvv && touched.cvv ? 'border-red-500 focus:ring-red-500' : ''}`}
                aria-invalid={!!errors.cvv}
              />
              {errors.cvv && touched.cvv && (
                <p className="mt-1 text-xs text-red-500" role="alert">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* Expiry error */}
          {errors.expiry && touched.expiry && (
            <p className="text-xs text-red-500" role="alert">{errors.expiry}</p>
          )}

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isHsaFsa}
                onChange={(e) => setIsHsaFsa(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="font-medium text-gray-900">HSA/FSA Card</span>
                <p className="text-sm text-gray-500">Use for eligible medical expenses</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="font-medium text-gray-900">Set as Default</span>
                <p className="text-sm text-gray-500">Use this card for all payments</p>
              </div>
            </label>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Your card information is encrypted and secure</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? 'Adding...' : 'Add Card'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
