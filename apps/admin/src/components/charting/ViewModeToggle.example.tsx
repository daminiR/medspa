'use client'

/**
 * ViewModeToggle - Usage Example
 * 
 * This example shows how to integrate the ViewModeToggle component
 * into a charting page or component.
 */

import React, { useState } from 'react'
import { ViewModeToggle, ViewMode, BodyArea2D, Gender } from './ViewModeToggle'

export function ViewModeToggleExample() {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('2d')
  const [bodyArea2D, setBodyArea2D] = useState<BodyArea2D>('face')
  const [gender, setGender] = useState<Gender>('female')

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ViewModeToggle Component
          </h2>
          <p className="text-sm text-gray-600">
            Clean toggle between 2D and 3D charting modes with conditional sub-options
          </p>
        </div>

        {/* The ViewModeToggle Component */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            bodyArea2D={bodyArea2D}
            onBodyArea2DChange={setBodyArea2D}
            gender={gender}
            onGenderChange={setGender}
          />
        </div>

        {/* Current State Display */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current State:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">View Mode:</span>
              <span className="font-medium text-gray-900">{viewMode}</span>
            </div>
            {viewMode === '2d' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Body Area:</span>
                <span className="font-medium text-purple-700">{bodyArea2D}</span>
              </div>
            )}
            {viewMode === '3d' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium text-blue-700">{gender}</span>
              </div>
            )}
          </div>
        </div>

        {/* Compact Mode Example */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Compact Mode:</h3>
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            bodyArea2D={bodyArea2D}
            onBodyArea2DChange={setBodyArea2D}
            gender={gender}
            onGenderChange={setGender}
            compact
          />
        </div>

        {/* Integration Example Code */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <pre className="text-xs text-gray-300 overflow-x-auto">
{`// Basic usage:
import { ViewModeToggle } from '@/components/charting'

const [viewMode, setViewMode] = useState<ViewMode>('2d')
const [bodyArea2D, setBodyArea2D] = useState<BodyArea2D>('face')
const [gender, setGender] = useState<Gender>('female')

<ViewModeToggle
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  bodyArea2D={bodyArea2D}
  onBodyArea2DChange={setBodyArea2D}
  gender={gender}
  onGenderChange={setGender}
/>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default ViewModeToggleExample
