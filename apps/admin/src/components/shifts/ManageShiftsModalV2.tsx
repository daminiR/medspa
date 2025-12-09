import React, { useState, useRef, useEffect } from 'react'
import { X, Plus, Copy, Calendar, Users, MapPin, Zap, Clock, ChevronLeft, ChevronRight, ChevronDown, Check, Search } from 'lucide-react'
import moment from 'moment'
import { practitioners } from '@/lib/data'

interface TimeBlock {
  id: string
  startTime: string
  endTime: string
  bookingOption: 'not-bookable' | 'contact-to-book' | 'bookable'
}

interface DaySchedule {
  [key: string]: TimeBlock[]
}

interface ManageShiftsModalV2Props {
  isOpen: boolean
  onClose: () => void
  onApply: (data: any) => void
}

// Predefined shift templates
const SHIFT_TEMPLATES = [
  { name: 'Full Day', start: '9:00 AM', end: '5:00 PM', icon: '🌞' },
  { name: 'Morning', start: '8:00 AM', end: '12:00 PM', icon: '🌅' },
  { name: 'Afternoon', start: '1:00 PM', end: '5:00 PM', icon: '☀️' },
  { name: 'Evening', start: '3:00 PM', end: '8:00 PM', icon: '🌆' },
  { name: 'Split Shift', blocks: [{ start: '9:00 AM', end: '12:00 PM' }, { start: '2:00 PM', end: '6:00 PM' }], icon: '⚡' }
]

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ManageShiftsModalV2({
  isOpen,
  onClose,
  onApply
}: ManageShiftsModalV2Props) {
  const [currentWeek, setCurrentWeek] = useState(moment().startOf('week'))
  const [schedule, setSchedule] = useState<DaySchedule>({})
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set())
  const [dateRange, setDateRange] = useState({
    start: moment().format('YYYY-MM-DD'),
    end: moment().add(3, 'months').format('YYYY-MM-DD')
  })
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set(['dr-marcus', 'maya-lopez']))
  const [location, setLocation] = useState('The Coast')
  const [bookingDefault, setBookingDefault] = useState<'not-bookable' | 'contact-to-book' | 'bookable'>('bookable')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [draggedBlock, setDraggedBlock] = useState<{ day: string; block: TimeBlock } | null>(null)
  const [showStaffDropdown, setShowStaffDropdown] = useState(false)
  const [staffSearchQuery, setStaffSearchQuery] = useState('')
  const staffDropdownRef = useRef<HTMLDivElement>(null)
  const [showCustomTime, setShowCustomTime] = useState(false)
  const [customStartTime, setCustomStartTime] = useState('9:00 AM')
  const [customEndTime, setCustomEndTime] = useState('5:00 PM')
  const [errorMessage, setErrorMessage] = useState('')

  // Generate time slots for the grid (6 AM to 10 PM)
  const timeSlots = Array.from({ length: 33 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6
    const minute = i % 2 === 0 ? '00' : '30'
    return `${hour}:${minute}`
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (staffDropdownRef.current && !staffDropdownRef.current.contains(event.target as Node)) {
        setShowStaffDropdown(false)
        setStaffSearchQuery('') // Clear search when closing
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter practitioners based on search
  const filteredPractitioners = practitioners.filter(p => 
    p.name.toLowerCase().includes(staffSearchQuery.toLowerCase())
  )

  // Check if two time blocks conflict
  const checkTimeConflict = (newBlock: TimeBlock, existingBlocks: TimeBlock[]): boolean => {
    const newStart = moment(newBlock.startTime, 'h:mm A')
    const newEnd = moment(newBlock.endTime, 'h:mm A')

    return existingBlocks.some(block => {
      const existingStart = moment(block.startTime, 'h:mm A')
      const existingEnd = moment(block.endTime, 'h:mm A')

      // Check for exact match
      if (newStart.isSame(existingStart) && newEnd.isSame(existingEnd)) {
        return true
      }

      // Check for overlap
      return (
        (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) ||
        (newStart.isSame(existingStart) || newEnd.isSame(existingEnd))
      )
    })
  }

  const handleTemplateClick = (template: any) => {
    const newBlocks: TimeBlock[] = []
    
    if (template.blocks) {
      // Split shift template
      template.blocks.forEach((block: any, index: number) => {
        newBlocks.push({
          id: `block-${Date.now()}-${index}`,
          startTime: block.start,
          endTime: block.end,
          bookingOption: bookingDefault
        })
      })
    } else {
      // Single block template
      newBlocks.push({
        id: `block-${Date.now()}`,
        startTime: template.start,
        endTime: template.end,
        bookingOption: bookingDefault
      })
    }

    // Apply to all selected days - replace existing blocks
    const updatedSchedule = { ...schedule }
    selectedDays.forEach(day => {
      updatedSchedule[day] = newBlocks.map(block => ({ ...block, id: `${day}-${block.id}` }))
    })
    setSchedule(updatedSchedule)
  }

  const handleDayClick = (day: string) => {
    const newSelected = new Set(selectedDays)
    if (newSelected.has(day)) {
      newSelected.delete(day)
      // Remove schedule for this day
      const updatedSchedule = { ...schedule }
      delete updatedSchedule[day]
      setSchedule(updatedSchedule)
    } else {
      newSelected.add(day)
    }
    setSelectedDays(newSelected)
  }

  const handleBlockDragStart = (day: string, block: TimeBlock) => {
    setDraggedBlock({ day, block })
  }

  const handleBlockDrop = (targetDay: string) => {
    if (!draggedBlock) return

    const updatedSchedule = { ...schedule }
    const existingBlocks = updatedSchedule[targetDay] || []
    
    // Check if this would create a conflict
    if (checkTimeConflict(draggedBlock.block, existingBlocks)) {
      setErrorMessage(`Time conflict with existing shifts on ${targetDay}`)
      setTimeout(() => setErrorMessage(''), 3000)
      setDraggedBlock(null)
      return
    }
    
    // Add the block to the target day (not replace)
    updatedSchedule[targetDay] = [...existingBlocks, {
      ...draggedBlock.block,
      id: `${targetDay}-${Date.now()}`
    }]
    
    setSchedule(updatedSchedule)
    setDraggedBlock(null)
    
    // Auto-select the day if not already selected
    if (!selectedDays.has(targetDay)) {
      setSelectedDays(new Set([...selectedDays, targetDay]))
    }
  }

  const removeTimeBlock = (day: string, blockId: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter(block => block.id !== blockId)
    }))
  }

  const toggleStaff = (staffId: string) => {
    const newSelected = new Set(selectedStaff)
    if (newSelected.has(staffId)) {
      newSelected.delete(staffId)
    } else {
      newSelected.add(staffId)
    }
    setSelectedStaff(newSelected)
  }

  const toggleAllStaff = () => {
    if (selectedStaff.size === practitioners.length) {
      setSelectedStaff(new Set())
    } else {
      setSelectedStaff(new Set(practitioners.map(p => p.id)))
    }
  }

  const calculateTotalShifts = () => {
    const daysWithShifts = Object.keys(schedule).filter(day => schedule[day]?.length > 0)
    const weeks = moment(dateRange.end).diff(moment(dateRange.start), 'weeks') + 1
    return daysWithShifts.length * weeks * selectedStaff.size
  }

  const handleApply = () => {
    // Convert to the format expected by the parent
    const formattedSchedule: any = {}
    DAYS_FULL.forEach((day, index) => {
      formattedSchedule[day] = {
        enabled: selectedDays.has(DAYS_SHORT[index]) && schedule[DAYS_SHORT[index]]?.length > 0,
        timeSlots: (schedule[DAYS_SHORT[index]] || []).map(block => ({
          ...block,
          bookingOption: block.bookingOption || bookingDefault
        }))
      }
    })

    onApply({
      schedule: formattedSchedule,
      startDate: dateRange.start,
      endDate: dateRange.end,
      location,
      selectedStaff: Array.from(selectedStaff)
    })
    
    setShowConfirmation(false)
  }

  const formatTimeForDisplay = (time: string) => {
    return moment(time, 'h:mm A').format('h:mm A')
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = moment().hours(hour).minutes(minute).format('h:mm A')
        options.push(time)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  const handleCustomTimeApply = () => {
    if (selectedDays.size === 0) return

    // Validate time range
    const startMoment = moment(customStartTime, 'h:mm A')
    const endMoment = moment(customEndTime, 'h:mm A')
    
    if (endMoment.isSameOrBefore(startMoment)) {
      setErrorMessage('End time must be after start time')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }
    
    // Check if end time exceeds 10 PM
    const maxEnd = moment('10:00 PM', 'h:mm A')
    if (endMoment.isAfter(maxEnd)) {
      setErrorMessage('End time cannot exceed 10:00 PM')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    const newBlock: TimeBlock = {
      id: `custom-${Date.now()}`,
      startTime: customStartTime,
      endTime: customEndTime,
      bookingOption: bookingDefault
    }

    const updatedSchedule = { ...schedule }
    const hasConflict = Array.from(selectedDays).some(day => {
      const existingBlocks = updatedSchedule[day] || []
      return checkTimeConflict(newBlock, existingBlocks)
    })

    if (hasConflict) {
      setErrorMessage('This time range conflicts with existing shifts')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    selectedDays.forEach(day => {
      const existingBlocks = updatedSchedule[day] || []
      updatedSchedule[day] = [...existingBlocks, {
        ...newBlock,
        id: `${day}-${newBlock.id}`
      }]
    })
    
    setSchedule(updatedSchedule)
    setShowCustomTime(false)
  }

  const addTimeBlockToDay = (day: string) => {
    // Find a default time that doesn't conflict
    const existingBlocks = schedule[day] || []
    let startTime = '9:00 AM'
    let endTime = '5:00 PM'
    
    // If default conflicts, try to find next available slot
    if (existingBlocks.length > 0) {
      // Sort blocks by start time to ensure we get the latest one
      const sortedBlocks = [...existingBlocks].sort((a, b) => {
        const aStart = moment(a.startTime, 'h:mm A')
        const bStart = moment(b.startTime, 'h:mm A')
        return aStart.diff(bStart)
      })
      
      const lastBlock = sortedBlocks[sortedBlocks.length - 1]
      const lastEnd = moment(lastBlock.endTime, 'h:mm A')
      
      // Set new block to start 30 minutes after last block ends
      const newStart = lastEnd.clone().add(30, 'minutes')
      
      // Check if we have at least 1 hour before 10 PM
      if (newStart.hours() >= 21 || (newStart.hours() === 20 && newStart.minutes() > 0)) {
        setErrorMessage('No more time slots available. Maximum end time is 10:00 PM.')
        setTimeout(() => setErrorMessage(''), 3000)
        return
      }
      
      startTime = newStart.format('h:mm A')
      
      // Calculate end time - try for 4 hours but cap at 10 PM
      const proposedEnd = newStart.clone().add(4, 'hours')
      const maxEnd = moment('10:00 PM', 'h:mm A')
      
      if (proposedEnd.isAfter(maxEnd)) {
        endTime = '10:00 PM'
      } else {
        endTime = proposedEnd.format('h:mm A')
      }
    }

    const newBlock: TimeBlock = {
      id: `${day}-${Date.now()}`,
      startTime,
      endTime,
      bookingOption: bookingDefault
    }

    setSchedule(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), newBlock]
    }))
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-[1400px] max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Create Shift Schedule</h2>
                <p className="text-purple-100 mt-1">Set up recurring shifts for your team</p>
              </div>
              <button 
                onClick={onClose} 
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Error Message Toast */}
          {errorMessage && (
            <div className="absolute top-20 right-6 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
              <X className="h-4 w-4" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}

          <div className="flex h-[calc(90vh-180px)]">
            {/* Left Panel - Templates & Settings */}
            <div className="w-80 bg-gray-50 p-6 overflow-y-auto">
              {/* Quick Templates */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Templates
                </h3>
                <div className="space-y-2">
                  {SHIFT_TEMPLATES.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => handleTemplateClick(template)}
                      disabled={selectedDays.size === 0}
                      className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{template.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="text-xs text-gray-500">
                              {template.blocks ? 'Split shift' : `${template.start} - ${template.end}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedDays.size === 0 && (
                  <p className="text-xs text-orange-600 mt-2">Select days first to apply templates</p>
                )}
              </div>

              {/* Custom Time Range */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Custom Time Range
                </h3>
                {!showCustomTime ? (
                  <button
                    onClick={() => setShowCustomTime(true)}
                    disabled={selectedDays.size === 0}
                    className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Plus className="h-4 w-4 mr-3 text-purple-600" />
                        <span className="font-medium text-gray-900">Set Custom Hours</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ) : (
                  <div className="bg-white border border-purple-300 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                        <select
                          value={customStartTime}
                          onChange={(e) => setCustomStartTime(e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        >
                          {timeOptions.map(time => (
                            <option key={`start-${time}`} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                        <select
                          value={customEndTime}
                          onChange={(e) => setCustomEndTime(e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        >
                          {timeOptions.map(time => (
                            <option key={`end-${time}`} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCustomTimeApply}
                        className="flex-1 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => setShowCustomTime(false)}
                        className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Range
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">From</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">To</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </h3>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="The Coast">The Coast</option>
                  <option value="Downtown">Downtown</option>
                  <option value="Westside">Westside</option>
                </select>
              </div>

              {/* Staff Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Staff
                </h3>
                <div ref={staffDropdownRef} className="relative">
                  <button
                    onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {selectedStaff.size === 0 ? (
                        <span className="text-gray-500">Select staff members</span>
                      ) : selectedStaff.size === practitioners.length ? (
                        <span className="text-gray-700">All staff selected ({practitioners.length})</span>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-700">{selectedStaff.size} selected:</span>
                          <div className="flex -space-x-2">
                            {Array.from(selectedStaff).slice(0, 3).map(id => {
                              const practitioner = practitioners.find(p => p.id === id)
                              return practitioner ? (
                                <div
                                  key={id}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-[10px] font-medium border-2 border-white"
                                  title={practitioner.name}
                                >
                                  {practitioner.initials}
                                </div>
                              ) : null
                            })}
                            {selectedStaff.size > 3 && (
                              <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-[10px] font-medium border-2 border-white">
                                +{selectedStaff.size - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showStaffDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showStaffDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-hidden">
                      {/* Search */}
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search staff..."
                            value={staffSearchQuery}
                            onChange={(e) => setStaffSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Select All */}
                      <div className="p-2 border-b border-gray-100">
                        <button
                          onClick={toggleAllStaff}
                          className="w-full flex items-center p-2 hover:bg-gray-50 rounded transition-colors"
                        >
                          <div className={`w-4 h-4 mr-3 border-2 rounded ${
                            selectedStaff.size === practitioners.length 
                              ? 'bg-purple-600 border-purple-600' 
                              : selectedStaff.size > 0 
                                ? 'bg-purple-100 border-purple-600' 
                                : 'border-gray-300'
                          }`}>
                            {selectedStaff.size === practitioners.length && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                            {selectedStaff.size > 0 && selectedStaff.size < practitioners.length && (
                              <div className="w-2 h-0.5 bg-purple-600 mx-auto" />
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {selectedStaff.size === practitioners.length ? 'Deselect All' : 'Select All'}
                          </span>
                        </button>
                      </div>

                      {/* Staff List */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredPractitioners.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No staff found
                          </div>
                        ) : (
                          filteredPractitioners.map(practitioner => (
                            <button
                              key={practitioner.id}
                              onClick={() => toggleStaff(practitioner.id)}
                              className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className={`w-4 h-4 mr-3 border-2 rounded ${
                                selectedStaff.has(practitioner.id) 
                                  ? 'bg-purple-600 border-purple-600' 
                                  : 'border-gray-300'
                              }`}>
                                {selectedStaff.has(practitioner.id) && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <div className="flex items-center flex-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-xs font-medium mr-3">
                                  {practitioner.initials}
                                </div>
                                <div className="text-left">
                                  <div className="text-sm font-medium text-gray-900">{practitioner.name}</div>
                                  <div className="text-xs text-gray-500">{practitioner.title}</div>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Default Booking Option */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Default Booking</h3>
                <div className="space-y-2">
                  <label className="flex items-center p-2 bg-white rounded-lg border border-gray-200 cursor-pointer">
                    <input
                      type="radio"
                      value="bookable"
                      checked={bookingDefault === 'bookable'}
                      onChange={(e) => setBookingDefault(e.target.value as any)}
                      className="mr-2 text-purple-600"
                    />
                    <span className="text-sm">Bookable Online</span>
                  </label>
                  <label className="flex items-center p-2 bg-white rounded-lg border border-gray-200 cursor-pointer">
                    <input
                      type="radio"
                      value="contact-to-book"
                      checked={bookingDefault === 'contact-to-book'}
                      onChange={(e) => setBookingDefault(e.target.value as any)}
                      className="mr-2 text-purple-600"
                    />
                    <span className="text-sm">Contact to Book</span>
                  </label>
                  <label className="flex items-center p-2 bg-white rounded-lg border border-gray-200 cursor-pointer">
                    <input
                      type="radio"
                      value="not-bookable"
                      checked={bookingDefault === 'not-bookable'}
                      onChange={(e) => setBookingDefault(e.target.value as any)}
                      className="mr-2 text-purple-600"
                    />
                    <span className="text-sm">Not Bookable</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Panel - Week View */}
            <div className="flex-1 bg-white p-6 overflow-hidden flex flex-col">
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentWeek(currentWeek.clone().subtract(1, 'week'))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentWeek.format('MMM D')} - {currentWeek.clone().endOf('week').format('MMM D, YYYY')}
                </h3>
                <button
                  onClick={() => setCurrentWeek(currentWeek.clone().add(1, 'week'))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Days Grid */}
              <div className="flex-1 overflow-auto relative">
                {/* Hint overlay when no days selected */}
                {selectedDays.size === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="bg-gray-800/80 text-white px-6 py-4 rounded-lg shadow-xl">
                      <p className="text-lg font-medium">👆 Select days to start creating shifts</p>
                    </div>
                  </div>
                )}
                
                <div className={`grid grid-cols-7 gap-2 min-h-[400px] transition-opacity ${
                  selectedDays.size === 0 ? 'opacity-40' : 'opacity-100'
                }`}>
                  {DAYS_SHORT.map((day, index) => {
                    const isSelected = selectedDays.has(day)
                    const dayBlocks = schedule[day] || []

                    return (
                      <div
                        key={day}
                        className={`border rounded-lg transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-purple-400 bg-purple-50 shadow-sm' 
                            : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/30'
                        }`}
                        onClick={() => handleDayClick(day)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.stopPropagation()
                          handleBlockDrop(day)
                        }}
                      >
                        {/* Day Header */}
                        <div
                          className={`w-full p-3 text-center border-b transition-colors ${
                            isSelected 
                              ? 'bg-purple-100 border-purple-200 text-purple-900' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="font-semibold">{day}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {currentWeek.clone().day(index).format('MMM D')}
                          </div>
                        </div>

                        {/* Time Blocks */}
                        <div className="p-2 space-y-2 min-h-[300px]">
                          {dayBlocks.map(block => (
                            <div
                              key={block.id}
                              draggable
                              onDragStart={() => handleBlockDragStart(day, block)}
                              className="p-2 bg-purple-500 text-white rounded-md text-xs cursor-move hover:bg-purple-600 transition-colors relative group"
                            >
                              <div className="font-medium">
                                {formatTimeForDisplay(block.startTime)} - {formatTimeForDisplay(block.endTime)}
                              </div>
                              <div className="text-purple-100 text-[10px] mt-1">
                                {block.bookingOption === 'bookable' ? 'Bookable' : 
                                 block.bookingOption === 'contact-to-book' ? 'Contact' : 'Not bookable'}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeTimeBlock(day, block.id)
                                }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          
                          {isSelected && (
                            <>
                              {dayBlocks.length === 0 ? (
                                <div className="text-center text-gray-400 text-xs mt-8">
                                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p>Select a template above</p>
                                  <p>or use custom hours</p>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    addTimeBlockToDay(day)
                                  }}
                                  className="w-full p-2 border-2 border-dashed border-purple-300 rounded-md text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center text-xs font-medium"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Time Block
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {calculateTotalShifts() > 0 && (
                <span>
                  Creating <span className="font-semibold">{calculateTotalShifts()} shifts</span> total
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfirmation(true)}
                disabled={calculateTotalShifts() === 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Shifts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Confirm Shift Creation
            </h3>
            <p className="text-gray-600 mb-2">
              You're about to create <span className="font-semibold text-purple-600">{calculateTotalShifts()}</span> shifts for:
            </p>
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• {selectedStaff.size} staff members</li>
              <li>• {Object.keys(schedule).filter(day => schedule[day]?.length > 0).length} days per week</li>
              <li>• {moment(dateRange.end).diff(moment(dateRange.start), 'weeks') + 1} weeks</li>
            </ul>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-orange-800">
                ⚠️ This will replace any existing shifts in the selected date range
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Shifts
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}