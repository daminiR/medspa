'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, Receipt, Mail } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to billing page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/billing');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Transaction ID</span>
            <span className="font-mono text-sm">TXN-{Date.now()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status</span>
            <span className="text-green-600 font-medium">Completed</span>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Receipt className="w-4 h-4" />
            Print Receipt
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Mail className="w-4 h-4" />
            Email Receipt
          </button>
        </div>

        <button
          onClick={() => router.push('/billing')}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Redirecting to billing page in 5 seconds...
        </p>
      </div>
    </div>
  );
}