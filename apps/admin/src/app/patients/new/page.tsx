'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import PatientForm from '@/components/patients/PatientForm'
import { Patient } from '@/types/patient'
import { ArrowLeft } from 'lucide-react'

export default function NewPatientPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (patientData: Partial<Patient>) => {
    setIsSaving(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In production, this would be an API call
      console.log('Saving new patient:', patientData)
      
      // Generate a new patient ID (in production, the server would do this)
      const newPatientId = `PAT-${Date.now()}`
      
      // Navigate to the patient detail page
      router.push(`/patients/${newPatientId}`)
    } catch (error) {
      console.error('Error saving patient:', error)
      alert('Failed to save patient. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/patients')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-900">New Patient</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the patient's information below
          </p>
        </div>

        {/* Form */}
        <PatientForm
          mode="create"
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}