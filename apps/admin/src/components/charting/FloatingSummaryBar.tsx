'use client';

import React from 'react';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';

interface InjectionPoint {
  id: string;
  x: number;
  y: number;
  productId: string;
  units: number;
  depth?: string;
  technique?: string;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  pricePerUnit: number;
  type: 'toxin' | 'filler' | 'other';
  unitLabel: string;
  color?: string;
}

interface FloatingSummaryBarProps {
  injectionPoints: InjectionPoint[];
  products: Product[];
  // Legacy props kept for backwards compatibility but no longer used
  onToggleExpand?: (expanded: boolean) => void;
  isExpanded?: boolean;
  defaultCollapsed?: boolean;
}

interface ProductSummary {
  productId: string;
  name: string;
  shortName: string;
  totalUnits: number;
  totalCost: number;
  unitLabel: string;
  pointCount: number;
  color?: string;
}

// Product name abbreviations for ultra-compact display
const PRODUCT_ABBREVIATIONS: Record<string, string> = {
  'Botox': 'BTX',
  'Dysport': 'DYS',
  'Xeomin': 'XEO',
  'Jeuveau': 'JEU',
  'Juvederm': 'JUV',
  'Restylane': 'RST',
  'Sculptra': 'SCP',
  'Radiesse': 'RAD',
  'Belotero': 'BEL',
  'Versa': 'VRS',
  'RHA': 'RHA',
  'Kybella': 'KYB',
};

/**
 * Ultra-Compact Treatment Summary Indicator - Fixed Position (Bottom-Left)
 *
 * Per PRACTITIONER_CONTEXT.md:
 * - Reference/viewing items belong on the LEFT side
 * - Always visible during treatments - no toggling required
 * - Practitioners need to glance at totals without interaction
 * - "If a practitioner is mid-treatment, will this help or interrupt?"
 *
 * Design MATCHES ZoomPanControls exactly:
 * - Same size, same styling, same feel
 * - Ultra-compact: "BTX: 40u | DYS: 60u | $450"
 * - No expand button, no popups, no interaction needed
 * - Just a glanceable indicator like the zoom percentage
 */
export function FloatingSummaryBar({
  injectionPoints,
  products,
}: FloatingSummaryBarProps) {
  const productSummaries: ProductSummary[] = React.useMemo(() => {
    const summaryMap = new Map<string, ProductSummary>();

    injectionPoints.forEach((point) => {
      const product = products.find((p) => p.id === point.productId);
      if (!product) return;

      const existing = summaryMap.get(point.productId);
      if (existing) {
        existing.totalUnits += point.units;
        existing.totalCost += point.units * product.pricePerUnit;
        existing.pointCount += 1;
      } else {
        // Find abbreviation for product name
        const shortName = Object.entries(PRODUCT_ABBREVIATIONS).find(
          ([key]) => product.name.toLowerCase().includes(key.toLowerCase())
        )?.[1] || product.name.substring(0, 3).toUpperCase();

        summaryMap.set(point.productId, {
          productId: point.productId,
          name: product.name,
          shortName,
          totalUnits: point.units,
          totalCost: point.units * product.pricePerUnit,
          unitLabel: product.unitLabel,
          pointCount: 1,
          color: product.color,
        });
      }
    });

    return Array.from(summaryMap.values());
  }, [injectionPoints, products]);

  const grandTotal = productSummaries.reduce((sum, p) => sum + p.totalCost, 0);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${Math.round(amount)}`;
  };

  // Get theme from context (safely returns default if outside provider)
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Don't show anything if no injection points
  if (injectionPoints.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        fixed bottom-16 left-3 z-20
        flex items-center gap-1 p-1.5
        ${isDark
          ? 'bg-gray-800/95 backdrop-blur-sm border-gray-700'
          : 'bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm'
        }
        rounded-lg border
      `}
    >
      {/* Product summaries - ultra-compact inline format */}
      {productSummaries.slice(0, 4).map((summary, index) => (
        <React.Fragment key={summary.productId}>
          {index > 0 && (
            <div className={`w-px h-4 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
          )}
          <div
            className={`
              px-1.5 py-0.5 text-xs font-medium rounded
              ${isDark ? 'text-gray-200' : 'text-gray-700'}
            `}
          >
            <span
              className="font-semibold"
              style={{ color: summary.color || (isDark ? '#A78BFA' : '#7C3AED') }}
            >
              {summary.shortName}
            </span>
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>:</span>
            <span className="ml-0.5">{summary.totalUnits}{summary.unitLabel}</span>
          </div>
        </React.Fragment>
      ))}

      {/* Show +N if more than 4 products */}
      {productSummaries.length > 4 && (
        <>
          <div className={`w-px h-4 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
          <span className={`px-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            +{productSummaries.length - 4}
          </span>
        </>
      )}

      {/* Divider before total */}
      <div className={`w-px h-5 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} mx-0.5`} />

      {/* Grand total - subtle highlight like zoom indicator */}
      <div
        className={`
          min-w-[48px] px-2 py-0.5 text-center text-xs font-bold rounded
          ${isDark
            ? 'bg-green-500/20 text-green-400'
            : 'bg-green-50 text-green-700'
          }
        `}
      >
        {formatCurrency(grandTotal)}
      </div>
    </div>
  );
}

export default FloatingSummaryBar;
