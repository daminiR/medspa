'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PatientListPaginated from '@/components/patients/PatientListPaginated'
import { 
  generateLargePatientDataset, 
  generatePatientListItems,
  searchPatientsOptimized 
} from '@/lib/data/patientGenerator'
import { PatientListItem } from '@/types/patient'

// Generate large dataset once (in production, this would be from database)
const TOTAL_PATIENTS = 10000 // Simulating a large medical spa with 10K patients

// Store dataset outside component to persist across re-renders
let cachedPatientData: PatientListItem[] | null = null

export default function PatientsPage() {
  const router = useRouter()
  const [allPatients, setAllPatients] = useState<PatientListItem[]>(cachedPatientData || [])
  const [isInitializing, setIsInitializing] = useState(!cachedPatientData)
  const isInitializingRef = useRef(!cachedPatientData)

  // Initialize large dataset
  useEffect(() => {
    const initializeData = async () => {
      // Use cached data if available
      if (cachedPatientData && cachedPatientData.length > 0) {
        setAllPatients(cachedPatientData)
        setIsInitializing(false)
        isInitializingRef.current = false
        return
      }
      
      // Simulate async data loading
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Generate dataset (in production, this would be loaded from API/database)
      const patients = generateLargePatientDataset(TOTAL_PATIENTS)
      const listItems = generatePatientListItems(patients)
      
      // Cache the data
      cachedPatientData = listItems
      
      setAllPatients(listItems)
      setIsInitializing(false)
      isInitializingRef.current = false
    }

    initializeData()
  }, [])

  // Load patients function for the optimized list
  const loadPatients = async (
    page: number, 
    pageSize: number, 
    query: string, 
    filters: any
  ): Promise<{
    results: PatientListItem[]
    total: number
    pages: number
  }> => {
    // Wait for initialization to complete
    let retries = 0
    while (isInitializingRef.current && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      retries++
    }
    
    // Check if we have data to work with
    // Always use cachedPatientData since it's outside the component and will have the latest data
    const dataSource = cachedPatientData
    
    if (!dataSource || dataSource.length === 0) {
      return {
        results: [],
        total: 0,
        pages: 0
      }
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))

    // Apply filters (in production, this would be done server-side)
    let filteredPatients = [...dataSource]

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filteredPatients = filteredPatients.filter(p => p.status === filters.status)
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredPatients.sort((a, b) => {
        let comparison = 0
        
        switch (filters.sortBy) {
          case 'name':
            comparison = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
            break
          case 'lastVisit':
            const dateA = a.lastVisit ? new Date(a.lastVisit).getTime() : 0
            const dateB = b.lastVisit ? new Date(b.lastVisit).getTime() : 0
            comparison = dateB - dateA
            break
          case 'balance':
            comparison = b.balance - a.balance
            break
        }
        
        return filters.sortOrder === 'asc' ? comparison : -comparison
      })
    }

    // Perform search with pagination
    const result = searchPatientsOptimized(filteredPatients, query, page, pageSize)
    
    return result
  }

  const handlePatientSelect = (patient: PatientListItem) => {
    // Navigate to patient detail page
    router.push(`/patients/${patient.id}`)
  }

  const handleNewPatient = () => {
    router.push('/patients/new')
  }

  if (isInitializing) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading patient database...</p>
            <p className="text-sm text-gray-400 mt-2">Preparing {TOTAL_PATIENTS.toLocaleString()} patient records</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 mt-1">Manage your patient database</p>
        </div>
        <PatientListPaginated
          loadPatients={loadPatients}
          onPatientSelect={handlePatientSelect}
          onNewPatient={handleNewPatient}
        />
      </div>
    </div>
  )
}
