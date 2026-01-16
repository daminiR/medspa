'use client'

import { useState, useEffect } from 'react'
import {
  Patient,
  Gender,
  PatientStatus,
  FitzpatrickType,
  EmergencyContact,
  MedicalAlert,
  Allergy,
  Medication
} from '@/types/patient'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard,
  AlertCircle,
  Shield,
  Users,
  Heart,
  FileText,
  Camera
} from 'lucide-react'

interface PatientFormProps {
  patient?: Patient
  mode: 'create' | 'edit'
  onSave: (patient: Partial<Patient>) => void | Promise<void>
  onCancel: () => void
  isSaving?: boolean
}

export default function PatientForm({ 
  patient, 
  mode, 
  onSave, 
  onCancel, 
  isSaving = false 
}: PatientFormProps) {
  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    preferredName: '',
    dateOfBirth: new Date(),
    gender: 'female' as Gender,
    email: '',
    phone: '',
    status: 'active' as PatientStatus,
    address: {
      street: '',
      street2: '',
      city: '',
      state: 'CA',
      zipCode: '',
      country: 'USA'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    medicalAlerts: [],
    allergies: [],
    medications: [],
    generalNotes: '',
    // Medical spa specific
    aestheticProfile: {
      skinType: 'I' as FitzpatrickType,
      skinConcerns: [],
      treatmentGoals: [],
      previousTreatments: [],
      contraindications: [],
      photoConsent: false
    },
    marketingConsent: false,
    photoConsent: false,
    ...patient
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'contact', label: 'Contact & Address', icon: MapPin },
    { id: 'medical', label: 'Medical Information', icon: Heart },
    { id: 'aesthetic', label: 'Aesthetic Profile', icon: Camera },
    { id: 'emergency', label: 'Emergency Contact', icon: Shield },
    { id: 'preferences', label: 'Preferences & Consent', icon: FileText }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.phone) newErrors.phone = 'Phone is required'

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // Validate phone format
    if (formData.phone && !/^\d{3}-\d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be in format: 555-555-5555'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      // Switch to the first tab with an error
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField && ['firstName', 'lastName', 'dateOfBirth'].includes(firstErrorField)) {
        setActiveTab('personal')
      } else if (firstErrorField && ['email', 'phone'].includes(firstErrorField)) {
        setActiveTab('contact')
      }
      return
    }

    await onSave(formData)
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const handlePhoneChange = (field: string, value: string) => {
    const formatted = formatPhoneNumber(value)
    if (field === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatted }))
    } else if (field === 'emergencyContact.phone') {
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact!,
          phone: formatted
        }
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
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

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Jane"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Name
                  </label>
                  <input
                    type="text"
                    value={formData.preferredName}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferredName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nickname or preferred name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth instanceof Date ? formData.dateOfBirth.toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: new Date(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PatientStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="deceased">Deceased</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contact & Address Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="jane.doe@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="555-555-5555"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Address</h3>
                
                <div>
                  <input
                    type="text"
                    value={formData.address?.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, street: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <input
                      type="text"
                      value={formData.address?.street2}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address!, street2: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Unit/Apt"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={formData.address?.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address!, city: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      value={formData.address?.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address!, state: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="State"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      value={formData.address?.zipCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address!, zipCode: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical Information Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Alerts
                </label>
                <textarea
                  value={formData.medicalAlerts?.map(a => a.description).join('\n')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    medicalAlerts: e.target.value.split('\n').filter(a => a.trim()).map((desc, index) => ({
                      id: `alert-${Date.now()}-${index}`,
                      type: 'other' as const,
                      severity: 'medium' as const,
                      description: desc,
                      addedDate: new Date(),
                      addedBy: 'current-user',
                      active: true
                    }))
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Enter each alert on a new line"
                />
                <p className="mt-1 text-xs text-gray-500">Enter each medical alert on a new line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <textarea
                  value={formData.allergies?.map(a => a.allergen).join('\n')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    allergies: e.target.value.split('\n').filter(a => a.trim()).map((allergen, index) => ({
                      id: `allergy-${Date.now()}-${index}`,
                      allergen,
                      reaction: '',
                      severity: 'medium' as const
                    }))
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Enter each allergy on a new line"
                />
                <p className="mt-1 text-xs text-gray-500">Enter each allergy on a new line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Medications
                </label>
                <textarea
                  value={formData.medications?.map(m => m.name).join('\n')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    medications: e.target.value.split('\n').filter(m => m.trim()).map((name, index) => ({
                      id: `medication-${Date.now()}-${index}`,
                      name,
                      dosage: '',
                      frequency: '',
                      startDate: new Date()
                    }))
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Enter each medication on a new line"
                />
                <p className="mt-1 text-xs text-gray-500">Enter each medication on a new line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical Notes
                </label>
                <textarea
                  value={formData.generalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, generalNotes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Any additional medical notes or history"
                />
              </div>
            </div>
          )}

          {/* Aesthetic Profile Tab */}
          {activeTab === 'aesthetic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fitzpatrick Skin Type
                </label>
                <select
                  value={formData.aestheticProfile?.skinType || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    aestheticProfile: {
                      ...prev.aestheticProfile!,
                      skinType: e.target.value as FitzpatrickType,
                      skinConcerns: prev.aestheticProfile?.skinConcerns || [],
                      treatmentGoals: prev.aestheticProfile?.treatmentGoals || [],
                      previousTreatments: prev.aestheticProfile?.previousTreatments || [],
                      contraindications: prev.aestheticProfile?.contraindications || [],
                      photoConsent: prev.aestheticProfile?.photoConsent || false
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select skin type</option>
                  <option value="I">Type I - Very fair, always burns</option>
                  <option value="II">Type II - Fair, usually burns</option>
                  <option value="III">Type III - Medium, sometimes burns</option>
                  <option value="IV">Type IV - Olive, rarely burns</option>
                  <option value="V">Type V - Brown, very rarely burns</option>
                  <option value="VI">Type VI - Black, never burns</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skin Concerns
                </label>
                <textarea
                  value={formData.aestheticProfile?.skinConcerns?.join('\n')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    aestheticProfile: {
                      ...prev.aestheticProfile!,
                      skinConcerns: e.target.value.split('\n').filter(c => c.trim())
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="E.g., Acne, Fine lines, Hyperpigmentation, etc."
                />
                <p className="mt-1 text-xs text-gray-500">Enter each concern on a new line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Goals
                </label>
                <textarea
                  value={formData.aestheticProfile?.treatmentGoals?.join('\n')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    aestheticProfile: {
                      ...prev.aestheticProfile!,
                      treatmentGoals: e.target.value.split('\n').filter(g => g.trim())
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="E.g., Anti-aging, Clear skin, Even tone, etc."
                />
                <p className="mt-1 text-xs text-gray-500">Enter each goal on a new line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraindicated Treatments
                </label>
                <textarea
                  value={formData.aestheticProfile?.contraindications?.join('\n')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    aestheticProfile: {
                      ...prev.aestheticProfile!,
                      contraindications: e.target.value.split('\n').filter(t => t.trim())
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Treatments to avoid due to medical conditions or allergies"
                />
                <p className="mt-1 text-xs text-gray-500">Enter each contraindication on a new line</p>
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: {
                        ...prev.emergencyContact!,
                        name: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.relationship}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: {
                        ...prev.emergencyContact!,
                        relationship: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="E.g., Spouse, Parent, Friend"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact?.phone}
                    onChange={(e) => handlePhoneChange('emergencyContact.phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="555-555-5555"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact?.alternatePhone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: {
                        ...prev.emergencyContact!,
                        alternatePhone: formatPhoneNumber(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="555-555-5555"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preferences & Consent Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      marketingConsent: e.target.checked
                    }))}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I consent to receive marketing communications
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.photoConsent}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      photoConsent: e.target.checked
                    }))}
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I consent to photos being taken for treatment documentation
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={formData.generalNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, generalNotes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Any additional preferences or notes"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : mode === 'create' ? 'Create Patient' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}