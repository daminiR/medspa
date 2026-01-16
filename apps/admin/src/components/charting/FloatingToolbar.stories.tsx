/**
 * FloatingToolbar Visual Examples
 *
 * This file demonstrates different configurations of the FloatingToolbar component.
 * Use this as a visual reference guide for implementation.
 */

'use client'

import React, { useState } from 'react'
import { FloatingToolbar } from './FloatingToolbar'

// ============================================================================
// MOCK DATA
// ============================================================================

const neurotoxinProducts = [
  { id: 'botox', name: 'Cosmetic', brand: 'Botox', type: 'neurotoxin' as const },
  { id: 'dysport', name: 'Dysport', brand: 'Dysport', type: 'neurotoxin' as const },
  { id: 'xeomin', name: 'Xeomin', brand: 'Xeomin', type: 'neurotoxin' as const },
  { id: 'jeuveau', name: 'Jeuveau', brand: 'Jeuveau', type: 'neurotoxin' as const }
]

const fillerProducts = [
  { id: 'juv-ultra', name: 'Ultra Plus', brand: 'Juvederm', type: 'filler' as const },
  { id: 'juv-voluma', name: 'Voluma XC', brand: 'Juvederm', type: 'filler' as const },
  { id: 'rest-lyft', name: 'Lyft', brand: 'Restylane', type: 'filler' as const },
  { id: 'rest-defyne', name: 'Defyne', brand: 'Restylane', type: 'filler' as const },
  { id: 'radiesse', name: 'Radiesse', brand: 'Radiesse', type: 'biostimulator' as const },
  { id: 'sculptra', name: 'Sculptra', brand: 'Sculptra', type: 'biostimulator' as const }
]

const unitDosages = [1, 2, 4, 5, 10, 15, 20, 25]
const mlDosages = [0.1, 0.2, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0]

const standardColors = [
  '#9333EA', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#84CC16'  // Lime
]

const minimalColors = ['#9333EA', '#EC4899', '#EF4444', '#10B981', '#3B82F6', '#F59E0B']

// ============================================================================
// STORY COMPONENTS
// ============================================================================

export function Story1_NeurotoxinToolbar() {
  const [selectedProduct, setSelectedProduct] = useState<string>('botox')
  const [selectedDosage, setSelectedDosage] = useState<number>(10)
  const [selectedColor, setSelectedColor] = useState('#9333EA')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Story 1: Neurotoxin Configuration
        </h1>
        <p className="text-gray-600 mb-8">
          Standard setup for Botox/Dysport/Xeomin treatments with unit-based dosages.
        </p>

        <div className="bg-white rounded-lg shadow p-8 h-96 relative">
          <p className="text-center text-gray-500">Charting Canvas Area</p>

          <FloatingToolbar
            products={neurotoxinProducts}
            selectedProductId={selectedProduct}
            onProductSelect={setSelectedProduct}
            dosageType="units"
            dosageOptions={unitDosages}
            selectedDosage={selectedDosage}
            onDosageSelect={setSelectedDosage}
            colorOptions={standardColors}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
            autoHideDelay={5000}
            initialPosition={{ x: 20, y: 100 }}
          />
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Current Selection:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Product: {neurotoxinProducts.find(p => p.id === selectedProduct)?.brand}</li>
            <li>Dosage: {selectedDosage} units</li>
            <li>Color: {selectedColor}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export function Story2_FillerToolbar() {
  const [selectedProduct, setSelectedProduct] = useState<string>('juv-ultra')
  const [selectedDosage, setSelectedDosage] = useState<number>(0.5)
  const [selectedColor, setSelectedColor] = useState('#EC4899')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Story 2: Filler Configuration
        </h1>
        <p className="text-gray-600 mb-8">
          Setup for dermal fillers with ml-based volume measurements.
        </p>

        <div className="bg-white rounded-lg shadow p-8 h-96 relative">
          <p className="text-center text-gray-500">Charting Canvas Area</p>

          <FloatingToolbar
            products={fillerProducts}
            selectedProductId={selectedProduct}
            onProductSelect={setSelectedProduct}
            dosageType="ml"
            dosageOptions={mlDosages}
            selectedDosage={selectedDosage}
            onDosageSelect={setSelectedDosage}
            colorOptions={standardColors}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
            autoHideDelay={5000}
            initialPosition={{ x: 20, y: 100 }}
          />
        </div>

        <div className="mt-4 p-4 bg-pink-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Current Selection:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              Product: {fillerProducts.find(p => p.id === selectedProduct)?.brand}{' '}
              {fillerProducts.find(p => p.id === selectedProduct)?.name}
            </li>
            <li>Volume: {selectedDosage} ml</li>
            <li>Color: {selectedColor}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export function Story3_MinimalToolbar() {
  const [selectedProduct, setSelectedProduct] = useState<string>()
  const [selectedDosage, setSelectedDosage] = useState<number>()
  const [selectedColor, setSelectedColor] = useState('#9333EA')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Story 3: Minimal Configuration
        </h1>
        <p className="text-gray-600 mb-8">
          Simplified toolbar with fewer products and colors for quick charting.
        </p>

        <div className="bg-white rounded-lg shadow p-8 h-96 relative">
          <p className="text-center text-gray-500">Charting Canvas Area</p>

          <FloatingToolbar
            products={neurotoxinProducts.slice(0, 2)} // Only Botox and Dysport
            selectedProductId={selectedProduct}
            onProductSelect={setSelectedProduct}
            dosageType="units"
            dosageOptions={[5, 10, 15, 20]} // Simplified dosages
            selectedDosage={selectedDosage}
            onDosageSelect={setSelectedDosage}
            colorOptions={minimalColors} // Only 6 colors
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
            autoHideDelay={3000}
            initialPosition={{ x: 20, y: 100 }}
          />
        </div>
      </div>
    </div>
  )
}

export function Story4_CustomPosition() {
  const [selectedProduct, setSelectedProduct] = useState<string>()
  const [selectedDosage, setSelectedDosage] = useState<number>()
  const [selectedColor, setSelectedColor] = useState('#9333EA')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Story 4: Custom Positioning
        </h1>
        <p className="text-gray-600 mb-8">
          Toolbar positioned in bottom-right corner. Drag it around to test movement!
        </p>

        <div className="bg-white rounded-lg shadow p-8 h-96 relative">
          <p className="text-center text-gray-500">Charting Canvas Area</p>

          <FloatingToolbar
            products={neurotoxinProducts}
            selectedProductId={selectedProduct}
            onProductSelect={setSelectedProduct}
            dosageType="units"
            dosageOptions={unitDosages}
            selectedDosage={selectedDosage}
            onDosageSelect={setSelectedDosage}
            colorOptions={standardColors}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
            autoHideDelay={4000}
            initialPosition={{ x: 600, y: 300 }} // Bottom right
          />
        </div>
      </div>
    </div>
  )
}

export function Story5_WithCloseButton() {
  const [showToolbar, setShowToolbar] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string>()
  const [selectedDosage, setSelectedDosage] = useState<number>()
  const [selectedColor, setSelectedColor] = useState('#9333EA')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Story 5: Closeable Toolbar
        </h1>
        <p className="text-gray-600 mb-8">
          Toolbar with close button. Click the X to hide, then toggle button to show again.
        </p>

        <button
          onClick={() => setShowToolbar(!showToolbar)}
          className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {showToolbar ? 'Hide' : 'Show'} Toolbar
        </button>

        <div className="bg-white rounded-lg shadow p-8 h-96 relative">
          <p className="text-center text-gray-500">Charting Canvas Area</p>

          {showToolbar && (
            <FloatingToolbar
              products={neurotoxinProducts}
              selectedProductId={selectedProduct}
              onProductSelect={setSelectedProduct}
              dosageType="units"
              dosageOptions={unitDosages}
              selectedDosage={selectedDosage}
              onDosageSelect={setSelectedDosage}
              colorOptions={standardColors}
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
              autoHideDelay={5000}
              initialPosition={{ x: 20, y: 100 }}
              onClose={() => setShowToolbar(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function Story6_QuickAutoHide() {
  const [selectedProduct, setSelectedProduct] = useState<string>()
  const [selectedDosage, setSelectedDosage] = useState<number>()
  const [selectedColor, setSelectedColor] = useState('#9333EA')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Story 6: Quick Auto-Hide (1 second)
        </h1>
        <p className="text-gray-600 mb-8">
          Toolbar auto-hides after just 1 second. Hover to see it reappear!
        </p>

        <div className="bg-white rounded-lg shadow p-8 h-96 relative">
          <p className="text-center text-gray-500">Charting Canvas Area</p>

          <FloatingToolbar
            products={neurotoxinProducts}
            selectedProductId={selectedProduct}
            onProductSelect={setSelectedProduct}
            dosageType="units"
            dosageOptions={unitDosages}
            selectedDosage={selectedDosage}
            onDosageSelect={setSelectedDosage}
            colorOptions={standardColors}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
            autoHideDelay={1000} // Quick hide
            initialPosition={{ x: 20, y: 100 }}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STORY INDEX
// ============================================================================

export default function FloatingToolbarStories() {
  const [currentStory, setCurrentStory] = useState(1)

  const stories = [
    { id: 1, name: 'Neurotoxin Configuration', component: Story1_NeurotoxinToolbar },
    { id: 2, name: 'Filler Configuration', component: Story2_FillerToolbar },
    { id: 3, name: 'Minimal Setup', component: Story3_MinimalToolbar },
    { id: 4, name: 'Custom Position', component: Story4_CustomPosition },
    { id: 5, name: 'With Close Button', component: Story5_WithCloseButton },
    { id: 6, name: 'Quick Auto-Hide', component: Story6_QuickAutoHide }
  ]

  const CurrentStoryComponent = stories.find(s => s.id === currentStory)?.component

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Story Navigator */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white text-xl font-bold mb-4">
            FloatingToolbar Visual Stories
          </h1>
          <div className="flex gap-2 flex-wrap">
            {stories.map(story => (
              <button
                key={story.id}
                onClick={() => setCurrentStory(story.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentStory === story.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {story.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-white">
        {CurrentStoryComponent && <CurrentStoryComponent />}
      </div>
    </div>
  )
}
