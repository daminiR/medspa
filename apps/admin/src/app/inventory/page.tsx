'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Barcode,
  FileText,
  TrendingUp,
  DollarSign,
  Boxes,
  Syringe,
  Droplets,
  Droplet,
  Settings,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Bell,
  Thermometer,
  Users,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Product,
  InventoryLevel,
  InventoryLot,
  InventoryAlert,
  StockStatus,
  ProductCategory,
  STOCK_STATUS_COLORS,
  PRODUCT_CATEGORY_LABELS,
  ALERT_SEVERITY_COLORS,
} from '@/types/inventory';
import { ReceiveInventoryModal } from '@/components/inventory/ReceiveInventoryModal';
import { BarcodeScanner } from '@/components/inventory/BarcodeScanner';
import { OpenVialsPanel } from '@/components/inventory/OpenVialsPanel';
import { ProviderAnalytics } from '@/components/inventory/ProviderAnalytics';

// ============================================================================
// TYPES
// ============================================================================

interface InventoryData {
  inventory: (InventoryLevel & {
    product: {
      id: string;
      name: string;
      displayName: string;
      category: ProductCategory;
      brand: string;
      sku: string;
      unitPrice: number;
      unitType: string;
      reorderPoint: number;
      reorderQuantity: number;
      requiresRefrigeration: boolean;
      trackByLot: boolean;
    } | null;
    lots: {
      id: string;
      lotNumber: string;
      currentQuantity: number;
      availableQuantity: number;
      expirationDate: string;
      status: string;
      storageLocation?: string;
    }[];
  })[];
  alerts: InventoryAlert[];
  summary: {
    totalProducts: number;
    inStock: number;
    lowStock: number;
    critical: number;
    outOfStock: number;
    totalValue: number;
    totalCost: number;
    activeAlerts: number;
    criticalAlerts: number;
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function InventoryPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'all'>('all');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [showAlerts, setShowAlerts] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'lots' | 'alerts' | 'orders' | 'vials' | 'analytics'>('overview');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('query', searchQuery);
      params.append('includeLots', 'true');
      params.append('includeAlerts', 'true');

      const response = await fetch(`/api/inventory?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch inventory');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, statusFilter]);

  // Toggle product expansion
  const toggleProductExpanded = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: StockStatus) => {
    const colors = STOCK_STATUS_COLORS[status];
    const labels: Record<StockStatus, string> = {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      critical: 'Critical',
      out_of_stock: 'Out of Stock',
      overstocked: 'Overstocked',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
      >
        {labels[status]}
      </span>
    );
  };

  // Get category icon
  const getCategoryIcon = (category: ProductCategory) => {
    switch (category) {
      case 'neurotoxin':
        return <Syringe className="w-4 h-4" />;
      case 'filler':
        return <Droplets className="w-4 h-4" />;
      case 'skincare':
        return <Package className="w-4 h-4" />;
      case 'device':
        return <Settings className="w-4 h-4" />;
      default:
        return <Boxes className="w-4 h-4" />;
    }
  };

  // Calculate days until expiration
  const getDaysUntilExpiration = (dateStr: string) => {
    const expDate = new Date(dateStr);
    const now = new Date();
    return Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Get expiration badge
  const getExpirationBadge = (dateStr: string) => {
    const days = getDaysUntilExpiration(dateStr);
    if (days <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    } else if (days <= 7) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          {days}d left
        </span>
      );
    } else if (days <= 30) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          {days}d left
        </span>
      );
    } else if (days <= 90) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {days}d left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        {days}d left
      </span>
    );
  };

  // Filter inventory by search
  const filteredInventory = data?.inventory.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.productName.toLowerCase().includes(query) ||
      item.product?.sku.toLowerCase().includes(query) ||
      item.product?.brand.toLowerCase().includes(query)
    );
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                  FDA-compliant lot tracking with FIFO expiration management
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchInventory}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
                <button
                  onClick={() => setShowScanner(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Barcode className="w-4 h-4 mr-2" />
                  Scan
                </button>
                <button
                  onClick={() => setShowReceiveModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Receive Inventory
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-4 border-b border-gray-200 -mb-px">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'vials', label: 'Open Vials', icon: Droplet, highlight: true },
                  { id: 'products', label: 'Products', icon: Package },
                  { id: 'lots', label: 'Lot Tracking', icon: Barcode },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'alerts', label: 'Alerts', icon: Bell, count: data?.summary.activeAlerts },
                  { id: 'orders', label: 'Purchase Orders', icon: FileText },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards */}
        {activeTab === 'overview' && data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{data.summary.totalProducts}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Stock</p>
                    <p className="text-2xl font-bold text-green-600">{data.summary.inStock}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Low / Critical</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {data.summary.lowStock + data.summary.critical}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(data.summary.totalValue)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{data.summary.activeAlerts}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            {data.alerts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 mb-6">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Active Alerts ({data.alerts.length})
                  </h3>
                  <button
                    onClick={() => setShowAlerts(!showAlerts)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {showAlerts ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showAlerts && (
                  <div className="divide-y divide-gray-100">
                    {data.alerts.slice(0, 5).map(alert => (
                      <div
                        key={alert.id}
                        className={`px-4 py-3 flex items-start gap-3 ${
                          ALERT_SEVERITY_COLORS[alert.severity].bg
                        }`}
                      >
                        <AlertTriangle
                          className={`w-5 h-5 mt-0.5 ${ALERT_SEVERITY_COLORS[alert.severity].icon}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${ALERT_SEVERITY_COLORS[alert.severity].text}`}>
                            {alert.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">{alert.message}</p>
                          {alert.actionRequired && (
                            <p className="text-sm text-gray-500 mt-1">
                              Action: {alert.actionRequired}
                            </p>
                          )}
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Products Tab */}
        {(activeTab === 'overview' || activeTab === 'products') && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search products, SKU, brand..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchInventory()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as ProductCategory | 'all')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as StockStatus | 'all')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="critical">Critical</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-8 px-4 py-3"></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reserved
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lots
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInventory.map(item => (
                      <>
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => item.lots.length > 0 && toggleProductExpanded(item.productId)}
                        >
                          <td className="px-4 py-4">
                            {item.lots.length > 0 && (
                              <button className="text-gray-400 hover:text-gray-600">
                                {expandedProducts.has(item.productId) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                {getCategoryIcon(item.product?.category || 'other')}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.product?.displayName || item.productName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {item.product?.brand} · {item.product?.sku}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {PRODUCT_CATEGORY_LABELS[item.product?.category || 'other']}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-semibold text-gray-900">
                              {item.availableQuantity}
                            </span>
                            <span className="text-gray-500 ml-1">{item.product?.unitType}</span>
                          </td>
                          <td className="px-4 py-4 text-right text-gray-600">
                            {item.reservedQuantity}
                          </td>
                          <td className="px-4 py-4 text-center">{getStatusBadge(item.status)}</td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-sm">
                              {item.activeLots} active
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right font-medium text-gray-900">
                            {formatCurrency(item.totalRetailValue)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Lot Details */}
                        {expandedProducts.has(item.productId) && item.lots.length > 0 && (
                          <tr>
                            <td colSpan={9} className="bg-gray-50 px-4 py-3">
                              <div className="ml-8">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                  <Barcode className="w-4 h-4" />
                                  Lot Details (FIFO Order)
                                </h4>
                                <div className="grid gap-2">
                                  {item.lots.map((lot, index) => (
                                    <div
                                      key={lot.id}
                                      className={`flex items-center justify-between p-3 rounded-lg border ${
                                        index === 0
                                          ? 'bg-green-50 border-green-200'
                                          : 'bg-white border-gray-200'
                                      }`}
                                    >
                                      <div className="flex items-center gap-4">
                                        {index === 0 && (
                                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                            USE FIRST
                                          </span>
                                        )}
                                        <div>
                                          <p className="font-medium text-gray-900">
                                            Lot: {lot.lotNumber}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            {lot.storageLocation || 'Storage location not specified'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-6">
                                        <div className="text-right">
                                          <p className="font-medium text-gray-900">
                                            {lot.availableQuantity} {item.product?.unitType}
                                          </p>
                                          <p className="text-xs text-gray-500">available</p>
                                        </div>
                                        <div className="text-right">
                                          {getExpirationBadge(lot.expirationDate)}
                                          <p className="text-xs text-gray-500 mt-0.5">
                                            Exp: {new Date(lot.expirationDate).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredInventory.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No inventory items found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Lot Tracking Tab */}
        {activeTab === 'lots' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Barcode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Lot Tracking</h3>
            <p className="text-gray-500 mb-4">
              View and manage individual lot numbers with expiration tracking
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add New Lot
            </button>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && data && (
          <div className="space-y-4">
            {data.alerts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
                <p className="text-gray-500">All inventory levels are healthy</p>
              </div>
            ) : (
              data.alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`bg-white rounded-xl border overflow-hidden ${
                    alert.severity === 'critical'
                      ? 'border-red-200'
                      : alert.severity === 'warning'
                      ? 'border-yellow-200'
                      : 'border-blue-200'
                  }`}
                >
                  <div
                    className={`px-4 py-3 ${ALERT_SEVERITY_COLORS[alert.severity].bg} border-b ${
                      alert.severity === 'critical'
                        ? 'border-red-200'
                        : alert.severity === 'warning'
                        ? 'border-yellow-200'
                        : 'border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-5 h-5 ${ALERT_SEVERITY_COLORS[alert.severity].icon}`}
                        />
                        <span
                          className={`font-semibold ${ALERT_SEVERITY_COLORS[alert.severity].text}`}
                        >
                          {alert.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700">{alert.message}</p>
                    {alert.actionRequired && (
                      <p className="text-sm text-gray-500 mt-2">
                        <strong>Action Required:</strong> {alert.actionRequired}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      <button className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                        Resolve
                      </button>
                      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                        Acknowledge
                      </button>
                      <button className="px-3 py-1.5 text-gray-500 text-sm hover:text-gray-700">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Purchase Orders</h3>
            <p className="text-gray-500 mb-4">
              Create and manage purchase orders with vendor integration
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Purchase Order
            </button>
          </div>
        )}

        {/* Open Vials Tab - THE DIFFERENTIATOR */}
        {activeTab === 'vials' && (
          <div className="space-y-6">
            {/* Feature Highlight Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Multi-Patient Vial Tracking</h3>
                  <p className="text-sm text-purple-100">
                    Track fractional units, stability timers, and usage across multiple patients from a single vial
                  </p>
                </div>
              </div>
            </div>

            <OpenVialsPanel
              locationId="loc-1"
              onUseFromVial={(vialId) => {
                toast.success(`Use from vial: ${vialId}`);
              }}
              onCloseVial={(vialId, reason) => {
                toast.success(`Vial ${vialId} closed: ${reason}`);
              }}
              onOpenNewVial={() => {
                toast('Opening new vial modal...');
              }}
            />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Provider Accountability & Cost Analytics</h3>
                  <p className="text-sm text-indigo-100">
                    Track usage by provider, identify variance, and analyze cost-per-treatment profitability
                  </p>
                </div>
              </div>
            </div>

            <ProviderAnalytics locationId="loc-1" />
          </div>
        )}
      </div>

      {/* Receive Inventory Modal */}
      <ReceiveInventoryModal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        onSuccess={() => {
          fetchInventory();
          setShowReceiveModal(false);
        }}
      />

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={(data) => {
          console.log('Scanned barcode:', data);
          toast.success(`Scanned: ${data.lotNumber || data.rawCode}`);
          setShowScanner(false);
          // Could open receive modal with pre-filled data
        }}
      />
    </div>
  );
}
