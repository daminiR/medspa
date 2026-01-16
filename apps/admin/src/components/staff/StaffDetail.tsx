'use client';

import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Award, Clock,
  Edit, Trash2, ChevronLeft, Star, Syringe, Shield, Bell, DollarSign
} from 'lucide-react';
import { StaffMember, StaffPermissions, NotificationPreferences, ServiceAssignment } from '@/types/staff';
import StaffSchedule from './StaffSchedule';

interface StaffDetailProps {
  staff: StaffMember;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: (updates: Partial<StaffMember>) => void;
}

// Toggle Switch Component
function Toggle({
  enabled,
  onChange,
  disabled = false
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}


// Permission Row Component
function PermissionRow({
  label,
  description,
  enabled,
  onChange
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

// Inline Editable Field Component - Click to edit, blur to save
function InlineEditField({
  value,
  onSave,
  icon: Icon,
  type = 'text',
  placeholder,
  suffix
}: {
  value: string;
  onSave: (value: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  type?: 'text' | 'email' | 'tel';
  placeholder?: string;
  suffix?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (tempValue !== value) {
      onSave(tempValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 group">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <input
          ref={inputRef}
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 text-sm text-gray-900 px-2 py-1 -ml-2 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-3 group cursor-pointer hover:bg-gray-100 -mx-2 px-2 py-1 rounded transition-colors"
    >
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <span className="text-sm text-gray-900 flex-1">
        {value || <span className="text-gray-400">{placeholder}</span>}
        {suffix && <span className="text-gray-500 ml-1">{suffix}</span>}
      </span>
      <Edit className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// Inline Editable Row - For label: value pairs
function InlineEditRow({
  label,
  value,
  onSave,
  type = 'text'
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'date';
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (tempValue !== value) {
      onSave(tempValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={() => !isEditing && setIsEditing(true)}
      className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
    >
      <span className="text-sm text-gray-500">{label}</span>
      {isEditing ? (
        <input
          ref={inputRef}
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="text-sm font-medium text-gray-900 px-2 py-0.5 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right w-40"
        />
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{value}</span>
          <Edit className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
}

// Default permissions for different access levels
function getDefaultPermissions(accessLevel: string): StaffPermissions {
  const isAdmin = accessLevel.includes('Full') || accessLevel.includes('Owner');
  const isPractitioner = accessLevel.includes('Practitioner');
  const isFrontDesk = accessLevel.includes('Front Desk');

  return {
    viewOwnCalendar: true,
    editOwnCalendar: isPractitioner || isAdmin,
    viewAllCalendars: isFrontDesk || isAdmin,
    editAllCalendars: isAdmin,
    manageTimeBlocks: isPractitioner || isAdmin,
    manageWaitlist: isFrontDesk || isAdmin,
    viewClientContactDetails: isFrontDesk || isAdmin,
    viewClientHistory: isPractitioner || isFrontDesk || isAdmin,
    editClientRecords: isPractitioner || isAdmin,
    viewOwnSales: true,
    viewAllSales: isFrontDesk || isAdmin,
    processCheckout: isFrontDesk || isAdmin,
    processRefunds: isAdmin,
    reopenSales: isAdmin,
    accessCashDrawer: isFrontDesk || isAdmin,
    viewOwnMessages: true,
    viewAllMessages: isFrontDesk || isAdmin,
    sendMessages: isPractitioner || isFrontDesk || isAdmin,
    viewReports: isAdmin,
    exportReports: isAdmin,
    manageProducts: isAdmin,
    managePurchaseOrders: isAdmin,
    manageGiftCards: isAdmin,
    manageMemberships: isAdmin,
    manageStaff: isAdmin,
    manageServices: isAdmin,
    manageSettings: isAdmin,
    accessBilling: isAdmin || accessLevel.includes('Billing'),
    useTimeClock: true,
    manageTimeCards: isAdmin,
    viewFormSubmissions: isPractitioner || isFrontDesk || isAdmin,
    viewAllFormSubmissions: isAdmin,
    manageFormTemplates: isAdmin,
  };
}

// Default notification preferences
function getDefaultNotificationPreferences(): NotificationPreferences {
  return {
    newAppointmentEmail: true,
    newAppointmentSms: true,
    newAppointmentPush: true,
    appointmentCancelledEmail: true,
    appointmentCancelledSms: true,
    appointmentCancelledPush: true,
    appointmentRescheduledEmail: true,
    appointmentRescheduledPush: true,
    dailyScheduleSummary: true,
    patientArrivals: true,
    newMessagePush: true,
    quietHoursEnabled: false,
    quietHoursStart: '21:00',
    quietHoursEnd: '07:00',
  };
}

// Mock service assignments for demo
function getMockServiceAssignments(): ServiceAssignment[] {
  return [
    { serviceId: '1', serviceName: 'Botox', category: 'Injectables', enabled: true, defaultDuration: 30, defaultPrice: 400, requiresCertification: 'Botox/Dysport' },
    { serviceId: '2', serviceName: 'Dysport', category: 'Injectables', enabled: true, defaultDuration: 30, defaultPrice: 380, requiresCertification: 'Botox/Dysport' },
    { serviceId: '3', serviceName: 'Juvederm Voluma', category: 'Dermal Fillers', enabled: true, defaultDuration: 45, defaultPrice: 800, requiresCertification: 'Dermal Fillers' },
    { serviceId: '4', serviceName: 'Restylane', category: 'Dermal Fillers', enabled: true, defaultDuration: 45, defaultPrice: 750, requiresCertification: 'Dermal Fillers' },
    { serviceId: '5', serviceName: 'Kybella', category: 'Injectables', enabled: false, defaultDuration: 45, defaultPrice: 600, requiresCertification: 'Dermal Fillers' },
    { serviceId: '6', serviceName: 'Laser Hair Removal', category: 'Laser Treatments', enabled: false, defaultDuration: 60, defaultPrice: 300, requiresCertification: 'Laser Hair Removal' },
    { serviceId: '7', serviceName: 'IPL Photofacial', category: 'Laser Treatments', enabled: false, defaultDuration: 45, defaultPrice: 350, requiresCertification: 'IPL/BBL' },
    { serviceId: '8', serviceName: 'Chemical Peel', category: 'Skin Treatments', enabled: true, defaultDuration: 45, defaultPrice: 200, requiresCertification: 'Chemical Peels' },
    { serviceId: '9', serviceName: 'Microneedling', category: 'Skin Treatments', enabled: true, defaultDuration: 60, defaultPrice: 350, requiresCertification: 'Microneedling' },
    { serviceId: '10', serviceName: 'PRP Facial', category: 'Skin Treatments', enabled: false, defaultDuration: 75, defaultPrice: 600, requiresCertification: 'PRP/PRF' },
  ];
}

export default function StaffDetail({ staff, onClose, onEdit, onDelete, onSave }: StaffDetailProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [isServiceProvider, setIsServiceProvider] = useState(staff.isServiceProvider ?? true);
  const [availableInOnlineBooking, setAvailableInOnlineBooking] = useState(staff.availableInOnlineBooking ?? true);
  const [permissions, setPermissions] = useState<StaffPermissions>(
    staff.permissions || getDefaultPermissions(staff.accessLevel)
  );
  const [notifications, setNotifications] = useState<NotificationPreferences>(
    staff.notificationPreferences || getDefaultNotificationPreferences()
  );
  const [serviceAssignments, setServiceAssignments] = useState<ServiceAssignment[]>(
    staff.serviceAssignments || getMockServiceAssignments()
  );

  // Editable staff data
  const [editableStaff, setEditableStaff] = useState({
    email: staff.email,
    phone: staff.phone,
    alternatePhone: staff.alternatePhone || '',
    address: { ...staff.address },
    emergencyContact: { ...staff.emergencyContact },
    bio: staff.bio || '',
  });

  // Update a single field and auto-save
  const updateField = (field: string, value: string) => {
    setEditableStaff(prev => ({ ...prev, [field]: value }));
    onSave?.({ [field]: value });
  };

  // Update nested address field
  const updateAddress = (field: string, value: string) => {
    const newAddress = { ...editableStaff.address, [field]: value };
    setEditableStaff(prev => ({ ...prev, address: newAddress }));
    onSave?.({ address: newAddress });
  };

  // Update nested emergency contact field
  const updateEmergencyContact = (field: string, value: string) => {
    const newContact = { ...editableStaff.emergencyContact, [field]: value };
    setEditableStaff(prev => ({ ...prev, emergencyContact: newContact }));
    onSave?.({ emergencyContact: newContact });
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: User },
    { id: 'schedule', label: 'Work Hours', icon: Calendar },
    { id: 'services', label: 'Services', icon: Syringe },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
  ];

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    terminated: 'bg-red-100 text-red-800'
  };

  const licenseStatusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    pending_renewal: 'bg-amber-100 text-amber-700'
  };

  const updatePermission = (key: keyof StaffPermissions, value: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key: keyof NotificationPreferences, value: boolean | string) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const toggleService = (serviceId: string) => {
    setServiceAssignments(prev =>
      prev.map(s => s.serviceId === serviceId ? { ...s, enabled: !s.enabled } : s)
    );
  };

  const updateServicePrice = (serviceId: string, price: number) => {
    setServiceAssignments(prev =>
      prev.map(s => s.serviceId === serviceId ? { ...s, customPrice: price } : s)
    );
  };

  const updateServiceDuration = (serviceId: string, duration: number) => {
    setServiceAssignments(prev =>
      prev.map(s => s.serviceId === serviceId ? { ...s, customDuration: duration } : s)
    );
  };

  // Group services by category
  const servicesByCategory = serviceAssignments.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, ServiceAssignment[]>);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
      {/* Header - Clean and focused */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {staff.profilePhoto ? (
            <img
              src={staff.profilePhoto}
              alt={`${staff.firstName} ${staff.lastName}`}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-lg font-medium">
              {staff.firstName[0]}{staff.lastName[0]}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {staff.firstName} {staff.lastName}
              </h2>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[staff.status]}`}>
                {staff.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500">{staff.role} • {staff.primaryLocation}</p>
          </div>
          {staff.performanceMetrics && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-900">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {staff.performanceMetrics.averageRating.toFixed(1)}
              </div>
              <p className="text-xs text-gray-400">rating</p>
            </div>
          )}
        </div>

        {/* Quick Settings - Inline */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <Toggle enabled={isServiceProvider} onChange={setIsServiceProvider} />
            <span className="text-sm text-gray-600">Service provider</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Toggle enabled={availableInOnlineBooking} onChange={setAvailableInOnlineBooking} disabled={!isServiceProvider} />
            <span className="text-sm text-gray-600">Online booking</span>
          </label>
        </div>
      </div>

      {/* Quick Actions - Clean, minimal */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-gray-100">
        <button
          onClick={() => window.location.href = `mailto:${editableStaff.email}`}
          title="Send email"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Mail className="w-4 h-4" />
        </button>
        <button
          onClick={() => window.location.href = `tel:${editableStaff.phone}`}
          title="Call"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          title="View schedule"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex px-6 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Details Tab - Clean single-column layout */}
        {activeTab === 'details' && (
          <div className="max-w-2xl">
            {/* Contact */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact</h3>
              <div className="space-y-1">
                <InlineEditField
                  value={editableStaff.email}
                  onSave={(v) => updateField('email', v)}
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                />
                <InlineEditField
                  value={editableStaff.phone}
                  onSave={(v) => updateField('phone', v)}
                  icon={Phone}
                  type="tel"
                  placeholder="Phone number"
                />
                {(editableStaff.alternatePhone || true) && (
                  <InlineEditField
                    value={editableStaff.alternatePhone}
                    onSave={(v) => updateField('alternatePhone', v)}
                    icon={Phone}
                    type="tel"
                    placeholder="Alternate phone (optional)"
                  />
                )}
              </div>
            </section>

            {/* Address */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Address</h3>
              <div className="space-y-1">
                <InlineEditField
                  value={editableStaff.address.street}
                  onSave={(v) => updateAddress('street', v)}
                  icon={MapPin}
                  placeholder="Street address"
                />
                <div className="flex gap-4 ml-7">
                  <div className="flex-1">
                    <InlineEditField
                      value={editableStaff.address.city}
                      onSave={(v) => updateAddress('city', v)}
                      placeholder="City"
                    />
                  </div>
                  <div className="w-20">
                    <InlineEditField
                      value={editableStaff.address.state}
                      onSave={(v) => updateAddress('state', v)}
                      placeholder="State"
                    />
                  </div>
                  <div className="w-28">
                    <InlineEditField
                      value={editableStaff.address.zip}
                      onSave={(v) => updateAddress('zip', v)}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Emergency Contact */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Emergency Contact</h3>
              <div className="space-y-1">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <InlineEditField
                      value={editableStaff.emergencyContact.name}
                      onSave={(v) => updateEmergencyContact('name', v)}
                      icon={User}
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="w-36">
                    <InlineEditField
                      value={editableStaff.emergencyContact.relationship}
                      onSave={(v) => updateEmergencyContact('relationship', v)}
                      placeholder="Relationship"
                    />
                  </div>
                </div>
                <InlineEditField
                  value={editableStaff.emergencyContact.phone}
                  onSave={(v) => updateEmergencyContact('phone', v)}
                  icon={Phone}
                  type="tel"
                  placeholder="Phone number"
                />
              </div>
            </section>

            {/* Employment */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Employment</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <p className="text-xs text-gray-400">Employee ID</p>
                  <p className="text-sm text-gray-900">{staff.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Hire Date</p>
                  <p className="text-sm text-gray-900">{new Date(staff.hireDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Access Level</p>
                  <p className="text-sm text-gray-900">{staff.accessLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Languages</p>
                  <p className="text-sm text-gray-900">{staff.languages.join(', ')}</p>
                </div>
              </div>
            </section>

            {/* Specializations */}
            {staff.specializations.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {staff.specializations.map((spec) => (
                    <span key={spec} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Licenses & Credentials */}
            {(staff.licenses.length > 0 || staff.deaNumber || staff.npiNumber) && (
              <section className="mb-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Licenses & Credentials</h3>

                {/* NPI / DEA */}
                {(staff.npiNumber || staff.deaNumber) && (
                  <div className="flex gap-8 mb-4">
                    {staff.npiNumber && (
                      <div>
                        <p className="text-xs text-gray-400">NPI Number</p>
                        <p className="text-sm font-mono text-gray-900">{staff.npiNumber}</p>
                      </div>
                    )}
                    {staff.deaNumber && (
                      <div>
                        <p className="text-xs text-gray-400">DEA Number</p>
                        <p className="text-sm font-mono text-gray-900">{staff.deaNumber}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Licenses */}
                {staff.licenses.length > 0 && (
                  <div className="space-y-2">
                    {staff.licenses.map((license) => (
                      <div key={license.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm text-gray-900">{license.type}</p>
                          <p className="text-xs text-gray-500">{license.number} • {license.state}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${licenseStatusColors[license.status]}`}>
                            {license.status.replace('_', ' ')}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            Exp {new Date(license.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Certifications */}
            {staff.certifications.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Certifications</h3>
                <div className="space-y-2">
                  {staff.certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <Award className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-sm text-gray-900">{cert.name}</p>
                          <p className="text-xs text-gray-500">{cert.issuer}</p>
                        </div>
                      </div>
                      {cert.expiryDate && (
                        <p className="text-xs text-gray-400">Exp {new Date(cert.expiryDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bio */}
            {staff.bio && (
              <section className="mb-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Bio</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{staff.bio}</p>
              </section>
            )}

            {/* Notes */}
            {staff.notes && (
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Notes</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{staff.notes}</p>
              </section>
            )}
          </div>
        )}

        {/* Work Hours Tab */}
        {activeTab === 'schedule' && (
          <StaffSchedule
            staff={staff}
            onEditSchedule={(scheduleId) => console.log('Edit schedule:', scheduleId)}
            onAddShift={() => console.log('Add shift for:', staff.id)}
            onApproveTimeOff={(requestId) => console.log('Approve time off:', requestId)}
            onDenyTimeOff={(requestId) => console.log('Deny time off:', requestId)}
          />
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {serviceAssignments.filter(s => s.enabled).length} of {serviceAssignments.length} services enabled
              </p>
            </div>

            <div className="space-y-8">
              {Object.entries(servicesByCategory).map(([category, services]) => (
                <section key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{category}</h3>
                    <button
                      onClick={() => {
                        const allEnabled = services.every(s => s.enabled);
                        setServiceAssignments(prev =>
                          prev.map(s => services.find(cs => cs.serviceId === s.serviceId)
                            ? { ...s, enabled: !allEnabled }
                            : s
                          )
                        );
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {services.every(s => s.enabled) ? 'Disable all' : 'Enable all'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div
                        key={service.serviceId}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Toggle enabled={service.enabled} onChange={() => toggleService(service.serviceId)} />
                          <div>
                            <p className="text-sm text-gray-900">{service.serviceName}</p>
                            {service.requiresCertification && (
                              <p className="text-xs text-gray-400">
                                Requires: {service.requiresCertification}
                              </p>
                            )}
                          </div>
                        </div>
                        {service.enabled && (
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">Duration</span>
                              <select
                                value={service.customDuration || service.defaultDuration}
                                onChange={(e) => updateServiceDuration(service.serviceId, parseInt(e.target.value))}
                                className="text-sm text-gray-900 border-gray-200 rounded-md py-1 focus:border-blue-500 focus:ring-blue-500"
                              >
                                {[15, 30, 45, 60, 75, 90, 120].map(min => (
                                  <option key={min} value={min}>{min} min</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">Price</span>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                  type="number"
                                  value={service.customPrice || service.defaultPrice}
                                  onChange={(e) => updateServicePrice(service.serviceId, parseInt(e.target.value))}
                                  className="pl-6 w-20 text-sm text-gray-900 border-gray-200 rounded-md py-1 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="max-w-3xl">
            {/* Calendar */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Calendar</h3>
              <div className="space-y-0">
                <PermissionRow label="View own calendar" description="See their own schedule and appointments" enabled={permissions.viewOwnCalendar} onChange={(v) => updatePermission('viewOwnCalendar', v)} />
                <PermissionRow label="Edit own calendar" description="Modify their own appointments" enabled={permissions.editOwnCalendar} onChange={(v) => updatePermission('editOwnCalendar', v)} />
                <PermissionRow label="View all calendars" description="See other staff members' schedules" enabled={permissions.viewAllCalendars} onChange={(v) => updatePermission('viewAllCalendars', v)} />
                <PermissionRow label="Edit all calendars" description="Modify any staff member's appointments" enabled={permissions.editAllCalendars} onChange={(v) => updatePermission('editAllCalendars', v)} />
                <PermissionRow label="Manage time blocks" description="Create breaks, personal time, etc." enabled={permissions.manageTimeBlocks} onChange={(v) => updatePermission('manageTimeBlocks', v)} />
                <PermissionRow label="Manage waitlist" description="Add/remove clients from waitlist" enabled={permissions.manageWaitlist} onChange={(v) => updatePermission('manageWaitlist', v)} />
              </div>
            </section>

            {/* Patients */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Patients</h3>
              <div className="space-y-0">
                <PermissionRow label="View contact details" description="See patient phone, email, address" enabled={permissions.viewClientContactDetails} onChange={(v) => updatePermission('viewClientContactDetails', v)} />
                <PermissionRow label="View patient history" description="Access treatment history and notes" enabled={permissions.viewClientHistory} onChange={(v) => updatePermission('viewClientHistory', v)} />
                <PermissionRow label="Edit patient records" description="Modify patient charts and information" enabled={permissions.editClientRecords} onChange={(v) => updatePermission('editClientRecords', v)} />
              </div>
            </section>

            {/* Sales & Checkout */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Sales & Checkout</h3>
              <div className="space-y-0">
                <PermissionRow label="View own sales" description="See their own transaction history" enabled={permissions.viewOwnSales} onChange={(v) => updatePermission('viewOwnSales', v)} />
                <PermissionRow label="View all sales" description="See all transactions in the system" enabled={permissions.viewAllSales} onChange={(v) => updatePermission('viewAllSales', v)} />
                <PermissionRow label="Process checkout" description="Complete sales and process payments" enabled={permissions.processCheckout} onChange={(v) => updatePermission('processCheckout', v)} />
                <PermissionRow label="Process refunds" description="Issue refunds to patients" enabled={permissions.processRefunds} onChange={(v) => updatePermission('processRefunds', v)} />
                <PermissionRow label="Reopen sales" description="Modify completed transactions" enabled={permissions.reopenSales} onChange={(v) => updatePermission('reopenSales', v)} />
                <PermissionRow label="Access cash drawer" description="Open and manage the cash drawer" enabled={permissions.accessCashDrawer} onChange={(v) => updatePermission('accessCashDrawer', v)} />
              </div>
            </section>

            {/* Messages */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Messages</h3>
              <div className="space-y-0">
                <PermissionRow label="View own messages" description="See messages with their own patients" enabled={permissions.viewOwnMessages} onChange={(v) => updatePermission('viewOwnMessages', v)} />
                <PermissionRow label="View all messages" description="See all patient conversations" enabled={permissions.viewAllMessages} onChange={(v) => updatePermission('viewAllMessages', v)} />
                <PermissionRow label="Send messages" description="Send SMS/email to patients" enabled={permissions.sendMessages} onChange={(v) => updatePermission('sendMessages', v)} />
              </div>
            </section>

            {/* Administrative */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Administrative</h3>
              <div className="space-y-0">
                <PermissionRow label="View reports" description="Access business reporting and analytics" enabled={permissions.viewReports} onChange={(v) => updatePermission('viewReports', v)} />
                <PermissionRow label="Manage staff" description="Add, edit, and remove staff members" enabled={permissions.manageStaff} onChange={(v) => updatePermission('manageStaff', v)} />
                <PermissionRow label="Manage services" description="Edit service menu and pricing" enabled={permissions.manageServices} onChange={(v) => updatePermission('manageServices', v)} />
                <PermissionRow label="Manage settings" description="Access system configuration" enabled={permissions.manageSettings} onChange={(v) => updatePermission('manageSettings', v)} />
                <PermissionRow label="Access billing" description="View and manage subscription/billing" enabled={permissions.accessBilling} onChange={(v) => updatePermission('accessBilling', v)} />
              </div>
            </section>

            {/* Products & Inventory */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Products & Inventory</h3>
              <div className="space-y-0">
                <PermissionRow label="Manage products" description="Edit product catalog and inventory" enabled={permissions.manageProducts} onChange={(v) => updatePermission('manageProducts', v)} />
                <PermissionRow label="Manage purchase orders" description="Create and receive inventory orders" enabled={permissions.managePurchaseOrders} onChange={(v) => updatePermission('managePurchaseOrders', v)} />
                <PermissionRow label="Manage gift cards" description="Create and adjust gift cards" enabled={permissions.manageGiftCards} onChange={(v) => updatePermission('manageGiftCards', v)} />
                <PermissionRow label="Manage memberships" description="Create and modify membership plans" enabled={permissions.manageMemberships} onChange={(v) => updatePermission('manageMemberships', v)} />
              </div>
            </section>

            {/* Time Tracking */}
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Time Tracking</h3>
              <div className="space-y-0">
                <PermissionRow label="Use time clock" description="Clock in/out for shifts" enabled={permissions.useTimeClock} onChange={(v) => updatePermission('useTimeClock', v)} />
                <PermissionRow label="Manage time cards" description="Edit employee time records" enabled={permissions.manageTimeCards} onChange={(v) => updatePermission('manageTimeCards', v)} />
              </div>
            </section>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="max-w-3xl">
            {/* Appointment Notifications */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Appointments</h3>
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-400 py-2">Event</th>
                      <th className="text-center text-xs font-medium text-gray-400 py-2 w-16">Email</th>
                      <th className="text-center text-xs font-medium text-gray-400 py-2 w-16">SMS</th>
                      <th className="text-center text-xs font-medium text-gray-400 py-2 w-16">Push</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3">
                        <p className="text-sm text-gray-900">New appointment booked</p>
                        <p className="text-xs text-gray-400">When a patient books online or via staff</p>
                      </td>
                      <td className="text-center py-3">
                        <Toggle enabled={notifications.newAppointmentEmail} onChange={(v) => updateNotification('newAppointmentEmail', v)} />
                      </td>
                      <td className="text-center py-3">
                        <Toggle enabled={notifications.newAppointmentSms} onChange={(v) => updateNotification('newAppointmentSms', v)} />
                      </td>
                      <td className="text-center py-3">
                        <Toggle enabled={notifications.newAppointmentPush} onChange={(v) => updateNotification('newAppointmentPush', v)} />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3">
                        <p className="text-sm text-gray-900">Appointment cancelled</p>
                        <p className="text-xs text-gray-400">When a booking is cancelled</p>
                      </td>
                      <td className="text-center py-3">
                        <Toggle enabled={notifications.appointmentCancelledEmail} onChange={(v) => updateNotification('appointmentCancelledEmail', v)} />
                      </td>
                      <td className="text-center py-3">
                        <Toggle enabled={notifications.appointmentCancelledSms} onChange={(v) => updateNotification('appointmentCancelledSms', v)} />
                      </td>
                      <td className="text-center py-3">
                        <Toggle enabled={notifications.appointmentCancelledPush} onChange={(v) => updateNotification('appointmentCancelledPush', v)} />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3">
                        <p className="text-sm text-gray-900">Appointment rescheduled</p>
                        <p className="text-xs text-gray-400">When date/time is changed</p>
                      </td>
                      <td className="text-center py-3">
                        <Toggle enabled={notifications.appointmentRescheduledEmail} onChange={(v) => updateNotification('appointmentRescheduledEmail', v)} />
                      </td>
                      <td className="text-center py-3">
                        <span className="text-gray-300">—</span>
                      </td>
                      <td className="text-center py-3">
                        <Toggle enabled={notifications.appointmentRescheduledPush} onChange={(v) => updateNotification('appointmentRescheduledPush', v)} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Daily Updates */}
            <section className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Daily Updates</h3>
              <div className="space-y-0">
                <PermissionRow label="Daily schedule summary" description="Receive a morning email with today's appointments" enabled={notifications.dailyScheduleSummary} onChange={(v) => updateNotification('dailyScheduleSummary', v)} />
                <PermissionRow label="Patient arrivals" description="Get notified when patients check in" enabled={notifications.patientArrivals} onChange={(v) => updateNotification('patientArrivals', v)} />
                <PermissionRow label="New message alerts" description="Push notification for incoming patient messages" enabled={notifications.newMessagePush} onChange={(v) => updateNotification('newMessagePush', v)} />
              </div>
            </section>

            {/* Quiet Hours */}
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quiet Hours</h3>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-900">Enable quiet hours</p>
                  <p className="text-xs text-gray-400">Pause non-urgent notifications during off hours</p>
                </div>
                <Toggle enabled={notifications.quietHoursEnabled} onChange={(v) => updateNotification('quietHoursEnabled', v)} />
              </div>
              {notifications.quietHoursEnabled && (
                <div className="flex items-center gap-4 py-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Start</label>
                    <input
                      type="time"
                      value={notifications.quietHoursStart}
                      onChange={(e) => updateNotification('quietHoursStart', e.target.value)}
                      className="text-sm text-gray-900 border-gray-200 rounded-md py-1 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-gray-300 mt-5">to</span>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">End</label>
                    <input
                      type="time"
                      value={notifications.quietHoursEnd}
                      onChange={(e) => updateNotification('quietHoursEnd', e.target.value)}
                      className="text-sm text-gray-900 border-gray-200 rounded-md py-1 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Compensation Tab */}
        {activeTab === 'compensation' && (
          <div className="max-w-3xl">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center py-4 border-r border-gray-100">
                <p className="text-2xl font-semibold text-gray-900">
                  {staff.salary ? `$${staff.salary.toLocaleString()}` :
                   staff.hourlyRate ? `$${staff.hourlyRate}` : '—'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {staff.salary ? 'per year' : staff.hourlyRate ? 'per hour' : 'Commission only'}
                </p>
              </div>
              {staff.performanceMetrics && (
                <>
                  <div className="text-center py-4 border-r border-gray-100">
                    <p className="text-2xl font-semibold text-gray-900">
                      ${staff.performanceMetrics.revenueGenerated.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">revenue generated</p>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-2xl font-semibold text-gray-900">
                      {(staff.performanceMetrics.utilizationRate * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-400 mt-1">utilization</p>
                  </div>
                </>
              )}
            </div>

            {/* Commission Structure */}
            {staff.commission.length > 0 && (
              <section className="mb-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Commission</h3>
                <div className="space-y-1">
                  {staff.commission.map((comm, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-900">{comm.serviceCategory}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {comm.type === 'percentage' ? `${comm.rate}%` : `$${comm.rate}`}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Performance Metrics */}
            {staff.performanceMetrics && (
              <section className="mb-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Performance</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Services Performed</span>
                    <span className="text-sm text-gray-900">{staff.performanceMetrics.servicesPerformed}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Average Rating</span>
                    <span className="text-sm text-gray-900">{staff.performanceMetrics.averageRating.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Client Retention</span>
                    <span className="text-sm text-gray-900">{(staff.performanceMetrics.clientRetentionRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Rebooking Rate</span>
                    <span className="text-sm text-gray-900">{(staff.performanceMetrics.rebookingRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Product Sales</span>
                    <span className="text-sm text-gray-900">${staff.performanceMetrics.productSalesTotal.toLocaleString()}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Training & Reviews */}
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Training & Reviews</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Onboarding Status</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    staff.onboardingCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {staff.onboardingCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                {staff.lastTrainingDate && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Last Training</span>
                    <span className="text-sm text-gray-900">{new Date(staff.lastTrainingDate).toLocaleDateString()}</span>
                  </div>
                )}
                {staff.nextReviewDate && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Next Review</span>
                    <span className="text-sm text-gray-900">{new Date(staff.nextReviewDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
