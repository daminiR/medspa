/**
 * CollapsedSummaryFooter - Usage Example
 *
 * This component displays a minimal footer showing treatment totals.
 * It can be expanded to show full treatment breakdown.
 */

'use client'

import React, { useState } from 'react'
import { CollapsedSummaryFooter } from './CollapsedSummaryFooter'

export function CollapsedSummaryFooterExample() {
  const [isExpanded, setIsExpanded] = useState(false)

  // Example treatment data
  const exampleTreatments = [
    {
      productName: 'Botox',
      productType: 'neurotoxin' as const,
      totalUnits: 12,
      totalCost: 168
    },
    {
      productName: 'Juvederm',
      productType: 'filler' as const,
      totalVolume: 2.0,
      totalCost: 1300
    },
    {
      productName: 'Dysport',
      productType: 'neurotoxin' as const,
      totalUnits: 30,
      totalCost: 135
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Treatment Charting Page
        </h1>
        <p className="text-gray-600 mb-8">
          Scroll down to see the CollapsedSummaryFooter at the bottom of the page.
          Tap it to expand and see the full treatment breakdown.
        </p>

        {/* Your charting UI would go here */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Face Chart</h2>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Face chart component would go here</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Injection Details</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Injection details would go here</p>
          </div>
        </div>
      </div>

      {/* The CollapsedSummaryFooter is fixed to the bottom */}
      <CollapsedSummaryFooter
        treatments={exampleTreatments}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
      />
    </div>
  )
}

/**
 * INTEGRATION NOTES:
 *
 * 1. Import the component:
 *    import { CollapsedSummaryFooter } from '@/components/charting/CollapsedSummaryFooter'
 *
 * 2. Add state for expand/collapse:
 *    const [isFooterExpanded, setIsFooterExpanded] = useState(false)
 *
 * 3. Calculate your treatment data from injection points:
 *    const treatments = useMemo(() => {
 *      // Calculate from your injection points
 *      return [
 *        {
 *          productName: 'Botox',
 *          productType: 'neurotoxin',
 *          totalUnits: calculateTotalUnits(),
 *          totalCost: calculateCost()
 *        }
 *      ]
 *    }, [injectionPoints])
 *
 * 4. Render at the bottom of your page:
 *    <CollapsedSummaryFooter
 *      treatments={treatments}
 *      isExpanded={isFooterExpanded}
 *      onToggleExpanded={() => setIsFooterExpanded(!isFooterExpanded)}
 *    />
 *
 * 5. Add padding to your page content to prevent overlap:
 *    <div className="pb-24"> // Adds space for collapsed footer
 *      {/* Your page content *\/}
 *    </div>
 */
