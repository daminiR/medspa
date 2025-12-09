'use client'

import { useInvoice } from '@/contexts/InvoiceContext'
import { 
  X, 
  Trash2, 
  Edit2, 
  Plus, 
  CreditCard, 
  DollarSign,
  FileText,
  Calendar,
  User,
  MapPin,
  Syringe,
  Package,
  ShoppingBag,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'

interface InvoiceViewProps {
  onClose?: () => void
  onAddItem?: () => void
  onPayment?: () => void
}

export function InvoiceView({ onClose, onAddItem, onPayment }: InvoiceViewProps) {
  const { currentInvoice, removeLineItem, updateInvoice } = useInvoice()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [discount, setDiscount] = useState(0)
  const [tip, setTip] = useState(0)
  
  if (!currentInvoice) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Invoice</h3>
        <p className="text-sm text-gray-500">Start by adding services or products to create an invoice.</p>
      </div>
    )
  }
  
  const toggleItemExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }
  
  const handleDiscountChange = (value: number) => {
    setDiscount(value)
    updateInvoice({ discount: value })
  }
  
  const handleTipChange = (value: number) => {
    setTip(value)
    updateInvoice({ tip: value })
  }
  
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'injectable':
        return <Syringe className="w-4 h-4" />
      case 'product':
        return <Package className="w-4 h-4" />
      default:
        return <ShoppingBag className="w-4 h-4" />
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Invoice #{currentInvoice.id}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {currentInvoice.patientName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(currentInvoice.createdAt).toLocaleDateString()}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                currentInvoice.status === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : currentInvoice.status === 'partial'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentInvoice.status}
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>
      
      {/* Line Items */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700">Line Items</h3>
          {onAddItem && (
            <button
              onClick={onAddItem}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {currentInvoice.lineItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg">
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.metadata?.productType && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            item.metadata.productType === 'neurotoxin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}>
                            {item.metadata.productType}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      
                      {/* Metadata Preview */}
                      {item.metadata && (item.metadata.zones?.length || item.metadata.customPoints?.length) && (
                        <button
                          onClick={() => toggleItemExpanded(item.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 mt-2 hover:text-gray-700"
                        >
                          {expandedItems.has(item.id) ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                          View injection details
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                      <p className="font-semibold text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="p-1 hover:bg-red-50 rounded text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Expanded Metadata */}
                {expandedItems.has(item.id) && item.metadata && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {item.metadata.zones && item.metadata.zones.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Injection Zones:</p>
                          <div className="space-y-1">
                            {item.metadata.zones.map(zone => (
                              <div key={zone.id} className="flex justify-between text-xs">
                                <span className="text-gray-600">{zone.name}</span>
                                <span className="font-medium">{zone.units}u</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.metadata.customPoints && item.metadata.customPoints.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Custom Points:</p>
                          <div className="space-y-1">
                            {item.metadata.customPoints.map(point => (
                              <div key={point.id} className="flex justify-between text-xs">
                                <span className="text-gray-600">{point.label || 'Custom'}</span>
                                <span className="font-medium">{point.units}u</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {item.metadata.lotNumber && (
                        <div>
                          <p className="font-medium text-gray-700">Lot #:</p>
                          <p className="text-gray-600">{item.metadata.lotNumber}</p>
                        </div>
                      )}
                      
                      {item.metadata.expirationDate && (
                        <div>
                          <p className="font-medium text-gray-700">Expires:</p>
                          <p className="text-gray-600">{item.metadata.expirationDate}</p>
                        </div>
                      )}
                    </div>
                    
                    {item.metadata.notes && (
                      <div className="mt-2">
                        <p className="font-medium text-gray-700 text-sm">Notes:</p>
                        <p className="text-gray-600 text-xs mt-1">{item.metadata.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {currentInvoice.lineItems.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No items added yet</p>
            {onAddItem && (
              <button
                onClick={onAddItem}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700"
              >
                Add your first item
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Totals */}
      {currentInvoice.lineItems.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${currentInvoice.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (8.25%)</span>
              <span className="font-medium">${currentInvoice.tax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-right border border-gray-300 rounded"
                placeholder="0.00"
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tip</span>
              <input
                type="number"
                value={tip}
                onChange={(e) => handleTipChange(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-right border border-gray-300 rounded"
                placeholder="0.00"
              />
            </div>
            
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Total</span>
              <span className="text-green-600">${currentInvoice.total.toFixed(2)}</span>
            </div>
          </div>
          
          {onPayment && (
            <button
              onClick={onPayment}
              className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Process Payment
            </button>
          )}
        </div>
      )}
    </div>
  )
}