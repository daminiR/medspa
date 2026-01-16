// useInventory Hook - Connect charting to inventory management
// Provides inventory lookup, validation, and auto-deduction functionality

import { useState, useCallback } from 'react';
import { InventoryDeductionResponse, StockStatus } from '@/types/inventory';

interface ProductStock {
  productId: string;
  productName: string;
  availableQuantity: number;
  status: StockStatus;
  lots: {
    id: string;
    lotNumber: string;
    availableQuantity: number;
    expirationDate: string;
    daysUntilExpiration: number;
  }[];
  earliestExpiration?: string;
  recommendedLot?: {
    id: string;
    lotNumber: string;
    expirationDate: string;
  };
}

interface DeductionResult {
  success: boolean;
  lotUsed?: {
    lotId: string;
    lotNumber: string;
    quantityDeducted: number;
    remainingInLot: number;
  };
  productStock?: {
    productId: string;
    totalAvailable: number;
    status: StockStatus;
  };
  alerts?: {
    type: string;
    severity: string;
    message: string;
  }[];
  error?: string;
}

export function useInventory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get stock level for a specific product
  const getProductStock = useCallback(
    async (productId: string, locationId?: string): Promise<ProductStock | null> => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          productId,
          includeLots: 'true',
        });
        if (locationId) params.append('locationId', locationId);

        const response = await fetch(`/api/inventory/lots?${params.toString()}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch inventory');
        }

        const lots = result.data.lots || [];
        const availableLots = lots.filter(
          (lot: { status: string; availableQuantity: number }) =>
            lot.status === 'available' && lot.availableQuantity > 0
        );

        if (availableLots.length === 0) {
          return {
            productId,
            productName: lots[0]?.productName || 'Unknown',
            availableQuantity: 0,
            status: 'out_of_stock',
            lots: [],
          };
        }

        // Sort by expiration date (FIFO)
        availableLots.sort(
          (a: { expirationDate: string }, b: { expirationDate: string }) =>
            new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
        );

        const totalAvailable = availableLots.reduce(
          (sum: number, lot: { availableQuantity: number }) => sum + lot.availableQuantity,
          0
        );

        const now = new Date();
        const enrichedLots = availableLots.map((lot: {
          id: string;
          lotNumber: string;
          availableQuantity: number;
          expirationDate: string;
        }) => ({
          id: lot.id,
          lotNumber: lot.lotNumber,
          availableQuantity: lot.availableQuantity,
          expirationDate: lot.expirationDate,
          daysUntilExpiration: Math.ceil(
            (new Date(lot.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          ),
        }));

        return {
          productId,
          productName: lots[0]?.productName || 'Unknown',
          availableQuantity: totalAvailable,
          status: totalAvailable > 0 ? 'in_stock' : 'out_of_stock',
          lots: enrichedLots,
          earliestExpiration: availableLots[0]?.expirationDate,
          recommendedLot: availableLots[0]
            ? {
                id: availableLots[0].id,
                lotNumber: availableLots[0].lotNumber,
                expirationDate: availableLots[0].expirationDate,
              }
            : undefined,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Validate if quantity is available
  const validateQuantity = useCallback(
    async (
      productId: string,
      quantity: number,
      locationId?: string
    ): Promise<{
      valid: boolean;
      available: number;
      message?: string;
    }> => {
      const stock = await getProductStock(productId, locationId);

      if (!stock) {
        return {
          valid: false,
          available: 0,
          message: 'Could not verify inventory',
        };
      }

      if (stock.availableQuantity === 0) {
        return {
          valid: false,
          available: 0,
          message: `${stock.productName} is out of stock`,
        };
      }

      if (stock.availableQuantity < quantity) {
        return {
          valid: false,
          available: stock.availableQuantity,
          message: `Only ${stock.availableQuantity} available (requested ${quantity})`,
        };
      }

      return {
        valid: true,
        available: stock.availableQuantity,
      };
    },
    [getProductStock]
  );

  // Deduct inventory from treatment
  const deductInventory = useCallback(
    async (params: {
      productId: string;
      quantity: number;
      lotId?: string;
      appointmentId: string;
      patientId: string;
      practitionerId: string;
      treatmentDetails?: {
        serviceName: string;
        areasInjected?: { name: string; units: number }[];
        chartId?: string;
        notes?: string;
      };
    }): Promise<DeductionResult> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/inventory/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...params,
            performedBy: params.practitionerId,
          }),
        });

        const result: InventoryDeductionResponse = await response.json();

        if (!result.success) {
          return {
            success: false,
            error: result.error || 'Failed to deduct inventory',
          };
        }

        return {
          success: true,
          lotUsed: result.lotUsed,
          productStock: result.productStock,
          alerts: result.alerts?.map(alert => ({
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
          })),
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return {
          success: false,
          error: message,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get lot info for display on charts/invoices
  const getLotInfo = useCallback(
    async (
      productId: string
    ): Promise<{
      lotNumber: string;
      expirationDate: string;
    } | null> => {
      const stock = await getProductStock(productId);
      if (!stock || !stock.recommendedLot) {
        return null;
      }

      return {
        lotNumber: stock.recommendedLot.lotNumber,
        expirationDate: stock.recommendedLot.expirationDate,
      };
    },
    [getProductStock]
  );

  // Check for expiring products that need attention
  const checkExpiringProducts = useCallback(
    async (
      daysThreshold = 30
    ): Promise<
      {
        productId: string;
        productName: string;
        lotNumber: string;
        quantity: number;
        expirationDate: string;
        daysRemaining: number;
      }[]
    > => {
      try {
        const response = await fetch(
          `/api/inventory/lots?expiringWithinDays=${daysThreshold}&status=available`
        );
        const result = await response.json();

        if (!result.success) {
          return [];
        }

        const now = new Date();
        return result.data.lots.map((lot: {
          productId: string;
          productName: string;
          lotNumber: string;
          currentQuantity: number;
          expirationDate: string;
        }) => ({
          productId: lot.productId,
          productName: lot.productName,
          lotNumber: lot.lotNumber,
          quantity: lot.currentQuantity,
          expirationDate: lot.expirationDate,
          daysRemaining: Math.ceil(
            (new Date(lot.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          ),
        }));
      } catch {
        return [];
      }
    },
    []
  );

  return {
    loading,
    error,
    getProductStock,
    validateQuantity,
    deductInventory,
    getLotInfo,
    checkExpiringProducts,
  };
}

export default useInventory;
