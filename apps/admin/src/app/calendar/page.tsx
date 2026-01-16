'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import Sidebar from '@/components/layout/Sidebar'
import CalendarView from '@/components/calendar/CalendarView'
import ScheduleCommandBar from '@/components/calendar/ScheduleCommandBar'
import { practitioners, type Service, locations } from '@/lib/data'
import { Menu, X } from 'lucide-react'

export default function CalendarPage() {
  // Start with sidebar closed on smaller screens, open on larger screens
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedPractitionerIds, setSelectedPractitionerIds] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all')
  const [singlePractitionerId, setSinglePractitionerId] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id || '1')
  const [calendarCreateMode, setCalendarCreateMode] = useState<'appointment' | 'break' | 'none'>('appointment')
  const [calendarBreakType, setCalendarBreakType] = useState<'lunch' | 'personal' | 'meeting' | 'training' | 'out_of_office' | 'other'>('personal')
  
  // Keep sidebar closed by default now that we have command bar
  useEffect(() => {
    setSidebarOpen(false) // Always start closed since we have the command bar
  }, [])

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

  // Command bar handlers
  const handlePractitionerToggle = (practitionerId: string) => {
    if (selectedPractitionerIds.includes(practitionerId)) {
      setSelectedPractitionerIds(prev => prev.filter(id => id !== practitionerId))
    } else {
      setSelectedPractitionerIds(prev => [...prev, practitionerId])
    }
  }

  const handleSelectAllPractitioners = () => {
    const allActiveIds = practitioners
      .filter(p => p.status === 'active')
      .map(p => p.id)
    setSelectedPractitionerIds(allActiveIds)
    setViewMode('all')
    setSinglePractitionerId(null)
  }

  const handleClearPractitioners = () => {
    setSelectedPractitionerIds([])
  }

  const handleQuickBreak = (type: 'lunch' | 'break' | 'meeting') => {
    // Map toolbar types to actual break types
    const breakTypeMap: Record<string, typeof calendarBreakType> = {
      'lunch': 'lunch',
      'break': 'personal',
      'meeting': 'meeting'
    }
    setCalendarBreakType(breakTypeMap[type] || 'personal')
    setCalendarCreateMode('break')
  }

  const handleFindSlot = (service: any) => {
    // Exit break mode and go back to appointment mode
    setCalendarCreateMode('appointment')
    
    setSelectedServiceFromSidebar({
      practitionerId: selectedPractitionerIds[0] || practitioners[0].id,
      service
    })
  }

  const handleOpenSettings = () => {
    console.log('Open calendar settings')
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Navigation />
      
      {/* Schedule Command Bar - New approach */}
      <ScheduleCommandBar
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedPractitionerIds={selectedPractitionerIds}
        onPractitionerToggle={handlePractitionerToggle}
        onSelectAllPractitioners={handleSelectAllPractitioners}
        onClearPractitioners={handleClearPractitioners}
        onQuickBreak={handleQuickBreak}
        onFindSlot={handleFindSlot}
        onOpenSettings={handleOpenSettings}
      />
      
      {/* Main calendar area with optional sidebar */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar - Responsive width, properly slides in/out */}
        <div className={`${
          sidebarOpen ? 'w-72 xl:w-80 2xl:w-96' : 'w-0'
        } transition-all duration-300 ease-in-out flex-shrink-0`}>
          <aside className="h-full bg-white border-r border-gray-200 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {/* Sidebar Header with Close Button */}
              {sidebarOpen && (
                <>
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
                    <div>
                      <h2 className="font-semibold text-gray-900">Schedule Manager</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Staff, breaks & availability</p>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Hide sidebar"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <Sidebar
                    isOpen={sidebarOpen}
                    selectedPractitionerIds={selectedPractitionerIds}
                    onPractitionerClick={handlePractitionerClick}
                    onAddPractitioner={handleAddPractitioner}
                    onRemovePractitioner={handleRemovePractitioner}
                    onViewProfile={handleViewProfile}
                    onServiceSelect={handleServiceSelect}
                    onClearSlotFinder={handleClearServiceSelection}
                  />
                </>
              )}
            </div>
          </aside>
        </div>

        {/* Calendar - Takes remaining space */}
        <main className="flex-1 min-w-0 min-h-0 bg-gray-50 relative overflow-hidden">
          {/* Floating sidebar toggle - less prominent, bottom right */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed bottom-6 right-6 z-40 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all group"
              title="Show classic sidebar"
            >
              <Menu className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            </button>
          )}
          <CalendarView
            selectedPractitionerIds={selectedPractitionerIds}
            viewMode={viewMode}
            singlePractitionerId={singlePractitionerId}
            onShowAll={handleShowAll}
            onUpdateSelectedPractitioners={handleUpdateSelectedPractitioners}
            selectedServiceFromSidebar={selectedServiceFromSidebar}
            onClearServiceSelection={handleClearServiceSelection}
            createMode={calendarCreateMode}
            onCreateModeChange={setCalendarCreateMode}
            breakType={calendarBreakType}
            onBreakTypeChange={setCalendarBreakType}
          />
        </main>
      </div>
    </div>
  )
}