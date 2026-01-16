'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
  Check,
  User,
  Mail,
  Phone,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<'info' | 'verify' | 'complete'> ('info');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          marketingOptIn,
          smsOptIn,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to home
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-600 mt-2">Join Luxe Medical Spa today</p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ' + (step === 'info' ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600')}>
                {step === 'info' ? '1' : <Check className="w-4 h-4" />}
              </div>
              <div className={'w-16 h-1 ' + (step !== 'info' ? 'bg-primary-600' : 'bg-gray-200')} />
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ' + (step === 'verify' ? 'bg-primary-600 text-white' : step === 'complete' ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500')}>
                {step === 'complete' ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className={'w-16 h-1 ' + (step === 'complete' ? 'bg-primary-600' : 'bg-gray-200')} />
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ' + (step === 'complete' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500')}>
                3
              </div>
            </div>
          </div>

          {/* Registration form */}
          {step === 'info' && (
            <div className="card p-6">
              <form onSubmit={handleSubmit}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your information</h3>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-error-50 text-error-700 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="label mb-1 block">
                      First name
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jane"
                        className="input pl-10"
                        required
                        autoComplete="given-name"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="label mb-1 block">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="input"
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="label mb-1 block">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="input pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="phone" className="label mb-1 block">
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="input pl-10"
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Opt-ins */}
                <div className="space-y-3 mb-6">
                  <label className="flex items-start cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={marketingOptIn}
                      onChange={(e) => setMarketingOptIn(e.target.checked)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
                      Send me exclusive offers and promotions
                    </span>
                  </label>

                  <label className="flex items-start cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={smsOptIn}
                      onChange={(e) => setSmsOptIn(e.target.checked)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900">
                      Send me appointment reminders via SMS
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !firstName || !lastName || !email || !phone}
                  className="btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>

                <p className="mt-4 text-xs text-gray-500 text-center">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
                </p>
              </form>

              {/* Sign in link */}
              <div className="text-center pt-6 border-t border-gray-200 mt-6">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary-600 font-medium hover:text-primary-700">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Verification step */}
          {step === 'verify' && (
            <div className="card p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify your email</h3>
              <p className="text-gray-600 mb-6">
                We sent a verification link to <strong>{email}</strong>.
                Please click the link to complete your registration.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setStep('complete')}
                  className="btn-primary btn-lg w-full"
                >
                  I have verified my email
                </button>
                <button
                  onClick={() => {
                    // Resend verification email
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 1000);
                  }}
                  disabled={isLoading}
                  className="w-full text-sm text-gray-600 hover:text-gray-900"
                >
                  {isLoading ? 'Sending...' : "Didn't receive the email? Resend"}
                </button>
              </div>
            </div>
          )}

          {/* Complete step */}
          {step === 'complete' && (
            <div className="card p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Luxe Medical Spa!</h3>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully.
                You are ready to book your first appointment.
              </p>

              <div className="space-y-4">
                <Link href="/booking" className="btn-primary btn-lg w-full inline-flex items-center justify-center">
                  Book Your First Appointment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/appointments"
                  className="block w-full text-sm text-gray-600 hover:text-gray-900"
                >
                  Go to dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
