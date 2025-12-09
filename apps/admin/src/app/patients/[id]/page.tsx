'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import PatientDetailTabs from '@/components/patients/PatientDetailTabsClean'
import { Patient } from '@/types/patient'
import { generateLargePatientDataset, getPatientByIdOptimized } from '@/lib/data/patientGenerator'
import { ArrowLeft, Edit2, Trash2, MoreVertical, Loader2 } from 'lucide-react'

export default function PatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showActions, setShowActions] = useState(false)

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

  const handleEdit = () => {
    router.push(`/patients/${params.id}/edit`)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) {
      console.log('Delete patient:', params.id)
      // In production, this would delete from the database
      router.push('/patients')
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
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Patients
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit Patient
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  onBlur={() => setTimeout(() => setShowActions(false), 200)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </button>
                
                {showActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Patient
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Details with Tabs */}
        <PatientDetailTabs patient={patient} />
      </div>
    </div>
  )
}