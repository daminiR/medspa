'use client'

import { useState } from 'react'
import {
  Layers,
  Syringe,
  ChevronDown,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

// Injection depth options as specified
export type InjectionDepth = 'superficial' | 'mid-dermis' | 'deep' | 'periosteal' | 'subcutaneous' | 'intramuscular'

// Delivery method options
export type DeliveryMethod = 'needle' | 'cannula'

// Needle gauge options
export type NeedleGauge = '27G' | '30G' | '32G' | '33G' | '25G' | '22G' | '18G'

// Cannula gauge options
export type CannulaGauge = '22G' | '25G' | '27G'

export interface InjectionTechnique {
  depth: InjectionDepth
  deliveryMethod: DeliveryMethod
  gauge?: NeedleGauge | CannulaGauge
  techniqueNotes?: string
}

interface InjectionTechniqueSelectorProps {
  value?: InjectionTechnique
  onChange?: (technique: InjectionTechnique) => void
  productType?: 'neurotoxin' | 'filler'
  zoneName?: string
  compact?: boolean
  disabled?: boolean
}

// Depth configurations with descriptions and recommendations
const INJECTION_DEPTHS: {
  id: InjectionDepth
  label: string
  description: string
  suitableFor: string[]
  color: string
  depthMm: string
}[] = [
  {
    id: 'superficial',
    label: 'Superficial',
    description: 'Intradermal injection into the papillary dermis',
    suitableFor: ['Fine lines', 'Skin booster', 'Mesotherapy'],
    color: 'yellow',
    depthMm: '0.5-1mm'
  },
  {
    id: 'mid-dermis',
    label: 'Mid-Dermis',
    description: 'Injection into the reticular dermis',
    suitableFor: ['Moderate wrinkles', 'Lip border', 'Tear trough'],
    color: 'orange',
    depthMm: '1-2mm'
  },
  {
    id: 'deep',
    label: 'Deep Dermis',
    description: 'Deep dermal injection at dermal-subcutaneous junction',
    suitableFor: ['Deep folds', 'Nasolabial folds', 'Marionette lines'],
    color: 'red',
    depthMm: '2-4mm'
  },
  {
    id: 'subcutaneous',
    label: 'Subcutaneous',
    description: 'Injection into the subcutaneous fat layer',
    suitableFor: ['Volume restoration', 'Cheek augmentation', 'Temple hollows'],
    color: 'purple',
    depthMm: '4-8mm'
  },
  {
    id: 'periosteal',
    label: 'Periosteal / Supraperiosteal',
    description: 'Injection on or just above the bone periosteum',
    suitableFor: ['Structural support', 'Chin augmentation', 'Jawline', 'Cheekbones'],
    color: 'indigo',
    depthMm: '8-15mm'
  },
  {
    id: 'intramuscular',
    label: 'Intramuscular',
    description: 'Injection directly into the muscle belly',
    suitableFor: ['Neurotoxins (Botox)', 'Muscle relaxation'],
    color: 'blue',
    depthMm: 'Varies'
  }
]

// Delivery method configurations
const DELIVERY_METHODS: {
  id: DeliveryMethod
  label: string
  description: string
  advantages: string[]
  gauges: (NeedleGauge | CannulaGauge)[]
}[] = [
  {
    id: 'needle',
    label: 'Needle',
    description: 'Sharp-tipped needle for precise injections',
    advantages: [
      'Precise placement',
      'Better for superficial injections',
      'Required for neurotoxins',
      'Good for small areas'
    ],
    gauges: ['27G', '30G', '32G', '33G', '25G']
  },
  {
    id: 'cannula',
    label: 'Cannula',
    description: 'Blunt-tipped flexible cannula for safer filler placement',
    advantages: [
      'Reduced bruising risk',
      'Fewer entry points',
      'Lower vascular occlusion risk',
      'Better for large areas'
    ],
    gauges: ['22G', '25G', '27G']
  }
]

const getDepthColor = (color: string) => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700' },
    orange: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
    red: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700' },
    purple: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' },
    indigo: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700' },
    blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
  }
  return colors[color] || colors.blue
}

export function InjectionTechniqueSelector({
  value,
  onChange,
  productType = 'filler',
  zoneName,
  compact = false,
  disabled = false
}: InjectionTechniqueSelectorProps) {
  const [showDepthInfo, setShowDepthInfo] = useState(false)
  const [showMethodInfo, setShowMethodInfo] = useState(false)

  const currentTechnique: InjectionTechnique = value || {
    depth: productType === 'neurotoxin' ? 'intramuscular' : 'mid-dermis',
    deliveryMethod: productType === 'neurotoxin' ? 'needle' : 'needle'
  }

  const handleDepthChange = (depth: InjectionDepth) => {
    onChange?.({ ...currentTechnique, depth })
  }

  const handleMethodChange = (method: DeliveryMethod) => {
    // Reset gauge when switching methods
    const newMethod = DELIVERY_METHODS.find(m => m.id === method)
    onChange?.({
      ...currentTechnique,
      deliveryMethod: method,
      gauge: newMethod?.gauges[0]
    })
  }

  const handleGaugeChange = (gauge: NeedleGauge | CannulaGauge) => {
    onChange?.({ ...currentTechnique, gauge })
  }

  const handleNotesChange = (notes: string) => {
    onChange?.({ ...currentTechnique, techniqueNotes: notes })
  }

  const selectedDepth = INJECTION_DEPTHS.find(d => d.id === currentTechnique.depth)
  const selectedMethod = DELIVERY_METHODS.find(m => m.id === currentTechnique.deliveryMethod)

  // Filter depths based on product type
  const availableDepths = productType === 'neurotoxin'
    ? INJECTION_DEPTHS.filter(d => ['superficial', 'mid-dermis', 'intramuscular'].includes(d.id))
    : INJECTION_DEPTHS.filter(d => d.id !== 'intramuscular')

  if (compact) {
    // Compact inline version for use in zone lists
    return (
      <div className="flex items-center gap-2">
        {/* Depth dropdown */}
        <div className="relative">
          <select
            value={currentTechnique.depth}
            onChange={(e) => handleDepthChange(e.target.value as InjectionDepth)}
            disabled={disabled}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {availableDepths.map((depth) => (
              <option key={depth.id} value={depth.id}>
                {depth.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Delivery method dropdown */}
        <div className="relative">
          <select
            value={currentTechnique.deliveryMethod}
            onChange={(e) => handleMethodChange(e.target.value as DeliveryMethod)}
            disabled={disabled || productType === 'neurotoxin'}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {DELIVERY_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Gauge dropdown */}
        {selectedMethod && (
          <div className="relative">
            <select
              value={currentTechnique.gauge || selectedMethod.gauges[0]}
              onChange={(e) => handleGaugeChange(e.target.value as NeedleGauge | CannulaGauge)}
              disabled={disabled}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedMethod.gauges.map((gauge) => (
                <option key={gauge} value={gauge}>
                  {gauge}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>
    )
  }

  // Full version with visual indicators
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Injection Technique</h3>
            {zoneName && <p className="text-xs text-gray-500">{zoneName}</p>}
          </div>
        </div>
        {selectedDepth && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDepthColor(selectedDepth.color).bg} ${getDepthColor(selectedDepth.color).text}`}>
            {selectedDepth.depthMm}
          </div>
        )}
      </div>

      {/* Depth Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Layers className="w-4 h-4" />
            Injection Depth
          </label>
          <button
            type="button"
            onClick={() => setShowDepthInfo(!showDepthInfo)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Depth visual selector */}
        <div className="relative">
          <select
            value={currentTechnique.depth}
            onChange={(e) => handleDepthChange(e.target.value as InjectionDepth)}
            disabled={disabled}
            className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {availableDepths.map((depth) => (
              <option key={depth.id} value={depth.id}>
                {depth.label} ({depth.depthMm})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Depth info panel */}
        {showDepthInfo && selectedDepth && (
          <div className={`mt-2 p-3 rounded-lg ${getDepthColor(selectedDepth.color).bg} border ${getDepthColor(selectedDepth.color).border}`}>
            <p className="text-sm font-medium mb-1">{selectedDepth.description}</p>
            <p className="text-xs text-gray-600 mb-2">
              <strong>Suitable for:</strong> {selectedDepth.suitableFor.join(', ')}
            </p>
          </div>
        )}

        {/* Visual depth indicator */}
        <div className="mt-3 relative h-12 bg-gradient-to-b from-amber-100 via-orange-100 to-red-100 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-between py-1 px-2">
            <span className="text-[10px] text-amber-700">Epidermis</span>
            <span className="text-[10px] text-orange-700">Dermis</span>
            <span className="text-[10px] text-red-700">Subcutaneous</span>
          </div>
          {/* Depth marker */}
          <div
            className="absolute left-0 right-0 h-1 bg-purple-600 shadow-lg transition-all duration-300"
            style={{
              top: currentTechnique.depth === 'superficial' ? '10%' :
                   currentTechnique.depth === 'mid-dermis' ? '30%' :
                   currentTechnique.depth === 'deep' ? '50%' :
                   currentTechnique.depth === 'subcutaneous' ? '70%' :
                   currentTechnique.depth === 'periosteal' ? '90%' :
                   currentTechnique.depth === 'intramuscular' ? '60%' : '50%'
            }}
          />
        </div>
      </div>

      {/* Delivery Method */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Syringe className="w-4 h-4" />
            Delivery Method
          </label>
          <button
            type="button"
            onClick={() => setShowMethodInfo(!showMethodInfo)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Method toggle buttons */}
        <div className="flex gap-2">
          {DELIVERY_METHODS.map((method) => {
            const isSelected = currentTechnique.deliveryMethod === method.id
            const isDisabled = disabled || (productType === 'neurotoxin' && method.id === 'cannula')

            return (
              <button
                key={method.id}
                onClick={() => handleMethodChange(method.id)}
                disabled={isDisabled}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">{method.label}</span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-purple-500" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Method info */}
        {showMethodInfo && selectedMethod && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium mb-2">{selectedMethod.description}</p>
            <ul className="space-y-1">
              {selectedMethod.advantages.map((adv, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {adv}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cannula warning for neurotoxins */}
        {productType === 'neurotoxin' && (
          <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Neurotoxins require needle injection for precise muscle targeting.
            </p>
          </div>
        )}
      </div>

      {/* Gauge Selection */}
      {selectedMethod && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            {currentTechnique.deliveryMethod === 'needle' ? 'Needle' : 'Cannula'} Gauge
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedMethod.gauges.map((gauge) => {
              const isSelected = (currentTechnique.gauge || selectedMethod.gauges[0]) === gauge
              return (
                <button
                  key={gauge}
                  onClick={() => handleGaugeChange(gauge)}
                  disabled={disabled}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {gauge}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {currentTechnique.deliveryMethod === 'needle'
              ? 'Smaller gauge (higher number) = finer needle, less trauma'
              : 'Smaller gauge = finer cannula, better for delicate areas'}
          </p>
        </div>
      )}

      {/* Technique Notes */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Technique Notes (optional)
        </label>
        <textarea
          value={currentTechnique.techniqueNotes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          disabled={disabled}
          rows={2}
          placeholder="E.g., Serial puncture, linear threading, fanning, bolus..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  )
}

// Export a simple inline version for use in lists
export function InlineInjectionTechnique({
  depth,
  deliveryMethod,
  gauge
}: {
  depth?: InjectionDepth
  deliveryMethod?: DeliveryMethod
  gauge?: string
}) {
  if (!depth && !deliveryMethod) return null

  const depthInfo = INJECTION_DEPTHS.find(d => d.id === depth)
  const colors = depthInfo ? getDepthColor(depthInfo.color) : { bg: 'bg-gray-100', text: 'text-gray-700' }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {depth && (
        <span className={`px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
          {depthInfo?.label || depth}
        </span>
      )}
      {deliveryMethod && (
        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600">
          {deliveryMethod === 'needle' ? '💉 Needle' : '🔧 Cannula'}
          {gauge && ` ${gauge}`}
        </span>
      )}
    </div>
  )
}
