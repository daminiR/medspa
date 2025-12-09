'use client'

import { useState } from 'react'
import { X, MapPin, Save } from 'lucide-react'

interface CustomZoneModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (zone: {
    name: string
    type: 'neurotoxin' | 'filler' | 'both'
    typicalUnits: number
    minUnits: number
    maxUnits: number
    coordinates: { x: number; y: number }
  }) => void
  coordinates: { x: number; y: number }
}

export function CustomZoneModal({ 
  isOpen, 
  onClose, 
  onSave, 
  coordinates 
}: CustomZoneModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'neurotoxin' | 'filler' | 'both'>('neurotoxin')
  const [typicalUnits, setTypicalUnits] = useState('')
  const [minUnits, setMinUnits] = useState('')
  const [maxUnits, setMaxUnits] = useState('')

  if (!isOpen) return null

  const handleSave = () => {
    if (!name || !typicalUnits || !minUnits || !maxUnits) {
      alert('Please fill in all fields')
      return
    }

    onSave({
      name,
      type,
      typicalUnits: parseFloat(typicalUnits),
      minUnits: parseFloat(minUnits),
      maxUnits: parseFloat(maxUnits),
      coordinates
    })

    // Reset form
    setName('')
    setTypicalUnits('')
    setMinUnits('')
    setMaxUnits('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add Custom Zone</h3>
              <p className="text-sm text-gray-500">Define a new injection point</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Zone Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Custom Forehead Point"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('neurotoxin')}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                  type === 'neurotoxin'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Neurotoxin
              </button>
              <button
                onClick={() => setType('filler')}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                  type === 'filler'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Filler
              </button>
              <button
                onClick={() => setType('both')}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                  type === 'both'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          {/* Units Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Recommendations ({type === 'filler' ? 'ml' : 'units'})
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                <input
                  type="number"
                  step={type === 'filler' ? '0.1' : '1'}
                  value={minUnits}
                  onChange={(e) => setMinUnits(e.target.value)}
                  placeholder="0"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Typical</label>
                <input
                  type="number"
                  step={type === 'filler' ? '0.1' : '1'}
                  value={typicalUnits}
                  onChange={(e) => setTypicalUnits(e.target.value)}
                  placeholder="0"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                <input
                  type="number"
                  step={type === 'filler' ? '0.1' : '1'}
                  value={maxUnits}
                  onChange={(e) => setMaxUnits(e.target.value)}
                  placeholder="0"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Position Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              Position: {Math.round(coordinates.x)}%, {Math.round(coordinates.y)}% from top-left
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Zone
          </button>
        </div>
      </div>
    </div>
  )
}