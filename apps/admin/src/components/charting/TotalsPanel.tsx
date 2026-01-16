'use client'

import React from 'react'
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react'

interface TotalsPanelProps {
  productType: 'neurotoxin' | 'filler'
  totalUnits: number
  totalVolume: number
  totalSites: number
  estimatedCost: number
  regionTotals: {
    'upper-face': { units: number; volume: number; sites: number }
    'periorbital': { units: number; volume: number; sites: number }
    'mid-face': { units: number; volume: number; sites: number }
    'lower-face': { units: number; volume: number; sites: number }
  }
  freehandCount: number
  isExpanded: boolean
  onToggleExpanded: () => void
}

export function TotalsPanel({
  productType,
  totalUnits,
  totalVolume,
  totalSites,
  estimatedCost,
  regionTotals,
  freehandCount,
  isExpanded,
  onToggleExpanded
}: TotalsPanelProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-w-[280px] z-50">
      {/* Header */}
      <button
        onClick={onToggleExpanded}
        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
          productType === 'neurotoxin'
            ? 'bg-purple-50 hover:bg-purple-100'
            : 'bg-pink-50 hover:bg-pink-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Treatment Total</div>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>

      {/* Main Total */}
      <div className={`px-4 py-3 ${productType === 'neurotoxin' ? 'bg-purple-50' : 'bg-pink-50'}`}>
        <div className={`text-4xl font-bold ${productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'}`}>
          {productType === 'neurotoxin' ? `${totalUnits}u` : `${totalVolume.toFixed(1)}ml`}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {totalSites} injection site{totalSites !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 py-3 space-y-3">
          {/* Estimated Cost */}
          {estimatedCost > 0 && (
            <div className="pb-3 border-b border-gray-100">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estimated Cost</div>
              <div className="text-2xl font-semibold text-gray-900">
                ${estimatedCost.toFixed(2)}
              </div>
            </div>
          )}

          {/* Region Breakdown */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-medium">By Region</div>
            <div className="space-y-2">
              {/* Upper Face */}
              {regionTotals['upper-face'].sites > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Upper Face</span>
                  <span className={`font-semibold ${productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'}`}>
                    {productType === 'neurotoxin'
                      ? `${regionTotals['upper-face'].units}u`
                      : `${regionTotals['upper-face'].volume.toFixed(1)}ml`
                    }
                  </span>
                </div>
              )}

              {/* Periorbital */}
              {regionTotals['periorbital'].sites > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Periorbital</span>
                  <span className={`font-semibold ${productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'}`}>
                    {productType === 'neurotoxin'
                      ? `${regionTotals['periorbital'].units}u`
                      : `${regionTotals['periorbital'].volume.toFixed(1)}ml`
                    }
                  </span>
                </div>
              )}

              {/* Mid Face */}
              {regionTotals['mid-face'].sites > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Mid Face</span>
                  <span className={`font-semibold ${productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'}`}>
                    {productType === 'neurotoxin'
                      ? `${regionTotals['mid-face'].units}u`
                      : `${regionTotals['mid-face'].volume.toFixed(1)}ml`
                    }
                  </span>
                </div>
              )}

              {/* Lower Face */}
              {regionTotals['lower-face'].sites > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Lower Face</span>
                  <span className={`font-semibold ${productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'}`}>
                    {productType === 'neurotoxin'
                      ? `${regionTotals['lower-face'].units}u`
                      : `${regionTotals['lower-face'].volume.toFixed(1)}ml`
                    }
                  </span>
                </div>
              )}

              {/* Freehand Points */}
              {freehandCount > 0 && (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    Custom Points
                  </span>
                  <span className="text-gray-500 text-xs">
                    {freehandCount} site{freehandCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
