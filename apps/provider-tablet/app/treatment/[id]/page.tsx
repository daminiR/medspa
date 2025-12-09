'use client'

import { useState } from 'react'
import { 
  ArrowLeft,
  Camera,
  Save,
  Clock,
  User,
  Syringe,
  MapPin,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Package
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// This would come from the shared components, but for now we'll create a tablet-optimized version
function TabletFaceChart({ onZoneClick, selectedZones }: any) {
  const zones = [
    { id: 'forehead', name: 'Forehead', x: 50, y: 20 },
    { id: 'glabella', name: 'Glabella', x: 50, y: 28 },
    { id: 'crow-left', name: 'L Crow\'s Feet', x: 30, y: 35 },
    { id: 'crow-right', name: 'R Crow\'s Feet', x: 70, y: 35 },
    { id: 'cheek-left', name: 'L Cheek', x: 35, y: 50 },
    { id: 'cheek-right', name: 'R Cheek', x: 65, y: 50 },
    { id: 'lips', name: 'Lips', x: 50, y: 60 },
    { id: 'chin', name: 'Chin', x: 50, y: 70 },
  ]
  
  return (
    <div className="relative bg-gray-50 rounded-xl p-4" style={{ aspectRatio: '3/4' }}>
      {/* Simple face outline */}
      <div className="absolute inset-4 border-2 border-gray-300 rounded-[50%_50%_50%_50%/_60%_60%_40%_40%]" />
      
      {/* Clickable zones */}
      {zones.map(zone => (
        <button
          key={zone.id}
          onClick={() => onZoneClick(zone)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            selectedZones.has(zone.id)
              ? 'bg-purple-600 scale-125 shadow-lg'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}>
            {selectedZones.has(zone.id) && (
              <Check className="w-6 h-6 text-white" />
            )}
          </div>
          <span className="absolute top-full mt-1 text-xs font-medium whitespace-nowrap">
            {zone.name}
          </span>
        </button>
      ))}
    </div>
  )
}

export default function TreatmentDocumentation({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<string>('botox')
  const [selectedZones, setSelectedZones] = useState<Map<string, number>>(new Map())
  const [lotNumber, setLotNumber] = useState('')
  const [totalUnits, setTotalUnits] = useState(0)
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  
  // Mock patient data
  const patient = {
    name: 'Emma Wilson',
    id: 'PT-004',
    service: 'Dysport - Forehead & Crow\'s Feet',
    appointmentTime: '2:00 PM'
  }
  
  const products = [
    { id: 'botox', name: 'Botox', brand: 'Allergan' },
    { id: 'dysport', name: 'Dysport', brand: 'Galderma' },
    { id: 'xeomin', name: 'Xeomin', brand: 'Merz' },
  ]
  
  const handleZoneClick = (zone: any) => {
    const newZones = new Map(selectedZones)
    if (newZones.has(zone.id)) {
      newZones.delete(zone.id)
    } else {
      newZones.set(zone.id, 20) // Default 20 units
    }
    setSelectedZones(newZones)
    
    // Calculate total
    let total = 0
    newZones.forEach(units => total += units)
    setTotalUnits(total)
  }
  
  const adjustUnits = (zoneId: string, delta: number) => {
    const newZones = new Map(selectedZones)
    const current = newZones.get(zoneId) || 0
    const newValue = Math.max(0, current + delta)
    
    if (newValue === 0) {
      newZones.delete(zoneId)
    } else {
      newZones.set(zoneId, newValue)
    }
    
    setSelectedZones(newZones)
    
    // Recalculate total
    let total = 0
    newZones.forEach(units => total += units)
    setTotalUnits(total)
  }
  
  const handleSave = () => {
    // In real app, this would sync to backend
    console.log('Saving treatment:', {
      patient,
      product: selectedProduct,
      zones: Array.from(selectedZones.entries()),
      lotNumber,
      totalUnits,
      notes,
      photos
    })
    
    // Show success and go back
    router.push('/')
  }
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Treatment Documentation</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                {patient.name} • {patient.service}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={selectedZones.size === 0}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save & Complete
          </button>
        </div>
      </header>
      
      {/* Main Content - Two Column Layout for iPad */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
          {/* Left: Face Chart */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Injection Sites</h2>
              <TabletFaceChart 
                onZoneClick={handleZoneClick}
                selectedZones={selectedZones}
              />
              
              {/* Photo Capture */}
              <div className="mt-6 pt-6 border-t">
                <button className="w-full py-4 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 text-gray-700 font-medium">
                  <Camera className="w-5 h-5" />
                  Take Before/After Photos
                </button>
              </div>
            </div>
          </div>
          
          {/* Right: Details */}
          <div className="space-y-6">
            {/* Product Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product</h3>
              <div className="grid grid-cols-3 gap-3">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedProduct === product.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </button>
                ))}
              </div>
              
              {/* Lot Number */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Lot Number</label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  placeholder="Enter lot number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            
            {/* Selected Areas with Units */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Areas</h3>
              
              {selectedZones.size === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Tap on the face chart to select injection areas
                </p>
              ) : (
                <div className="space-y-3">
                  {Array.from(selectedZones.entries()).map(([zoneId, units]) => (
                    <div key={zoneId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900 capitalize">
                        {zoneId.replace('-', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustUnits(zoneId, -5)}
                          className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-100"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="w-20 text-center font-semibold text-lg">
                          {units} units
                        </span>
                        <button
                          onClick={() => adjustUnits(zoneId, 5)}
                          className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-100"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Units</span>
                      <span className="text-2xl font-bold text-purple-600">{totalUnits}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Notes */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the treatment..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}