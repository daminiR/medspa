'use client'

import { useState } from 'react'
import { useInvoice } from '@/contexts/InvoiceContext'
import toast from 'react-hot-toast'
import {
  X,
  Syringe,
  Package,
  Calculator,
  MapPin,
  Calendar,
  AlertCircle,
  Save,
  Plus,
  Minus,
  ChevronDown,
  Camera,
  Clock,
  DollarSign,
  Sparkles,
  Target,
  Activity,
  Eye,
  Users,
  Info,
  User,
  HelpCircle,
  Upload,
  Image,
  Trash2,
  Check
} from 'lucide-react'
import { DocumentationFaceChart } from './DocumentationFaceChart'
import { INJECTION_ZONES } from './EnhancedFaceChart'

interface InjectableProduct {
  id: string
  name: string
  type: 'neurotoxin' | 'filler'
  brand: string
  unitPrice: number
  concentration?: string
  volumePerSyringe?: number
  expiresIn?: number // days
  color: string
  icon?: string
}

interface TreatmentPhoto {
  id: string
  type: 'before' | 'after'
  angle: 'front' | 'left' | 'right' | '45-left' | '45-right'
  url: string
  timestamp: Date
  notes?: string
}

// Using InjectionZone from AnatomicalFaceChart instead

const NEUROTOXIN_PRODUCTS: InjectableProduct[] = [
  {
    id: 'botox',
    name: 'Botox® Cosmetic',
    type: 'neurotoxin',
    brand: 'Allergan',
    unitPrice: 14,
    concentration: '100U/vial',
    expiresIn: 30,
    color: 'purple'
  },
  {
    id: 'dysport',
    name: 'Dysport®',
    type: 'neurotoxin',
    brand: 'Galderma',
    unitPrice: 4.5,
    concentration: '300U/vial',
    expiresIn: 30,
    color: 'blue'
  },
  {
    id: 'xeomin',
    name: 'Xeomin®',
    type: 'neurotoxin',
    brand: 'Merz',
    unitPrice: 12,
    concentration: '100U/vial',
    expiresIn: 36,
    color: 'green'
  },
  {
    id: 'daxxify',
    name: 'Daxxify™',
    type: 'neurotoxin',
    brand: 'Revance',
    unitPrice: 16,
    concentration: '100U/vial',
    expiresIn: 30,
    color: 'indigo'
  }
]

const FILLER_PRODUCTS: InjectableProduct[] = [
  {
    id: 'juvederm-ultra',
    name: 'Juvéderm® Ultra XC',
    type: 'filler',
    brand: 'Allergan',
    unitPrice: 650,
    volumePerSyringe: 1,
    expiresIn: 730,
    color: 'pink'
  },
  {
    id: 'juvederm-voluma',
    name: 'Juvéderm® Voluma XC',
    type: 'filler',
    brand: 'Allergan',
    unitPrice: 850,
    volumePerSyringe: 1,
    expiresIn: 730,
    color: 'purple'
  },
  {
    id: 'restylane-l',
    name: 'Restylane®-L',
    type: 'filler',
    brand: 'Galderma',
    unitPrice: 600,
    volumePerSyringe: 1,
    expiresIn: 730,
    color: 'blue'
  },
  {
    id: 'restylane-lyft',
    name: 'Restylane® Lyft',
    type: 'filler',
    brand: 'Galderma',
    unitPrice: 750,
    volumePerSyringe: 1,
    expiresIn: 730,
    color: 'teal'
  },
  {
    id: 'sculptra',
    name: 'Sculptra® Aesthetic',
    type: 'filler',
    brand: 'Galderma',
    unitPrice: 950,
    volumePerSyringe: 1,
    expiresIn: 730,
    color: 'orange'
  },
  {
    id: 'radiesse',
    name: 'Radiesse®',
    type: 'filler',
    brand: 'Merz',
    unitPrice: 700,
    volumePerSyringe: 1.5,
    expiresIn: 730,
    color: 'gray'
  }
]

// Use INJECTION_ZONES from AnatomicalFaceChart

interface InjectableBillingProps {
  onClose: () => void
  patientId?: string
  patientName?: string
}

// Simple Tooltip component
const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
  const [show, setShow] = useState(false)
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg">
          <div className="relative">
            {text}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800" />
          </div>
        </div>
      )}
    </div>
  )
}

export function InjectableBilling({ onClose, patientId, patientName }: InjectableBillingProps) {
  const { currentInvoice, createInvoice, addLineItem } = useInvoice()
  const [activeTab, setActiveTab] = useState<'neurotoxin' | 'filler'>('neurotoxin')
  const [selectedProduct, setSelectedProduct] = useState<InjectableProduct | null>(null)
  const [selectedAreas, setSelectedAreas] = useState<Map<string, number>>(new Map())
  const [lotNumber, setLotNumber] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [notes, setNotes] = useState('')
  const [showFaceChart, setShowFaceChart] = useState(true)
  const [showMuscles, setShowMuscles] = useState(false)
  const [gender, setGender] = useState<'male' | 'female'>('female')
  const [customPoints, setCustomPoints] = useState<any[]>([])
  const [dilutionRatio, setDilutionRatio] = useState('1:1')
  const [syringeCount, setSyringeCount] = useState(1)
  const [photos, setPhotos] = useState<TreatmentPhoto[]>([])
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [photoConsentSigned, setPhotoConsentSigned] = useState(false)
  const [inventoryDeduction, setInventoryDeduction] = useState(true)
  
  const handleAreaClick = (zone: any) => {
    if (!selectedProduct) {
      alert('Please select a product first')
      return
    }
    
    const currentUnits = selectedAreas.get(zone.id) || 0
    const isNeurotoxin = selectedProduct.type === 'neurotoxin'
    const units = zone.recommendedUnits?.[selectedProduct.type]
    
    if (!units) return // Zone not applicable for this product type
    
    if (currentUnits === 0) {
      // Set to typical amount
      setSelectedAreas(new Map(selectedAreas).set(zone.id, units.typical))
    } else {
      // Remove from selection
      const newAreas = new Map(selectedAreas)
      newAreas.delete(zone.id)
      setSelectedAreas(newAreas)
    }
  }
  
  const adjustUnits = (zoneId: string, delta: number) => {
    const zone = INJECTION_ZONES.find(z => z.id === zoneId)
    if (!zone || !selectedProduct) return
    
    const units = zone.recommendedUnits?.[selectedProduct.type]
    if (!units) return
    
    const currentUnits = selectedAreas.get(zoneId) || 0
    const newUnits = Math.max(0, Math.min(units.max, currentUnits + delta))
    
    if (newUnits === 0) {
      const newAreas = new Map(selectedAreas)
      newAreas.delete(zoneId)
      setSelectedAreas(newAreas)
    } else {
      setSelectedAreas(new Map(selectedAreas).set(zoneId, newUnits))
    }
  }
  
  const getTotalUnits = () => {
    let total = 0
    selectedAreas.forEach(units => total += units)
    customPoints.forEach(point => total += point.units)
    return total
  }
  
  const getTotalFillerVolume = () => {
    if (!selectedProduct || selectedProduct.type !== 'filler') return 0
    let total = 0
    selectedAreas.forEach(units => total += units)
    customPoints.forEach(point => total += point.units)
    return total
  }
  
  const getRequiredSyringes = () => {
    if (!selectedProduct || selectedProduct.type !== 'filler') return 0
    const totalVolume = getTotalFillerVolume()
    const volumePerSyringe = selectedProduct.volumePerSyringe || 1
    return Math.ceil(totalVolume / volumePerSyringe)
  }
  
  const getTotalPrice = () => {
    if (!selectedProduct) return 0
    
    if (selectedProduct.type === 'neurotoxin') {
      return getTotalUnits() * selectedProduct.unitPrice
    } else {
      // For fillers, use the actual required syringes based on selected areas
      const requiredSyringes = getRequiredSyringes()
      const syringesToCharge = Math.max(syringeCount, requiredSyringes)
      return syringesToCharge * selectedProduct.unitPrice
    }
  }
  
  const getPresetProtocols = () => {
    return [
      { name: 'Basic Refresh', areas: ['frontalis', 'glabella', 'crow-feet-left', 'crow-feet-right'], units: 64 },
      { name: 'Full Upper Face', areas: ['frontalis', 'glabella', 'corrugator-left', 'corrugator-right', 'crow-feet-left', 'crow-feet-right'], units: 72 },
      { name: 'Lip Flip', areas: ['upper-lip'], units: 4 },
      { name: 'Gummy Smile', areas: ['upper-lip'], units: 6 },
      { name: 'Chin Dimpling', areas: ['chin'], units: 6 },
      { name: 'Masseter Reduction', areas: ['masseter-left', 'masseter-right'], units: 50 },
      { name: 'Neck Lift (Nefertiti)', areas: ['platysma', 'dao-left', 'dao-right'], units: 48 },
      { name: 'Brow Lift', areas: ['frontalis', 'glabella'], units: 40 }
    ]
  }
  
  const applyPreset = (preset: any) => {
    if (!selectedProduct || selectedProduct.type !== 'neurotoxin') {
      alert('Please select a neurotoxin product first')
      return
    }
    
    const newAreas = new Map<string, number>()
    preset.areas.forEach((zoneId: string) => {
      const zone = INJECTION_ZONES.find(z => z.id === zoneId)
      if (zone?.recommendedUnits?.neurotoxin) {
        newAreas.set(zoneId, zone.recommendedUnits.neurotoxin.typical)
      }
    })
    setSelectedAreas(newAreas)
  }
  
  const handleAddToInvoice = () => {
    if (!selectedProduct) return
    if (!patientId || !patientName) {
      toast.error('Patient information is required')
      return
    }
    
    // Create invoice if it doesn't exist
    let invoice = currentInvoice
    if (!invoice) {
      invoice = createInvoice(patientId, patientName)
    }
    
    // Prepare zones data
    const zonesData = Array.from(selectedAreas.entries()).map(([zoneId, units]) => {
      const zone = INJECTION_ZONES.find(z => z.id === zoneId)
      return {
        id: zoneId,
        name: zone?.name || zoneId,
        units
      }
    })
    
    // Create line item
    const lineItem = {
      id: `LI-${Date.now()}`,
      type: 'injectable' as const,
      name: selectedProduct.name,
      description: selectedProduct.type === 'neurotoxin' 
        ? `${getTotalUnits()} units` 
        : `${syringeCount} syringe(s) (${getTotalFillerVolume().toFixed(1)}ml)`,
      quantity: selectedProduct.type === 'neurotoxin' ? getTotalUnits() : syringeCount,
      unitPrice: selectedProduct.unitPrice,
      totalPrice: getTotalPrice(),
      metadata: {
        productId: selectedProduct.id,
        productType: selectedProduct.type,
        zones: zonesData,
        customPoints: customPoints.map(p => ({
          id: p.id,
          label: p.label,
          units: p.units
        })),
        lotNumber,
        expirationDate,
        notes,
        photos: photos.map(p => ({
          id: p.id,
          type: p.type,
          angle: p.angle,
          url: p.url,
          timestamp: p.timestamp
        })),
        photoConsentSigned,
        inventoryDeduction,
        totalUnits: selectedProduct.type === 'neurotoxin' ? getTotalUnits() : undefined,
        totalVolume: selectedProduct.type === 'filler' ? getTotalFillerVolume() : undefined,
        syringeCount: selectedProduct.type === 'filler' ? syringeCount : undefined
      }
    }
    
    // Add to invoice
    addLineItem(lineItem)
    
    // Show success and close
    toast.success(`${selectedProduct.name} added to invoice`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Syringe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Injectable Billing Calculator</h2>
              <p className="text-sm text-gray-600">
                {patientName || 'New Patient'} • Advanced unit tracking & face mapping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Product Type Tabs */}
        <div className="px-6 pt-4 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('neurotoxin')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'neurotoxin'
                  ? 'bg-white text-purple-600 shadow-sm border-2 border-purple-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Neurotoxins
            </button>
            <button
              onClick={() => setActiveTab('filler')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'filler'
                  ? 'bg-white text-pink-600 shadow-sm border-2 border-pink-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Dermal Fillers
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Product Selection */}
            <div className="space-y-6">
              {/* Product Cards */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Select Product</h3>
                  <Tooltip text="Customize your product catalog and pricing in Settings → Injectable Products. You can add new products, adjust unit prices, and set expiration tracking.">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                  </Tooltip>
                </div>
                <div className="space-y-2">
                  {(activeTab === 'neurotoxin' ? NEUROTOXIN_PRODUCTS : FILLER_PRODUCTS).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedProduct?.id === product.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                          {product.concentration && (
                            <p className="text-xs text-gray-400 mt-1">{product.concentration}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${product.unitPrice}
                            <span className="text-xs text-gray-500 ml-1">
                              /{product.type === 'neurotoxin' ? 'unit' : 'syringe'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lot Tracking & Inventory */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-700">Inventory Tracking</h3>
                  <Tooltip text="Track lot numbers and expiration dates for FDA compliance and inventory management. This information will be saved with the treatment record.">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                  </Tooltip>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Lot Number</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="e.g., LOT2024ABC123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-700">Auto-deduct from inventory</span>
                  </div>
                  <button
                    onClick={() => setInventoryDeduction(!inventoryDeduction)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      inventoryDeduction ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      inventoryDeduction ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Photo Documentation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-700">Photo Documentation</h3>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      {photos.length} photos
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPhotoCapture(!showPhotoCapture)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {showPhotoCapture ? 'Hide' : 'Add Photos'}
                  </button>
                </div>
                
                {showPhotoCapture && (
                  <div className="space-y-3">
                    {/* Photo Consent */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="photo-consent"
                        checked={photoConsentSigned}
                        onChange={(e) => setPhotoConsentSigned(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="photo-consent" className="text-xs text-gray-700">
                        Patient has signed photo consent form
                      </label>
                    </div>

                    {/* Photo Upload Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {['before', 'after'].map((photoType) => (
                        <div key={photoType} className="space-y-2">
                          <p className="text-xs font-medium text-gray-600 uppercase">{photoType}</p>
                          <div className="grid grid-cols-3 gap-1">
                            {['front', 'left', 'right'].map((angle) => {
                              const photo = photos.find(
                                p => p.type === photoType && p.angle === angle
                              )
                              return (
                                <div
                                  key={angle}
                                  className="relative aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors group"
                                >
                                  {photo ? (
                                    <>
                                      <img
                                        src={photo.url}
                                        alt={`${photoType} ${angle}`}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                      <button
                                        onClick={() => {
                                          setPhotos(photos.filter(p => p.id !== photo.id))
                                        }}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        // Simulate photo upload
                                        const newPhoto: TreatmentPhoto = {
                                          id: `photo-${Date.now()}`,
                                          type: photoType as 'before' | 'after',
                                          angle: angle as any,
                                          url: `https://placehold.co/200x200/purple/white?text=${photoType}+${angle}`,
                                          timestamp: new Date()
                                        }
                                        setPhotos([...photos, newPhoto])
                                      }}
                                      disabled={!photoConsentSigned}
                                      className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Camera className="w-6 h-6 mb-1" />
                                      <span className="text-xs capitalize">{angle}</span>
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Photo Tips */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">
                        <strong>Photo Tips:</strong>
                      </p>
                      <ul className="text-xs text-gray-500 space-y-0.5">
                        <li>• Use consistent lighting</li>
                        <li>• Maintain same distance</li>
                        <li>• Neutral facial expression</li>
                        <li>• Clean background</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Preset Protocols (for neurotoxins) */}
              {activeTab === 'neurotoxin' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Quick Protocols</h3>
                    <Tooltip text="Common treatment patterns to speed up documentation. Click to auto-populate injection zones with typical unit amounts. You can adjust units after selection.">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="space-y-1">
                    {getPresetProtocols().map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-purple-50 transition-colors group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 group-hover:text-purple-700">{preset.name}</span>
                          <span className="text-xs text-gray-500 group-hover:text-purple-600">
                            ~{preset.units} units
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filler Options */}
              {activeTab === 'filler' && selectedProduct && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Syringes to Bill</h3>
                    <Tooltip text="Select injection areas on the face chart to calculate required syringes. You can bill additional syringes if needed (e.g., for wastage or patient request).">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                    </Tooltip>
                  </div>
                  
                  {/* Required vs Billed */}
                  {getTotalFillerVolume() > 0 && (
                    <div className="mb-3 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Volume Selected:</span>
                          <span className="font-medium">{getTotalFillerVolume().toFixed(1)} ml</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min Syringes Required:</span>
                          <span className="font-medium">{getRequiredSyringes()}</span>
                        </div>
                        {syringeCount < getRequiredSyringes() && (
                          <div className="text-pink-600 text-xs mt-2">
                            ⚠️ Billing less than required syringes
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSyringeCount(Math.max(0.5, syringeCount - 0.5))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-xl font-semibold">{syringeCount}</span>
                      <span className="text-sm text-gray-500 ml-2">syringe(s)</span>
                    </div>
                    <button
                      onClick={() => setSyringeCount(syringeCount + 0.5)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {getTotalFillerVolume() === 0 && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Select areas on the face chart to auto-calculate required syringes
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Middle Column - Face Chart & Area Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Face Chart Controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-700">Treatment Areas</h3>
                  <Tooltip text="Use Preset Zones for anatomically-defined injection points, or switch to Custom Marking to click anywhere on the face for precise documentation.">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                  </Tooltip>
                </div>
                <div className="flex gap-2">
                  {/* Gender Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setGender('female')}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        gender === 'female'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Female
                    </button>
                    <button
                      onClick={() => setGender('male')}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        gender === 'male'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Male
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowFaceChart(!showFaceChart)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    {showFaceChart ? 'Hide' : 'Show'} Chart
                  </button>
                </div>
              </div>

              {/* Visual Face Chart */}
              {showFaceChart && (
                <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-xl p-6 shadow-inner">
                  <DocumentationFaceChart
                    selectedZones={selectedAreas}
                    customPoints={customPoints}
                    onZoneClick={handleAreaClick}
                    onCustomPointAdd={(point) => setCustomPoints([...customPoints, point])}
                    onCustomPointUpdate={(id, units) => {
                      setCustomPoints(customPoints.map(p => 
                        p.id === id ? { ...p, units } : p
                      ))
                    }}
                    onCustomPointRemove={(id) => {
                      setCustomPoints(customPoints.filter(p => p.id !== id))
                    }}
                    productType={activeTab}
                    gender={gender}
                  />
                </div>
              )}

              {/* Selected Areas List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Areas</h3>
                {selectedAreas.size === 0 && customPoints.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Click on the face chart or select areas below to add injection sites
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Array.from(selectedAreas.entries()).map(([zoneId, units]) => {
                      const zone = INJECTION_ZONES.find(z => z.id === zoneId)
                      if (!zone) return null
                      
                      const zoneUnits = zone.recommendedUnits?.[selectedProduct?.type || 'neurotoxin']
                      if (!zoneUnits) return null
                      
                      return (
                        <div
                          key={zoneId}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <Target className="w-4 h-4 text-purple-500" />
                            <div>
                              <p className="font-medium text-gray-900">{zone.name}</p>
                              {zone.muscle && (
                                <p className="text-xs text-gray-400 italic">{zone.muscle}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                Recommended: {zoneUnits.min}-{zoneUnits.max} 
                                {selectedProduct?.type === 'neurotoxin' ? ' units' : ' ml'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => adjustUnits(zoneId, selectedProduct?.type === 'neurotoxin' ? -1 : -0.1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={units}
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value) || 0
                                if (newValue === 0) {
                                  const newAreas = new Map(selectedAreas)
                                  newAreas.delete(zoneId)
                                  setSelectedAreas(newAreas)
                                } else {
                                  const zone = INJECTION_ZONES.find(z => z.id === zoneId)
                                  const zoneUnits = zone?.recommendedUnits?.[selectedProduct?.type || 'neurotoxin']
                                  const clampedValue = Math.max(0, Math.min(zoneUnits?.max || newValue, newValue))
                                  setSelectedAreas(new Map(selectedAreas).set(zoneId, clampedValue))
                                }
                              }}
                              step={selectedProduct?.type === 'neurotoxin' ? '1' : '0.1'}
                              className="w-16 text-center font-semibold border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <span className="text-sm text-gray-600">
                              {selectedProduct?.type === 'neurotoxin' ? 'u' : 'ml'}
                            </span>
                            <button
                              onClick={() => adjustUnits(zoneId, selectedProduct?.type === 'neurotoxin' ? 1 : 0.1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Custom Points */}
                    {customPoints.map(point => (
                      <div
                        key={point.id}
                        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {point.label || 'Custom Point'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newUnits = point.units - (selectedProduct?.type === 'neurotoxin' ? 1 : 0.1)
                              if (newUnits > 0) {
                                setCustomPoints(customPoints.map(p => 
                                  p.id === point.id ? { ...p, units: newUnits } : p
                                ))
                              }
                            }}
                            className="p-1 hover:bg-purple-100 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={point.units}
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value) || 0
                              if (newValue > 0) {
                                setCustomPoints(customPoints.map(p => 
                                  p.id === point.id ? { ...p, units: newValue } : p
                                ))
                              }
                            }}
                            step={selectedProduct?.type === 'neurotoxin' ? '1' : '0.1'}
                            className="w-16 text-center font-semibold border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          <span className="text-sm text-gray-600">
                            {selectedProduct?.type === 'neurotoxin' ? 'u' : 'ml'}
                          </span>
                          <button
                            onClick={() => {
                              const newUnits = point.units + (selectedProduct?.type === 'neurotoxin' ? 1 : 0.1)
                              setCustomPoints(customPoints.map(p => 
                                p.id === point.id ? { ...p, units: newUnits } : p
                              ))
                            }}
                            className="p-1 hover:bg-purple-100 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCustomPoints(customPoints.filter(p => p.id !== point.id))}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any special instructions, dilution ratios, technique notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Summary */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              {selectedProduct && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedProduct.type === 'neurotoxin' ? 'Total Units' : 'Volume'}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedProduct.type === 'neurotoxin' 
                        ? getTotalUnits() 
                        : `${getTotalFillerVolume().toFixed(1)} ml`
                      }
                    </p>
                  </div>
                  {selectedProduct.type === 'filler' && (
                    <div>
                      <p className="text-sm text-gray-600">Syringes</p>
                      <p className="font-semibold text-gray-900">
                        {syringeCount}
                        {getRequiredSyringes() > syringeCount && (
                          <span className="text-xs text-pink-600 ml-1">
                            (min: {getRequiredSyringes()})
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {customPoints.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Custom Points</p>
                      <p className="font-semibold text-indigo-600">{customPoints.length}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="font-semibold text-2xl text-green-600">
                      ${getTotalPrice().toFixed(2)}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToInvoice}
                disabled={!selectedProduct || (activeTab === 'neurotoxin' ? (selectedAreas.size === 0 && customPoints.length === 0) : syringeCount === 0)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Add to Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}