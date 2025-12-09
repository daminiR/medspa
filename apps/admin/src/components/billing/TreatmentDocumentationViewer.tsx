'use client'

import { useState } from 'react'
import {
  FileText,
  Camera,
  Package,
  User,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronRight,
  Eye,
  AlertCircle,
  CheckCircle,
  Image,
  Syringe,
  Activity
} from 'lucide-react'

interface TreatmentDocumentation {
  id: string
  providerId: string
  providerName: string
  patientId: string
  patientName: string
  treatmentDate: Date
  roomNumber: string
  status: 'documenting' | 'completed' | 'synced'
  
  // Injectable documentation
  injections?: {
    product: string
    brand: string
    totalUnits: number
    zones: {
      id: string
      name: string
      units: number
      depth?: string
    }[]
    lotNumber: string
    expirationDate: string
  }[]
  
  // Photos
  photos?: {
    id: string
    type: 'before' | 'after'
    angle: string
    url: string
    timestamp: Date
  }[]
  
  // Clinical notes
  soapNotes?: {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
  
  // Products used
  productsUsed?: {
    id: string
    name: string
    quantity: number
    lotNumber?: string
    autoDeducted: boolean
  }[]
  
  // Timestamps
  startedAt: Date
  completedAt?: Date
  syncedAt?: Date
}

interface TreatmentDocumentationViewerProps {
  documentation: TreatmentDocumentation
  onClose?: () => void
  compact?: boolean
}

export function TreatmentDocumentationViewer({ 
  documentation, 
  onClose,
  compact = false 
}: TreatmentDocumentationViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['injections', 'photos'])
  )
  
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }
  
  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'text-green-600 bg-green-50'
      case 'completed': return 'text-blue-600 bg-blue-50'
      case 'documenting': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  if (compact) {
    // Compact view for embedding in other components
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Provider Documentation</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSyncStatusColor(documentation.status)}`}>
                {documentation.status === 'synced' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {documentation.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Documented by {documentation.providerName} in {documentation.roomNumber}
            </p>
            
            {/* Quick summary */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              {documentation.injections && documentation.injections.length > 0 && (
                <div className="flex items-center gap-1">
                  <Syringe className="w-3 h-3" />
                  <span>{documentation.injections.reduce((sum, inj) => sum + inj.totalUnits, 0)} units</span>
                </div>
              )}
              {documentation.photos && documentation.photos.length > 0 && (
                <div className="flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  <span>{documentation.photos.length} photos</span>
                </div>
              )}
              {documentation.productsUsed && documentation.productsUsed.length > 0 && (
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span>{documentation.productsUsed.length} products</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Full view
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Treatment Documentation</h2>
              <p className="text-sm text-gray-600">Provider-documented treatment details (read-only)</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Metadata Bar */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{documentation.providerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{documentation.roomNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{formatTime(documentation.startedAt)}</span>
              {documentation.completedAt && (
                <span className="text-gray-400">→ {formatTime(documentation.completedAt)}</span>
              )}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSyncStatusColor(documentation.status)}`}>
            {documentation.status === 'synced' && <CheckCircle className="w-3 h-3 inline mr-1" />}
            {documentation.status === 'documenting' && <Activity className="w-3 h-3 inline mr-1 animate-pulse" />}
            {documentation.status}
          </div>
        </div>
      </div>
      
      {/* Content Sections */}
      <div className="divide-y divide-gray-200">
        {/* Injectable Documentation */}
        {documentation.injections && documentation.injections.length > 0 && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('injections')}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
            >
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">Injectable Documentation</h3>
                <span className="text-sm text-gray-500">
                  ({documentation.injections.reduce((sum, inj) => sum + inj.totalUnits, 0)} total units)
                </span>
              </div>
              {expandedSections.has('injections') ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has('injections') && (
              <div className="mt-4 space-y-4">
                {documentation.injections.map((injection, idx) => (
                  <div key={idx} className="bg-purple-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{injection.product}</h4>
                        <p className="text-sm text-gray-600">{injection.brand}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-purple-600">{injection.totalUnits} units</p>
                        <p className="text-xs text-gray-500">Lot: {injection.lotNumber}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {injection.zones.map((zone) => (
                        <div key={zone.id} className="bg-white rounded px-3 py-2">
                          <p className="text-sm font-medium text-gray-900">{zone.name}</p>
                          <p className="text-xs text-gray-600">{zone.units} units</p>
                          {zone.depth && (
                            <p className="text-xs text-gray-500">{zone.depth}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Photos */}
        {documentation.photos && documentation.photos.length > 0 && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('photos')}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
            >
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Treatment Photos</h3>
                <span className="text-sm text-gray-500">({documentation.photos.length} photos)</span>
              </div>
              {expandedSections.has('photos') ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has('photos') && (
              <div className="mt-4">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {documentation.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={`${photo.type} - ${photo.angle}`}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-opacity flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-600 capitalize">{photo.type}</p>
                        <p className="text-xs text-gray-500">{photo.angle}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Photos captured by provider during treatment
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* SOAP Notes */}
        {documentation.soapNotes && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('soap')}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Clinical Notes</h3>
              </div>
              {expandedSections.has('soap') ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has('soap') && (
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Subjective</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                    {documentation.soapNotes.subjective || 'No notes'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Objective</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                    {documentation.soapNotes.objective || 'No notes'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Assessment</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                    {documentation.soapNotes.assessment || 'No notes'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Plan</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                    {documentation.soapNotes.plan || 'No notes'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Products Used */}
        {documentation.productsUsed && documentation.productsUsed.length > 0 && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('products')}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-gray-900">Products Used</h3>
                <span className="text-sm text-gray-500">({documentation.productsUsed.length} items)</span>
              </div>
              {expandedSections.has('products') ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has('products') && (
              <div className="mt-4 space-y-2">
                {documentation.productsUsed.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.lotNumber && (
                        <p className="text-xs text-gray-500">Lot: {product.lotNumber}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{product.quantity}</span>
                      {product.autoDeducted && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Auto-deducted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {documentation.completedAt && (
              <span>Completed: {new Date(documentation.completedAt).toLocaleString()}</span>
            )}
            {documentation.syncedAt && (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Synced: {new Date(documentation.syncedAt).toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-gray-400">Read-only • Provider documentation</span>
        </div>
      </div>
    </div>
  )
}