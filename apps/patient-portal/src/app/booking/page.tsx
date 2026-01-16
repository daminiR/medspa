'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Check, Star, User, Clock } from 'lucide-react';

// Provider interface
interface Provider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  image: string;
  rating: number;
  reviewCount: number;
}

// Mock providers data
const providers: Provider[] = [
  {
    id: '1',
    name: 'Dr. Sarah Smith',
    title: 'Medical Director',
    specialty: 'Injectables & Facial Aesthetics',
    image: '/providers/sarah.jpg',
    rating: 4.9,
    reviewCount: 127,
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    title: 'Dermatologist',
    specialty: 'Laser Treatments & Skin Care',
    image: '/providers/michael.jpg',
    rating: 4.8,
    reviewCount: 94,
  },
  {
    id: '3',
    name: 'Jessica Taylor',
    title: 'Nurse Injector',
    specialty: 'Botox & Dermal Fillers',
    image: '/providers/jessica.jpg',
    rating: 4.9,
    reviewCount: 156,
  },
  {
    id: '4',
    name: 'Amanda Davis',
    title: 'Licensed Aesthetician',
    specialty: 'Facials & Chemical Peels',
    image: '/providers/amanda.jpg',
    rating: 4.7,
    reviewCount: 83,
  },
];

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const services = [
    { id: '1', name: 'Botox', duration: '30 min', price: 350, category: 'Injectables' },
    { id: '2', name: 'Dermal Fillers', duration: '45 min', price: 650, category: 'Injectables' },
    { id: '3', name: 'Hydrafacial', duration: '60 min', price: 250, category: 'Facials' },
    { id: '4', name: 'Laser Hair Removal', duration: '30 min', price: 300, category: 'Laser' },
  ];

  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const stepLabels = ['Service', 'Provider', 'Date & Time', 'Confirm'];

  const handleBooking = () => {
    // Save booking state to sessionStorage for the confirmation page
    const service = getSelectedService();
    const provider = getSelectedProvider();
    const bookingData = {
      service: service?.name || '',
      duration: service?.duration || '',
      price: service?.price || 0,
      provider: selectedProvider === 'any' ? 'Any Available Provider' : provider?.name || '',
      date: selectedDate || '',
      time: selectedTime || '',
    };
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    router.push('/booking/confirmed');
  };

  const getSelectedService = () => services.find(s => s.id === selectedService);
  const getSelectedProvider = () => providers.find(p => p.id === selectedProvider);

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
      <p className="text-gray-600 mb-8">Schedule your next treatment with us</p>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ' +
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
                  'w-12 sm:w-16 h-1 mx-1 sm:mx-2 transition-all duration-300 ' +
                  (step > s ? 'bg-green-500' : 'bg-gray-200')
                }
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="hidden sm:flex justify-center mb-8 text-xs text-gray-500">
        {stepLabels.map((label, index) => (
          <span
            key={label}
            className={
              (step >= index + 1 ? 'text-purple-600 font-medium' : '') +
              (index < stepLabels.length - 1 ? ' mx-6' : '')
            }
          >
            {label}
          </span>
        ))}
      </div>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Select Service</CardTitle>
            <CardDescription>Choose the treatment you would like to book</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={
                    'p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ' +
                    (selectedService === service.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300')
                  }
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        {selectedService === service.id && (
                          <Check className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                          {service.category}
                        </span>
                      </div>
                    </div>
                    <p className="font-semibold text-lg">${service.price}</p>
                  </div>
                </button>
              ))}
            </div>
            <Button
              className="w-full mt-6"
              disabled={!selectedService}
              onClick={() => setStep(2)}
            >
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Provider Selection */}
      {step === 2 && (
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Select Provider</CardTitle>
            <CardDescription>Choose your preferred provider or let us match you with anyone available</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Any Available Provider Option */}
            <button
              onClick={() => setSelectedProvider('any')}
              className={
                'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left mb-4 hover:shadow-md ' +
                (selectedProvider === 'any'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300')
              }
            >
              <div className="flex items-center gap-4">
                <div
                  className={
                    'w-14 h-14 rounded-full flex items-center justify-center ' +
                    (selectedProvider === 'any'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600')
                  }
                >
                  <User className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Any Available Provider</h3>
                  <p className="text-sm text-gray-500">We will match you with the first available provider</p>
                </div>
                {selectedProvider === 'any' && (
                  <Check className="w-6 h-6 text-purple-600" />
                )}
              </div>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">or choose a specific provider</span>
              </div>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={
                    'p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ' +
                    (selectedProvider === provider.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300')
                  }
                >
                  <div className="flex items-start gap-3">
                    {/* Provider Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                      {provider.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-sm text-gray-500">{provider.title}</p>
                        </div>
                        {selectedProvider === provider.id && (
                          <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{provider.specialty}</p>
                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex items-center">
                          {renderStars(provider.rating)}
                        </div>
                        <span className="text-sm font-medium ml-1">{provider.rating}</span>
                        <span className="text-xs text-gray-400">({provider.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedProvider}
                onClick={() => setStep(3)}
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Date & Time Selection */}
      {step === 3 && (
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle>Select Date & Time</CardTitle>
            <CardDescription>Choose your preferred appointment date and time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Available Times</label>
              <div className="grid grid-cols-3 gap-3">
                {times.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={
                      'py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium ' +
                      (selectedTime === time
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50')
                    }
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(4)}
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <Card className="transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle>Confirm Your Booking</CardTitle>
            <CardDescription>Please review your appointment details</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold">{getSelectedService()?.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold">{getSelectedService()?.duration}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Provider</span>
                <span className="font-semibold">
                  {selectedProvider === 'any'
                    ? 'Any Available Provider'
                    : getSelectedProvider()?.name || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold">
                  {selectedDate
                    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Time</span>
                <span className="font-semibold">{selectedTime}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold text-xl text-purple-600">
                  ${getSelectedService()?.price}
                </span>
              </div>
            </div>

            {/* Cancellation Policy Notice */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Cancellation Policy:</strong> Free cancellation up to 24 hours before your appointment.
                Late cancellations may be subject to a fee.
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleBooking}
              >
                Confirm Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
