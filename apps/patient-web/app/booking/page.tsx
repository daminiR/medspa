'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, addDays, parseISO, startOfDay, isSameDay } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  User,
  Calendar,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Star,
} from 'lucide-react';
import { servicesApi, bookingApi, type Service, type ServiceCategory, type AppointmentSlot } from '@/lib/api';

type Step = 'service' | 'datetime' | 'confirm';

interface BookingState {
  service: Service | null;
  date: Date | null;
  slot: AppointmentSlot | null;
  notes: string;
}

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('service');
  const [booking, setBooking] = useState<BookingState>({
    service: null,
    date: null,
    slot: null,
    notes: '',
  });
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  });

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await servicesApi.getCategories();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
        // Mock data
        setCategories([
          {
            id: '1',
            name: 'Injectables',
            description: 'Botox, fillers, and more',
            imageUrl: '',
            services: [
              { id: 's1', name: 'Botox Treatment', description: 'Reduce fine lines and wrinkles', shortDescription: 'From $12/unit', categoryId: '1', categoryName: 'Injectables', duration: 30, price: 450, onlineBookable: true },
              { id: 's2', name: 'Dermal Fillers - Lips', description: 'Add volume and definition', shortDescription: 'From $600', categoryId: '1', categoryName: 'Injectables', duration: 45, price: 650, onlineBookable: true },
              { id: 's3', name: 'Dermal Fillers - Cheeks', description: 'Restore youthful contours', shortDescription: 'From $800', categoryId: '1', categoryName: 'Injectables', duration: 60, price: 850, onlineBookable: true },
            ],
          },
          {
            id: '2',
            name: 'Facials',
            description: 'Rejuvenating skin treatments',
            imageUrl: '',
            services: [
              { id: 's4', name: 'HydraFacial', description: 'Deep cleanse and hydration', shortDescription: '$250', categoryId: '2', categoryName: 'Facials', duration: 60, price: 250, onlineBookable: true },
              { id: 's5', name: 'Chemical Peel', description: 'Reveal fresh, glowing skin', shortDescription: 'From $150', categoryId: '2', categoryName: 'Facials', duration: 45, price: 175, onlineBookable: true },
            ],
          },
          {
            id: '3',
            name: 'Laser Treatments',
            description: 'Advanced skin rejuvenation',
            imageUrl: '',
            services: [
              { id: 's6', name: 'Laser Hair Removal', description: 'Permanent hair reduction', shortDescription: 'From $150/area', categoryId: '3', categoryName: 'Laser Treatments', duration: 30, price: 175, onlineBookable: true },
              { id: 's7', name: 'IPL Photofacial', description: 'Treat sun damage and pigmentation', shortDescription: '$350', categoryId: '3', categoryName: 'Laser Treatments', duration: 45, price: 350, onlineBookable: true },
            ],
          },
        ]);
        setSelectedCategory('1');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch slots when service and date are selected
  useEffect(() => {
    if (!booking.service || !booking.date) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const data = await bookingApi.getSlots(
          booking.service!.id,
          format(booking.date!, 'yyyy-MM-dd')
        );
        setSlots(data);
      } catch (error) {
        console.error('Failed to fetch slots:', error);
        // Mock data
        const baseDate = booking.date!;
        setSlots([
          { startTime: new Date(baseDate.setHours(9, 0)).toISOString(), endTime: new Date(baseDate.setHours(10, 0)).toISOString(), providerId: 'p1', providerName: 'Dr. Sarah Smith', available: true },
          { startTime: new Date(baseDate.setHours(10, 30)).toISOString(), endTime: new Date(baseDate.setHours(11, 30)).toISOString(), providerId: 'p1', providerName: 'Dr. Sarah Smith', available: true },
          { startTime: new Date(baseDate.setHours(13, 0)).toISOString(), endTime: new Date(baseDate.setHours(14, 0)).toISOString(), providerId: 'p2', providerName: 'Dr. Michael Lee', available: true },
          { startTime: new Date(baseDate.setHours(14, 30)).toISOString(), endTime: new Date(baseDate.setHours(15, 30)).toISOString(), providerId: 'p1', providerName: 'Dr. Sarah Smith', available: true },
          { startTime: new Date(baseDate.setHours(16, 0)).toISOString(), endTime: new Date(baseDate.setHours(17, 0)).toISOString(), providerId: 'p2', providerName: 'Dr. Michael Lee', available: true },
        ]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [booking.service, booking.date]);

  const handleServiceSelect = (service: Service) => {
    setBooking((prev) => ({ ...prev, service, date: dateRange[0] }));
    setStep('datetime');
  };

  const handleSlotSelect = (slot: AppointmentSlot) => {
    setBooking((prev) => ({ ...prev, slot }));
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!booking.service || !booking.slot) return;

    setIsSubmitting(true);
    try {
      await bookingApi.create({
        serviceId: booking.service.id,
        providerId: booking.slot.providerId,
        startTime: booking.slot.startTime,
        locationId: 'loc1',
        patientNotes: booking.notes,
      });
      router.push('/appointments?booked=true');
    } catch (error) {
      console.error('Failed to create booking:', error);
      // For demo, redirect anyway
      router.push('/appointments?booked=true');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newStart = direction === 'next'
      ? addDays(dateRange[0], 7)
      : addDays(dateRange[0], -7);
    
    const today = startOfDay(new Date());
    if (newStart < today) return;

    setDateRange(Array.from({ length: 7 }, (_, i) => addDays(newStart, i)));
  };

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {step !== 'service' ? (
                <button
                  onClick={() => {
                    if (step === 'confirm') setStep('datetime');
                    else if (step === 'datetime') setStep('service');
                  }}
                  className="mr-4 p-2 -ml-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <Link href="/appointments" className="mr-4 p-2 -ml-2 text-gray-400 hover:text-gray-600">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Book Appointment</h1>
                <p className="text-sm text-gray-500">
                  {step === 'service' && 'Step 1: Choose a service'}
                  {step === 'datetime' && 'Step 2: Pick date and time'}
                  {step === 'confirm' && 'Step 3: Confirm booking'}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center space-x-2">
              <div className={'w-3 h-3 rounded-full ' + (step === 'service' ? 'bg-primary-600' : 'bg-primary-200')} />
              <div className={'w-3 h-3 rounded-full ' + (step === 'datetime' ? 'bg-primary-600' : step === 'confirm' ? 'bg-primary-200' : 'bg-gray-200')} />
              <div className={'w-3 h-3 rounded-full ' + (step === 'confirm' ? 'bg-primary-600' : 'bg-gray-200')} />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading services...</p>
              </div>
            ) : (
              <>
                {/* Category tabs */}
                <div className="flex overflow-x-auto no-scrollbar space-x-2 pb-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ' + (selectedCategory === category.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200')}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Services grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {currentCategory?.services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="card p-4 text-left hover:shadow-md hover:border-primary-200 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
                          {service.name}
                        </h3>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {service.duration} min
                        </span>
                        <span className="font-semibold text-primary-600">
                          {service.priceRange
                            ? 'From $' + service.priceRange.min
                            : '$' + service.price}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 'datetime' && booking.service && (
          <div className="space-y-6">
            {/* Selected service summary */}
            <div className="card p-4 bg-primary-50 border-primary-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600 font-medium">Selected Service</p>
                  <p className="font-semibold text-gray-900">{booking.service.name}</p>
                  <p className="text-sm text-gray-600">{booking.service.duration} min • ${booking.service.price}</p>
                </div>
                <button
                  onClick={() => setStep('service')}
                  className="text-sm text-primary-600 font-medium hover:text-primary-700"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Date selector */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Select Date</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDateChange('prev')}
                    disabled={isSameDay(dateRange[0], startOfDay(new Date()))}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {format(dateRange[0], 'MMM d')} - {format(dateRange[6], 'MMM d')}
                  </span>
                  <button
                    onClick={() => handleDateChange('next')}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {dateRange.map((date) => {
                  const isSelected = booking.date && isSameDay(date, booking.date);
                  const isToday = isSameDay(date, new Date());
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setBooking((prev) => ({ ...prev, date, slot: null }))}
                      className={'flex flex-col items-center p-3 rounded-lg transition-colors ' + (isSelected ? 'bg-primary-600 text-white' : 'hover:bg-gray-100')}
                    >
                      <span className="text-xs uppercase">{format(date, 'EEE')}</span>
                      <span className="text-lg font-semibold">{format(date, 'd')}</span>
                      {isToday && <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Select Time</h3>

              {isLoadingSlots ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading available times...</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No available times on this date</p>
                  <p className="text-sm text-gray-500">Please try another date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.filter((s) => s.available).map((slot) => {
                    const isSelected = booking.slot?.startTime === slot.startTime;
                    return (
                      <button
                        key={slot.startTime}
                        onClick={() => handleSlotSelect(slot)}
                        className={'w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ' + (isSelected ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-200')}
                      >
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-gray-400 mr-3" />
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">
                              {format(parseISO(slot.startTime), 'h:mm a')}
                            </p>
                            <p className="text-sm text-gray-500">with {slot.providerName}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && booking.service && booking.slot && (
          <div className="space-y-6">
            {/* Booking summary */}
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center">{booking.service.name}</h2>
                <p className="text-center text-primary-100 mt-1">
                  {booking.service.duration} minutes
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(parseISO(booking.slot.startTime), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(booking.slot.startTime), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{booking.slot.providerName}</p>
                    <p className="text-sm text-gray-500">Provider</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Luxe Medical Spa - Downtown</p>
                    <p className="text-sm text-gray-500">123 Main St, Suite 100</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Service Price</span>
                    <span className="font-semibold text-gray-900">${booking.service.price}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card p-4">
              <label className="label mb-2 block">
                Notes for your provider (optional)
              </label>
              <textarea
                value={booking.notes}
                onChange={(e) => setBooking((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requests or things we should know?"
                className="input min-h-[100px]"
              />
            </div>

            {/* Policies */}
            <div className="card p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Booking Policies</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  Free cancellation up to 24 hours before your appointment
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  We will send you a reminder 24 hours and 2 hours before
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
                  Please arrive 10 minutes early for check-in
                </li>
              </ul>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary btn-xl w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  Confirm Booking
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
