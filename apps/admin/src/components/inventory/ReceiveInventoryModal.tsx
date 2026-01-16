'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Barcode,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  Check,
  Trash2,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Product, Vendor } from '@/types/inventory';
import BarcodeScanner from './BarcodeScanner';

interface ReceiveItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  lotNumber: string;
  expirationDate: string;
  unitCost: number;
  manufacturingDate?: string;
  serialNumber?: string;
}

interface ReceiveInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReceiveInventoryModal({ isOpen, onClose, onSuccess }: ReceiveInventoryModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ReceiveItem[]>([]);

  const [showScanner, setShowScanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Fetch products and vendors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes] = await Promise.all([
          fetch('/api/inventory/products?injectablesOnly=true'),
        ]);

        const productsData = await productsRes.json();

        if (productsData.success) {
          setProducts(productsData.data.products);
        }

        // Mock vendors for now
        setVendors([
          { id: 'vendor-allergan', name: 'Allergan Aesthetics', shortName: 'Allergan' } as Vendor,
          { id: 'vendor-galderma', name: 'Galderma', shortName: 'Galderma' } as Vendor,
          { id: 'vendor-merz', name: 'Merz Aesthetics', shortName: 'Merz' } as Vendor,
          { id: 'vendor-revance', name: 'Revance Therapeutics', shortName: 'Revance' } as Vendor,
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Add item to list
  const addItem = (product: Product) => {
    const newItem: ReceiveItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      productName: product.displayName || product.name,
      quantity: 1,
      lotNumber: '',
      expirationDate: '',
      unitCost: product.costPrice / (product.unitsPerPackage || 1),
    };
    setItems([...items, newItem]);
    setShowProductSearch(false);
    setSearchQuery('');
  };

  // Update item
  const updateItem = (id: string, field: keyof ReceiveItem, value: string | number) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  // Remove item
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Handle barcode scan
  const handleBarcodeScan = (data: {
    gtin?: string;
    lotNumber?: string;
    expirationDate?: Date;
    serialNumber?: string;
    rawCode: string;
  }) => {
    // Find product by GTIN
    const product = products.find(p => p.gtin === data.gtin || p.upc === data.gtin);

    if (product) {
      const newItem: ReceiveItem = {
        id: `item-${Date.now()}`,
        productId: product.id,
        productName: product.displayName || product.name,
        quantity: 1,
        lotNumber: data.lotNumber || '',
        expirationDate: data.expirationDate
          ? data.expirationDate.toISOString().split('T')[0]
          : '',
        unitCost: product.costPrice / (product.unitsPerPackage || 1),
        serialNumber: data.serialNumber,
      };
      setItems([...items, newItem]);
      toast.success(`Added ${product.displayName}`);
    } else if (data.lotNumber) {
      // If we can't find the product but have lot info, prompt to select product
      toast.success(
        `Lot ${data.lotNumber} scanned. Please select the product to apply this information.`
      );
      // Store scanned data for later use
      setShowProductSearch(true);
    } else {
      toast.error('Product not found. Please add manually.');
    }

    setShowScanner(false);
  };

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  // Validate form
  const isValid = items.length > 0 && items.every(item => item.lotNumber && item.expirationDate);

  // Submit
  const handleSubmit = async () => {
    if (!isValid) {
      toast.error('Please fill in all required fields (lot number and expiration date)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            lotNumber: item.lotNumber,
            expirationDate: new Date(item.expirationDate),
            unitCost: item.unitCost,
            manufacturingDate: item.manufacturingDate
              ? new Date(item.manufacturingDate)
              : undefined,
            serialNumber: item.serialNumber,
          })),
          locationId: 'loc-1',
          receivedBy: 'current-user',
          purchaseOrderId: purchaseOrderNumber || undefined,
          notes: notes || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully received ${totalItems} items`);
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Failed to receive inventory');
      }
    } catch (error) {
      console.error('Error receiving inventory:', error);
      toast.error('Failed to receive inventory');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products by search
  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Receive Inventory</h2>
            <p className="text-sm text-gray-500">Add received products to inventory</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Vendor & PO */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor (Optional)
              </label>
              <select
                value={selectedVendor}
                onChange={e => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select vendor...</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Number (Optional)
              </label>
              <input
                type="text"
                value={purchaseOrderNumber}
                onChange={e => setPurchaseOrderNumber(e.target.value)}
                placeholder="e.g., PO-2024-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Add Items Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Items to Receive</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowScanner(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  <Barcode className="w-4 h-4 mr-1" />
                  Scan
                </button>
                <button
                  onClick={() => setShowProductSearch(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Product Search Dropdown */}
            {showProductSearch && (
              <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-2 bg-gray-50 border-b">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addItem(product)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {product.displayName || product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.brand} · {product.sku}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="px-4 py-3 text-sm text-gray-500 text-center">No products found</p>
                  )}
                </div>
                <div className="p-2 border-t bg-gray-50">
                  <button
                    onClick={() => {
                      setShowProductSearch(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            {items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No items added yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Scan a barcode or add products manually
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <p className="text-xs text-gray-500">Item #{index + 1}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Quantity */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              updateItem(item.id, 'quantity', Math.max(1, item.quantity - 1))
                            }
                            className="p-1 border border-gray-300 rounded-l-lg hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e =>
                              updateItem(
                                item.id,
                                'quantity',
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            className="w-16 px-2 py-1 text-center border-y border-gray-300 focus:outline-none"
                          />
                          <button
                            onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                            className="p-1 border border-gray-300 rounded-r-lg hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Unit Cost */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Unit Cost</label>
                        <div className="relative">
                          <DollarSign className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitCost}
                            onChange={e =>
                              updateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)
                            }
                            className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>
                      </div>

                      {/* Lot Number */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Lot Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.lotNumber}
                          onChange={e => updateItem(item.id, 'lotNumber', e.target.value)}
                          placeholder="e.g., C3709C3"
                          className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm ${
                            !item.lotNumber ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>

                      {/* Expiration Date */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Expiration Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={item.expirationDate}
                          onChange={e => updateItem(item.id, 'expirationDate', e.target.value)}
                          className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-purple-500 text-sm ${
                            !item.expirationDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                      <span className="text-gray-500">Line Total</span>
                      <span className="font-medium text-gray-900">
                        ${(item.quantity * item.unitCost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional notes about this receipt..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* Summary */}
          {items.length > 0 && (
            <div className="flex justify-between text-sm mb-4 pb-4 border-b border-gray-200">
              <span className="text-gray-600">
                Total: {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
              <span className="font-semibold text-gray-900">${totalCost.toFixed(2)}</span>
            </div>
          )}

          {/* Validation Warning */}
          {items.length > 0 && !isValid && (
            <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg mb-4 text-sm">
              <AlertCircle className="w-4 h-4" />
              Please fill in lot number and expiration date for all items
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Receiving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Receive Inventory
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner isOpen={showScanner} onClose={() => setShowScanner(false)} onScan={handleBarcodeScan} />
    </>
  );
}

export default ReceiveInventoryModal;
