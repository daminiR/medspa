'use client';

import { useState, useMemo } from 'react';
import {
  Clock, Users, TrendingUp, DollarSign, CheckCircle, XCircle,
  Calendar, ArrowUpRight, ArrowDownRight, Filter, Download,
  BarChart3, PieChart as PieChartIcon, Activity, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { exportData, formatters, ExportColumn } from '@/lib/export';

// Types
interface WaitlistStats {
  totalEntries: number;
  activeEntries: number;
  offeredEntries: number;
  bookedEntries: number;
  fillRate: number;
  avgWaitDays: number;
  avgResponseMinutes: number;
  revenueRecovered: number;
  acceptanceRate: number;
}

interface TrendData {
  week: string;
  newEntries: number;
  offersSent: number;
  bookings: number;
  conversionRate: number;
}

interface ServiceBreakdown {
  service: string;
  count: number;
  percentage: number;
}

interface TierBreakdown {
  tier: string;
  count: number;
  acceptanceRate: number;
  avgResponseMinutes: number;
}

// Mock data generator
const generateMockData = (dateRange: string) => {
  const stats: WaitlistStats = {
    totalEntries: 156,
    activeEntries: 42,
    offeredEntries: 18,
    bookedEntries: 89,
    fillRate: 72.4,
    avgWaitDays: 3.2,
    avgResponseMinutes: 8.5,
    revenueRecovered: 34500,
    acceptanceRate: 78.5
  };

  const trends: TrendData[] = [
    { week: 'Week 1', newEntries: 28, offersSent: 15, bookings: 12, conversionRate: 80 },
    { week: 'Week 2', newEntries: 35, offersSent: 22, bookings: 18, conversionRate: 82 },
    { week: 'Week 3', newEntries: 31, offersSent: 19, bookings: 14, conversionRate: 74 },
    { week: 'Week 4', newEntries: 42, offersSent: 28, bookings: 23, conversionRate: 82 },
  ];

  const serviceBreakdown: ServiceBreakdown[] = [
    { service: 'Botox', count: 45, percentage: 28.8 },
    { service: 'Dermal Fillers', count: 38, percentage: 24.4 },
    { service: 'Laser Treatment', count: 28, percentage: 17.9 },
    { service: 'Chemical Peel', count: 25, percentage: 16.0 },
    { service: 'Microneedling', count: 20, percentage: 12.9 },
  ];

  const tierBreakdown: TierBreakdown[] = [
    { tier: 'Platinum', count: 24, acceptanceRate: 92.0, avgResponseMinutes: 4.2 },
    { tier: 'Gold', count: 58, acceptanceRate: 82.5, avgResponseMinutes: 6.8 },
    { tier: 'Silver', count: 74, acceptanceRate: 71.3, avgResponseMinutes: 12.4 },
  ];

  const responseTimeDistribution = [
    { range: '< 5 min', count: 45, percentage: 38 },
    { range: '5-15 min', count: 32, percentage: 27 },
    { range: '15-30 min', count: 25, percentage: 21 },
    { range: '> 30 min', count: 16, percentage: 14 },
  ];

  const waitTimeDistribution = [
    { range: '< 3 days', count: 68, percentage: 44 },
    { range: '3-7 days', count: 48, percentage: 31 },
    { range: '7-14 days', count: 28, percentage: 18 },
    { range: '> 14 days', count: 12, percentage: 7 },
  ];

  return { stats, trends, serviceBreakdown, tierBreakdown, responseTimeDistribution, waitTimeDistribution };
};

// Chart colors
const COLORS = {
  primary: '#7c3aed',
  secondary: '#2563eb',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  platinum: '#a855f7',
  gold: '#f59e0b',
  silver: '#6b7280',
};

const PIE_COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#d97706', '#dc2626'];
const TIER_COLORS = { Platinum: '#a855f7', Gold: '#f59e0b', Silver: '#6b7280' };

export default function WaitlistAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('last30Days');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { stats, trends, serviceBreakdown, tierBreakdown, responseTimeDistribution, waitTimeDistribution } = useMemo(
    () => generateMockData(dateRange),
    [dateRange]
  );

  const dateRangeOptions = [
    { value: 'last7Days', label: 'Last 7 Days' },
    { value: 'last30Days', label: 'Last 30 Days' },
    { value: 'last90Days', label: 'Last 90 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
  ];

  // Export functions
  const handleExport = (format: 'csv' | 'xlsx') => {
    const columns: ExportColumn[] = [
      { key: 'metric', header: 'Metric' },
      { key: 'value', header: 'Value' },
    ];

    const data = [
      { metric: 'Total Entries', value: stats.totalEntries },
      { metric: 'Active Entries', value: stats.activeEntries },
      { metric: 'Booked from Waitlist', value: stats.bookedEntries },
      { metric: 'Fill Rate', value: `${stats.fillRate}%` },
      { metric: 'Avg Wait Time (days)', value: stats.avgWaitDays },
      { metric: 'Avg Response Time (min)', value: stats.avgResponseMinutes },
      { metric: 'Revenue Recovered', value: `$${stats.revenueRecovered.toLocaleString()}` },
      { metric: 'Acceptance Rate', value: `${stats.acceptanceRate}%` },
    ];

    exportData({
      filename: `waitlist-analytics-${dateRange}`,
      format,
      columns,
      data,
      title: 'Waitlist Analytics Report',
    });

    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Waitlist Analytics</h2>
          <p className="text-gray-600">Track waitlist performance and fill rates</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('xlsx')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fill Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              5.2%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.fillRate}%</p>
          <p className="text-sm text-gray-600">Fill Rate</p>
        </div>

        {/* Revenue Recovered */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              12.8%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.revenueRecovered.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Revenue Recovered</p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowDownRight className="w-4 h-4" />
              15%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.avgResponseMinutes} min</p>
          <p className="text-sm text-gray-600">Avg Response Time</p>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              3.2%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.acceptanceRate}%</p>
          <p className="text-sm text-gray-600">Acceptance Rate</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <p className="text-2xl font-bold text-purple-700">{stats.totalEntries}</p>
          <p className="text-sm text-purple-600">Total Entries</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{stats.activeEntries}</p>
          <p className="text-sm text-blue-600">Active Entries</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <p className="text-2xl font-bold text-green-700">{stats.bookedEntries}</p>
          <p className="text-sm text-green-600">Booked</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <p className="text-2xl font-bold text-yellow-700">{stats.avgWaitDays} days</p>
          <p className="text-sm text-yellow-600">Avg Wait Time</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Weekly Trends
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="newEntries"
                  name="New Entries"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings"
                  stroke={COLORS.success}
                  fill={COLORS.success}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Performance by Tier
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="tier" tick={{ fontSize: 12 }} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value: number) => [`${value}%`, 'Acceptance Rate']}
                />
                <Bar dataKey="acceptanceRate" name="Acceptance Rate">
                  {tierBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={TIER_COLORS[entry.tier as keyof typeof TIER_COLORS]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            Top Waitlisted Services
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="service"
                  label={({ service, percentage }) => `${service}: ${percentage}%`}
                  labelLine={false}
                >
                  {serviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {serviceBreakdown.slice(0, 3).map((service, index) => (
              <div key={service.service} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index] }}
                  />
                  <span className="text-sm text-gray-700">{service.service}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{service.count} patients</span>
              </div>
            ))}
          </div>
        </div>

        {/* Response Time Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Response Time Distribution
          </h3>
          <div className="space-y-4">
            {responseTimeDistribution.map((item) => (
              <div key={item.range}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.range}</span>
                  <span className="font-medium text-gray-900">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Wait Time Distribution</h4>
            {waitTimeDistribution.map((item) => (
              <div key={item.range} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.range}</span>
                  <span className="font-medium text-gray-900">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-purple-600" />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
            <p className="text-gray-700">
              <strong>Platinum tier</strong> patients respond 66% faster than Silver tier, with 92% acceptance rate.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
            <p className="text-gray-700">
              <strong>Botox & Fillers</strong> account for 53% of all waitlist entries. Consider expanding capacity.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <p className="text-gray-700">
              <strong>38% of patients</strong> respond within 5 minutes. Fast offer delivery is paying off.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
            <p className="text-gray-700">
              <strong>$34,500 recovered</strong> this period from cancelled appointment slots filled via waitlist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
