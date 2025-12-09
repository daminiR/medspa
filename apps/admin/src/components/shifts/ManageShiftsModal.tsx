import React, { useState } from 'react'
import { X, Plus, Copy, Phone, Home, Edit, Computer, HelpCircle } from 'lucide-react'
import moment from 'moment'
import { practitioners } from '@/lib/data'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  bookingOption: 'not-bookable' | 'contact-to-book' | 'bookable'
}

interface DaySchedule {
  enabled: boolean
  timeSlots: TimeSlot[]
}

interface ManageShiftsModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (data: any) => void
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const DEFAULT_TIME_SLOT: TimeSlot = {
  id: '',
  startTime: '8:00 AM',
  endTime: '12:00 PM',
  bookingOption: 'not-bookable'
}

export default function ManageShiftsModal({
  isOpen,
  onClose,
  onApply
}: ManageShiftsModalProps) {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const initial: Record<string, DaySchedule> = {}
    DAYS_OF_WEEK.forEach(day => {
      initial[day] = {
        enabled: day !== 'Sunday' && day !== 'Saturday', // Weekdays enabled by default
        timeSlots: day !== 'Sunday' && day !== 'Saturday' ? [
          { ...DEFAULT_TIME_SLOT, id: `${day}-1` },
          { id: `${day}-2`, startTime: '1:00 PM', endTime: '4:00 PM', bookingOption: 'not-bookable' }
        ] : []
      }
    })
    return initial
  })

  const [startDate, setStartDate] = useState('2021-06-13')
  const [endDate, setEndDate] = useState('2021-12-31')
  const [location, setLocation] = useState('The Coast')
  const [selectedStaff, setSelectedStaff] = useState<string[]>(['dr-marcus', 'maya-lopez'])
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [copyFromDay, setCopyFromDay] = useState('')
  const [copyToDays, setCopyToDays] = useState<string[]>([])
  const [showBookingOptions, setShowBookingOptions] = useState<{ day: string, slotId: string } | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingNotes, setBookingNotes] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  const handleDayToggle = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        timeSlots: !prev[day].enabled && prev[day].timeSlots.length === 0 
          ? [{ ...DEFAULT_TIME_SLOT, id: `${day}-${Date.now()}` }]
          : prev[day].timeSlots
      }
    }))
  }

  const handleAddTimeSlot = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, {
          ...DEFAULT_TIME_SLOT,
          id: `${day}-${Date.now()}`
        }]
      }
    }))
  }

  const handleRemoveTimeSlot = (day: string, slotId: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter(slot => slot.id !== slotId)
      }
    }))
  }

  const handleTimeChange = (day: string, slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map(slot =>
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
    }))
  }

  const handleCopyTimes = () => {
    if (!copyFromDay || copyToDays.length === 0) return

    const sourceSlots = schedule[copyFromDay].timeSlots
    setSchedule(prev => {
      const updated = { ...prev }
      copyToDays.forEach(day => {
        updated[day] = {
          enabled: true,
          timeSlots: sourceSlots.map(slot => ({
            ...slot,
            id: `${day}-${Date.now()}-${Math.random()}`
          }))
        }
      })
      return updated
    })

    setShowCopyModal(false)
    setCopyFromDay('')
    setCopyToDays([])
  }

  const calculateTotalShifts = () => {
    const enabledDays = Object.entries(schedule).filter(([_, data]) => data.enabled)
    const totalSlots = enabledDays.reduce((sum, [_, data]) => sum + data.timeSlots.length, 0)
    
    // Calculate weeks between dates
    const start = moment(startDate)
    const end = moment(endDate)
    const weeks = end.diff(start, 'weeks') + 1
    
    return totalSlots * weeks * selectedStaff.length
  }

  const handleApply = () => {
    const shiftsData = {
      schedule,
      startDate,
      endDate,
      location,
      selectedStaff,
      bookingNotes
    }
    onApply(shiftsData)
    setShowConfirmation(false)
    onClose()
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = moment().hours(hour).minutes(minute)
        options.push(time.format('h:mm A'))
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  if (!isOpen) return null

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-[1200px] max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Manage Shifts</h2>
              <button 
                className="ml-2 text-gray-400 hover:text-gray-600 relative"
                onClick={() => setShowHelp(!showHelp)}
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Help Tooltip */}
          {showHelp && (
            <div className="absolute top-20 left-6 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-96 z-10">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">How to use Manage Shifts</h3>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>Select days:</strong> Check the days you want to create shifts for</p>
                <p>• <strong>Add time slots:</strong> Click "Add Times" to add multiple shift periods per day</p>
                <p>• <strong>Copy times:</strong> Use the copy icon to duplicate time slots to other days</p>
                <p>• <strong>Booking options:</strong> Click the computer icon to set how shifts can be booked</p>
                <p>• <strong>Date range:</strong> Set the start and end dates for creating recurring shifts</p>
                <p>• <strong>Select staff:</strong> Choose which practitioners will have these shifts</p>
                <p className="text-orange-600 mt-3">⚠️ Note: This will override any existing shifts in the selected date range</p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex">
            {/* Left side - Schedule */}
            <div className="flex-1 p-6 border-r overflow-y-auto max-h-[calc(90vh-200px)]">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="mb-6">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={schedule[day].enabled}
                      onChange={() => handleDayToggle(day)}
                      className="mr-3 h-5 w-5 text-teal-600 rounded"
                    />
                    <h3 className="text-lg font-medium text-gray-700">{day}s</h3>
                  </div>

                  {schedule[day].enabled && (
                    <>
                      {schedule[day].timeSlots.map((slot, index) => (
                        <div key={slot.id} className="flex items-center mb-3 ml-8">
                          <select
                            value={slot.startTime}
                            onChange={(e) => handleTimeChange(day, slot.id, 'startTime', e.target.value)}
                            className="w-32 p-2 border rounded"
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span className="mx-3 text-gray-500">to</span>
                          <select
                            value={slot.endTime}
                            onChange={(e) => handleTimeChange(day, slot.id, 'endTime', e.target.value)}
                            className="w-32 p-2 border rounded"
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>

                          {/* Action buttons */}
                          <div className="ml-4 flex items-center space-x-2">
                            <button
                              onClick={() => setShowBookingOptions({ day, slotId: slot.id })}
                              className={`p-2 rounded ${
                                slot.bookingOption === 'bookable' ? 'bg-teal-100' : 'bg-gray-100'
                              }`}
                              title={slot.bookingOption === 'bookable' ? 'Bookable Online' : 
                                     slot.bookingOption === 'contact-to-book' ? 'Contact to Book' : 
                                     'Not Bookable Online'}
                            >
                              <Computer className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-gray-100 rounded">
                              <Phone className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-gray-100 rounded">
                              <Home className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-gray-100 rounded">
                              <Edit className="h-4 w-4" />
                            </button>
                            {schedule[day].timeSlots.length > 1 && (
                              <button
                                onClick={() => handleRemoveTimeSlot(day, slot.id)}
                                className="p-2 hover:bg-red-100 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Copy button for first slot */}
                          {index === 0 && (
                            <button
                              onClick={() => {
                                setCopyFromDay(day)
                                setShowCopyModal(true)
                              }}
                              className="ml-auto text-gray-400 hover:text-gray-600"
                              title="Copy times to other days"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => handleAddTimeSlot(day)}
                        className="ml-8 text-teal-600 hover:text-teal-700 text-sm font-medium"
                      >
                        Add Times
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Right side - Configuration */}
            <div className="w-96 p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Apply this shift schedule to the following dates:
                  </h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-1 p-2 border rounded"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    At the following location:
                  </h3>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="The Coast">The Coast</option>
                    <option value="Downtown">Downtown</option>
                    <option value="Westside">Westside</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    For the following staff:
                  </h3>
                  <div className="space-y-2">
                    {practitioners.map(practitioner => (
                      <label key={practitioner.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedStaff.includes(practitioner.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStaff([...selectedStaff, practitioner.id])
                            } else {
                              setSelectedStaff(selectedStaff.filter(id => id !== practitioner.id))
                            }
                          }}
                          className="mr-3 h-4 w-4 text-teal-600 rounded"
                        />
                        <span className="text-sm">{practitioner.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowConfirmation(true)}
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Apply Shift Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Copy Times Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Copy Times To...</h3>
            <div className="space-y-2 mb-6">
              {DAYS_OF_WEEK.filter(d => d !== copyFromDay).map(day => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={copyToDays.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCopyToDays([...copyToDays, day])
                      } else {
                        setCopyToDays(copyToDays.filter(d => d !== day))
                      }
                    }}
                    className="mr-3 h-4 w-4 text-teal-600 rounded"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCopyModal(false)
                  setCopyFromDay('')
                  setCopyToDays([])
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyTimes}
                disabled={copyToDays.length === 0}
                className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
              >
                Copy Times
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Options Dropdown */}
      {showBookingOptions && (
        <div 
          className="fixed inset-0 z-[60]" 
          onClick={() => setShowBookingOptions(null)}
        >
          <div 
            className="absolute bg-white border rounded-lg shadow-lg p-4 w-80"
            style={{
              left: '400px',
              top: '200px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-medium mb-3">Booking Options</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="booking"
                  checked={schedule[showBookingOptions.day].timeSlots.find(s => s.id === showBookingOptions.slotId)?.bookingOption === 'not-bookable'}
                  onChange={() => {
                    setSchedule(prev => ({
                      ...prev,
                      [showBookingOptions.day]: {
                        ...prev[showBookingOptions.day],
                        timeSlots: prev[showBookingOptions.day].timeSlots.map(slot =>
                          slot.id === showBookingOptions.slotId
                            ? { ...slot, bookingOption: 'not-bookable' }
                            : slot
                        )
                      }
                    }))
                  }}
                  className="mr-2 text-teal-600"
                />
                <span>Not Bookable Online</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="booking"
                  checked={schedule[showBookingOptions.day].timeSlots.find(s => s.id === showBookingOptions.slotId)?.bookingOption === 'contact-to-book'}
                  onChange={() => {
                    setSchedule(prev => ({
                      ...prev,
                      [showBookingOptions.day]: {
                        ...prev[showBookingOptions.day],
                        timeSlots: prev[showBookingOptions.day].timeSlots.map(slot =>
                          slot.id === showBookingOptions.slotId
                            ? { ...slot, bookingOption: 'contact-to-book' }
                            : slot
                        )
                      }
                    }))
                  }}
                  className="mr-2"
                />
                <span>Contact us to Book Online</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="booking"
                  checked={schedule[showBookingOptions.day].timeSlots.find(s => s.id === showBookingOptions.slotId)?.bookingOption === 'bookable'}
                  onChange={() => {
                    setSchedule(prev => ({
                      ...prev,
                      [showBookingOptions.day]: {
                        ...prev[showBookingOptions.day],
                        timeSlots: prev[showBookingOptions.day].timeSlots.map(slot =>
                          slot.id === showBookingOptions.slotId
                            ? { ...slot, bookingOption: 'bookable' }
                            : slot
                        )
                      }
                    }))
                  }}
                  className="mr-2"
                />
                <span>Bookable Online</span>
              </label>
            </div>
            <div className="mt-4">
              <textarea
                placeholder="Add notes..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="w-full p-2 border rounded text-sm h-20 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Are you sure you want to create multiple shifts?
            </h3>
            <p className="text-gray-600 mb-4">
              This will create <span className="font-semibold">{calculateTotalShifts()}</span> shifts 
              for each of the selected staff at {location}.
            </p>
            <p className="text-gray-600 mb-6">
              Please note: If you already have shifts created, continuing 
              <span className="font-semibold"> will override</span> those shifts.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}