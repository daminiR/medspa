'use client'

/**
 * FloatingToolbar Integration Example
 *
 * This file demonstrates how to integrate the FloatingToolbar component
 * with the charting system. Copy this pattern into your charting pages.
 */

import React, { useState, useMemo } from 'react'
import { FloatingToolbar } from './FloatingToolbar'
import { useChartingSettings } from '@/contexts/ChartingSettingsContext'

// ============================================================================
// EXAMPLE INTEGRATION WITH CHARTING PAGE
// ============================================================================

export function ChartingPageWithFloatingToolbar() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [showToolbar, setShowToolbar] = useState(true)
  const [selectedProductId, setSelectedProductId] = useState<string>()
  const [selectedDosage, setSelectedDosage] = useState<number>()
  const [selectedColor, setSelectedColor] = useState('#9333EA') // Default purple
  const [productType, setProductType] = useState<'neurotoxin' | 'filler'>('neurotoxin')

  // Get charting settings for product presets
  const { settings } = useChartingSettings()

  // ============================================================================
  // PRODUCT DATA
  // ============================================================================

  // Mock product data - in production, this would come from inventory
  const mockProducts = [
    {
      id: 'botox-cosmetic',
      name: 'Cosmetic',
      brand: 'Botox',
      type: 'neurotoxin' as const
    },
    {
      id: 'dysport',
      name: 'Dysport',
      brand: 'Dysport',
      type: 'neurotoxin' as const
    },
    {
      id: 'juvederm-ultra',
      name: 'Ultra Plus',
      brand: 'Juvederm',
      type: 'filler' as const
    },
    {
      id: 'juvederm-voluma',
      name: 'Voluma XC',
      brand: 'Juvederm',
      type: 'filler' as const
    },
    {
      id: 'restylane-lyft',
      name: 'Lyft',
      brand: 'Restylane',
      type: 'filler' as const
    },
    {
      id: 'radiesse',
      name: 'Radiesse',
      brand: 'Radiesse',
      type: 'biostimulator' as const
    }
  ]

  // Filter products by current product type
  const availableProducts = useMemo(() => {
    return mockProducts.filter(p =>
      productType === 'neurotoxin'
        ? p.type === 'neurotoxin'
        : p.type === 'filler' || p.type === 'biostimulator'
    )
  }, [productType])

  // ============================================================================
  // DOSAGE OPTIONS
  // ============================================================================

  const dosageOptions = useMemo(() => {
    if (productType === 'neurotoxin') {
      // Units for neurotoxins
      return [1, 2, 4, 5, 10, 15, 20, 25]
    } else {
      // ml for fillers
      return [0.1, 0.2, 0.25, 0.5, 0.75, 1.0, 1.5, 2.0]
    }
  }, [productType])

  // ============================================================================
  // COLOR OPTIONS
  // ============================================================================

  const colorOptions = [
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

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId)
    console.log('Product selected:', productId)
    // In production:
    // - Update active product in charting context
    // - Load product-specific settings (default depth, technique, etc.)
    // - Update inventory tracking
  }

  const handleDosageSelect = (dosage: number) => {
    setSelectedDosage(dosage)
    console.log('Dosage selected:', dosage, productType === 'neurotoxin' ? 'units' : 'ml')
    // In production:
    // - Apply dosage to selected injection point
    // - Update totals calculation
    // - Trigger inventory deduction preview
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    console.log('Color selected:', color)
    // In production:
    // - Update drawing tool color
    // - Apply to annotation markers
    // - Save as user preference
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            FloatingToolbar Integration Example
          </h1>

          <div className="flex items-center gap-4">
            {/* Product Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setProductType('neurotoxin')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  productType === 'neurotoxin'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Neurotoxin
              </button>
              <button
                onClick={() => setProductType('filler')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  productType === 'filler'
                    ? 'bg-white text-pink-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Filler
              </button>
            </div>

            {/* Show/Hide Toolbar Toggle */}
            <button
              onClick={() => setShowToolbar(!showToolbar)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showToolbar
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showToolbar ? 'Hide' : 'Show'} Toolbar
            </button>
          </div>
        </div>
      </div>

      {/* Demo Content Area */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Charting Canvas
            </h2>
            <p className="text-gray-600 mb-8">
              This is where your face chart, body chart, or 3D model would appear.
            </p>

            {/* Current Selections Display */}
            <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Current Selections</h3>
              <div className="space-y-2 text-sm text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">
                    {selectedProductId
                      ? availableProducts.find(p => p.id === selectedProductId)?.brand + ' ' +
                        availableProducts.find(p => p.id === selectedProductId)?.name
                      : 'None selected'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dosage:</span>
                  <span className="font-medium">
                    {selectedDosage
                      ? `${selectedDosage} ${productType === 'neurotoxin' ? 'units' : 'ml'}`
                      : 'None selected'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Color:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="font-medium font-mono text-xs">
                      {selectedColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toolbar */}
      {showToolbar && (
        <FloatingToolbar
          products={availableProducts}
          selectedProductId={selectedProductId}
          onProductSelect={handleProductSelect}
          dosageType={productType === 'neurotoxin' ? 'units' : 'ml'}
          dosageOptions={dosageOptions}
          selectedDosage={selectedDosage}
          onDosageSelect={handleDosageSelect}
          colorOptions={colorOptions}
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
          autoHideDelay={3000}
          initialPosition={{ x: 20, y: 100 }}
          onClose={() => setShowToolbar(false)}
        />
      )}
    </div>
  )
}

// ============================================================================
// INTEGRATION NOTES
// ============================================================================

/**
 * To integrate the FloatingToolbar into your existing charting pages:
 *
 * 1. Import the component:
 *    ```tsx
 *    import { FloatingToolbar } from '@/components/charting'
 *    ```
 *
 * 2. Add state management:
 *    ```tsx
 *    const [selectedProductId, setSelectedProductId] = useState<string>()
 *    const [selectedDosage, setSelectedDosage] = useState<number>()
 *    const [selectedColor, setSelectedColor] = useState('#9333EA')
 *    ```
 *
 * 3. Connect to your product inventory:
 *    ```tsx
 *    const products = useInventory().products.filter(p => p.injectableDetails)
 *    ```
 *
 * 4. Render the toolbar:
 *    ```tsx
 *    <FloatingToolbar
 *      products={products}
 *      selectedProductId={selectedProductId}
 *      onProductSelect={(id) => {
 *        setSelectedProductId(id)
 *        // Apply product to current injection point
 *      }}
 *      // ... other props
 *    />
 *    ```
 *
 * 5. Auto-hide behavior:
 *    - Toolbar automatically fades after 3 seconds of inactivity
 *    - Reappears on hover or touch
 *    - Can be manually hidden/shown with onClose prop
 *
 * 6. Draggable positioning:
 *    - Click and drag the header to reposition
 *    - Position is constrained to viewport bounds
 *    - Touch-friendly for tablet use
 *
 * 7. Responsive design:
 *    - Minimum button size: 48px (WCAG touch target)
 *    - Works on mobile, tablet, and desktop
 *    - Optimized for Apple Pencil on iPad
 *
 * 8. Accessibility:
 *    - All buttons have proper aria-labels
 *    - Keyboard navigation supported
 *    - High contrast color indicators
 */
