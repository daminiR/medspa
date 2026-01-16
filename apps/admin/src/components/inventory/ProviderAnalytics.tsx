'use client';

import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Package,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';

interface ProviderStats {
  providerId: string;
  providerName: string;
  totalUnitsUsed: number;
  totalTreatments: number;
  averageUnitsPerTreatment: number;
  variancePercent: number;
  isAboveAverage: boolean;
  wastePercent: number;
  profitMargin: number;
  revenueGenerated: number;
  costOfGoodsUsed: number;
  byProduct: {
    productName: string;
    unitsUsed: number;
    avgPerTreatment: number;
    vsClinicAverage: number;
  }[];
}

interface ProviderAnalyticsProps {
  locationId?: string;
  dateRange?: { start: Date; end: Date };
}

// Mock data for demonstration
const mockProviderStats: ProviderStats[] = [
  {
    providerId: '4',
    providerName: 'Dr. Susan Lo',
    totalUnitsUsed: 1250,
    totalTreatments: 48,
    averageUnitsPerTreatment: 26.04,
    variancePercent: 2.3,
    isAboveAverage: true,
    wastePercent: 3.2,
    profitMargin: 68.5,
    revenueGenerated: 18500,
    costOfGoodsUsed: 5827.50,
    byProduct: [
      { productName: 'Botox®', unitsUsed: 720, avgPerTreatment: 24, vsClinicAverage: -2.1 },
      { productName: 'Dysport®', unitsUsed: 360, avgPerTreatment: 60, vsClinicAverage: 5.2 },
      { productName: 'Juvéderm Ultra', unitsUsed: 12, avgPerTreatment: 1.2, vsClinicAverage: 0 },
    ],
  },
  {
    providerId: '5',
    providerName: 'Dr. Maria Garcia',
    totalUnitsUsed: 980,
    totalTreatments: 42,
    averageUnitsPerTreatment: 23.33,
    variancePercent: -8.4,
    isAboveAverage: false,
    wastePercent: 1.8,
    profitMargin: 72.1,
    revenueGenerated: 15200,
    costOfGoodsUsed: 4243.60,
    byProduct: [
      { productName: 'Botox®', unitsUsed: 580, avgPerTreatment: 22, vsClinicAverage: -10.2 },
      { productName: 'Restylane', unitsUsed: 18, avgPerTreatment: 1, vsClinicAverage: -16.7 },
      { productName: 'Sculptra®', unitsUsed: 5, avgPerTreatment: 1, vsClinicAverage: 0 },
    ],
  },
  {
    providerId: '6',
    providerName: 'NP Jennifer Kim',
    totalUnitsUsed: 1680,
    totalTreatments: 52,
    averageUnitsPerTreatment: 32.31,
    variancePercent: 26.8,
    isAboveAverage: true,
    wastePercent: 8.4,
    profitMargin: 58.2,
    revenueGenerated: 22400,
    costOfGoodsUsed: 9363.20,
    byProduct: [
      { productName: 'Botox®', unitsUsed: 920, avgPerTreatment: 30.7, vsClinicAverage: 25.3 },
      { productName: 'Dysport®', unitsUsed: 540, avgPerTreatment: 72, vsClinicAverage: 26.3 },
      { productName: 'Juvéderm Voluma', unitsUsed: 8, avgPerTreatment: 1.6, vsClinicAverage: 14.3 },
    ],
  },
];

const clinicAverage = {
  unitsPerTreatment: 25.47,
  wastePercent: 4.5,
  profitMargin: 66.3,
};

export function ProviderAnalytics({ locationId, dateRange }: ProviderAnalyticsProps) {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'units' | 'variance' | 'waste' | 'profit'>('variance');

  const sortedProviders = [...mockProviderStats].sort((a, b) => {
    switch (sortBy) {
      case 'units':
        return b.totalUnitsUsed - a.totalUnitsUsed;
      case 'variance':
        return Math.abs(b.variancePercent) - Math.abs(a.variancePercent);
      case 'waste':
        return b.wastePercent - a.wastePercent;
      case 'profit':
        return b.profitMargin - a.profitMargin;
      default:
        return 0;
    }
  });

  // Identify outliers (more than 15% variance)
  const outliers = mockProviderStats.filter(p => Math.abs(p.variancePercent) > 15);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Provider Usage Analytics
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Track inventory usage by provider • Identify variance from clinic averages
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="variance">Sort by Variance</option>
              <option value="units">Sort by Units Used</option>
              <option value="waste">Sort by Waste %</option>
              <option value="profit">Sort by Profit Margin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clinic Averages Banner */}
      <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-indigo-600 font-medium">Clinic Avg:</span>
            </div>
            <div>
              <span className="text-gray-600">Units/Treatment:</span>{' '}
              <span className="font-semibold text-gray-900">{clinicAverage.unitsPerTreatment}</span>
            </div>
            <div>
              <span className="text-gray-600">Waste:</span>{' '}
              <span className="font-semibold text-gray-900">{clinicAverage.wastePercent}%</span>
            </div>
            <div>
              <span className="text-gray-600">Profit Margin:</span>{' '}
              <span className="font-semibold text-gray-900">{clinicAverage.profitMargin}%</span>
            </div>
          </div>
          {outliers.length > 0 && (
            <div className="flex items-center gap-2 text-orange-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{outliers.length} provider(s) with significant variance</span>
            </div>
          )}
        </div>
      </div>

      {/* Provider List */}
      <div className="divide-y divide-gray-100">
        {sortedProviders.map(provider => (
          <div key={provider.providerId}>
            {/* Provider Row */}
            <div
              className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                Math.abs(provider.variancePercent) > 15 ? 'bg-orange-50/50' : ''
              }`}
              onClick={() =>
                setExpandedProvider(expandedProvider === provider.providerId ? null : provider.providerId)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Expand Toggle */}
                  <button className="text-gray-400 hover:text-gray-600">
                    {expandedProvider === provider.providerId ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  {/* Provider Info */}
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {provider.providerName}
                      {Math.abs(provider.variancePercent) > 20 && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {provider.totalTreatments} treatments • {provider.totalUnitsUsed} units
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  {/* Avg Units */}
                  <div className="text-center min-w-[80px]">
                    <div className="text-sm font-semibold text-gray-900">
                      {provider.averageUnitsPerTreatment.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">avg units</div>
                  </div>

                  {/* Variance */}
                  <div className="text-center min-w-[100px]">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-semibold ${
                        Math.abs(provider.variancePercent) > 15
                          ? 'bg-orange-100 text-orange-700'
                          : provider.isAboveAverage
                          ? 'bg-red-50 text-red-600'
                          : 'bg-green-50 text-green-600'
                      }`}
                    >
                      {provider.isAboveAverage ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {provider.variancePercent > 0 ? '+' : ''}
                      {provider.variancePercent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">vs average</div>
                  </div>

                  {/* Waste */}
                  <div className="text-center min-w-[80px]">
                    <div
                      className={`text-sm font-semibold ${
                        provider.wastePercent > 5
                          ? 'text-red-600'
                          : provider.wastePercent > 3
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {provider.wastePercent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">waste</div>
                  </div>

                  {/* Profit Margin */}
                  <div className="text-center min-w-[80px]">
                    <div
                      className={`text-sm font-semibold ${
                        provider.profitMargin >= 70
                          ? 'text-green-600'
                          : provider.profitMargin >= 60
                          ? 'text-blue-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {provider.profitMargin.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">margin</div>
                  </div>

                  {/* Revenue */}
                  <div className="text-center min-w-[100px]">
                    <div className="text-sm font-semibold text-gray-900">
                      ${provider.revenueGenerated.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">revenue</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedProvider === provider.providerId && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="ml-9">
                  {/* Product Breakdown */}
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Product Usage Breakdown
                  </h4>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {provider.byProduct.map((product, i) => (
                      <div key={i} className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="font-medium text-gray-900 text-sm">{product.productName}</div>
                        <div className="mt-2 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Total Used:</span>
                            <span className="font-medium">{product.unitsUsed} units</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Avg/Treatment:</span>
                            <span className="font-medium">{product.avgPerTreatment}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-600">vs Clinic:</span>
                            <span
                              className={`font-semibold ${
                                product.vsClinicAverage > 10
                                  ? 'text-red-600'
                                  : product.vsClinicAverage < -10
                                  ? 'text-green-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {product.vsClinicAverage > 0 ? '+' : ''}
                              {product.vsClinicAverage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Insights */}
                  {Math.abs(provider.variancePercent) > 15 && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 mt-4">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-orange-600 mt-0.5" />
                        <div className="text-sm text-orange-800">
                          <span className="font-semibold">Variance Alert:</span>{' '}
                          {provider.isAboveAverage
                            ? `${provider.providerName} uses ${provider.variancePercent.toFixed(1)}% more units than the clinic average. This may indicate technique differences, over-treatment, or potential waste. Consider reviewing injection protocols.`
                            : `${provider.providerName} uses ${Math.abs(provider.variancePercent).toFixed(1)}% fewer units than the clinic average. This could indicate efficient technique or potential under-treatment. Verify patient outcomes are satisfactory.`}
                        </div>
                      </div>
                    </div>
                  )}

                  {provider.wastePercent > 5 && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200 mt-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div className="text-sm text-red-800">
                          <span className="font-semibold">High Waste Alert:</span>{' '}
                          {provider.wastePercent.toFixed(1)}% waste rate is above the {clinicAverage.wastePercent}% clinic average.
                          Review vial management practices and consider additional training.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing <span className="font-semibold">{mockProviderStats.length}</span> providers •
            Total: <span className="font-semibold">{mockProviderStats.reduce((sum, p) => sum + p.totalUnitsUsed, 0).toLocaleString()}</span> units •
            <span className="font-semibold"> ${mockProviderStats.reduce((sum, p) => sum + p.revenueGenerated, 0).toLocaleString()}</span> revenue
          </div>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
