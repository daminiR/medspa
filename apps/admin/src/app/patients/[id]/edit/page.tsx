'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import PatientForm from '@/components/patients/PatientForm'
import { Patient } from '@/types/patient'
import { generateLargePatientDataset, getPatientByIdOptimized } from '@/lib/data/patientGenerator'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function EditPatientPage() {
  const router = useRouter()
  const params = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadPatient = async () => {
      setIsLoading(true)
      
      // Simulate async data loading
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Generate dataset if needed (in production, this would be an API call)
      const patients = generateLargePatientDataset(10000)
      const foundPatient = getPatientByIdOptimized(params.id as string, patients)
      
      if (foundPatient) {
        setPatient(foundPatient)
      }
      
      setIsLoading(false)
    }

    if (params.id) {
      loadPatient()
    }
  }, [params.id])

  const handleSave = async (patientData: Partial<Patient>) => {
    setIsSaving(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In production, this would be an API call to update the patient
      console.log('Updating patient:', params.id, patientData)
      
      // Navigate back to the patient detail page
      router.push(`/patients/${params.id}`)
    } catch (error) {
      console.error('Error saving patient:', error)
      alert('Failed to save patient. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push(`/patients/${params.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading patient information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Patient not found</h2>
            <p className="text-gray-500 mb-4">The patient record you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/patients')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    )
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
            Back to Patient Details
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Patient: {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update the patient's information below
          </p>
        </div>

        {/* Form */}
        <PatientForm
          patient={patient}
          mode="edit"
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}