/**
 * SnoozeModal Component
 *
 * Modal for snoozing a conversation until a later time.
 * Provides preset options and custom date/time selection.
 */

'use client'

import React, { useState } from 'react'
import { X, Clock } from 'lucide-react'
import { addHours, addDays, addWeeks, startOfDay, setHours } from 'date-fns'

interface SnoozeModalProps {
  isOpen: boolean
  onClose: () => void
  onSnooze: (until: Date) => void
}

const SNOOZE_PRESETS = [
  { label: 'Later today (6 hours)', getValue: () => addHours(new Date(), 6) },
  { label: 'Tomorrow morning (9 AM)', getValue: () => setHours(addDays(startOfDay(new Date()), 1), 9) },
  { label: 'Tomorrow afternoon (2 PM)', getValue: () => setHours(addDays(startOfDay(new Date()), 1), 14) },
  { label: 'This weekend (Saturday 9 AM)', getValue: () => {
    const now = new Date()
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7
    return setHours(addDays(startOfDay(now), daysUntilSaturday), 9)
  }},
  { label: 'Next week (Monday 9 AM)', getValue: () => {
    const now = new Date()
    const daysUntilNextMonday = ((8 - now.getDay()) % 7) || 7
    return setHours(addDays(startOfDay(now), daysUntilNextMonday), 9)
  }},
]

export default function SnoozeModal({ isOpen, onClose, onSnooze }: SnoozeModalProps) {
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('09:00')

  if (!isOpen) return null

  const handlePresetSnooze = (preset: typeof SNOOZE_PRESETS[0]) => {
    onSnooze(preset.getValue())
    onClose()
  }

  const handleCustomSnooze = () => {
    if (!customDate) return

    const [hours, minutes] = customTime.split(':').map(Number)
    const date = new Date(customDate)
    date.setHours(hours, minutes, 0, 0)

    onSnooze(date)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Snooze Conversation</h3>
              <p className="text-sm text-gray-500">Hide until a later time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Preset Options */}
          <div className="space-y-2 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick options</p>
            {SNOOZE_PRESETS.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetSnooze(preset)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 border border-gray-200 rounded-lg text-left text-sm font-medium text-gray-900 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date/Time */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Custom date and time</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <button
              onClick={handleCustomSnooze}
              disabled={!customDate}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Snooze until {customDate || 'selected date'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-600">
            Snoozed conversations will reappear in your inbox at the scheduled time.
          </p>
        </div>
      </div>
    </div>
  )
}
