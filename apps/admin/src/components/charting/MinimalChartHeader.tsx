'use client'

import React from 'react'
import { Save, Undo, Redo, Zap, Mic } from 'lucide-react'

interface MinimalChartHeaderProps {
  patientName: string
  appointmentTime: string
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  speedMode?: boolean
  onSpeedModeToggle?: () => void
  voiceMode?: boolean
  onVoiceModeToggle?: () => void
  canUndo?: boolean
  canRedo?: boolean
  isSaving?: boolean
}

export function MinimalChartHeader({
  patientName,
  appointmentTime,
  onSave,
  onUndo,
  onRedo,
  speedMode = false,
  onSpeedModeToggle,
  voiceMode = false,
  onVoiceModeToggle,
  canUndo = true,
  canRedo = true,
  isSaving = false
}: MinimalChartHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between h-12">
      {/* Left: Patient Info */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{patientName}</h2>
          <p className="text-xs text-gray-500">{appointmentTime}</p>
        </div>
      </div>

      {/* Right: Compact Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo || isSaving}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
          title="Undo"
          aria-label="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo || isSaving}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors touch-manipulation"
          title="Redo"
          aria-label="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Speed Mode Toggle */}
        <button
          onClick={onSpeedModeToggle}
          className={`p-2 rounded-lg transition-all touch-manipulation ${
            speedMode
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title={speedMode ? 'Speed Mode: ON' : 'Speed Mode: OFF'}
          aria-label="Toggle Speed Mode"
        >
          <Zap className={`w-4 h-4 ${speedMode ? 'fill-current' : ''}`} />
        </button>

        {/* Voice Input Toggle */}
        <button
          onClick={onVoiceModeToggle}
          className={`p-2 rounded-lg transition-all touch-manipulation ${
            voiceMode
              ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          title={voiceMode ? 'Voice Input: ON' : 'Voice Input: OFF'}
          aria-label="Toggle Voice Input"
        >
          <Mic className={`w-4 h-4 ${voiceMode ? 'fill-current' : ''}`} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Save */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 text-sm font-medium touch-manipulation"
          aria-label="Save Chart"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
