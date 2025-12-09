'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { getStripe, stripeAPI } from '@/services/stripe/client';
import { 
  CreditCard, 
  Lock, 
  AlertCircle, 
  Check,
  Loader2,
  DollarSign,
  X
} from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  invoiceId?: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

function PaymentForm({ 
  amount, 
  patientId, 
  patientName,
  patientEmail,
  invoiceId,
  onSuccess, 
  onCancel 
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'check'>('card');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod !== 'card') {
      // Handle cash/check payments differently
      alert(`Processing ${paymentMethod} payment of $${amount.toFixed(2)}`);
      onSuccess('cash-payment-' + Date.now());
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'An error occurred');
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/billing/payment-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      // Payment succeeded
      onSuccess('payment-successful');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'card'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Card</div>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`p-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'cash'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <DollarSign className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Cash</div>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('check')}
            className={`p-3 rounded-lg border-2 transition-all ${
              paymentMethod === 'check'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Check className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Check</div>
          </button>
        </div>
      </div>

      {/* Card Payment Form */}
      {paymentMethod === 'card' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <PaymentElement 
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card'],
            }}
          />
        </div>
      )}

      {/* Cash Payment Form */}
      {paymentMethod === 'cash' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-center py-6">
            <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-gray-600">Cash payment will be recorded</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ${amount.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Check Payment Form */}
      {paymentMethod === 'check' && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Check Number</label>
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter check number"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Bank Name</label>
            <input
              type="text"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter bank name"
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{errorMessage}</span>
        </div>
      )}

      {/* Security Badge */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock className="w-4 h-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Process ${amount.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const paymentIntent = await stripeAPI.createPaymentIntent({
          amount: props.amount,
          patientId: props.patientId,
          patientEmail: props.patientEmail,
          description: `Payment for ${props.patientName}`,
          metadata: {
            invoiceId: props.invoiceId || '',
            patientName: props.patientName,
          },
        });
        setClientSecret(paymentIntent.clientSecret);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [props.amount, props.patientId, props.patientEmail, props.patientName, props.invoiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Payment Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#7c3aed',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
}