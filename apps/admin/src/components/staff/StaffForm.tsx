'use client';

import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Award, Shield, 
  DollarSign, Clock, Save, X, Plus, Trash2, Building
} from 'lucide-react';
import { 
  StaffMember, StaffRole, AccessLevel, StaffStatus, 
  Specialization, License, Certification
} from '@/types/staff';

interface StaffFormProps {
  staff?: StaffMember;
  onSave: (data: Partial<StaffMember>) => void;
  onCancel: () => void;
}

const roles: StaffRole[] = [
  'Medical Director', 'Physician', 'Nurse Practitioner', 'Registered Nurse',
  'Aesthetician', 'Laser Technician', 'Injection Specialist', 'Front Desk',
  'Office Manager', 'Billing Specialist', 'Marketing Coordinator', 'Patient Coordinator'
];

const accessLevels: AccessLevel[] = [
  'No Access', 'Practitioner Limited', 'Practitioner + Front Desk',
  'Practitioner + Front Desk (All Locations)', 'Front Desk Only',
  'Administrative/Billing', 'Full Access', 'Account Owner'
];

const specializations: Specialization[] = [
  'Botox/Dysport', 'Dermal Fillers', 'Laser Hair Removal', 'IPL/BBL',
  'Chemical Peels', 'Microneedling', 'Body Contouring', 'PRP/PRF',
  'Skin Resurfacing', 'Medical-Grade Facials'
];

const locations = [
  'Beverly Hills Main', 'Santa Monica Branch', 'Newport Beach', 
  'Malibu Center', 'West Hollywood'
];

export default function StaffForm({ staff, onSave, onCancel }: StaffFormProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    role: staff?.role || 'Aesthetician',
    accessLevel: staff?.accessLevel || 'Practitioner Limited',
    status: staff?.status || 'active',
    specializations: staff?.specializations || [],
    primaryLocation: staff?.primaryLocation || locations[0],
    locations: staff?.locations || [locations[0]],
    address: staff?.address || { street: '', city: '', state: 'CA', zip: '' },
    emergencyContact: staff?.emergencyContact || { name: '', relationship: '', phone: '' },
    bio: staff?.bio || '',
    qualifications: staff?.qualifications || [],
    languages: staff?.languages || ['English'],
    licenses: staff?.licenses || [],
    certifications: staff?.certifications || [],
    commission: staff?.commission || [],
    hourlyRate: staff?.hourlyRate,
    salary: staff?.salary,
    pronouns: staff?.pronouns || '',
    hireDate: staff?.hireDate || new Date().toISOString().split('T')[0]
  });

  const [newQualification, setNewQualification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Award },
    { id: 'access', label: 'Access & Permissions', icon: Shield },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
    { id: 'schedule', label: 'Schedule', icon: Clock }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address!, [field]: value }
    }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact!, [field]: value }
    }));
  };

  const handleSpecializationToggle = (spec: Specialization) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations?.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...(prev.specializations || []), spec]
    }));
  };

  const handleLocationToggle = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations?.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...(prev.locations || []), location]
    }));
  };

  const handleAddQualification = () => {
    if (newQualification) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), newQualification]
      }));
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications?.filter((_, i) => i !== index)
    }));
  };

  const handleAddLanguage = () => {
    if (newLanguage && !formData.languages?.includes(newLanguage)) {
      setFormData(prev => ({
        ...prev,
        languages: [...(prev.languages || []), newLanguage]
      }));
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages?.filter(l => l !== lang)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pronouns
                  </label>
                  <select
                    value={formData.pronouns}
                    onChange={(e) => handleInputChange('pronouns', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select...</option>
                    <option value="she/her">she/her</option>
                    <option value="he/him">he/him</option>
                    <option value="they/them">they/them</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Street"
                    value={formData.address?.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="col-span-2 px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.address?.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.address?.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-20 px-3 py-2 border rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="ZIP"
                      value={formData.address?.zip}
                      onChange={(e) => handleAddressChange('zip', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.emergencyContact?.name}
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Relationship"
                    value={formData.emergencyContact?.relationship}
                    onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.emergencyContact?.phone}
                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'professional' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Location
                  </label>
                  <select
                    value={formData.primaryLocation}
                    onChange={(e) => handleInputChange('primaryLocation', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {specializations.map(spec => (
                    <label key={spec} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.specializations?.includes(spec)}
                        onChange={() => handleSpecializationToggle(spec)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief professional bio..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications
                </label>
                <div className="space-y-2">
                  {formData.qualifications?.map((qual, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 rounded">{qual}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQualification}
                      onChange={(e) => setNewQualification(e.target.value)}
                      placeholder="Add qualification..."
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleAddQualification}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.languages?.map(lang => (
                    <span key={lang} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                      {lang}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add language..."
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Level
                </label>
                <select
                  value={formData.accessLevel}
                  onChange={(e) => handleInputChange('accessLevel', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {accessLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This determines what areas of the system the staff member can access
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Access
                </label>
                <div className="space-y-2">
                  {locations.map(loc => (
                    <label key={loc} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.locations?.includes(loc)}
                        onChange={() => handleLocationToggle(loc)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Permission Preview</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Patient Charts</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Scheduling</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Billing</span>
                    <span className={`w-2 h-2 rounded-full ${
                      formData.accessLevel?.includes('Billing') || formData.accessLevel?.includes('Full') 
                        ? 'bg-green-500' : 'bg-gray-300'
                    }`}></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reports</span>
                    <span className={`w-2 h-2 rounded-full ${
                      formData.accessLevel?.includes('Full') || formData.accessLevel?.includes('Owner')
                        ? 'bg-green-500' : 'bg-gray-300'
                    }`}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compensation' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compensation Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="compType"
                      checked={!!formData.salary}
                      onChange={() => {
                        handleInputChange('salary', 60000);
                        handleInputChange('hourlyRate', undefined);
                      }}
                    />
                    <span className="text-sm">Salary</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="compType"
                      checked={!!formData.hourlyRate}
                      onChange={() => {
                        handleInputChange('hourlyRate', 25);
                        handleInputChange('salary', undefined);
                      }}
                    />
                    <span className="text-sm">Hourly</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="compType"
                      checked={!formData.salary && !formData.hourlyRate}
                      onChange={() => {
                        handleInputChange('salary', undefined);
                        handleInputChange('hourlyRate', undefined);
                      }}
                    />
                    <span className="text-sm">Commission Only</span>
                  </label>
                </div>
              </div>

              {formData.salary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Salary
                  </label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {formData.hourlyRate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Structure
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-600">
                    <span>Service Category</span>
                    <span>Rate</span>
                    <span>Type</span>
                  </div>
                  {['Injectables', 'Laser Treatments', 'Product Sales'].map(category => (
                    <div key={category} className="grid grid-cols-3 gap-2">
                      <span className="text-sm px-2 py-1">{category}</span>
                      <input
                        type="number"
                        placeholder="0"
                        className="px-2 py-1 border rounded text-sm"
                      />
                      <select className="px-2 py-1 border rounded text-sm">
                        <option>Percentage</option>
                        <option>Fixed</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Schedule configuration is managed through the Shifts system in the Calendar view.
                  You can apply schedule templates or edit individual shifts there.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-3">Default Weekly Schedule</h4>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                    <div key={day} className="text-center">
                      <div className="text-xs font-medium text-gray-600 mb-2">{day}</div>
                      <button
                        type="button"
                        className="w-full px-2 py-4 border rounded hover:bg-gray-50 text-xs"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {staff ? 'Save Changes' : 'Add Staff Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}