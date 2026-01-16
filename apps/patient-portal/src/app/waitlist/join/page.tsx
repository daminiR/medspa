'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  User,
  Sparkles,
  Syringe,
  Zap,
  Droplets,
  Sun,
  Heart,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// Types
interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  icon: React.ReactNode;
  description: string;
}

interface Provider {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  image: string;
}

interface FormData {
  serviceId: string | null;
  providerId: string | null;
  availabilityType: 'anytime_week' | 'anytime_month' | 'specific' | null;
  specificDays: string[];
  timeWindows: string[];
  smsConsent: boolean;
  referralSource: string;
}

// Mock data
const services: Service[] = [
  { id: '1', name: 'Botox', category: 'Injectables', duration: 30, price: 350, icon: <Syringe className="w-6 h-6" />, description: 'Smooth wrinkles and fine lines' },
  { id: '2', name: 'Dermal Fillers', category: 'Injectables', duration: 45, price: 650, icon: <Droplets className="w-6 h-6" />, description: 'Restore volume and contour' },
  { id: '3', name: 'Hydrafacial', category: 'Facials', duration: 60, price: 250, icon: <Sparkles className="w-6 h-6" />, description: 'Deep cleanse and hydration' },
  { id: '4', name: 'Laser Hair Removal', category: 'Laser', duration: 30, price: 300, icon: <Zap className="w-6 h-6" />, description: 'Permanent hair reduction' },
  { id: '5', name: 'Chemical Peel', category: 'Facials', duration: 45, price: 200, icon: <Sun className="w-6 h-6" />, description: 'Skin resurfacing treatment' },
  { id: '6', name: 'Lip Enhancement', category: 'Injectables', duration: 30, price: 500, icon: <Heart className="w-6 h-6" />, description: 'Fuller, natural-looking lips' },
];

const providers: Provider[] = [
  { id: '1', name: 'Dr. Sarah Smith', title: 'Medical Director', specialties: ['Injectables', 'Facial Aesthetics'], image: '/providers/sarah.jpg' },
  { id: '2', name: 'Dr. Michael Chen', title: 'Dermatologist', specialties: ['Laser Treatments', 'Skin Care'], image: '/providers/michael.jpg' },
  { id: '3', name: 'Jessica Taylor', title: 'Nurse Injector', specialties: ['Botox', 'Fillers'], image: '/providers/jessica.jpg' },
  { id: '4', name: 'Amanda Davis', title: 'Aesthetician', specialties: ['Facials', 'Chemical Peels'], image: '/providers/amanda.jpg' },
];

const categories = ['All', 'Injectables', 'Facials', 'Laser'];
const days = [
  { id: 'mon', label: 'M', fullLabel: 'Monday' },
  { id: 'tue', label: 'T', fullLabel: 'Tuesday' },
  { id: 'wed', label: 'W', fullLabel: 'Wednesday' },
  { id: 'thu', label: 'Th', fullLabel: 'Thursday' },
  { id: 'fri', label: 'F', fullLabel: 'Friday' },
  { id: 'sat', label: 'S', fullLabel: 'Saturday' },
  { id: 'sun', label: 'Su', fullLabel: 'Sunday' },
];
const timeWindows = [
  { id: 'morning', label: 'Morning', description: '8am - 12pm' },
  { id: 'afternoon', label: 'Afternoon', description: '12pm - 5pm' },
  { id: 'evening', label: 'Evening', description: '5pm - 8pm' },
];
const referralSources = [
  'Google Search',
  'Social Media',
  'Friend/Family',
  'Previous Patient',
  'Yelp/Reviews',
  'Other',
];

export default function JoinWaitlistPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    serviceId: null,
    providerId: null,
    availabilityType: null,
    specificDays: [],
    timeWindows: [],
    smsConsent: false,
    referralSource: '',
  });

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const selectedService = services.find(s => s.id === formData.serviceId);
  const selectedProvider = providers.find(p => p.id === formData.providerId);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!formData.serviceId) {
          newErrors.service = 'Please select a service';
        }
        break;
      case 3:
        if (!formData.availabilityType) {
          newErrors.availability = 'Please select your availability';
        }
        if (formData.availabilityType === 'specific') {
          if (formData.specificDays.length === 0) {
            newErrors.days = 'Please select at least one day';
          }
          if (formData.timeWindows.length === 0) {
            newErrors.timeWindows = 'Please select at least one time window';
          }
        }
        break;
      case 4:
        if (!formData.smsConsent) {
          newErrors.smsConsent = 'SMS consent is required to receive waitlist notifications';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Navigate to dashboard on success
    router.push('/waitlist?joined=true');
  };

  const toggleDay = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      specificDays: prev.specificDays.includes(dayId)
        ? prev.specificDays.filter(d => d !== dayId)
        : [...prev.specificDays, dayId],
    }));
  };

  const toggleTimeWindow = (windowId: string) => {
    setFormData(prev => ({
      ...prev,
      timeWindows: prev.timeWindows.includes(windowId)
        ? prev.timeWindows.filter(w => w !== windowId)
        : [...prev.timeWindows, windowId],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/waitlist" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
          <ChevronLeft className="w-4 h-4 inline mr-1" />
          Back to Waitlist
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Join Our Waitlist</h1>
      <p className="text-gray-600 mb-8">Get notified when an appointment opens up</p>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ' +
                (step > s
                  ? 'bg-green-500 text-white'
                  : step === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-600')
              }
            >
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={
                  'w-12 sm:w-16 h-1 mx-1 sm:mx-2 transition-colors ' +
                  (step > s ? 'bg-green-500' : 'bg-gray-200')
                }
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="hidden sm:flex justify-center mb-8 text-xs text-gray-500">
        <span className={step >= 1 ? 'text-purple-600 font-medium' : ''}>Service</span>
        <span className="mx-8"></span>
        <span className={step >= 2 ? 'text-purple-600 font-medium' : ''}>Provider</span>
        <span className="mx-8"></span>
        <span className={step >= 3 ? 'text-purple-600 font-medium' : ''}>Availability</span>
        <span className="mx-8"></span>
        <span className={step >= 4 ? 'text-purple-600 font-medium' : ''}>Confirm</span>
      </div>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Service</CardTitle>
            <CardDescription>Choose the service you would like to be waitlisted for</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setFormData(prev => ({ ...prev, serviceId: service.id }))}
                  className={
                    'p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ' +
                    (formData.serviceId === service.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300')
                  }
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={
                        'w-12 h-12 rounded-lg flex items-center justify-center ' +
                        (formData.serviceId === service.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600')
                      }
                    >
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{service.description}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration} min
                        </span>
                        <span className="font-medium">${service.price}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {errors.service && (
              <div className="flex items-center gap-2 text-red-500 text-sm mb-4">
                <AlertCircle className="w-4 h-4" />
                {errors.service}
              </div>
            )}

            <Button className="w-full" onClick={handleNext} disabled={!formData.serviceId}>
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Provider Preference */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Provider Preference</CardTitle>
            <CardDescription>Optional: Choose a preferred provider or select any available</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Any Available Option */}
            <button
              onClick={() => setFormData(prev => ({ ...prev, providerId: null }))}
              className={
                'w-full p-4 rounded-lg border-2 transition-all text-left mb-4 hover:shadow-md ' +
                (formData.providerId === null
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300')
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={
                    'w-12 h-12 rounded-full flex items-center justify-center ' +
                    (formData.providerId === null
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600')
                  }
                >
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Any Available Provider</h3>
                  <p className="text-sm text-gray-500">Get notified for the first available slot</p>
                </div>
                {formData.providerId === null && (
                  <Check className="w-5 h-5 text-purple-600 ml-auto" />
                )}
              </div>
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">or choose a provider</span>
              </div>
            </div>

            {/* Provider List */}
            <div className="space-y-3 mb-6">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setFormData(prev => ({ ...prev, providerId: provider.id }))}
                  className={
                    'w-full p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ' +
                    (formData.providerId === provider.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300')
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                      {provider.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{provider.name}</h3>
                      <p className="text-sm text-gray-500">{provider.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {provider.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    {formData.providerId === provider.id && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button className="flex-1" onClick={handleNext}>
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Availability */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Availability</CardTitle>
            <CardDescription>When are you available for an appointment?</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Quick Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setFormData(prev => ({
                  ...prev,
                  availabilityType: 'anytime_week',
                  specificDays: [],
                  timeWindows: [],
                }))}
                className={
                  'p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ' +
                  (formData.availabilityType === 'anytime_week'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300')
                }
              >
                <h3 className="font-semibold">Anytime This Week</h3>
                <p className="text-sm text-gray-500">Flexible for the next 7 days</p>
              </button>
              <button
                onClick={() => setFormData(prev => ({
                  ...prev,
                  availabilityType: 'anytime_month',
                  specificDays: [],
                  timeWindows: [],
                }))}
                className={
                  'p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ' +
                  (formData.availabilityType === 'anytime_month'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300')
                }
              >
                <h3 className="font-semibold">Anytime This Month</h3>
                <p className="text-sm text-gray-500">Flexible for the next 30 days</p>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">or specify your availability</span>
              </div>
            </div>

            {/* Specific Days */}
            <div className="mb-6">
              <Label className="block mb-3">Select Days</Label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, availabilityType: 'specific' }));
                      toggleDay(day.id);
                    }}
                    className={
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-full font-semibold transition-colors ' +
                      (formData.specificDays.includes(day.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                    }
                    title={day.fullLabel}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {errors.days && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.days}
                </div>
              )}
            </div>

            {/* Time Windows */}
            <div className="mb-6">
              <Label className="block mb-3">Preferred Time</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {timeWindows.map((window) => (
                  <button
                    key={window.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, availabilityType: 'specific' }));
                      toggleTimeWindow(window.id);
                    }}
                    className={
                      'p-3 rounded-lg border-2 transition-all text-center hover:shadow-md ' +
                      (formData.timeWindows.includes(window.id)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300')
                    }
                  >
                    <h4 className="font-semibold">{window.label}</h4>
                    <p className="text-sm text-gray-500">{window.description}</p>
                  </button>
                ))}
              </div>
              {errors.timeWindows && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.timeWindows}
                </div>
              )}
            </div>

            {errors.availability && (
              <div className="flex items-center gap-2 text-red-500 text-sm mb-4">
                <AlertCircle className="w-4 h-4" />
                {errors.availability}
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button className="flex-1" onClick={handleNext}>
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Your Waitlist Entry</CardTitle>
            <CardDescription>Review your selections and join the waitlist</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold">{selectedService?.duration} minutes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Provider</span>
                <span className="font-semibold">
                  {selectedProvider ? selectedProvider.name : 'Any Available'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Availability</span>
                <span className="font-semibold">
                  {formData.availabilityType === 'anytime_week'
                    ? 'Anytime This Week'
                    : formData.availabilityType === 'anytime_month'
                    ? 'Anytime This Month'
                    : `${formData.specificDays.length} days, ${formData.timeWindows.length} time slots`}
                </span>
              </div>
            </div>

            {/* SMS Consent */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.smsConsent}
                  onChange={(e) => setFormData(prev => ({ ...prev, smsConsent: e.target.checked }))}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-medium">SMS Notifications</span>
                  <span className="text-red-500 ml-1">*</span>
                  <p className="text-sm text-gray-500 mt-1">
                    I agree to receive SMS notifications when appointments become available.
                    Message and data rates may apply. You can opt out at any time.
                  </p>
                </div>
              </label>
              {errors.smsConsent && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-2 ml-8">
                  <AlertCircle className="w-4 h-4" />
                  {errors.smsConsent}
                </div>
              )}
            </div>

            {/* Referral Source */}
            <div className="mb-6">
              <Label htmlFor="referralSource" className="block mb-2">
                How did you hear about us? <span className="text-gray-400">(optional)</span>
              </Label>
              <select
                id="referralSource"
                value={formData.referralSource}
                onChange={(e) => setFormData(prev => ({ ...prev, referralSource: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select an option</option>
                {referralSources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={handleBack} disabled={isSubmitting}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Waitlist'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
