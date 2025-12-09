'use client';

import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Award, Clock, DollarSign, 
  Shield, Users, FileText, Activity, Edit, Trash2, X, Star,
  Briefcase, Heart, AlertCircle, CreditCard, Building
} from 'lucide-react';
import { StaffMember } from '@/types/staff';
import StaffSchedule from './StaffSchedule';

interface StaffDetailProps {
  staff: StaffMember;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function StaffDetail({ staff, onClose, onEdit, onDelete }: StaffDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    terminated: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={onClose}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Staff Directory
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
              {staff.firstName[0]}{staff.lastName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {staff.firstName} {staff.lastName}
                {staff.pronouns && <span className="text-sm text-gray-500 ml-2">({staff.pronouns})</span>}
              </h2>
              <p className="text-gray-600">{staff.role} • {staff.employeeId}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[staff.status]}`}>
                  {staff.status}
                </span>
                <span className="text-sm text-gray-500">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {staff.primaryLocation}
                </span>
                {staff.performanceMetrics && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{staff.performanceMetrics.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-600 hover:text-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
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

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{staff.phone}</span>
                  </div>
                  {staff.alternatePhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{staff.alternatePhone} (Alt)</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-sm">
                      {staff.address.street}<br />
                      {staff.address.city}, {staff.address.state} {staff.address.zip}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Emergency Contact</h3>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">{staff.emergencyContact.name}</span>
                    <span className="text-gray-500 ml-2">({staff.emergencyContact.relationship})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{staff.emergencyContact.phone}</span>
                  </div>
                  {staff.emergencyContact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{staff.emergencyContact.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {staff.languages.map((lang) => (
                    <span key={lang} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Professional Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500">Access Level</span>
                    <p className="text-sm font-medium">{staff.accessLevel}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Hire Date</span>
                    <p className="text-sm">{new Date(staff.hireDate).toLocaleDateString()}</p>
                  </div>
                  {staff.bio && (
                    <div>
                      <span className="text-xs text-gray-500">Bio</span>
                      <p className="text-sm mt-1">{staff.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {staff.specializations.map((spec) => (
                    <span key={spec} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Qualifications</h3>
                <ul className="space-y-1">
                  {staff.qualifications.map((qual, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <Award className="w-3 h-3 text-gray-400 mt-0.5" />
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {staff.licenses.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Licenses</h3>
                  <div className="space-y-2">
                    {staff.licenses.map((license) => (
                      <div key={license.id} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{license.type}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            license.status === 'active' ? 'bg-green-100 text-green-800' : 
                            license.status === 'expired' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {license.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {license.number} • Expires {new Date(license.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <StaffSchedule 
            staff={staff}
            onEditSchedule={(scheduleId) => console.log('Edit schedule:', scheduleId)}
            onAddShift={() => console.log('Add shift for:', staff.id)}
            onApproveTimeOff={(requestId) => console.log('Approve time off:', requestId)}
            onDenyTimeOff={(requestId) => console.log('Deny time off:', requestId)}
          />
        )}

        {activeTab === 'permissions' && (
          <div>
            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">Access Level</h3>
                  <p className="text-sm text-blue-700 mt-1">{staff.accessLevel}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Module Permissions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Patient Charts', access: true },
                    { name: 'Scheduling', access: true },
                    { name: 'Billing', access: staff.accessLevel.includes('Billing') || staff.accessLevel.includes('Full') },
                    { name: 'Reports', access: staff.accessLevel.includes('Full') || staff.accessLevel.includes('Owner') },
                    { name: 'Settings', access: staff.accessLevel.includes('Full') || staff.accessLevel.includes('Owner') },
                    { name: 'Staff Management', access: staff.accessLevel.includes('Full') || staff.accessLevel.includes('Owner') }
                  ].map((perm) => (
                    <div key={perm.name} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                      <span className="text-sm">{perm.name}</span>
                      <span className={`w-2 h-2 rounded-full ${perm.access ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Location Access</h3>
                <div className="flex flex-wrap gap-2">
                  {staff.locations.map((loc) => (
                    <span key={loc} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compensation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Compensation Type</span>
                  <DollarSign className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-semibold">
                  {staff.salary ? `$${staff.salary.toLocaleString()}/year` : 
                   staff.hourlyRate ? `$${staff.hourlyRate}/hour` : 'Commission Only'}
                </p>
              </div>

              {staff.performanceMetrics && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Revenue Generated</span>
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-semibold text-green-700">
                    ${staff.performanceMetrics.revenueGenerated.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {staff.commission.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Commission Structure</h3>
                <div className="space-y-2">
                  {staff.commission.map((comm, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <span className="text-sm font-medium">{comm.serviceCategory}</span>
                      <span className="text-sm text-gray-600">
                        {comm.type === 'percentage' ? `${comm.rate}%` : `$${comm.rate}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && staff.performanceMetrics && (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Services Performed</span>
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-semibold">{staff.performanceMetrics.servicesPerformed}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Client Retention</span>
                  <Heart className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-2xl font-semibold">
                  {(staff.performanceMetrics.clientRetentionRate * 100).toFixed(0)}%
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Utilization Rate</span>
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-semibold">
                  {(staff.performanceMetrics.utilizationRate * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{staff.performanceMetrics.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rebooking Rate</span>
                    <span className="text-sm font-medium">
                      {(staff.performanceMetrics.rebookingRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Product Sales</span>
                    <span className="text-sm font-medium">
                      ${staff.performanceMetrics.productSalesTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Review Information</h3>
                <div className="space-y-3">
                  {staff.lastTrainingDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Training</span>
                      <span className="text-sm">{new Date(staff.lastTrainingDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Next Review</span>
                    <span className="text-sm">{new Date(staff.nextReviewDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Onboarding</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      staff.onboardingCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {staff.onboardingCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="space-y-4">
              {staff.certifications.map((cert) => (
                <div key={cert.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{cert.issuer}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Certificate #{cert.certificationNumber}</span>
                        <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                        {cert.expiryDate && (
                          <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Award className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}

              {staff.insuranceInfo && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Malpractice Insurance</h4>
                      <p className="text-sm text-gray-500 mt-1">{staff.insuranceInfo.provider}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Policy #{staff.insuranceInfo.policyNumber}</span>
                        <span>Expires: {new Date(staff.insuranceInfo.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              )}

              {(staff.deaNumber || staff.npiNumber) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Professional Numbers</h4>
                  <div className="space-y-2">
                    {staff.deaNumber && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">DEA Number</span>
                        <span className="font-mono">{staff.deaNumber}</span>
                      </div>
                    )}
                    {staff.npiNumber && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">NPI Number</span>
                        <span className="font-mono">{staff.npiNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            {staff.notes ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{staff.notes}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No notes available</p>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">History</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <div>Created: {new Date(staff.createdAt).toLocaleDateString()}</div>
                <div>Last Updated: {new Date(staff.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}