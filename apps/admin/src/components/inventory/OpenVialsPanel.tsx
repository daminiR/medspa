'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  Users,
  Droplet,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Trash2,
  Eye,
} from 'lucide-react';
import { OpenVialSession, VialUsageRecord } from '@/types/inventory';
import { RecordUsageModal } from './RecordUsageModal';

interface OpenVialsPanelProps {
  locationId: string;
  onUseFromVial?: (vialId: string, units: number) => void;
  onCloseVial?: (vialId: string, reason: string) => void;
  onOpenNewVial?: () => void;
  compact?: boolean;
}

// Mock data for demonstration
const mockOpenVials: OpenVialSession[] = [
  {
    id: 'vial-1',
    lotId: 'lot-btx-001',
    lotNumber: 'C3709C3',
    productId: 'prod-botox',
    productName: 'Botox® Cosmetic',
    vialNumber: 1,
    originalUnits: 100,
    currentUnits: 42.5, // Fractional!
    usedUnits: 52.5,
    wastedUnits: 5,
    reconstitutedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    reconstitutedBy: '4',
    reconstitutedByName: 'Susan Lo',
    diluentType: 'preservative-free saline',
    diluentVolume: 2.5,
    concentration: '4U per 0.1ml',
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
    stabilityHoursTotal: 24,
    stabilityHoursRemaining: 20,
    isExpired: false,
    usageRecords: [
      {
        id: 'usage-1',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        patientId: 'p1',
        patientName: 'Sarah Johnson',
        appointmentId: 'apt-101',
        practitionerId: '4',
        practitionerName: 'Susan Lo',
        unitsUsed: 25,
        areasInjected: [
          { name: 'Forehead', units: 10 },
          { name: 'Glabella', units: 10 },
          { name: "Crow's Feet", units: 5 },
        ],
      },
      {
        id: 'usage-2',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        patientId: 'p2',
        patientName: 'Lily Gagnon',
        appointmentId: 'apt-102',
        practitionerId: '4',
        practitionerName: 'Susan Lo',
        unitsUsed: 27.5, // Fractional units!
        areasInjected: [
          { name: 'Glabella', units: 12.5 },
          { name: 'Forehead', units: 15 },
        ],
      },
    ],
    totalPatients: 2,
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Fridge A, Shelf 1',
    status: 'active',
    vialCost: 420,
    costPerUnitUsed: 8,
    revenueGenerated: 735,
    profitMargin: 42.8,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    createdBy: '4',
    lastUpdatedBy: '4',
  },
  {
    id: 'vial-2',
    lotId: 'lot-dsp-001',
    lotNumber: 'DSP2024A789',
    productId: 'prod-dysport',
    productName: 'Dysport®',
    vialNumber: 1,
    originalUnits: 300,
    currentUnits: 180,
    usedUnits: 120,
    wastedUnits: 0,
    reconstitutedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    reconstitutedBy: '4',
    reconstitutedByName: 'Susan Lo',
    diluentType: 'preservative-free saline',
    diluentVolume: 2.5,
    concentration: '12U per 0.1ml',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours - critical!
    stabilityHoursTotal: 4,
    stabilityHoursRemaining: 2,
    isExpired: false,
    usageRecords: [
      {
        id: 'usage-3',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        patientId: 'p3',
        patientName: 'Michael Brown',
        appointmentId: 'apt-103',
        practitionerId: '4',
        practitionerName: 'Susan Lo',
        unitsUsed: 60,
        areasInjected: [
          { name: 'Forehead', units: 30 },
          { name: 'Glabella', units: 30 },
        ],
      },
      {
        id: 'usage-4',
        timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
        patientId: 'p4',
        patientName: 'Emily Chen',
        appointmentId: 'apt-104',
        practitionerId: '4',
        practitionerName: 'Susan Lo',
        unitsUsed: 60,
        areasInjected: [
          { name: 'Glabella', units: 35 },
          { name: "Crow's Feet", units: 25 },
        ],
      },
    ],
    totalPatients: 2,
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Fridge A, Shelf 2',
    status: 'active',
    vialCost: 380,
    costPerUnitUsed: 3.17,
    revenueGenerated: 540,
    profitMargin: 29.6,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
    createdBy: '4',
    lastUpdatedBy: '4',
  },
];

export function OpenVialsPanel({
  locationId,
  onUseFromVial,
  onCloseVial,
  onOpenNewVial,
  compact = false,
}: OpenVialsPanelProps) {
  const [openVials, setOpenVials] = useState<OpenVialSession[]>(mockOpenVials);
  const [selectedVialForUse, setSelectedVialForUse] = useState<OpenVialSession | null>(null);
  const [expandedVial, setExpandedVial] = useState<string | null>(null);
  const [showUsageHistory, setShowUsageHistory] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Update stability timers every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      // In production, would recalculate stability hours from API
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate time remaining display
  const formatTimeRemaining = (hours: number): string => {
    if (hours <= 0) return 'Expired';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${Math.floor(hours / 24)}d ${Math.round(hours % 24)}h`;
  };

  // Get urgency color based on stability
  const getStabilityColor = (hours: number, total: number): string => {
    const percent = hours / total;
    if (percent <= 0.1) return 'text-red-600 bg-red-50';
    if (percent <= 0.25) return 'text-orange-600 bg-orange-50';
    if (percent <= 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  // Get progress bar color
  const getProgressColor = (hours: number, total: number): string => {
    const percent = hours / total;
    if (percent <= 0.1) return 'bg-red-500';
    if (percent <= 0.25) return 'bg-orange-500';
    if (percent <= 0.5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleQuickUse = (vialId: string) => {
    const vial = openVials.find(v => v.id === vialId);
    if (vial) {
      setSelectedVialForUse(vial);
    }
  };

  const handleRecordUsage = (data: {
    vialId: string;
    patientId: string;
    patientName: string;
    appointmentId: string;
    practitionerId: string;
    practitionerName: string;
    unitsUsed: number;
    areasInjected: { name: string; units: number }[];
  }) => {
    // Update the vial with new usage
    setOpenVials(prevVials =>
      prevVials.map(vial => {
        if (vial.id === data.vialId) {
          const newUsageRecord: VialUsageRecord = {
            id: `usage-${Date.now()}`,
            timestamp: new Date(),
            patientId: data.patientId,
            patientName: data.patientName,
            appointmentId: data.appointmentId,
            practitionerId: data.practitionerId,
            practitionerName: data.practitionerName,
            unitsUsed: data.unitsUsed,
            areasInjected: data.areasInjected,
          };
          return {
            ...vial,
            currentUnits: vial.currentUnits - data.unitsUsed,
            usedUnits: vial.usedUnits + data.unitsUsed,
            usageRecords: [...vial.usageRecords, newUsageRecord],
            totalPatients: vial.totalPatients + 1,
            updatedAt: new Date(),
          };
        }
        return vial;
      })
    );
    // Notify parent
    onUseFromVial?.(data.vialId, data.unitsUsed);
    setSelectedVialForUse(null);
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-purple-600" />
            Open Vials
          </h3>
          <span className="text-xs text-gray-500">{openVials.length} active</span>
        </div>
        <div className="space-y-2">
          {openVials.slice(0, 3).map(vial => (
            <div
              key={vial.id}
              className={`p-2 rounded-lg border ${
                vial.stabilityHoursRemaining <= 2
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {vial.productName}
                </div>
                <div
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${getStabilityColor(
                    vial.stabilityHoursRemaining,
                    vial.stabilityHoursTotal
                  )}`}
                >
                  {formatTimeRemaining(vial.stabilityHoursRemaining)}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">
                  {vial.currentUnits} units left
                </span>
                <span className="text-xs text-gray-500">
                  {vial.totalPatients} patients
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-purple-600" />
              Open Vials
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Track multi-patient vial usage with fractional units
            </p>
          </div>
          <button
            onClick={onOpenNewVial}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Open New Vial
          </button>
        </div>
      </div>

      {/* Active Vials */}
      <div className="p-6">
        {openVials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Droplet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No open vials</p>
            <p className="text-sm mt-1">Open a vial to start tracking usage</p>
          </div>
        ) : (
          <div className="space-y-4">
            {openVials.map(vial => (
              <div
                key={vial.id}
                className={`rounded-xl border ${
                  vial.stabilityHoursRemaining <= 2
                    ? 'border-red-200 bg-red-50/50'
                    : vial.stabilityHoursRemaining <= 4
                    ? 'border-yellow-200 bg-yellow-50/50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Vial Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{vial.productName}</h3>
                      <p className="text-sm text-gray-500">
                        Lot: {vial.lotNumber} • Vial #{vial.vialNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {vial.stabilityHoursRemaining <= 2 && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStabilityColor(
                          vial.stabilityHoursRemaining,
                          vial.stabilityHoursTotal
                        )}`}
                      >
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatTimeRemaining(vial.stabilityHoursRemaining)}
                      </div>
                    </div>
                  </div>

                  {/* Stability Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getProgressColor(
                          vial.stabilityHoursRemaining,
                          vial.stabilityHoursTotal
                        )}`}
                        style={{
                          width: `${(vial.stabilityHoursRemaining / vial.stabilityHoursTotal) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Reconstituted {new Date(vial.reconstitutedAt!).toLocaleTimeString()}</span>
                      <span>Expires {new Date(vial.expiresAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                      <div className="text-2xl font-bold text-purple-600">{vial.currentUnits}</div>
                      <div className="text-xs text-gray-500">Units Left</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                      <div className="text-2xl font-bold text-blue-600">{vial.usedUnits}</div>
                      <div className="text-xs text-gray-500">Used</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                      <div className="text-2xl font-bold text-green-600">{vial.totalPatients}</div>
                      <div className="text-xs text-gray-500">Patients</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                      <div className="text-2xl font-bold text-emerald-600">
                        {vial.profitMargin.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">Margin</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleQuickUse(vial.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Droplet className="w-4 h-4" />
                      Use From Vial
                    </button>
                    <button
                      onClick={() => setShowUsageHistory(showUsageHistory === vial.id ? null : vial.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      History
                      {showUsageHistory === vial.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onCloseVial?.(vial.id, 'manual_close')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Usage History (Expandable) */}
                {showUsageHistory === vial.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50/50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Patient Usage History
                    </h4>
                    <div className="space-y-2">
                      {vial.usageRecords.map(record => (
                        <div
                          key={record.id}
                          className="p-3 bg-white rounded-lg border border-gray-100"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900">{record.patientName}</span>
                              <span className="text-gray-500 text-sm ml-2">
                                • {new Date(record.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <span className="font-semibold text-purple-600">
                              {record.unitsUsed} units
                            </span>
                          </div>
                          {record.areasInjected && record.areasInjected.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {record.areasInjected.map((area, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {area.name}: {area.units}u
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            By {record.practitionerName}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Waste Summary */}
                    {vial.wastedUnits > 0 && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2 text-red-600">
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {vial.wastedUnits} units documented as waste
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {openVials.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-semibold">{openVials.length}</span> open vials •{' '}
              <span className="font-semibold">
                {openVials.reduce((sum, v) => sum + v.currentUnits, 0).toFixed(1)}
              </span>{' '}
              total units available •{' '}
              <span className="font-semibold">
                {openVials.reduce((sum, v) => sum + v.totalPatients, 0)}
              </span>{' '}
              patients served
            </div>
            <div className="text-gray-500">
              {openVials.filter(v => v.stabilityHoursRemaining <= 4).length > 0 && (
                <span className="text-orange-600 font-medium">
                  {openVials.filter(v => v.stabilityHoursRemaining <= 4).length} vial(s) expiring soon
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Record Usage Modal */}
      {selectedVialForUse && (
        <RecordUsageModal
          isOpen={!!selectedVialForUse}
          onClose={() => setSelectedVialForUse(null)}
          vial={selectedVialForUse}
          onSubmit={handleRecordUsage}
        />
      )}
    </div>
  );
}
