'use client'

import { useState } from 'react'
import { Patient } from '@/types/patient'
import { 
  User, 
  Calendar, 
  FileText, 
  Camera, 
  CreditCard, 
  Heart,
  Shield,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Package,
  Syringe,
  Activity,
  MessageSquare,
  Download,
  Upload,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'

interface PatientDetailTabsProps {
  patient: Patient
}

export default function PatientDetailTabs({ patient }: PatientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'treatments', label: 'Treatments', icon: Syringe },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notes', label: 'Notes', icon: MessageSquare }
  ]

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Patient Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-purple-600">
                {patient.firstName[0]}{patient.lastName[0]}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {patient.lastName}, {patient.firstName}
                {patient.preferredName && (
                  <span className="text-gray-500 font-normal ml-2">
                    ({patient.preferredName})
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {patient.gender} • {calculateAge(patient.dateOfBirth)} years old
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  DOB: {format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}
                </span>
                <span className="text-gray-500">#{patient.patientNumber}</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <a href={`mailto:${patient.email}`} className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </a>
                <a href={`tel:${patient.phone}`} className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {patient.phone}
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
              patient.status === 'active' ? 'bg-green-100 text-green-800' :
              patient.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
              'bg-gray-200 text-gray-700'
            }`}>
              {patient.status}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {patient.medicalAlerts && patient.medicalAlerts.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-900">Medical Alerts</h4>
                <ul className="mt-1 text-sm text-red-700 space-y-1">
                  {patient.medicalAlerts.map((alert, index) => (
                    <li key={index}>• {alert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  {patient.address && (
                    <div>
                      <p className="text-gray-600">Address:</p>
                      <p className="text-gray-900">
                        {patient.address.street} {patient.address.unit && `, ${patient.address.unit}`}<br />
                        {patient.address.city}, {patient.address.state} {patient.address.zip}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Preferred Contact:</p>
                    <p className="text-gray-900 capitalize">{patient.preferredCommunication}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {patient.emergencyContact && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Emergency Contact
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Name:</p>
                      <p className="text-gray-900">{patient.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Relationship:</p>
                      <p className="text-gray-900">{patient.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone:</p>
                      <p className="text-gray-900">{patient.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Medical Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Medical Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div>
                      <p className="text-gray-600 font-medium">Allergies:</p>
                      <ul className="mt-1 text-gray-900 space-y-1">
                        {patient.allergies.map((allergy, index) => (
                          <li key={index}>• {allergy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {patient.medications && patient.medications.length > 0 && (
                    <div>
                      <p className="text-gray-600 font-medium">Current Medications:</p>
                      <ul className="mt-1 text-gray-900 space-y-1">
                        {patient.medications.map((med, index) => (
                          <li key={index}>• {med}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(!patient.allergies || patient.allergies.length === 0) && 
                   (!patient.medications || patient.medications.length === 0) && (
                    <p className="text-gray-500 italic">No medical information on file</p>
                  )}
                </div>
              </div>

              {/* Aesthetic Profile */}
              {patient.aestheticProfile && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Aesthetic Profile
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                    {patient.aestheticProfile.fitzpatrickType && (
                      <div>
                        <p className="text-gray-600">Fitzpatrick Type:</p>
                        <p className="text-gray-900">Type {patient.aestheticProfile.fitzpatrickType}</p>
                      </div>
                    )}
                    {patient.aestheticProfile.skinConcerns && patient.aestheticProfile.skinConcerns.length > 0 && (
                      <div>
                        <p className="text-gray-600">Skin Concerns:</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {patient.aestheticProfile.skinConcerns.map((concern, index) => (
                            <span key={index} className="px-2 py-1 bg-white rounded text-xs text-gray-700">
                              {concern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Balance:</span>
                    <span className={`text-sm font-medium ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${patient.balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Payment:</span>
                    <span className="text-sm text-gray-900">
                      {patient.lastPaymentDate ? format(new Date(patient.lastPaymentDate), 'MMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                  {patient.insurance && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">Insurance:</p>
                      <p className="text-sm text-gray-900">{patient.insurance.provider}</p>
                      <p className="text-xs text-gray-500">ID: {patient.insurance.memberId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Visit History */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Visit History
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Visits:</span>
                    <span className="text-gray-900 font-medium">
                      {patient.visitCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Visit:</span>
                    <span className="text-gray-900">
                      {patient.lastVisit ? format(new Date(patient.lastVisit), 'MMM d, yyyy') : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="text-gray-900">
                      {format(new Date(patient.createdAt), 'MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consents */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Consents</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={patient.marketingConsent}
                      disabled
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Marketing Communications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={patient.photoConsent}
                      disabled
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Photo Documentation</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Appointment History</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                Book Appointment
              </button>
            </div>
            
            {/* Mock appointment data */}
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Botox Treatment</p>
                    <p className="text-sm text-gray-600">Dr. Sarah Johnson</p>
                    <p className="text-sm text-gray-500">45 minutes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Dec 15, 2024</p>
                    <p className="text-sm text-gray-600">2:30 PM</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Consultation</p>
                    <p className="text-sm text-gray-600">Dr. Michael Chen</p>
                    <p className="text-sm text-gray-500">30 minutes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Jan 20, 2025</p>
                    <p className="text-sm text-gray-600">10:00 AM</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>Load more appointments to see full history</p>
              </div>
            </div>
          </div>
        )}

        {/* Treatments Tab */}
        {activeTab === 'treatments' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Treatment History</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                Add Treatment
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Treatment summary cards */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Syringe className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium text-purple-900">Botox</h4>
                </div>
                <p className="text-sm text-purple-700">Last: Dec 15, 2024</p>
                <p className="text-sm text-purple-700">Total sessions: 3</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Chemical Peel</h4>
                </div>
                <p className="text-sm text-blue-700">Last: Nov 20, 2024</p>
                <p className="text-sm text-blue-700">Total sessions: 2</p>
              </div>
            </div>

            <div className="mt-6 text-center py-8 border-t">
              <p className="text-gray-500">Full treatment tracking coming soon</p>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Documents & Forms</h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4" />
                  Download All
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg divide-y">
              <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Intake Form</p>
                    <p className="text-xs text-gray-500">Signed on Dec 1, 2024</p>
                  </div>
                </div>
                <button className="text-purple-600 hover:text-purple-700 text-sm">
                  View
                </button>
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Botox Consent Form</p>
                    <p className="text-xs text-gray-500">Signed on Dec 15, 2024</p>
                  </div>
                </div>
                <button className="text-purple-600 hover:text-purple-700 text-sm">
                  View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Treatment Photos</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Camera className="h-4 w-4" />
                Add Photos
              </button>
            </div>

            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No treatment photos uploaded yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload before and after photos to track treatment progress</p>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Billing & Payments</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <CreditCard className="h-4 w-4" />
                Add Payment
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className={`text-2xl font-semibold ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${patient.balance.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-semibold text-gray-900">$3,450.00</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Available Credit</p>
                <p className="text-2xl font-semibold text-gray-900">$500.00</p>
              </div>
            </div>

            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Transactions</h4>
            <div className="border border-gray-200 rounded-lg divide-y">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Botox Treatment</p>
                  <p className="text-xs text-gray-500">Dec 15, 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">$450.00</p>
                  <p className="text-xs text-green-600">Paid</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Clinical Notes</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <Plus className="h-4 w-4" />
                Add Note
              </button>
            </div>

            <div className="space-y-4">
              {patient.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">General Notes</p>
                      <p className="text-sm text-gray-700 mt-1">{patient.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-900">Treatment Note</p>
                  <p className="text-xs text-gray-500">Dec 15, 2024 • Dr. Sarah Johnson</p>
                </div>
                <p className="text-sm text-gray-700">
                  Patient received 20 units of Botox for forehead lines. No adverse reactions. 
                  Scheduled follow-up in 2 weeks.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}