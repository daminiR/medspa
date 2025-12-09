'use client'

import React, { useState } from 'react'
import { 
  ArrowLeft,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  User,
  CreditCard,
  FileText,
  Camera,
  Heart,
  Shield,
  Users,
  DollarSign,
  Clock,
  ChevronRight,
  Pill,
  Activity,
  Syringe,
  AlertTriangle,
  Star,
  MoreVertical
} from 'lucide-react'
import { Patient, FitzpatrickType, FITZPATRICK_TYPES } from '@/types/patient'
import { format } from 'date-fns'

interface PatientProfileProps {
  patient: Patient
  onBack?: () => void
  onEdit?: (patient: Patient) => void
  onDelete?: (id: string) => void
}

export default function PatientProfile({ patient, onBack, onEdit, onDelete }: PatientProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'treatments' | 'financial' | 'notes'>('overview')
  const [isEditing, setIsEditing] = useState(false)

  // Calculate age
  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : patient.age

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-600',
      deceased: 'bg-gray-200 text-gray-700'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors] || colors.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const SeverityBadge = ({ severity }: { severity: string }) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[severity as keyof typeof colors] || colors.low}`}>
        {severity}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {patient.lastName}, {patient.firstName}
                    {patient.preferredName && (
                      <span className="text-gray-500 font-normal ml-2">
                        ({patient.preferredName})
                      </span>
                    )}
                  </h1>
                  <StatusBadge status={patient.status} />
                  {patient.privacySettings?.privacyMode && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      <Shield className="h-3 w-3" />
                      VIP
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>Patient #{patient.patientNumber}</span>
                  <span>•</span>
                  <span>{age} years old</span>
                  <span>•</span>
                  <span>Member since {format(new Date(patient.registrationDate), 'MMM yyyy')}</span>
                  {patient.lastVisit && (
                    <>
                      <span>•</span>
                      <span>Last visit: {format(new Date(patient.lastVisit), 'MMM d, yyyy')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Camera className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FileText className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Edit
                  </>
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 border-b">
            {['overview', 'medical', 'treatments', 'financial', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab 
                    ? 'border-purple-600 text-purple-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Medical Alerts Bar */}
        {patient.medicalAlerts.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Medical Alerts</h3>
                <div className="space-y-2">
                  {patient.medicalAlerts.map(alert => (
                    <div key={alert.id} className="flex items-center gap-3">
                      <SeverityBadge severity={alert.severity} />
                      <span className="text-sm text-red-800">{alert.description}</span>
                      <span className="text-xs text-red-600">Added {format(new Date(alert.addedDate), 'MMM d, yyyy')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Contact & Demographics */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{patient.phone}</p>
                    {patient.alternatePhone && (
                      <p className="text-sm text-gray-500">{patient.alternatePhone} (alt)</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">{patient.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">{patient.address.street}</p>
                    {patient.address.street2 && (
                      <p className="text-sm text-gray-900">{patient.address.street2}</p>
                    )}
                    <p className="text-sm text-gray-900">
                      {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">{patient.emergencyContact.name}</p>
                <p className="text-sm text-gray-500">{patient.emergencyContact.relationship}</p>
                <p className="text-sm text-gray-900">{patient.emergencyContact.phone}</p>
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Demographics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Date of Birth</span>
                  <span className="text-sm font-medium text-gray-900">
                    {format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Gender</span>
                  <span className="text-sm font-medium text-gray-900">{patient.gender}</span>
                </div>
                {patient.pronouns && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Pronouns</span>
                    <span className="text-sm font-medium text-gray-900">{patient.pronouns}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column - Medical Information */}
          <div className="space-y-6">
            {/* Allergies */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Allergies
              </h2>
              {patient.allergies.length > 0 ? (
                <div className="space-y-2">
                  {patient.allergies.map(allergy => (
                    <div key={allergy.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{allergy.allergen}</span>
                      <SeverityBadge severity={allergy.severity} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No known allergies</p>
              )}
            </div>

            {/* Medications */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-500" />
                Current Medications
              </h2>
              {patient.medications.length > 0 ? (
                <div className="space-y-2">
                  {patient.medications.map(med => (
                    <div key={med.id}>
                      <p className="text-sm font-medium text-gray-900">{med.name}</p>
                      <p className="text-xs text-gray-500">{med.dosage} - {med.frequency}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No current medications</p>
              )}
            </div>

            {/* Aesthetic Profile */}
            {patient.aestheticProfile && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Aesthetic Profile</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Skin Type</p>
                    <p className="text-sm font-medium text-gray-900">
                      Fitzpatrick Type {patient.aestheticProfile.skinType} - {FITZPATRICK_TYPES[patient.aestheticProfile.skinType]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Skin Concerns</p>
                    <div className="flex flex-wrap gap-1">
                      {patient.aestheticProfile.skinConcerns.map(concern => (
                        <span key={concern} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Photo Consent</p>
                    <p className="text-sm font-medium text-gray-900">
                      {patient.aestheticProfile.photoConsent ? '✓ Granted' : '✗ Not granted'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Activity & Financial */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Account Balance</span>
                  <span className={`text-sm font-bold ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${patient.balance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Credits</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${patient.credits.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Lifetime Value</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${patient.lifetimeValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Visits</span>
                  <span className="text-sm font-medium text-gray-900">
                    {patient.totalVisits}
                  </span>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                View Transaction History
              </button>
            </div>

            {/* Tags */}
            {patient.tags && patient.tags.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {patient.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Communication Preferences */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Preferred Method</span>
                  <span className="text-sm font-medium text-gray-900">
                    {patient.communicationPreferences.preferredMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Appointment Reminders</span>
                  <span className="text-sm font-medium text-gray-900">
                    {patient.communicationPreferences.appointmentReminders ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Marketing Emails</span>
                  <span className="text-sm font-medium text-gray-900">
                    {patient.communicationPreferences.marketingEmails ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">SMS Notifications</span>
                  <span className="text-sm font-medium text-gray-900">
                    {patient.communicationPreferences.smsNotifications ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Book Appointment</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">View Charts</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Process Payment</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Send Message</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}