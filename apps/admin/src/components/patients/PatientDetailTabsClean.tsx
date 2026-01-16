'use client'

import { useState } from 'react'
import { Patient } from '@/types/patient'
import AppointmentHistory from './AppointmentHistory'
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
  Syringe,
  MessageSquare,
  Plus,
  ChevronRight,
  Activity,
  Users,
  Pill,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  UserPlus
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface PatientDetailTabsProps {
  patient: Patient
}

export default function PatientDetailTabs({ patient }: PatientDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'medical', label: 'Medical Profile', icon: Activity },
    { id: 'treatments', label: 'Treatments', icon: Syringe },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notes', label: 'Notes', icon: MessageSquare }
  ]

  const calculateAge = (dateOfBirth: Date | string) => {
    const today = new Date()
    const birthDate = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const daysSinceLastVisit = patient.lastVisit 
    ? differenceInDays(new Date(), new Date(patient.lastVisit))
    : null

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Patient Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-purple-600">
                {patient.firstName[0]}{patient.lastName[0]}
              </span>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
                {patient.preferredName && (
                  <span className="text-gray-500 font-normal ml-2 text-lg">
                    ({patient.preferredName})
                  </span>
                )}
              </h2>
              
              <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                <span>{patient.gender} • {calculateAge(patient.dateOfBirth)} years old</span>
                <span>DOB: {format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}</span>
                <span className="text-gray-400">#{patient.patientNumber}</span>
              </div>
              
              <div className="flex items-center gap-4 mt-3">
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
          
          <div>
            <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
              patient.status === 'active' ? 'bg-green-100 text-green-700' :
              patient.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {patient.status}
            </span>
          </div>
        </div>

        {/* Medical Alerts */}
        {patient.medicalAlerts && patient.medicalAlerts.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm font-medium text-red-900">Medical Alerts: </span>
                <span className="text-sm text-red-700">
                  {patient.medicalAlerts.map(alert => alert.description).join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-3 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
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
            {/* Column 1: Contact & Personal */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Patient Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Visits</span>
                    <span className="font-medium text-gray-900">{patient.totalVisits || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Visit</span>
                    <span className="font-medium text-gray-900">
                      {daysSinceLastVisit !== null ? `${daysSinceLastVisit} days ago` : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(patient.createdAt), 'MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                  {patient.address && (
                    <div>
                      <p className="text-gray-600 mb-1">Address</p>
                      <p className="text-gray-900">
                        {patient.address.street} {patient.address.street2 && `, ${patient.address.street2}`}<br />
                        {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600 mb-1">Preferred Contact Method</p>
                    <p className="text-gray-900 capitalize">{patient.communicationPreferences.preferredMethod}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {patient.emergencyContact && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Emergency Contact</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <p className="text-gray-900 font-medium">{patient.emergencyContact.name}</p>
                    <p className="text-gray-600">{patient.emergencyContact.relationship}</p>
                    <p className="text-gray-600">{patient.emergencyContact.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Medical */}
            <div className="space-y-6">
              {/* Medical Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Medical Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4 text-sm">
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div>
                      <p className="text-gray-600 font-medium mb-2">Allergies</p>
                      <ul className="space-y-1">
                        {patient.allergies.map((allergy, index) => (
                          <li key={index} className="text-gray-900 flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            {allergy.allergen}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {patient.medications && patient.medications.length > 0 && (
                    <div>
                      <p className="text-gray-600 font-medium mb-2">Current Medications</p>
                      <ul className="space-y-1">
                        {patient.medications.map((med, index) => (
                          <li key={index} className="text-gray-900 flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            {med.name}
                          </li>
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
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Aesthetic Profile</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                    {patient.aestheticProfile.skinType && (
                      <div>
                        <p className="text-gray-600 mb-1">Fitzpatrick Skin Type</p>
                        <p className="text-gray-900">Type {patient.aestheticProfile.skinType}</p>
                      </div>
                    )}
                    
                    {patient.aestheticProfile.skinConcerns && patient.aestheticProfile.skinConcerns.length > 0 && (
                      <div>
                        <p className="text-gray-600 mb-1">Skin Concerns</p>
                        <p className="text-gray-900">{patient.aestheticProfile.skinConcerns.join(', ')}</p>
                      </div>
                    )}
                    
                    {patient.aestheticProfile.treatmentGoals && patient.aestheticProfile.treatmentGoals.length > 0 && (
                      <div>
                        <p className="text-gray-600 mb-1">Treatment Goals</p>
                        <p className="text-gray-900">{patient.aestheticProfile.treatmentGoals.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: Financial & Admin */}
            <div className="space-y-6">
              {/* Financial Summary */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Financial Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Account Balance</span>
                      <span className={`text-lg font-semibold ${patient.balance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        ${patient.balance.toFixed(2)}
                      </span>
                    </div>
                    
                    {patient.insurance && patient.insurance.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600 mb-1">Insurance</p>
                        <p className="text-sm font-medium text-gray-900">{patient.insurance[0].provider}</p>
                        <p className="text-xs text-gray-500">ID: {patient.insurance[0].policyNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Appointment */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Next Appointment</h3>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">Botox Treatment</p>
                  <p className="text-sm text-gray-600 mt-1">Jan 20, 2025 at 2:30 PM</p>
                  <p className="text-sm text-gray-600">with Dr. Sarah Johnson</p>
                  <button className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                    View Details
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Consent Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Consents</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={patient.marketingConsent}
                      disabled
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Marketing Communications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={patient.photoConsent}
                      disabled
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Photo Documentation</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 space-y-2">
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                  Book Appointment
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab - Using AppointmentHistory Component */}
        {activeTab === 'appointments' && (
          <AppointmentHistory patientId={patient.id} />
        )}

        {/* Medical Profile Tab - Deep Profile Details */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            {/* Medical Alerts Banner */}
            {patient.medicalAlerts && patient.medicalAlerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">Active Medical Alerts</h3>
                    <div className="space-y-2">
                      {patient.medicalAlerts.map((alert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">{alert.severity.toUpperCase()}</span>
                          <span className="text-sm text-red-800">{alert.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Medical History */}
              <div className="space-y-6">
                {/* Allergies Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Allergies
                  </h3>
                  {patient.allergies && patient.allergies.length > 0 ? (
                    <div className="space-y-3">
                      {patient.allergies.map((allergy, index) => (
                        <div key={index} className="flex items-start justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{allergy.allergen}</p>
                            <p className="text-sm text-gray-600 mt-1">Reaction: {allergy.reaction}</p>
                          </div>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            {allergy.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No known allergies on file</p>
                  )}
                  <button className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Allergy
                  </button>
                </div>

                {/* Current Medications */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-500" />
                    Current Medications
                  </h3>
                  {patient.medications && patient.medications.length > 0 ? (
                    <div className="space-y-3">
                      {patient.medications.map((medication, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="font-medium text-gray-900">{medication.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{medication.dosage} - {medication.frequency}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No medications on file</p>
                  )}
                  <button className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Medication
                  </button>
                </div>

                {/* Medical History Timeline */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Medical History
                  </h3>
                  <div className="space-y-4">
                    <div className="relative pl-6 pb-4 border-l-2 border-gray-200">
                      <div className="absolute -left-1.5 top-0 w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Initial Consultation</p>
                          <p className="text-sm text-gray-600">Full medical history review completed</p>
                        </div>
                        <span className="text-xs text-gray-500">{patient.createdAt ? format(new Date(patient.createdAt), 'MMM yyyy') : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="relative pl-6 pb-4 border-l-2 border-gray-200">
                      <div className="absolute -left-1.5 top-0 w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Consent Forms Signed</p>
                          <p className="text-sm text-gray-600">Treatment consent, photo release</p>
                        </div>
                        <span className="text-xs text-gray-500">{patient.createdAt ? format(new Date(patient.createdAt), 'MMM yyyy') : 'N/A'}</span>
                      </div>
                    </div>
                    {patient.lastVisit && (
                      <div className="relative pl-6">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">Last Visit</p>
                            <p className="text-sm text-gray-600">Most recent treatment</p>
                          </div>
                          <span className="text-xs text-gray-500">{format(new Date(patient.lastVisit), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Aesthetic Profile & Preferences */}
              <div className="space-y-6">
                {/* Contraindications Checklist */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    Contraindications Checklist
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Pregnancy', checked: false },
                      { label: 'Breastfeeding', checked: false },
                      { label: 'Active Infection', checked: false },
                      { label: 'Autoimmune Disease', checked: false },
                      { label: 'Blood Thinners', checked: patient.medications?.some((m) => m.name.toLowerCase().includes('aspirin') || m.name.toLowerCase().includes('warfarin')) || false },
                      { label: 'Keloid Scarring', checked: false },
                      { label: 'Recent Sun Exposure', checked: false },
                      { label: 'Isotretinoin (Accutane)', checked: false }
                    ].map((item, index) => (
                      <div key={index} className={`flex items-center gap-2 p-2 rounded ${item.checked ? 'bg-red-50' : 'bg-gray-50'}`}>
                        {item.checked ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className={`text-sm ${item.checked ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Last updated: {patient.updatedAt ? format(new Date(patient.updatedAt), 'MMM d, yyyy') : 'Not available'}</p>
                </div>

                {/* Aesthetic Profile */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Aesthetic Profile
                  </h3>
                  <div className="space-y-4">
                    {/* Skin Type */}
                    {patient.aestheticProfile?.skinType && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Fitzpatrick Skin Type</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900">Type {patient.aestheticProfile.skinType}</span>
                          <span className="text-sm text-gray-500">
                            {patient.aestheticProfile.skinType === 'I' && '- Always burns, never tans'}
                            {patient.aestheticProfile.skinType === 'II' && '- Usually burns, tans minimally'}
                            {patient.aestheticProfile.skinType === 'III' && '- Sometimes burns, tans uniformly'}
                            {patient.aestheticProfile.skinType === 'IV' && '- Burns minimally, always tans'}
                            {patient.aestheticProfile.skinType === 'V' && '- Very rarely burns, tans darkly'}
                            {patient.aestheticProfile.skinType === 'VI' && '- Never burns, deeply pigmented'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Skin Concerns */}
                    {patient.aestheticProfile?.skinConcerns && patient.aestheticProfile.skinConcerns.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Skin Concerns</p>
                        <div className="flex flex-wrap gap-2">
                          {patient.aestheticProfile.skinConcerns.map((concern: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">
                              {concern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Treatment Goals */}
                    {patient.aestheticProfile?.treatmentGoals && patient.aestheticProfile.treatmentGoals.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Treatment Goals</p>
                        <div className="flex flex-wrap gap-2">
                          {patient.aestheticProfile.treatmentGoals.map((goal: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photo Consent Status */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Photo Documentation Consent</p>
                      <div className="flex items-center gap-2">
                        {patient.photoConsent ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="font-medium text-green-700">Consent Granted</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-500" />
                            <span className="font-medium text-red-700">Not Consented</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment Preferences */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Treatment Preferences
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Preferred Days</span>
                      <span className="text-sm font-medium text-gray-900">Weekdays</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Preferred Times</span>
                      <span className="text-sm font-medium text-gray-900">Afternoon</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Primary Provider</span>
                      <span className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Numbing Preference</span>
                      <span className="text-sm font-medium text-gray-900">Topical only</span>
                    </div>
                  </div>
                </div>

                {/* Family Members / Linked Accounts */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Family Members
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">For Group Bookings</span>
                  </h3>
                  {patient.familyMembers && patient.familyMembers.length > 0 ? (
                    <div className="space-y-3">
                      {patient.familyMembers.map((member: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{member.patientName || 'Family Member'}</p>
                              <p className="text-sm text-gray-500 capitalize">{member.relationship}</p>
                            </div>
                          </div>
                          <button className="text-sm text-purple-600 hover:text-purple-700">
                            View Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-3">No linked family members</p>
                      <button className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 mx-auto">
                        <UserPlus className="h-4 w-4" />
                        Link Family Member
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Treatments Tab */}
        {activeTab === 'treatments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Treatment History</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                <Plus className="h-4 w-4" />
                Add Treatment
              </button>
            </div>

            {/* Treatment Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-1">Botox</h4>
                <p className="text-sm text-purple-700">Total Sessions: 4</p>
                <p className="text-sm text-purple-700">Last: Dec 15, 2024</p>
                <p className="text-sm text-purple-700">Next Due: Mar 2025</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-1">Chemical Peels</h4>
                <p className="text-sm text-blue-700">Total Sessions: 2</p>
                <p className="text-sm text-blue-700">Last: Nov 20, 2024</p>
                <p className="text-sm text-blue-700">Next Due: Feb 2025</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-1">HydraFacial</h4>
                <p className="text-sm text-green-700">Total Sessions: 3</p>
                <p className="text-sm text-green-700">Last: Oct 5, 2024</p>
                <p className="text-sm text-green-700">Monthly treatments</p>
              </div>
            </div>

            {/* Treatment Details */}
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Treatments</h4>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Botox - 20 units</p>
                    <p className="text-sm text-gray-600 mt-1">Areas: Forehead (8 units), Crow's feet (12 units)</p>
                    <p className="text-sm text-gray-500 mt-1">Provider: Dr. Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Notes: Patient tolerated well, no bruising</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Dec 15, 2024</p>
                    <p className="text-sm font-semibold text-gray-700">$450</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">VI Peel</p>
                    <p className="text-sm text-gray-600 mt-1">Type: Medium depth chemical peel</p>
                    <p className="text-sm text-gray-500 mt-1">Provider: RN Jessica Martinez</p>
                    <p className="text-sm text-gray-500">Notes: Fitzpatrick III, good candidate</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Nov 20, 2024</p>
                    <p className="text-sm font-semibold text-gray-700">$350</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Documents & Forms</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                <Plus className="h-4 w-4" />
                Upload Document
              </button>
            </div>

            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">New Patient Intake Form</p>
                      <p className="text-sm text-gray-500">Completed Sep 1, 2024 • PDF • 156 KB</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Botox Consent Form</p>
                      <p className="text-sm text-gray-500">Signed Dec 15, 2024 • PDF • 89 KB</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Chemical Peel Consent</p>
                      <p className="text-sm text-gray-500">Signed Nov 20, 2024 • PDF • 92 KB</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Medical History</p>
                      <p className="text-sm text-gray-500">Updated Sep 1, 2024 • PDF • 201 KB</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Photo Release Form</p>
                      <p className="text-sm text-gray-500">Signed Sep 1, 2024 • PDF • 67 KB</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Treatment Photos</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                <Camera className="h-4 w-4" />
                Add Photos
              </button>
            </div>

            <div className="space-y-6">
              {/* Botox Before/After */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">Botox Treatment - Dec 15, 2024</h4>
                  <span className="text-sm text-gray-500">Dr. Sarah Johnson</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Before</p>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">After (2 weeks)</p>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Notes: 20 units, forehead and crow's feet</p>
              </div>

              {/* Chemical Peel Progress */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">VI Peel - Nov 20, 2024</h4>
                  <span className="text-sm text-gray-500">RN Jessica Martinez</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Before</p>
                    <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Day 7</p>
                    <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Day 30</p>
                    <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Billing & Payments</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                <CreditCard className="h-4 w-4" />
                Add Payment
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Account Balance</p>
                <p className={`text-2xl font-bold ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${patient.balance.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">$3,450.00</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Package Credits</p>
                <p className="text-2xl font-bold text-gray-900">$500.00</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Membership</p>
                <p className="text-lg font-bold text-purple-600">VIP Gold</p>
              </div>
            </div>

            {/* Payment Methods */}
            <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Methods</h4>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
                    <p className="text-xs text-gray-500">Expires 12/25</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Primary</span>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mastercard ending in 5555</p>
                    <p className="text-xs text-gray-500">Expires 08/26</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Transactions</h4>
            <div className="space-y-2">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Botox Treatment</p>
                    <p className="text-xs text-gray-500">Dec 15, 2024 • Invoice #INV-2024-1215</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">$450.00</p>
                    <p className="text-xs text-green-600">Paid</p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">VI Peel</p>
                    <p className="text-xs text-gray-500">Nov 20, 2024 • Invoice #INV-2024-1120</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">$350.00</p>
                    <p className="text-xs text-green-600">Paid</p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">HydraFacial</p>
                    <p className="text-xs text-gray-500">Oct 5, 2024 • Invoice #INV-2024-1005</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">$275.00</p>
                    <p className="text-xs text-green-600">Paid</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Package Purchase - 5 HydraFacials</p>
                    <p className="text-xs text-gray-500">Sep 15, 2024 • Invoice #INV-2024-0915</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">$1,200.00</p>
                    <p className="text-xs text-green-600">Paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Clinical Notes</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                <Plus className="h-4 w-4" />
                Add Note
              </button>
            </div>
            
            <div className="space-y-3">
              {/* General notes */}
              {patient.generalNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">General Notes</p>
                      <p className="text-sm text-gray-700">{patient.generalNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent clinical notes */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-900">Botox Treatment Note</p>
                  <p className="text-xs text-gray-500">Dec 15, 2024 • Dr. Sarah Johnson</p>
                </div>
                <p className="text-sm text-gray-700">
                  Patient received 20 units of Botox (8 units forehead, 12 units crow's feet bilaterally). 
                  No immediate adverse reactions. Patient tolerated procedure well. Reviewed aftercare instructions. 
                  Schedule follow-up in 2 weeks to assess results.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-900">Chemical Peel Note</p>
                  <p className="text-xs text-gray-500">Nov 20, 2024 • RN Jessica Martinez</p>
                </div>
                <p className="text-sm text-gray-700">
                  VI Peel applied per protocol. Fitzpatrick type III. Prepped with degreasing solution. 
                  Patient educated on post-peel care. Provided take-home kit. No contraindications noted. 
                  Follow up in 1 week.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-900">Consultation Note</p>
                  <p className="text-xs text-gray-500">Sep 1, 2024 • Dr. Michael Chen</p>
                </div>
                <p className="text-sm text-gray-700">
                  New patient consultation. Chief concerns: forehead lines, crow's feet, skin texture. 
                  Medical history reviewed - no contraindications for proposed treatments. 
                  Discussed treatment plan: Botox quarterly, monthly facials, chemical peels every 3 months. 
                  Patient agreeable to plan. All consent forms signed.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-gray-900">Allergy Alert Added</p>
                  <p className="text-xs text-gray-500">Sep 1, 2024 • System</p>
                </div>
                <p className="text-sm text-gray-700">
                  Patient reported allergy to lidocaine during intake. Alternative numbing agents to be used.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}