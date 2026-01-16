'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Calendar,
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Info,
  RefreshCw,
} from 'lucide-react';
import useInventory from '@/hooks/useInventory';

interface LotOption {
  id: string;
  lotNumber: string;
  availableQuantity: number;
  expirationDate: string;
  daysUntilExpiration: number;
}

interface LotSelectorProps {
  productId: string;
  productName: string;
  requiredQuantity: number;
  selectedLotId?: string;
  selectedLotNumber?: string;
  onSelect: (lot: { lotId: string; lotNumber: string; expirationDate: string } | null) => void;
  showWarnings?: boolean;
  autoSelectFIFO?: boolean;
}

export function LotSelector({
  productId,
  productName,
  requiredQuantity,
  selectedLotId,
  selectedLotNumber,
  onSelect,
  showWarnings = true,
  autoSelectFIFO = true,
}: LotSelectorProps) {
  const { getProductStock, loading, error } = useInventory();
  const [lots, setLots] = useState<LotOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [stockStatus, setStockStatus] = useState<'loading' | 'available' | 'low' | 'out'>('loading');
  const [totalAvailable, setTotalAvailable] = useState(0);

  // Fetch available lots
  useEffect(() => {
    const fetchLots = async () => {
      const stock = await getProductStock(productId);

      if (!stock) {
        setStockStatus('out');
        setLots([]);
        return;
      }

      setLots(stock.lots);
      setTotalAvailable(stock.availableQuantity);

      if (stock.availableQuantity === 0) {
        setStockStatus('out');
      } else if (stock.availableQuantity < requiredQuantity) {
        setStockStatus('low');
      } else {
        setStockStatus('available');
      }

      // Auto-select FIFO lot if enabled and nothing selected
      if (autoSelectFIFO && !selectedLotId && stock.recommendedLot) {
        onSelect({
          lotId: stock.recommendedLot.id,
          lotNumber: stock.recommendedLot.lotNumber,
          expirationDate: stock.recommendedLot.expirationDate,
        });
      }
    };

    if (productId) {
      fetchLots();
    }
  }, [productId, requiredQuantity, autoSelectFIFO, getProductStock]);

  // Get expiration badge styling
  const getExpirationStyle = (days: number) => {
    if (days <= 7) return 'bg-red-100 text-red-700 border-red-200';
    if (days <= 30) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (days <= 90) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  // Get selected lot details
  const selectedLot = lots.find(l => l.id === selectedLotId);

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-500">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Loading inventory...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Stock Status Indicator */}
      {showWarnings && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Available Inventory</span>
          <span
            className={`font-medium ${
              stockStatus === 'out'
                ? 'text-red-600'
                : stockStatus === 'low'
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
          >
            {totalAvailable} available
          </span>
        </div>
      )}

      {/* Lot Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => lots.length > 0 && setIsOpen(!isOpen)}
          disabled={lots.length === 0}
          className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between ${
            lots.length === 0
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
              : selectedLotId
              ? 'bg-white border-gray-300 hover:border-purple-400'
              : 'bg-yellow-50 border-yellow-300 hover:border-yellow-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            {selectedLot ? (
              <div>
                <span className="font-medium text-gray-900">Lot: {selectedLot.lotNumber}</span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-sm text-gray-600">
                  Exp: {formatDate(selectedLot.expirationDate)}
                </span>
              </div>
            ) : lots.length === 0 ? (
              <span className="text-red-600">No inventory available</span>
            ) : (
              <span className="text-yellow-700">Select lot number</span>
            )}
          </div>
          {lots.length > 0 && <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {/* Dropdown */}
        {isOpen && lots.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {/* FIFO Header */}
              <div className="px-3 py-2 bg-purple-50 border-b border-purple-100">
                <div className="flex items-center gap-1.5 text-xs text-purple-700">
                  <Info className="w-3.5 h-3.5" />
                  Lots sorted by expiration (FIFO - first to expire shown first)
                </div>
              </div>

              {lots.map((lot, index) => {
                const isSelected = lot.id === selectedLotId;
                const hasEnough = lot.availableQuantity >= requiredQuantity;
                const isRecommended = index === 0;

                return (
                  <button
                    key={lot.id}
                    type="button"
                    onClick={() => {
                      onSelect({
                        lotId: lot.id,
                        lotNumber: lot.lotNumber,
                        expirationDate: lot.expirationDate,
                      });
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                      isSelected ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-gray-900">{lot.lotNumber}</span>
                        {isRecommended && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            FIFO
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {lot.availableQuantity} available
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(lot.expirationDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full border ${getExpirationStyle(
                          lot.daysUntilExpiration
                        )}`}
                      >
                        {lot.daysUntilExpiration <= 0
                          ? 'Expired'
                          : `${lot.daysUntilExpiration}d left`}
                      </span>
                      {!hasEnough && (
                        <span className="text-xs text-red-500">Insufficient</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Clear Selection */}
            {selectedLotId && (
              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(null);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 text-left"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Warnings */}
      {showWarnings && selectedLot && selectedLot.daysUntilExpiration <= 30 && (
        <div
          className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
            selectedLot.daysUntilExpiration <= 7
              ? 'bg-red-50 text-red-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium">
              {selectedLot.daysUntilExpiration <= 0
                ? 'This lot has expired!'
                : selectedLot.daysUntilExpiration <= 7
                ? `Expiring in ${selectedLot.daysUntilExpiration} days`
                : `Expiring soon (${selectedLot.daysUntilExpiration} days)`}
            </span>
            {selectedLot.daysUntilExpiration > 0 && (
              <p className="text-xs opacity-80 mt-0.5">
                Use this lot first to minimize waste
              </p>
            )}
          </div>
        </div>
      )}

      {/* Out of Stock Warning */}
      {stockStatus === 'out' && (
        <div className="flex items-start gap-2 px-3 py-2 bg-red-50 rounded-lg text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium">Out of stock</span>
            <p className="text-xs opacity-80 mt-0.5">
              {productName} is not available. Please receive inventory before treatment.
            </p>
          </div>
        </div>
      )}

      {/* Insufficient Stock Warning */}
      {stockStatus === 'low' && (
        <div className="flex items-start gap-2 px-3 py-2 bg-yellow-50 rounded-lg text-sm text-yellow-700">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium">Low inventory</span>
            <p className="text-xs opacity-80 mt-0.5">
              Only {totalAvailable} available. You requested {requiredQuantity}.
            </p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

export default LotSelector;
