import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

/**
 * 3-Click Booking Flow
 * Step 1: Select Service (or skip if coming from service page)
 * Step 2: Select Date & Time
 * Step 3: Confirm & Book
 *
 * Key differentiator: NO competitor has booking this fast
 */

type BookingStep = 1 | 2 | 3;

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  services: ServiceOption[];
}

interface ServiceOption {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  providerId?: string;
  providerName?: string;
}

interface Provider {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  nextAvailable?: string;
}

// Mock data
const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: '1',
    name: 'Injectables',
    icon: 'water-outline',
    services: [
      { id: 's1', name: 'Botox - Full Face', duration: 30, price: 450 },
      { id: 's2', name: 'Botox - Forehead Only', duration: 20, price: 250 },
      { id: 's3', name: 'Lip Filler', duration: 45, price: 650 },
      { id: 's4', name: 'Cheek Filler', duration: 45, price: 800 },
    ],
  },
  {
    id: '2',
    name: 'Facials',
    icon: 'sparkles-outline',
    services: [
      { id: 's5', name: 'HydraFacial', duration: 60, price: 250 },
      { id: 's6', name: 'Chemical Peel', duration: 45, price: 200 },
      { id: 's7', name: 'Microneedling', duration: 60, price: 350 },
    ],
  },
  {
    id: '3',
    name: 'Laser',
    icon: 'flash-outline',
    services: [
      { id: 's8', name: 'Laser Hair Removal', duration: 30, price: 150 },
      { id: 's9', name: 'IPL Photofacial', duration: 45, price: 300 },
    ],
  },
  {
    id: '4',
    name: 'Body',
    icon: 'body-outline',
    services: [
      { id: 's10', name: 'CoolSculpting', duration: 60, price: 750 },
      { id: 's11', name: 'Body Contouring', duration: 45, price: 400 },
    ],
  },
];

const MOCK_PROVIDERS: Provider[] = [
  { id: 'p1', name: 'Dr. Sarah Chen', title: 'Medical Director', nextAvailable: 'Today 2:00 PM' },
  { id: 'p2', name: 'Emma Wilson', title: 'Lead Aesthetician', nextAvailable: 'Tomorrow 10:00 AM' },
  { id: 'p3', name: 'Lisa Park', title: 'Nurse Practitioner', nextAvailable: 'Today 4:30 PM' },
];

const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const providers = MOCK_PROVIDERS;

  for (let hour = 9; hour < 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${hour > 12 ? hour - 12 : hour}:${min === 0 ? '00' : min} ${hour >= 12 ? 'PM' : 'AM'}`;
      const available = Math.random() > 0.3; // 70% available
      const provider = providers[Math.floor(Math.random() * providers.length)];
      slots.push({
        time,
        available,
        providerId: available ? provider.id : undefined,
        providerName: available ? provider.name : undefined,
      });
    }
  }
  return slots;
};

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ serviceId?: string; rebook?: string }>();

  // State
  const [currentStep, setCurrentStep] = useState<BookingStep>(params.serviceId ? 2 : 1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [anyProvider, setAnyProvider] = useState(true);

  // Generate dates for next 14 days
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  // Time slots for selected date
  const timeSlots = useMemo(() => generateTimeSlots(selectedDate), [selectedDate]);

  const handleServiceSelect = (service: ServiceOption) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setCurrentStep(3);
  };

  const handleConfirm = () => {
    // TODO: Call API to create appointment
    router.push({
      pathname: '/booking/confirmed',
      params: {
        serviceId: selectedService?.id,
        serviceName: selectedService?.name,
        date: selectedDate.toISOString(),
        time: selectedSlot?.time,
        provider: selectedSlot?.providerName,
      },
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <Text style={styles.headerSubtitle}>3 simple steps</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                currentStep >= step && styles.progressDotActive,
                currentStep > step && styles.progressDotComplete,
              ]}
            >
              {currentStep > step ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <Text style={[styles.progressNumber, currentStep >= step && styles.progressNumberActive]}>
                  {step}
                </Text>
              )}
            </View>
            <Text style={[styles.progressLabel, currentStep >= step && styles.progressLabelActive]}>
              {step === 1 ? 'Service' : step === 2 ? 'Time' : 'Confirm'}
            </Text>
            {step < 3 && (
              <View style={[styles.progressLine, currentStep > step && styles.progressLineActive]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <Animated.View entering={FadeIn.duration(400)}>
            <Text style={styles.stepTitle}>What would you like?</Text>
            <Text style={styles.stepSubtitle}>Select a service to get started</Text>

            {/* Quick Book - Popular Services */}
            <View style={styles.quickBookSection}>
              <Text style={styles.sectionTitle}>Popular Services</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.quickBookRow}>
                  {MOCK_CATEGORIES[0].services.slice(0, 3).map((service, index) => (
                    <Animated.View key={service.id} entering={FadeInRight.duration(400).delay(index * 100)}>
                      <TouchableOpacity
                        style={styles.quickBookCard}
                        onPress={() => handleServiceSelect(service)}
                      >
                        <LinearGradient
                          colors={['#F5F3FF', '#EDE9FE']}
                          style={styles.quickBookGradient}
                        >
                          <Text style={styles.quickBookName}>{service.name}</Text>
                          <Text style={styles.quickBookDuration}>{service.duration} min</Text>
                          <Text style={styles.quickBookPrice}>${service.price}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* All Categories */}
            <Text style={styles.sectionTitle}>All Services</Text>
            {MOCK_CATEGORIES.map((category, catIndex) => (
              <Animated.View
                key={category.id}
                entering={FadeInDown.duration(400).delay(catIndex * 100)}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.categoryCardExpanded,
                  ]}
                  onPress={() =>
                    setSelectedCategory(selectedCategory === category.id ? null : category.id)
                  }
                >
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryIcon}>
                      <Ionicons name={category.icon as any} size={24} color="#8B5CF6" />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryCount}>{category.services.length} services</Text>
                    <Ionicons
                      name={selectedCategory === category.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </View>

                  {selectedCategory === category.id && (
                    <View style={styles.servicesList}>
                      {category.services.map((service) => (
                        <TouchableOpacity
                          key={service.id}
                          style={styles.serviceItem}
                          onPress={() => handleServiceSelect(service)}
                        >
                          <View style={styles.serviceInfo}>
                            <Text style={styles.serviceName}>{service.name}</Text>
                            <Text style={styles.serviceDuration}>{service.duration} min</Text>
                          </View>
                          <Text style={styles.servicePrice}>${service.price}</Text>
                          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Step 2: Date & Time Selection */}
        {currentStep === 2 && selectedService && (
          <Animated.View entering={FadeIn.duration(400)}>
            {/* Selected Service Summary */}
            <View style={styles.selectedServiceCard}>
              <View style={styles.selectedServiceInfo}>
                <Text style={styles.selectedServiceName}>{selectedService.name}</Text>
                <Text style={styles.selectedServiceDetails}>
                  {selectedService.duration} min • ${selectedService.price}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCurrentStep(1)}>
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Provider Preference */}
            <View style={styles.providerPreference}>
              <Text style={styles.sectionTitle}>Provider Preference</Text>
              <View style={styles.providerToggle}>
                <TouchableOpacity
                  style={[styles.toggleOption, anyProvider && styles.toggleOptionActive]}
                  onPress={() => setAnyProvider(true)}
                >
                  <Text style={[styles.toggleText, anyProvider && styles.toggleTextActive]}>
                    Any Available
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleOption, !anyProvider && styles.toggleOptionActive]}
                  onPress={() => setAnyProvider(false)}
                >
                  <Text style={[styles.toggleText, !anyProvider && styles.toggleTextActive]}>
                    Choose Provider
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Selection */}
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              <View style={styles.dateRow}>
                {availableDates.map((date, index) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text style={[styles.dateDayName, isSelected && styles.dateDayNameSelected]}>
                        {formatShortDate(date).split(' ')[0]}
                      </Text>
                      <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                        {date.getDate()}
                      </Text>
                      {isToday && <View style={styles.todayDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Time Slots */}
            <Text style={styles.sectionTitle}>Available Times • {formatDate(selectedDate)}</Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    !slot.available && styles.timeSlotUnavailable,
                    selectedSlot?.time === slot.time && styles.timeSlotSelected,
                  ]}
                  onPress={() => handleSlotSelect(slot)}
                  disabled={!slot.available}
                >
                  <Text
                    style={[
                      styles.timeText,
                      !slot.available && styles.timeTextUnavailable,
                      selectedSlot?.time === slot.time && styles.timeTextSelected,
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && selectedService && selectedSlot && (
          <Animated.View entering={FadeIn.duration(400)}>
            <Text style={styles.stepTitle}>Confirm Booking</Text>
            <Text style={styles.stepSubtitle}>Review your appointment details</Text>

            <View style={styles.confirmationCard}>
              {/* Service */}
              <View style={styles.confirmRow}>
                <View style={styles.confirmIcon}>
                  <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.confirmContent}>
                  <Text style={styles.confirmLabel}>Service</Text>
                  <Text style={styles.confirmValue}>{selectedService.name}</Text>
                  <Text style={styles.confirmSubvalue}>
                    {selectedService.duration} minutes
                  </Text>
                </View>
              </View>

              {/* Date & Time */}
              <View style={styles.confirmRow}>
                <View style={styles.confirmIcon}>
                  <Ionicons name="calendar" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.confirmContent}>
                  <Text style={styles.confirmLabel}>Date & Time</Text>
                  <Text style={styles.confirmValue}>{formatDate(selectedDate)}</Text>
                  <Text style={styles.confirmSubvalue}>{selectedSlot.time}</Text>
                </View>
              </View>

              {/* Provider */}
              <View style={styles.confirmRow}>
                <View style={styles.confirmIcon}>
                  <Ionicons name="person" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.confirmContent}>
                  <Text style={styles.confirmLabel}>Provider</Text>
                  <Text style={styles.confirmValue}>
                    {selectedSlot.providerName || 'First Available'}
                  </Text>
                </View>
              </View>

              {/* Location */}
              <View style={styles.confirmRow}>
                <View style={styles.confirmIcon}>
                  <Ionicons name="location" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.confirmContent}>
                  <Text style={styles.confirmLabel}>Location</Text>
                  <Text style={styles.confirmValue}>Beverly Hills</Text>
                  <Text style={styles.confirmSubvalue}>
                    123 Luxury Ave, Beverly Hills, CA 90210
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.confirmDivider} />

              {/* Price */}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total</Text>
                <Text style={styles.priceValue}>${selectedService.price}</Text>
              </View>
            </View>

            {/* Cancellation Policy */}
            <View style={styles.policyCard}>
              <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
              <Text style={styles.policyText}>
                Free cancellation up to 24 hours before your appointment
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      {currentStep === 3 && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.bottomAction, { paddingBottom: insets.bottom + 16 }]}
        >
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.confirmButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  headerPlaceholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: '#8B5CF6',
  },
  progressDotComplete: {
    backgroundColor: '#10B981',
  },
  progressNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  progressNumberActive: {
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 6,
    marginRight: 8,
  },
  progressLabelActive: {
    color: '#1F2937',
    fontWeight: '500',
  },
  progressLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  progressLineActive: {
    backgroundColor: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
  },
  quickBookSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickBookRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 24,
  },
  quickBookCard: {
    width: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickBookGradient: {
    padding: 16,
    minHeight: 100,
  },
  quickBookName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  quickBookDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  quickBookPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryCardExpanded: {
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryCount: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  servicesList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  serviceDuration: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  selectedServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  selectedServiceInfo: {
    flex: 1,
  },
  selectedServiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedServiceDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  changeLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  providerPreference: {
    marginBottom: 24,
  },
  providerToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#8B5CF6',
  },
  dateScroll: {
    marginBottom: 24,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateCard: {
    width: 56,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateCardSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  dateDayName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  dateDayNameSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  dateDaySelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    marginTop: 4,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    width: (width - 48 - 24) / 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeSlotUnavailable: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
  },
  timeSlotSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  timeTextUnavailable: {
    color: '#D1D5DB',
  },
  timeTextSelected: {
    color: '#FFFFFF',
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  confirmRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  confirmIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  confirmContent: {
    flex: 1,
  },
  confirmLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  confirmValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  confirmSubvalue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  confirmDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  policyText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
