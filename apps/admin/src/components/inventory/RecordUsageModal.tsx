'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Syringe,
  User,
  MapPin,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  Clock,
} from 'lucide-react';
import { OpenVialSession } from '@/types/inventory';

interface InjectionArea {
  id: string;
  name: string;
  units: number;
}

interface TodayAppointment {
  id: string;
  patientId: string;
  patientName: string;
  serviceName: string;
  startTime: Date;
  practitionerId: string;
  practitionerName: string;
}

interface RecordUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  vial: OpenVialSession;
  onSubmit: (data: {
    vialId: string;
    patientId: string;
    patientName: string;
    appointmentId: string;
    practitionerId: string;
    practitionerName: string;
    unitsUsed: number;
    areasInjected: { name: string; units: number }[];
  }) => void;
}

// Common injection areas for neurotoxins
const INJECTION_AREAS = [
  'Forehead',
  'Glabella',
  "Crow's Feet",
  'Bunny Lines',
  'Lip Flip',
  'Masseter',
  'Platysma',
  'Underarms',
  'Other',
];

// Mock today's appointments
const mockTodayAppointments: TodayAppointment[] = [
  {
    id: 'apt-201',
    patientId: 'p3',
    patientName: 'Emma Wilson',
    serviceName: 'Botox - Full Face',
    startTime: new Date(),
    practitionerId: '4',
    practitionerName: 'Dr. Susan Lo',
  },
  {
    id: 'apt-202',
    patientId: 'p4',
    patientName: 'Michael Chen',
    serviceName: 'Dysport - Forehead',
    startTime: new Date(Date.now() + 60 * 60 * 1000),
    practitionerId: '4',
    practitionerName: 'Dr. Susan Lo',
  },
  {
    id: 'apt-203',
    patientId: 'p5',
    patientName: 'Jennifer Garcia',
    serviceName: 'Botox - Crow\'s Feet',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    practitionerId: '2',
    practitionerName: 'Dr. Maria Garcia',
  },
];

export function RecordUsageModal({
  isOpen,
  onClose,
  vial,
  onSubmit,
}: RecordUsageModalProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<TodayAppointment | null>(null);
  const [injectionAreas, setInjectionAreas] = useState<InjectionArea[]>([
    { id: '1', name: '', units: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Calculate total units
  const totalUnits = injectionAreas.reduce((sum, area) => sum + area.units, 0);
  const remainingAfterUse = vial.currentUnits - totalUnits;
  const isOverLimit = totalUnits > vial.currentUnits;

  useEffect(() => {
    if (isOpen) {
      setSelectedAppointment(null);
      setInjectionAreas([{ id: '1', name: '', units: 0 }]);
      setError(null);
    }
  }, [isOpen]);

  const addInjectionArea = () => {
    setInjectionAreas([
      ...injectionAreas,
      { id: Date.now().toString(), name: '', units: 0 },
    ]);
  };

  const removeInjectionArea = (id: string) => {
    if (injectionAreas.length > 1) {
      setInjectionAreas(injectionAreas.filter((area) => area.id !== id));
    }
  };

  const updateInjectionArea = (id: string, field: 'name' | 'units', value: string | number) => {
    setInjectionAreas(
      injectionAreas.map((area) =>
        area.id === id ? { ...area, [field]: value } : area
      )
    );
  };

  const handleSubmit = async () => {
    setError(null);

    if (!selectedAppointment) {
      setError('Please select a patient/appointment');
      return;
    }

    const validAreas = injectionAreas.filter((a) => a.name && a.units > 0);
    if (validAreas.length === 0) {
      setError('Please add at least one injection area with units');
      return;
    }

    if (isOverLimit) {
      setError(`Not enough units in vial. Available: ${vial.currentUnits}`);
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        vialId: vial.id,
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patientName,
        appointmentId: selectedAppointment.id,
        practitionerId: selectedAppointment.practitionerId,
        practitionerName: selectedAppointment.practitionerName,
        unitsUsed: totalUnits,
        areasInjected: validAreas.map((a) => ({ name: a.name, units: a.units })),
      });
      onClose();
    } catch (err) {
      setError('Failed to record usage. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Syringe className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Record Usage</h2>
              <p className="text-sm text-gray-600">{vial.productName} - Vial #{vial.vialNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Vial Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {vial.stabilityHoursRemaining}h stability remaining
              </span>
            </div>
            <div className="text-sm font-medium">
              <span className={remainingAfterUse < 0 ? 'text-red-600' : 'text-gray-900'}>
                {vial.currentUnits}U available
              </span>
            </div>
          </div>

          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Patient / Appointment
            </label>
            <div className="space-y-2">
              {mockTodayAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    selectedAppointment?.id === apt.id
                      ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{apt.patientName}</span>
                    </div>
                    {selectedAppointment?.id === apt.id && (
                      <Check className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {apt.serviceName} • {apt.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Injection Areas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Injection Areas
              </label>
              <button
                onClick={addInjectionArea}
                className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
              >
                <Plus className="h-4 w-4" />
                Add Area
              </button>
            </div>
            <div className="space-y-3">
              {injectionAreas.map((area, index) => (
                <div key={area.id} className="flex items-center gap-3">
                  <select
                    value={area.name}
                    onChange={(e) => updateInjectionArea(area.id, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select area...</option>
                    {INJECTION_AREAS.map((areaName) => (
                      <option key={areaName} value={areaName}>
                        {areaName}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={area.units || ''}
                      onChange={(e) => updateInjectionArea(area.id, 'units', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      step="0.5"
                      min="0"
                      max={vial.currentUnits}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center"
                    />
                    <span className="text-sm text-gray-500">U</span>
                  </div>
                  {injectionAreas.length > 1 && (
                    <button
                      onClick={() => removeInjectionArea(area.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className={`p-4 rounded-lg ${isOverLimit ? 'bg-red-50 border border-red-200' : 'bg-purple-50'}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Total Units:</span>
              <span className={`text-xl font-bold ${isOverLimit ? 'text-red-600' : 'text-purple-600'}`}>
                {totalUnits}U
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-gray-600">Remaining after use:</span>
              <span className={remainingAfterUse < 0 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                {remainingAfterUse.toFixed(1)}U
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || isOverLimit || totalUnits === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Record {totalUnits}U Usage
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
