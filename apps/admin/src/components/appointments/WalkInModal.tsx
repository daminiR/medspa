'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Footprints, User, Phone, Search, Plus, Clock, Loader2 } from 'lucide-react';
import moment from 'moment';
import { patients, practitioners, services, Appointment, Patient, Practitioner, Service } from '@/lib/data';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedLocationId: string;
  existingAppointments: Appointment[];
  onSuccess?: (appointment: Appointment) => void;
}

export default function WalkInModal({
  isOpen,
  onClose,
  selectedDate,
  selectedLocationId,
  existingAppointments,
  onSuccess,
}: WalkInModalProps) {
  // Patient state
  const [patientSearch, setPatientSearch] = useState('');
  const [isCreatingNewPatient, setIsCreatingNewPatient] = useState(false);
  const [newPatientFirstName, setNewPatientFirstName] = useState('');
  const [newPatientLastName, setNewPatientLastName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Service state
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Practitioner state
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter patients based on search
  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return [];
    const searchLower = patientSearch.toLowerCase();
    return patients.filter(p =>
      p.fullName.toLowerCase().includes(searchLower) ||
      (p.phone && p.phone.includes(patientSearch))
    ).slice(0, 5);
  }, [patientSearch]);

  // Get active services
  const activeServices = useMemo(() => {
    return services.filter(s => s.isActive);
  }, []);

  // Get available practitioners for the current time
  const availablePractitioners = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();

    // Filter practitioners who are scheduled to work today
    return practitioners.filter(p => {
      if (p.status !== 'active') return false;

      // Check if they work this day
      if (p.schedule?.workDays && !p.schedule.workDays.includes(currentDay)) {
        return false;
      }

      // If a service is selected, filter by practitioners who can perform it
      if (selectedService && !selectedService.practitionerIds.includes(p.id)) {
        return false;
      }

      return true;
    });
  }, [selectedService]);

  // Auto-select first available practitioner when service changes
  useEffect(() => {
    if (selectedService && availablePractitioners.length > 0) {
      // Check if current practitioner can still perform the service
      if (!selectedPractitioner || !selectedService.practitionerIds.includes(selectedPractitioner.id)) {
        // Find first practitioner who can perform this service
        const firstAvailable = availablePractitioners[0];
        setSelectedPractitioner(firstAvailable);
      }
    }
  }, [selectedService, availablePractitioners, selectedPractitioner]);

  // Calculate next available slot for selected practitioner
  const nextAvailableTime = useMemo(() => {
    if (!selectedPractitioner) return { hour: 9, minute: 0 };

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Round up to next 15-minute slot
    const roundedMinute = Math.ceil(currentMinute / 15) * 15;
    let startHour = currentHour;
    let startMinute = roundedMinute;

    if (roundedMinute >= 60) {
      startHour += 1;
      startMinute = 0;
    }

    // Check existing appointments for this practitioner today
    const todayAppointments = existingAppointments.filter(apt => {
      const aptDate = moment(apt.startTime);
      return apt.practitionerId === selectedPractitioner.id &&
        aptDate.isSame(moment(selectedDate), 'day') &&
        apt.status !== 'cancelled' &&
        apt.status !== 'deleted';
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Find a gap for the service duration
    const serviceDuration = selectedService?.duration || 30;

    let proposedStart = new Date(selectedDate);
    proposedStart.setHours(startHour, startMinute, 0, 0);

    for (const apt of todayAppointments) {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);

      // If proposed start is before this appointment
      if (proposedStart < aptStart) {
        const proposedEnd = new Date(proposedStart.getTime() + serviceDuration * 60000);
        // Check if there's enough time before this appointment
        if (proposedEnd <= aptStart) {
          // Found a slot!
          break;
        }
      }

      // Move proposed start to after this appointment
      if (proposedStart < aptEnd) {
        proposedStart = new Date(aptEnd);
      }
    }

    return {
      hour: proposedStart.getHours(),
      minute: proposedStart.getMinutes()
    };
  }, [selectedPractitioner, selectedDate, existingAppointments, selectedService]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPatientPhone(formatPhoneNumber(e.target.value));
  };

  // Handle selecting an existing patient
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.fullName);
    setShowPatientDropdown(false);
    setIsCreatingNewPatient(false);
  };

  // Handle creating new patient
  const handleCreateNewPatient = () => {
    setIsCreatingNewPatient(true);
    setSelectedPatient(null);
    setShowPatientDropdown(false);
    // Pre-fill with search term
    if (patientSearch.trim() && !patientSearch.includes('(')) {
      const nameParts = patientSearch.trim().split(' ');
      setNewPatientFirstName(nameParts[0] || '');
      setNewPatientLastName(nameParts.slice(1).join(' ') || '');
    }
  };

  // Validate form
  const isFormValid = () => {
    if (!selectedService) return false;
    if (!selectedPractitioner) return false;

    if (isCreatingNewPatient) {
      return newPatientFirstName.trim() && newPatientPhone.replace(/\D/g, '').length >= 10;
    }

    return !!selectedPatient;
  };

  // Handle save
  const handleSave = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create patient if new
      let patientId: string;
      let patientName: string;
      let patientPhone: string | undefined;
      let patientEmail: string | undefined;

      if (isCreatingNewPatient) {
        // In a real app, this would create the patient in the database
        patientId = `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        patientName = `${newPatientFirstName} ${newPatientLastName}`.trim();
        patientPhone = newPatientPhone;
      } else if (selectedPatient) {
        patientId = selectedPatient.id;
        patientName = selectedPatient.fullName;
        patientPhone = selectedPatient.phone;
        patientEmail = selectedPatient.email;
      } else {
        throw new Error('No patient selected');
      }

      // Calculate times
      const startTime = new Date(selectedDate);
      startTime.setHours(nextAvailableTime.hour, nextAvailableTime.minute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (selectedService?.duration || 30));

      // Create the walk-in appointment
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId,
        patientName,
        serviceName: selectedService!.name,
        serviceCategory: selectedService!.category,
        practitionerId: selectedPractitioner!.id,
        startTime,
        endTime,
        status: 'arrived', // Walk-ins are automatically marked as arrived
        color: '#F97316', // Orange color for walk-ins
        duration: selectedService!.duration,
        phone: patientPhone,
        email: patientEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
        locationId: selectedLocationId,
        // Walk-in specific fields
        bookingType: 'walk_in',
        checkInTime: new Date(),
      };

      // Call success callback
      if (onSuccess) {
        onSuccess(newAppointment);
      }

      // Reset form and close
      handleClose();
    } catch (err) {
      setError('Failed to create walk-in. Please try again.');
      setSaving(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setPatientSearch('');
    setIsCreatingNewPatient(false);
    setNewPatientFirstName('');
    setNewPatientLastName('');
    setNewPatientPhone('');
    setSelectedPatient(null);
    setSelectedService(null);
    setSelectedPractitioner(null);
    setSaving(false);
    setError(null);
    setShowPatientDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Footprints className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Walk-In Appointment</h2>
              <p className="text-sm text-gray-500">Quick add a walk-in patient</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Current Time Banner */}
        <div className="bg-amber-50 px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center text-amber-900">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              {moment(selectedDate).format('ddd, MMM D')} at {moment().format('h:mm A')}
            </span>
          </div>
          <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
            Walk-In
          </span>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Patient Search/Create */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>

            {!isCreatingNewPatient ? (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setShowPatientDropdown(true);
                      if (selectedPatient && e.target.value !== selectedPatient.fullName) {
                        setSelectedPatient(null);
                      }
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    placeholder="Search by name or phone..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showPatientDropdown && patientSearch && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      <>
                        {filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => handleSelectPatient(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{patient.fullName}</div>
                            {patient.phone && (
                              <div className="text-sm text-gray-500">{patient.phone}</div>
                            )}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        No patients found
                      </div>
                    )}

                    {/* Create New Patient Option */}
                    <button
                      onClick={handleCreateNewPatient}
                      className="w-full text-left px-4 py-3 bg-amber-50 hover:bg-amber-100 flex items-center gap-2 text-amber-700 font-medium border-t border-gray-200"
                    >
                      <Plus className="h-4 w-4" />
                      Create new patient
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">New Patient</span>
                  <button
                    onClick={() => {
                      setIsCreatingNewPatient(false);
                      setNewPatientFirstName('');
                      setNewPatientLastName('');
                      setNewPatientPhone('');
                    }}
                    className="text-xs text-amber-600 hover:text-amber-700"
                  >
                    Search instead
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      value={newPatientFirstName}
                      onChange={(e) => setNewPatientFirstName(e.target.value)}
                      placeholder="First name *"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newPatientLastName}
                      onChange={(e) => setNewPatientLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={newPatientPhone}
                    onChange={handlePhoneChange}
                    placeholder="Phone number *"
                    maxLength={14}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service *
            </label>
            <select
              value={selectedService?.id || ''}
              onChange={(e) => {
                const service = activeServices.find(s => s.id === e.target.value);
                setSelectedService(service || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Select a service...</option>
              {activeServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration} min) - ${service.price}
                </option>
              ))}
            </select>
            {selectedService && (
              <p className="text-xs text-gray-500 mt-1">
                Duration: {selectedService.duration} minutes
              </p>
            )}
          </div>

          {/* Practitioner Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Practitioner *
            </label>
            <select
              value={selectedPractitioner?.id || ''}
              onChange={(e) => {
                const practitioner = availablePractitioners.find(p => p.id === e.target.value);
                setSelectedPractitioner(practitioner || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Select a practitioner...</option>
              {availablePractitioners.map((practitioner) => (
                <option key={practitioner.id} value={practitioner.id}>
                  {practitioner.name} - {practitioner.discipline}
                </option>
              ))}
            </select>
            {availablePractitioners.length === 0 && selectedService && (
              <p className="text-xs text-amber-600 mt-1">
                No practitioners available for this service
              </p>
            )}
          </div>

          {/* Appointment Time Preview */}
          {selectedPractitioner && selectedService && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="text-sm font-medium text-amber-900 mb-2">Appointment Details</h4>
              <div className="text-sm space-y-1 text-amber-800">
                <div className="flex justify-between">
                  <span>Start Time:</span>
                  <span className="font-medium">
                    {moment().hours(nextAvailableTime.hour).minutes(nextAvailableTime.minute).format('h:mm A')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{selectedService.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="font-medium">{selectedPractitioner.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 sticky bottom-0">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isFormValid()}
              className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg font-semibold hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Footprints className="h-5 w-5" />
                  Add Walk-In
                </>
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            Patient will be automatically checked in
          </p>
        </div>
      </div>
    </div>
  );
}
