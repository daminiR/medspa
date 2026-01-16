'use client'

import React, { useMemo } from 'react'
import { ChevronUp, ChevronDown, Syringe, DollarSign } from 'lucide-react'

interface TreatmentSummary {
  productName: string
  productType: 'neurotoxin' | 'filler'
  totalUnits?: number
  totalVolume?: number
  totalCost: number
}

interface CollapsedSummaryFooterProps {
  treatments: TreatmentSummary[]
  isExpanded: boolean
  onToggleExpanded: () => void
}

export function CollapsedSummaryFooter({
  treatments,
  isExpanded,
  onToggleExpanded
}: CollapsedSummaryFooterProps) {
  // Calculate grand totals
  const totals = useMemo(() => {
    let totalCost = 0
    let totalUnits = 0
    let totalVolume = 0

    treatments.forEach(treatment => {
      totalCost += treatment.totalCost
      if (treatment.totalUnits) totalUnits += treatment.totalUnits
      if (treatment.totalVolume) totalVolume += treatment.totalVolume
    })

    return { totalCost, totalUnits, totalVolume }
  }, [treatments])

  // Generate collapsed summary text (e.g., "12u Botox | 2ml Juvederm | $560")
  const summaryText = useMemo(() => {
    const parts = treatments.map(treatment => {
      const quantity = treatment.productType === 'neurotoxin'
        ? `${treatment.totalUnits || 0}u`
        : `${treatment.totalVolume?.toFixed(1) || 0}ml`
      return `${quantity} ${treatment.productName}`
    })
    parts.push(`$${totals.totalCost.toFixed(0)}`)
    return parts.join(' | ')
  }, [treatments, totals.totalCost])

  if (treatments.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transition-all duration-300">
      {/* Collapsed View - Single Line */}
      {!isExpanded && (
        <button
          onClick={onToggleExpanded}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Syringe className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">
              {summaryText}
            </span>
          </div>
          <ChevronUp className="w-5 h-5 text-gray-400" />
        </button>
      )}

      {/* Expanded View - Full Details */}
      {isExpanded && (
        <div className="animate-in slide-in-from-bottom duration-200">
          {/* Header */}
          <button
            onClick={onToggleExpanded}
            className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors border-b border-gray-200"
          >
            <div className="flex items-center gap-2">
              <Syringe className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-900">Treatment Summary</span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>

          {/* Treatment Breakdown */}
          <div className="px-4 py-4 space-y-3 max-h-64 overflow-y-auto">
            {treatments.map((treatment, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  treatment.productType === 'neurotoxin'
                    ? 'bg-purple-50 border border-purple-100'
                    : 'bg-pink-50 border border-pink-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      treatment.productType === 'neurotoxin' ? 'bg-purple-500' : 'bg-pink-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{treatment.productName}</p>
                    <p className="text-xs text-gray-500">
                      {treatment.productType === 'neurotoxin' ? 'Neurotoxin' : 'Dermal Filler'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      treatment.productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'
                    }`}
                  >
                    {treatment.productType === 'neurotoxin'
                      ? `${treatment.totalUnits || 0}u`
                      : `${treatment.totalVolume?.toFixed(1) || 0}ml`}
                  </p>
                  <p className="text-xs text-gray-600">${treatment.totalCost.toFixed(2)}</p>
                </div>
              </div>
            ))}

            {/* Grand Total */}
            <div className="pt-3 mt-3 border-t-2 border-gray-200">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-700" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Total Treatment Cost</p>
                    <p className="text-xs text-gray-600">
                      {totals.totalUnits > 0 && `${totals.totalUnits}u`}
                      {totals.totalUnits > 0 && totals.totalVolume > 0 && ' + '}
                      {totals.totalVolume > 0 && `${totals.totalVolume.toFixed(1)}ml`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${totals.totalCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
