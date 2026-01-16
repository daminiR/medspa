/**
 * InjectionMap Component - Usage Example
 *
 * This file demonstrates how to use the unified InjectionMap container component
 * in your charting views.
 */

'use client'

import React, { useState } from 'react'
import { InjectionMap } from './InjectionMap'
import type { InjectionPoint as InjectionPoint2D, FreehandPoint } from './InteractiveFaceChart'
import type { InjectionPoint3D } from './FaceChart3D'

export function InjectionMapExample() {
  // State for different injection point types
  const [injectionPoints2D, setInjectionPoints2D] = useState<Map<string, InjectionPoint2D>>(new Map())
  const [freehandPoints, setFreehandPoints] = useState<Map<string, FreehandPoint>>(new Map())
  const [injectionPoints3DFace, setInjectionPoints3DFace] = useState<Map<string, InjectionPoint3D>>(new Map())
  const [injectionPoints3DBody, setInjectionPoints3DBody] = useState<Map<string, InjectionPoint3D>>(new Map())

  // Product selection
  const [productType, setProductType] = useState<'neurotoxin' | 'filler'>('neurotoxin')
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>('product-botox-50u')

  // Patient info (would come from your patient context/state)
  const patient = {
    id: 'PT-001',
    name: 'Sarah Johnson',
    gender: 'female' as const
  }

  // Handlers
  const handleSave = () => {
    console.log('Saving injection map...', {
      injectionPoints2D: Array.from(injectionPoints2D.entries()),
      freehandPoints: Array.from(freehandPoints.entries()),
      injectionPoints3DFace: Array.from(injectionPoints3DFace.entries()),
      injectionPoints3DBody: Array.from(injectionPoints3DBody.entries())
    })

    // In production, you would:
    // 1. Format the data for your backend
    // 2. Send to API endpoint
    // 3. Show success/error toast
  }

  const handleReset = () => {
    console.log('Resetting injection map...')
    // Additional reset logic if needed
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Product Type Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-medium text-gray-700">Treatment Type:</label>
        <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
          <button
            onClick={() => setProductType('neurotoxin')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              productType === 'neurotoxin'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Neurotoxin (Botox)
          </button>
          <button
            onClick={() => setProductType('filler')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              productType === 'filler'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dermal Filler
          </button>
        </div>
      </div>

      {/* Injection Map Component */}
      <InjectionMap
        // Patient info
        patientId={patient.id}
        patientName={patient.name}
        patientGender={patient.gender}

        // Product selection
        productType={productType}
        selectedProductId={selectedProductId}

        // State management for 2D face
        injectionPoints2D={injectionPoints2D}
        onInjectionPoints2DChange={setInjectionPoints2D}
        freehandPoints={freehandPoints}
        onFreehandPointsChange={setFreehandPoints}

        // State management for 3D face
        injectionPoints3DFace={injectionPoints3DFace}
        onInjectionPoints3DFaceChange={setInjectionPoints3DFace}

        // State management for 3D body
        injectionPoints3DBody={injectionPoints3DBody}
        onInjectionPoints3DBodyChange={setInjectionPoints3DBody}

        // Callbacks
        onSave={handleSave}
        onReset={handleReset}

        // Optional: Previous treatment for smart defaults
        // patientLastTreatment={previousTreatmentData}

        // UI state (optional)
        initialViewMode="2d" // or '3d'
        initialBodyPart="face" // or 'torso' or 'full-body'
        readOnly={false}
      />

      {/* Debug Info (remove in production) */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Debug Info</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>2D Points: {injectionPoints2D.size}</div>
          <div>Freehand Points: {freehandPoints.size}</div>
          <div>3D Face Points: {injectionPoints3DFace.size}</div>
          <div>3D Body Points: {injectionPoints3DBody.size}</div>
          <div>Product Type: {productType}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * INTEGRATION NOTES:
 *
 * 1. STATE MANAGEMENT:
 *    - The component requires separate state for 2D, 3D face, and 3D body injection points
 *    - Consider using a custom hook to manage all injection states together
 *    - Example: useInjectionMapState()
 *
 * 2. PRODUCT SELECTION:
 *    - Pass the currently selected product ID from your product selector
 *    - The component will use this for cost calculations in the totals panel
 *
 * 3. PATIENT DATA:
 *    - Get patient info from your patient context or state management
 *    - Gender is used to select the appropriate 2D face diagram
 *
 * 4. SAVING DATA:
 *    - Implement the onSave callback to persist data to your backend
 *    - Format the injection points data according to your API schema
 *    - Consider auto-save functionality for better UX
 *
 * 5. SMART DEFAULTS:
 *    - Pass patientLastTreatment to pre-populate injection points from previous sessions
 *    - This helps maintain consistency across treatments
 *
 * 6. READ-ONLY MODE:
 *    - Set readOnly={true} when viewing historical treatment records
 *    - This prevents accidental modifications to completed treatments
 *
 * 7. VIEW MODE:
 *    - Users can toggle between 2D and 3D modes
 *    - Users can switch between face, torso, and full-body views
 *    - State is maintained across view switches
 *
 * 8. TOTALS PANEL:
 *    - Automatically calculates totals based on injection points
 *    - Shows estimated cost if product pricing is configured
 *    - Can be expanded/collapsed by the user
 */
