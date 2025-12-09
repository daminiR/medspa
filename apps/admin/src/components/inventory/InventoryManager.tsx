'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle, TrendingDown, Plus, Minus, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface InventoryItem {
  id: string
  name: string
  brand: string
  type: 'neurotoxin' | 'filler' | 'skincare' | 'other'
  currentStock: number
  unitType: string
  reorderPoint: number
  lastUpdated: Date
  lotNumbers: {
    number: string
    quantity: number
    expirationDate: Date
  }[]
}

// Mock inventory data
const mockInventory: InventoryItem[] = [
  {
    id: 'botox-100',
    name: 'Botox® Cosmetic',
    brand: 'Allergan',
    type: 'neurotoxin',
    currentStock: 850,
    unitType: 'units',
    reorderPoint: 200,
    lastUpdated: new Date('2025-08-26'),
    lotNumbers: [
      { number: 'LOT2024ABC123', quantity: 500, expirationDate: new Date('2025-12-31') },
      { number: 'LOT2024DEF456', quantity: 350, expirationDate: new Date('2026-01-31') }
    ]
  },
  {
    id: 'dysport-300',
    name: 'Dysport®',
    brand: 'Galderma',
    type: 'neurotoxin',
    currentStock: 1200,
    unitType: 'units',
    reorderPoint: 600,
    lastUpdated: new Date('2025-08-26'),
    lotNumbers: [
      { number: 'DSP2024789', quantity: 1200, expirationDate: new Date('2025-11-30') }
    ]
  },
  {
    id: 'juvederm-ultra',
    name: 'Juvéderm® Ultra XC',
    brand: 'Allergan',
    type: 'filler',
    currentStock: 24,
    unitType: 'syringes',
    reorderPoint: 10,
    lastUpdated: new Date('2025-08-25'),
    lotNumbers: [
      { number: 'JUV2024XC001', quantity: 12, expirationDate: new Date('2027-06-30') },
      { number: 'JUV2024XC002', quantity: 12, expirationDate: new Date('2027-08-31') }
    ]
  },
  {
    id: 'restylane-l',
    name: 'Restylane®-L',
    brand: 'Galderma',
    type: 'filler',
    currentStock: 8,
    unitType: 'syringes',
    reorderPoint: 10,
    lastUpdated: new Date('2025-08-24'),
    lotNumbers: [
      { number: 'RST2024L100', quantity: 8, expirationDate: new Date('2027-03-31') }
    ]
  }
]

export function InventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Simulate inventory deduction
  const deductInventory = (itemId: string, quantity: number, lotNumber?: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.currentStock - quantity)
        
        // Update lot numbers if specified
        if (lotNumber) {
          const newLots = item.lotNumbers.map(lot => {
            if (lot.number === lotNumber) {
              return { ...lot, quantity: Math.max(0, lot.quantity - quantity) }
            }
            return lot
          })
          
          return {
            ...item,
            currentStock: newStock,
            lastUpdated: new Date(),
            lotNumbers: newLots
          }
        }
        
        return {
          ...item,
          currentStock: newStock,
          lastUpdated: new Date()
        }
      }
      return item
    }))
    
    toast.success(`Deducted ${quantity} ${inventory.find(i => i.id === itemId)?.unitType} from inventory`)
  }

  // Check for low stock
  const getLowStockItems = () => {
    return inventory.filter(item => item.currentStock <= item.reorderPoint)
  }

  // Check for expiring lots
  const getExpiringLots = () => {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    return inventory.flatMap(item => 
      item.lotNumbers
        .filter(lot => lot.expirationDate <= thirtyDaysFromNow)
        .map(lot => ({ ...lot, itemName: item.name }))
    )
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Stock Alert */}
        {getLowStockItems().length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{getLowStockItems().length} items below reorder point:</p>
                  <ul className="mt-1 list-disc list-inside">
                    {getLowStockItems().map(item => (
                      <li key={item.id}>
                        {item.name}: {item.currentStock} {item.unitType} remaining
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expiring Lots Alert */}
        {getExpiringLots().length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Expiring Soon</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{getExpiringLots().length} lots expiring within 30 days:</p>
                  <ul className="mt-1 list-disc list-inside">
                    {getExpiringLots().map((lot, index) => (
                      <li key={index}>
                        {lot.itemName} - Lot {lot.number}: Expires {lot.expirationDate.toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Current Inventory</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Real-time tracking with automatic deduction on treatment completion
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder Point
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.brand}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {item.currentStock} {item.unitType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.reorderPoint} {item.unitType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.currentStock <= item.reorderPoint ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Low Stock
                      </span>
                    ) : item.currentStock <= item.reorderPoint * 2 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Normal
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Well Stocked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastUpdated.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{selectedItem.name}</h3>
              <p className="text-sm text-gray-500">{selectedItem.brand}</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {/* Stock Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Stock Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Stock:</span>
                    <span className="font-medium">{selectedItem.currentStock} {selectedItem.unitType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reorder Point:</span>
                    <span className="font-medium">{selectedItem.reorderPoint} {selectedItem.unitType}</span>
                  </div>
                </div>
              </div>

              {/* Lot Numbers */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Lot Numbers</h4>
                <div className="space-y-2">
                  {selectedItem.lotNumbers.map((lot, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{lot.number}</p>
                          <p className="text-xs text-gray-500">
                            Expires: {lot.expirationDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{lot.quantity} {selectedItem.unitType}</p>
                          <button
                            onClick={() => {
                              deductInventory(selectedItem.id, 10, lot.number)
                              setSelectedItem(null)
                            }}
                            className="mt-1 text-xs text-purple-600 hover:text-purple-700"
                          >
                            Test Deduct 10
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}