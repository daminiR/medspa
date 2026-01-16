'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Send, MessageSquare, MousePointerClick,
  Users, DollarSign, Clock, CheckCircle, XCircle, Download,
  BarChart3, ArrowUpRight, ArrowDownRight, Mail, Smartphone, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { exportData, formatters, ExportColumn } from '@/lib/export';

// Types
interface CampaignMetrics {
  totalCampaigns: number;
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  totalFailed: number;
  avgDeliveryRate: number;
  avgClickRate: number;
  totalCreditsUsed: number;
  estimatedRevenue: number;
}

interface CampaignPerformance {
  name: string;
  sent: number;
  delivered: number;
  clicked: number;
  deliveryRate: number;
  clickRate: number;
  date: string;
}

interface TemplatePerformance {
  template: string;
  usageCount: number;
  avgClickRate: number;
  avgDeliveryRate: number;
}

// Mock data generator
const generateMockData = (dateRange: string) => {
  const metrics: CampaignMetrics = {
    totalCampaigns: 24,
    totalSent: 15678,
    totalDelivered: 14892,
    totalClicked: 2847,
    totalFailed: 786,
    avgDeliveryRate: 95.0,
    avgClickRate: 19.1,
    totalCreditsUsed: 15678,
    estimatedRevenue: 28500
  };

  const weeklyTrends = [
    { week: 'Week 1', sent: 2450, delivered: 2328, clicked: 412, rate: 17.7 },
    { week: 'Week 2', sent: 3120, delivered: 2964, clicked: 534, rate: 18.0 },
    { week: 'Week 3', sent: 4200, delivered: 3990, clicked: 798, rate: 20.0 },
    { week: 'Week 4', sent: 5908, delivered: 5610, clicked: 1103, rate: 19.7 },
  ];

  const campaignPerformance: CampaignPerformance[] = [
    { name: 'Holiday Special', sent: 2087, delivered: 1998, clicked: 456, deliveryRate: 95.7, clickRate: 22.8, date: '2024-12-10' },
    { name: 'Post-Care Follow-up', sent: 398, delivered: 387, clicked: 52, deliveryRate: 97.2, clickRate: 13.4, date: '2024-12-13' },
    { name: 'VIP Exclusive', sent: 148, delivered: 145, clicked: 41, deliveryRate: 98.0, clickRate: 28.3, date: '2024-12-14' },
    { name: 'Re-engagement', sent: 512, delivered: 486, clicked: 89, deliveryRate: 94.9, clickRate: 18.3, date: '2024-12-08' },
    { name: 'Birthday Promo', sent: 245, delivered: 238, clicked: 67, deliveryRate: 97.1, clickRate: 28.2, date: '2024-12-12' },
  ];

  const templatePerformance: TemplatePerformance[] = [
    { template: 'Promotional Offer', usageCount: 8, avgClickRate: 24.5, avgDeliveryRate: 96.2 },
    { template: 'Appointment Reminder', usageCount: 6, avgClickRate: 12.3, avgDeliveryRate: 98.1 },
    { template: 'Post-Care Instructions', usageCount: 5, avgClickRate: 15.8, avgDeliveryRate: 97.5 },
    { template: 'Birthday Greeting', usageCount: 3, avgClickRate: 28.9, avgDeliveryRate: 97.8 },
    { template: 'Re-engagement', usageCount: 2, avgClickRate: 18.2, avgDeliveryRate: 94.5 },
  ];

  const audienceBreakdown = [
    { name: 'All Patients', value: 45 },
    { name: 'VIP Members', value: 20 },
    { name: 'New Patients', value: 15 },
    { name: 'Inactive', value: 12 },
    { name: 'Custom', value: 8 },
  ];

  const hourlyPerformance = [
    { hour: '9 AM', sent: 2340, clickRate: 22 },
    { hour: '10 AM', sent: 1890, clickRate: 18 },
    { hour: '11 AM', sent: 1456, clickRate: 16 },
    { hour: '12 PM', sent: 1234, clickRate: 14 },
    { hour: '1 PM', sent: 1678, clickRate: 19 },
    { hour: '2 PM', sent: 2100, clickRate: 21 },
    { hour: '3 PM', sent: 1890, clickRate: 18 },
    { hour: '4 PM', sent: 2090, clickRate: 20 },
  ];

  return { metrics, weeklyTrends, campaignPerformance, templatePerformance, audienceBreakdown, hourlyPerformance };
};

const COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#d97706', '#dc2626'];

export default function CampaignAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('last30Days');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { metrics, weeklyTrends, campaignPerformance, templatePerformance, audienceBreakdown, hourlyPerformance } = useMemo(
    () => generateMockData(dateRange),
    [dateRange]
  );

  const dateRangeOptions = [
    { value: 'last7Days', label: 'Last 7 Days' },
    { value: 'last30Days', label: 'Last 30 Days' },
    { value: 'last90Days', label: 'Last 90 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
  ];

  // Export function
  const handleExport = (format: 'csv' | 'xlsx') => {
    const columns: ExportColumn[] = [
      { key: 'name', header: 'Campaign' },
      { key: 'sent', header: 'Sent', formatter: formatters.number },
      { key: 'delivered', header: 'Delivered', formatter: formatters.number },
      { key: 'clicked', header: 'Clicked', formatter: formatters.number },
      { key: 'deliveryRate', header: 'Delivery Rate', formatter: formatters.percentage },
      { key: 'clickRate', header: 'Click Rate', formatter: formatters.percentage },
      { key: 'date', header: 'Date' },
    ];

    exportData({
      filename: `campaign-analytics-${dateRange}`,
      format,
      columns,
      data: campaignPerformance,
      title: 'Campaign Analytics Report',
    });

    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
          <p className="text-gray-600">Track SMS campaign performance and engagement</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Send className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              12%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalSent.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Messages Sent</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">{metrics.avgDeliveryRate}%</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalDelivered.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Delivered</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MousePointerClick className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              8%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.avgClickRate}%</p>
          <p className="text-sm text-gray-600">Avg Click Rate</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              15%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${metrics.estimatedRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Est. Revenue</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <p className="text-2xl font-bold text-purple-700">{metrics.totalCampaigns}</p>
          <p className="text-sm text-purple-600">Campaigns Sent</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{metrics.totalClicked.toLocaleString()}</p>
          <p className="text-sm text-blue-600">Total Clicks</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <p className="text-2xl font-bold text-red-700">{metrics.totalFailed.toLocaleString()}</p>
          <p className="text-sm text-red-600">Failed</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-2xl font-bold text-gray-700">{metrics.totalCreditsUsed.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Credits Used</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Weekly Performance
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Area type="monotone" dataKey="sent" name="Sent" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} />
                <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#16a34a" fill="#16a34a" fillOpacity={0.2} />
                <Area type="monotone" dataKey="clicked" name="Clicked" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Click Rate Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Click Rate Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 30]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value: number) => [`${value}%`, 'Click Rate']}
                />
                <Line type="monotone" dataKey="rate" name="Click Rate" stroke="#7c3aed" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Top Campaign Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Campaign</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Sent</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Delivered</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Clicked</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Delivery %</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Click %</th>
              </tr>
            </thead>
            <tbody>
              {campaignPerformance.map((campaign, index) => (
                <tr key={campaign.name} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{campaign.name}</span>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">{campaign.sent.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 text-gray-700">{campaign.delivered.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 text-gray-700">{campaign.clicked.toLocaleString()}</td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-medium ${campaign.deliveryRate >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {campaign.deliveryRate}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-medium ${campaign.clickRate >= 20 ? 'text-green-600' : campaign.clickRate >= 15 ? 'text-blue-600' : 'text-gray-600'}`}>
                      {campaign.clickRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template Performance & Audience Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Performance</h3>
          <div className="space-y-4">
            {templatePerformance.map((template) => (
              <div key={template.template} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{template.template}</p>
                  <p className="text-sm text-gray-500">Used {template.usageCount} times</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">{template.avgClickRate}%</p>
                  <p className="text-xs text-gray-500">avg click rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={audienceBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {audienceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Best Send Times */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Best Send Times
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 30]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="sent" name="Messages Sent" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="clickRate" name="Click Rate %" stroke="#16a34a" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          <span><strong>Best performing times:</strong> 9 AM and 2 PM have the highest click rates at 22% and 21% respectively.</span>
        </div>
      </div>
    </div>
  );
}
