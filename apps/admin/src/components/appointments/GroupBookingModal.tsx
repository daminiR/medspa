'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Users,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  Percent
} from 'lucide-react';
import {
  patients,
  practitioners,
  services,
  Patient,
  Service,
  Practitioner,
  GroupBookingParticipant,
  GroupPaymentMode,
  calculateGroupDiscount,
  createGroupBooking,
  getServicesForPractitioner
} from '@/lib/data';

interface GroupBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSuccess?: (groupId: string) => void;
}

type SchedulingMode = 'simultaneous' | 'staggered_15' | 'staggered_30' | 'custom';

interface ParticipantDraft {
  id: string;
  patientId: string;
  patientName: string;
  phone?: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  practitionerId: string;
  practitionerName: string;
  startHour: number;
  startMinute: number;
  roomId?: string;
}

const STEPS = [
  { id: 1, name: 'Group Details', icon: Users },
  { id: 2, name: 'Add Participants', icon: UserPlus },
  { id: 3, name: 'Schedule', icon: Clock },
  { id: 4, name: 'Review & Confirm', icon: CheckCircle }
];

export default function GroupBookingModal({
  isOpen,
  onClose,
  selectedDate,
  onSuccess
}: GroupBookingModalProps) {
  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Group Details
  const [groupName, setGroupName] = useState('');
  const [coordinatorId, setCoordinatorId] = useState('');
  const [coordinatorSearch, setCoordinatorSearch] = useState('');
  const [showCoordinatorDropdown, setShowCoordinatorDropdown] = useState(false);
  const [paymentMode, setPaymentMode] = useState<GroupPaymentMode>('individual');

  // Step 2: Participants
  const [participants, setParticipants] = useState<ParticipantDraft[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);

  // Add participant form
  const [newPatientSearch, setNewPatientSearch] = useState('');
  const [newPatientId, setNewPatientId] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newPractitionerId, setNewPractitionerId] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Step 3: Schedule
  const [schedulingMode, setSchedulingMode] = useState<SchedulingMode>('staggered_30');
  const [baseStartHour, setBaseStartHour] = useState(10);
  const [baseStartMinute, setBaseStartMinute] = useState(0);

  // Status
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setGroupName('');
      setCoordinatorId('');
      setCoordinatorSearch('');
      setPaymentMode('individual');
      setParticipants([]);
      setSchedulingMode('staggered_30');
      setBaseStartHour(10);
      setBaseStartMinute(0);
      setSaving(false);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter patients for search
  const filteredPatients = patients.filter(p =>
    p.status === 'active' &&
    (p.firstName.toLowerCase().includes(coordinatorSearch.toLowerCase()) ||
      p.lastName.toLowerCase().includes(coordinatorSearch.toLowerCase()) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(coordinatorSearch.toLowerCase()))
  ).slice(0, 5);

  const filteredPatientsForAdd = patients.filter(p =>
    p.status === 'active' &&
    (p.firstName.toLowerCase().includes(newPatientSearch.toLowerCase()) ||
      p.lastName.toLowerCase().includes(newPatientSearch.toLowerCase()) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(newPatientSearch.toLowerCase()))
  ).slice(0, 5);

  // Get coordinator info
  const coordinator = patients.find(p => p.id === coordinatorId);

  // Get available practitioners
  const activePractitioners = practitioners.filter(p => p.status === 'active');

  // Get services for selected practitioner (for add participant)
  const availableServices = newPractitionerId
    ? getServicesForPractitioner(newPractitionerId)
    : services.filter(s => s.isActive);

  // Calculate totals
  const totalOriginalPrice = participants.reduce((sum, p) => sum + p.servicePrice, 0);
  const discountPercent = calculateGroupDiscount(participants.length);
  const totalDiscountAmount = (totalOriginalPrice * discountPercent) / 100;
  const totalDiscountedPrice = totalOriginalPrice - totalDiscountAmount;

  // Select coordinator
  const handleSelectCoordinator = (patient: Patient) => {
    setCoordinatorId(patient.id);
    setCoordinatorSearch(`${patient.firstName} ${patient.lastName}`);
    setShowCoordinatorDropdown(false);

    // Auto-add coordinator as first participant if not already added
    if (!participants.some(p => p.patientId === patient.id)) {
      // Don't auto-add, let user add manually
    }
  };

  // Add participant
  const handleAddParticipant = () => {
    if (!newPatientId || !newServiceId || !newPractitionerId) {
      setError('Please select patient, service, and practitioner');
      return;
    }

    const patient = patients.find(p => p.id === newPatientId);
    const service = services.find(s => s.id === newServiceId);
    const practitioner = practitioners.find(p => p.id === newPractitionerId);

    if (!patient || !service || !practitioner) return;

    const newParticipant: ParticipantDraft = {
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      phone: patient.phone,
      email: patient.email,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      practitionerId: practitioner.id,
      practitionerName: practitioner.name,
      startHour: baseStartHour,
      startMinute: baseStartMinute
    };

    setParticipants([...participants, newParticipant]);
    setShowAddParticipant(false);
    setNewPatientId('');
    setNewPatientSearch('');
    setNewServiceId('');
    setNewPractitionerId('');
    setError(null);
  };

  // Remove participant
  const handleRemoveParticipant = (participantId: string) => {
    setParticipants(participants.filter(p => p.id !== participantId));
  };

  // Calculate scheduled times based on mode
  const getScheduledParticipants = (): ParticipantDraft[] => {
    if (schedulingMode === 'simultaneous') {
      return participants.map(p => ({
        ...p,
        startHour: baseStartHour,
        startMinute: baseStartMinute
      }));
    }

    if (schedulingMode === 'custom') {
      return participants;
    }

    const staggerMinutes = schedulingMode === 'staggered_15' ? 15 : 30;
    let currentMinutes = baseStartHour * 60 + baseStartMinute;

    return participants.map((p, index) => {
      const startHour = Math.floor(currentMinutes / 60);
      const startMinute = currentMinutes % 60;
      currentMinutes += p.serviceDuration + staggerMinutes;

      return {
        ...p,
        startHour,
        startMinute
      };
    });
  };

  // Validate step
  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!groupName.trim() && !!coordinatorId;
      case 2:
        return participants.length >= 2;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const scheduledParticipants = getScheduledParticipants();

      // Create participants for the group
      const groupParticipants: GroupBookingParticipant[] = scheduledParticipants.map(p => {
        const startTime = new Date(selectedDate);
        startTime.setHours(p.startHour, p.startMinute, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + p.serviceDuration);

        return {
          patientId: p.patientId,
          patientName: p.patientName,
          phone: p.phone,
          email: p.email,
          serviceId: p.serviceId,
          serviceName: p.serviceName,
          servicePrice: p.servicePrice,
          practitionerId: p.practitionerId,
          practitionerName: p.practitionerName,
          startTime,
          endTime,
          duration: p.serviceDuration,
          status: 'pending',
          paymentStatus: 'pending',
          roomId: p.roomId
        };
      });

      const result = createGroupBooking({
        name: groupName,
        coordinatorPatientId: coordinatorId,
        coordinatorName: coordinator ? `${coordinator.firstName} ${coordinator.lastName}` : '',
        coordinatorPhone: coordinator?.phone,
        coordinatorEmail: coordinator?.email,
        participants: groupParticipants,
        date: selectedDate,
        schedulingMode,
        totalOriginalPrice,
        paymentMode,
        paymentStatus: 'pending',
        status: 'confirmed'
      });

      setSuccess(true);
      setSaving(false);

      if (onSuccess) {
        onSuccess(result.group.id);
      }

      // Close after delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError('Failed to create group booking');
      setSaving(false);
    }
  };

  // Format time
  const formatTime = (hour: number, minute: number): string => {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Success view
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Booking Created!</h2>
          <p className="text-gray-600 mb-4">
            {groupName} with {participants.length} participants
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">${totalDiscountedPrice.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Group Discount ({discountPercent}%):</span>
                  <span>-${totalDiscountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">Appointments have been added to the calendar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center text-white">
            <Users className="h-6 w-6 mr-3" />
            <div>
              <h2 className="text-lg font-semibold">Group Booking</h2>
              <p className="text-sm text-purple-200">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center ${index > 0 ? 'ml-4' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:block ${
                    currentStep === step.id ? 'text-purple-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Step 1: Group Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Sarah's Bridal Party, Couples Spa Day"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Coordinator *
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Primary contact person who will receive group confirmations
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={coordinatorSearch}
                    onChange={(e) => {
                      setCoordinatorSearch(e.target.value);
                      setShowCoordinatorDropdown(true);
                      if (!e.target.value) setCoordinatorId('');
                    }}
                    onFocus={() => setShowCoordinatorDropdown(true)}
                    placeholder="Search by patient name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {showCoordinatorDropdown && coordinatorSearch && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                          <button
                            key={patient.id}
                            onClick={() => handleSelectCoordinator(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                              <div className="text-sm text-gray-500">{patient.phone}</div>
                            </div>
                            {coordinatorId === patient.id && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm">No patients found</div>
                      )}
                    </div>
                  )}
                </div>
                {coordinator && (
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-medium">
                        {coordinator.firstName[0]}{coordinator.lastName[0]}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{coordinator.firstName} {coordinator.lastName}</div>
                        <div className="text-sm text-gray-500">{coordinator.phone}</div>
                      </div>
                    </div>
                    <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">Coordinator</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'individual', label: 'Individual', desc: 'Each person pays separately' },
                    { value: 'coordinator', label: 'Coordinator Pays', desc: 'One invoice for all' },
                    { value: 'split', label: 'Split Evenly', desc: 'Divide total equally' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPaymentMode(option.value as GroupPaymentMode)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        paymentMode === option.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add Participants */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Participants ({participants.length})</h3>
                  <p className="text-sm text-gray-500">Add at least 2 participants for group booking</p>
                </div>
                <button
                  onClick={() => setShowAddParticipant(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Participant
                </button>
              </div>

              {/* Participants List */}
              {participants.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No participants added yet</p>
                  <p className="text-sm text-gray-400">Click "Add Participant" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((participant, index) => (
                    <div key={participant.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-medium">
                          {index + 1}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium flex items-center">
                            {participant.patientName}
                            {participant.patientId === coordinatorId && (
                              <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                                Coordinator
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {participant.serviceName} • {participant.serviceDuration} min • ${participant.servicePrice}
                          </div>
                          <div className="text-xs text-gray-400">
                            with {participant.practitionerName}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Discount Preview */}
              {participants.length >= 2 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <Percent className="h-5 w-5 mr-2" />
                    <span className="font-medium">
                      {discountPercent}% Group Discount Applied!
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Saving ${totalDiscountAmount.toFixed(2)} on total of ${totalOriginalPrice.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Add Participant Modal */}
              {showAddParticipant && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-60">
                  <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Add Participant</h3>
                      <button onClick={() => setShowAddParticipant(false)} className="p-1 hover:bg-gray-100 rounded">
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Patient Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={newPatientSearch}
                            onChange={(e) => {
                              setNewPatientSearch(e.target.value);
                              setShowPatientDropdown(true);
                            }}
                            onFocus={() => setShowPatientDropdown(true)}
                            placeholder="Search patient..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                          {showPatientDropdown && newPatientSearch && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                              {filteredPatientsForAdd.map(patient => (
                                <button
                                  key={patient.id}
                                  onClick={() => {
                                    setNewPatientId(patient.id);
                                    setNewPatientSearch(`${patient.firstName} ${patient.lastName}`);
                                    setShowPatientDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-purple-50"
                                >
                                  <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                                  <div className="text-sm text-gray-500">{patient.phone}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Practitioner */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Practitioner</label>
                        <select
                          value={newPractitionerId}
                          onChange={(e) => {
                            setNewPractitionerId(e.target.value);
                            setNewServiceId(''); // Reset service when practitioner changes
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select practitioner...</option>
                          {activePractitioners.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Service */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                        <select
                          value={newServiceId}
                          onChange={(e) => setNewServiceId(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          disabled={!newPractitionerId}
                        >
                          <option value="">Select service...</option>
                          {availableServices.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} - {s.duration} min - ${s.price}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setShowAddParticipant(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddParticipant}
                          disabled={!newPatientId || !newServiceId || !newPractitionerId}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <div className="flex gap-3">
                  <select
                    value={baseStartHour}
                    onChange={(e) => setBaseStartHour(parseInt(e.target.value))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                      <option key={hour} value={hour}>
                        {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                      </option>
                    ))}
                  </select>
                  <select
                    value={baseStartMinute}
                    onChange={(e) => setBaseStartMinute(parseInt(e.target.value))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {[0, 15, 30, 45].map(min => (
                      <option key={min} value={min}>{min.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduling Mode</label>
                <div className="space-y-3">
                  {[
                    { value: 'simultaneous', label: 'All at Same Time', desc: 'All participants start together (requires multiple practitioners)' },
                    { value: 'staggered_15', label: 'Staggered (15 min apart)', desc: 'Appointments start 15 minutes after previous ends' },
                    { value: 'staggered_30', label: 'Staggered (30 min apart)', desc: 'Appointments start 30 minutes after previous ends' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSchedulingMode(option.value as SchedulingMode)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        schedulingMode === option.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Schedule */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Schedule Preview</h4>
                <div className="space-y-2">
                  {getScheduledParticipants().map((p, index) => {
                    const endHour = Math.floor((p.startHour * 60 + p.startMinute + p.serviceDuration) / 60);
                    const endMinute = (p.startHour * 60 + p.startMinute + p.serviceDuration) % 60;
                    return (
                      <div key={p.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-medium text-sm">
                          {index + 1}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-sm">{p.patientName}</div>
                          <div className="text-xs text-gray-500">{p.serviceName}</div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatTime(p.startHour, p.startMinute)} - {formatTime(endHour, endMinute)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Group Summary */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">{groupName}</h3>
                <div className="text-sm text-purple-700 space-y-1">
                  <div>Coordinator: {coordinator?.firstName} {coordinator?.lastName}</div>
                  <div>Date: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                  <div>Participants: {participants.length} people</div>
                </div>
              </div>

              {/* Appointments Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Appointments</h4>
                <div className="space-y-2">
                  {getScheduledParticipants().map((p, index) => {
                    const discountedPrice = p.servicePrice * (1 - discountPercent / 100);
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-sm">{p.patientName}</div>
                            <div className="text-xs text-gray-500">
                              {p.serviceName} with {p.practitionerName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatTime(p.startHour, p.startMinute)} • {p.serviceDuration} min
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">${discountedPrice.toFixed(2)}</div>
                          {discountPercent > 0 && (
                            <div className="text-xs text-gray-400 line-through">${p.servicePrice.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>${totalOriginalPrice.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Group Discount ({discountPercent}%)</span>
                      <span>-${totalDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${totalDiscountedPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm">
                  <span className="text-gray-500">Payment:</span>{' '}
                  <span className="font-medium">
                    {paymentMode === 'individual' && 'Each person pays individually'}
                    {paymentMode === 'coordinator' && `${coordinator?.firstName} pays for everyone`}
                    {paymentMode === 'split' && `Split evenly ($${(totalDiscountedPrice / participants.length).toFixed(2)} each)`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
            className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed(currentStep)}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Group Booking
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
