// src/app/calendar/schedule/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import CalendarView from '@/components/calendar/CalendarView'
import { practitioners, type Service } from '@/lib/data'

export default function SchedulePage() {
  const [selectedPractitionerIds, setSelectedPractitionerIds] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all')
  const [singlePractitionerId, setSinglePractitionerId] = useState<string | null>(null)

  // Slot finder state
  const [selectedServiceFromSidebar, setSelectedServiceFromSidebar] = useState<{
    practitionerId: string
    service: Service
  } | null>(null)

  // Initialize with all active practitioners on mount
  useEffect(() => {
    const activePractitioners = practitioners
      .filter(p => p.status === 'active')
      .map(p => p.id)
    setSelectedPractitionerIds(activePractitioners)
  }, [])

  const handleUpdateSelectedPractitioners = (practitionerIds: string[]) => {
    setSelectedPractitionerIds(practitionerIds)
    // Also reset to 'all' view mode when Staff Today is clicked
    setViewMode('all')
    setSinglePractitionerId(null)
  }

  // Handle clicking on a practitioner name - show only their calendar
  const handlePractitionerClick = (practitionerId: string) => {
    setViewMode('single')
    setSinglePractitionerId(practitionerId)
    setSelectedPractitionerIds([practitionerId])
  }

  // Handle adding a practitioner to the multi-view
  const handleAddPractitioner = (practitionerId: string) => {
    if (viewMode === 'single') {
      // Switch to multi-view when adding
      setViewMode('all')
      setSinglePractitionerId(null)
      setSelectedPractitionerIds([singlePractitionerId!, practitionerId])
    } else {
      setSelectedPractitionerIds(prev => [...prev, practitionerId])
    }
  }

  // Handle removing a practitioner from the view
  const handleRemovePractitioner = (practitionerId: string) => {
    setSelectedPractitionerIds(prev => prev.filter(id => id !== practitionerId))

    // If we remove the single practitioner being viewed, go back to all view
    if (viewMode === 'single' && practitionerId === singlePractitionerId) {
      setViewMode('all')
      setSinglePractitionerId(null)
      const activePractitioners = practitioners
        .filter(p => p.status === 'active')
        .map(p => p.id)
      setSelectedPractitionerIds(activePractitioners)
    }
  }

  // Handle viewing practitioner profile
  const handleViewProfile = (practitionerId: string) => {
    // TODO: Implement profile view modal or navigation
    console.log('View profile for:', practitionerId)
  }

  // Reset to show all practitioners
  const handleShowAll = () => {
    setViewMode('all')
    setSinglePractitionerId(null)
    const activePractitioners = practitioners
      .filter(p => p.status === 'active')
      .map(p => p.id)
    setSelectedPractitionerIds(activePractitioners)
  }

  // Handle service selection from sidebar
  const handleServiceSelect = (practitionerId: string, service: Service) => {
    setSelectedServiceFromSidebar({ practitionerId, service })

    // If the practitioner is not currently visible, add them
    if (!selectedPractitionerIds.includes(practitionerId)) {
      if (viewMode === 'single') {
        // Switch to showing just this practitioner
        setSinglePractitionerId(practitionerId)
        setSelectedPractitionerIds([practitionerId])
      } else {
        // Add to the current view
        setSelectedPractitionerIds(prev => [...prev, practitionerId])
      }
    }
  }

  // Clear service selection
  const handleClearServiceSelection = () => {
    setSelectedServiceFromSidebar(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-500 mt-1">Manage provider schedules and appointments</p>
        </div>
        
        <CalendarView
          selectedPractitionerIds={selectedPractitionerIds}
          viewMode={viewMode}
          singlePractitionerId={singlePractitionerId}
          onShowAll={handleShowAll}
          onUpdateSelectedPractitioners={handleUpdateSelectedPractitioners}
          selectedServiceFromSidebar={selectedServiceFromSidebar}
          onClearServiceSelection={handleClearServiceSelection}
        />
      </div>
    </div>
  )
}