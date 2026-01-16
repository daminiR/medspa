'use client'

import { useState, useRef, useEffect } from 'react'
import { CalendarPlus, ChevronDown, ExternalLink, Download } from 'lucide-react'
import { Appointment, Practitioner, Location } from '@/lib/data'
import {
  generateICS,
  generateGoogleCalendarLink,
  generateOutlookCalendarLink,
  ICSAppointmentData
} from '@/lib/ics-generator'

interface AddToCalendarButtonProps {
  appointment: Appointment
  practitioner: Practitioner
  location?: Location
  /** Optional: Custom clinic name */
  clinicName?: string
  /** Optional: Custom clinic phone */
  clinicPhone?: string
  /** Optional: Custom clinic email */
  clinicEmail?: string
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show the dropdown arrow */
  showArrow?: boolean
  /** Optional className override */
  className?: string
}

/**
 * AddToCalendarButton Component
 *
 * A dropdown button that allows users to add an appointment to their calendar.
 * Supports multiple calendar services:
 * 1. Google Calendar - Opens Google Calendar with pre-filled event
 * 2. Outlook/Office 365 - Opens Outlook web calendar
 * 3. Apple Calendar - Downloads .ics file (native macOS/iOS support)
 * 4. Download .ics - Universal download for any calendar app
 *
 * Usage:
 * ```tsx
 * <AddToCalendarButton
 *   appointment={appointment}
 *   practitioner={practitioner}
 *   location={location}
 * />
 * ```
 */
export default function AddToCalendarButton({
  appointment,
  practitioner,
  location,
  clinicName,
  clinicPhone,
  clinicEmail,
  variant = 'secondary',
  size = 'md',
  showArrow = true,
  className = ''
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prepare ICS data
  const icsData: ICSAppointmentData = {
    appointment,
    practitioner,
    location,
    clinicName,
    clinicPhone,
    clinicEmail
  }

  // Generate calendar links
  const googleLink = generateGoogleCalendarLink(icsData)
  const outlookLink = generateOutlookCalendarLink(icsData)

  /**
   * Downloads the .ics file for the appointment
   * Uses client-side blob generation for immediate download
   */
  const handleDownloadICS = () => {
    try {
      // Generate ICS content
      const icsContent = generateICS(icsData)

      // Create blob and download link
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)

      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `appointment-${appointment.id}.ics`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setIsOpen(false)
    } catch (error) {
      console.error('Failed to download ICS file:', error)
      // Fallback to API endpoint
      window.open(`/api/appointment/export?appointmentId=${appointment.id}`, '_blank')
    }
  }

  /**
   * Opens Google Calendar in a new window
   */
  const handleGoogleCalendar = () => {
    window.open(googleLink, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  /**
   * Opens Outlook Calendar in a new window
   */
  const handleOutlookCalendar = () => {
    window.open(outlookLink, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  /**
   * Opens Apple Calendar via .ics download
   * Apple Calendar natively handles .ics files
   */
  const handleAppleCalendar = () => {
    handleDownloadICS()
  }

  // Button styling based on variant and size
  const baseButtonStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantStyles = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  }

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const buttonStyles = `${baseButtonStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  // Calendar options
  const calendarOptions = [
    {
      id: 'google',
      label: 'Google Calendar',
      icon: (
        <svg className={`${iconSizes[size]} mr-2`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15.75h-3v-9h3v9zm4.5 0h-3v-6h3v6zm4.5 0h-3v-3h3v3z"/>
        </svg>
      ),
      onClick: handleGoogleCalendar,
      external: true
    },
    {
      id: 'outlook',
      label: 'Outlook / Office 365',
      icon: (
        <svg className={`${iconSizes[size]} mr-2`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      onClick: handleOutlookCalendar,
      external: true
    },
    {
      id: 'apple',
      label: 'Apple Calendar',
      icon: (
        <svg className={`${iconSizes[size]} mr-2`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83z"/>
        </svg>
      ),
      onClick: handleAppleCalendar,
      external: false
    },
    {
      id: 'ics',
      label: 'Download .ics File',
      icon: <Download className={`${iconSizes[size]} mr-2`} />,
      onClick: handleDownloadICS,
      external: false
    }
  ]

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Main Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonStyles}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <CalendarPlus className={`${iconSizes[size]} mr-2`} />
        <span>Add to Calendar</span>
        {showArrow && (
          <ChevronDown
            className={`${iconSizes[size]} ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {calendarOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.onClick}
                className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                role="menuitem"
              >
                {option.icon}
                <span className="flex-1 text-left">{option.label}</span>
                {option.external && (
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>
            ))}
          </div>

          {/* Helper text */}
          <div className="border-t border-gray-100 px-4 py-2">
            <p className="text-xs text-gray-500">
              Tip: Apple Calendar users can also use the .ics file
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
