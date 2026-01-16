'use client'

import { useState } from 'react'
import {
  Users,
  TrendingUp,
  DollarSign,
  Share2,
  MousePointer,
  UserPlus,
  Calendar as CalendarIcon,
  Award,
  Filter,
  Download,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Gift,
  Target,
  Zap
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'
import { exportData, columnPresets, formatters } from '@/lib/export'

// Types
interface ReferralOverview {
  totalReferrals: number
  pendingReferrals: number
  qualifiedReferrals: number
  expiredReferrals: number
  totalRevenueGenerated: number
  programCost: number
  programROI: number
  averageReferralValue: number
  viralCoefficient: number
}

interface ConversionFunnel {
  shares: number
  clicks: number
  signups: number
  firstVisits: number
  qualified: number
  clickThroughRate: number
  signupRate: number
  visitRate: number
  qualificationRate: number
  overallConversionRate: number
}

interface ChannelMetrics {
  method: string
  shares: number
  clicks: number
  conversions: number
  clickThroughRate: number
  conversionRate: number
  revenue: number
  averageOrderValue: number
}

interface MonthlyTrend {
  month: string
  shares: number
  clicks: number
  signups: number
  completed: number
  revenue: number
}

interface TierBreakdown {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  count: number
  totalReferrals: number
  totalEarnings: number
  averageReferralsPerUser: number
}

interface TopReferrer {
  id: string
  patientId: string
  patientName: string
  email: string
  referralCode: string
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  totalReferrals: number
  qualifiedReferrals: number
  totalEarnings: number
  availableCredits: number
}

export function ReferralAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('thisMonth')
  const [isExporting, setIsExporting] = useState(false)

  // Mock data - In production, this would come from API
  const overview: ReferralOverview = {
    totalReferrals: 284,
    pendingReferrals: 47,
    qualifiedReferrals: 198,
    expiredReferrals: 39,
    totalRevenueGenerated: 69300,
    programCost: 9900,
    programROI: 600,
    averageReferralValue: 350,
    viralCoefficient: 1.24
  }

  const funnel: ConversionFunnel = {
    shares: 1245,
    clicks: 623,
    signups: 312,
    firstVisits: 234,
    qualified: 198,
    clickThroughRate: 50.0,
    signupRate: 50.1,
    visitRate: 75.0,
    qualificationRate: 84.6,
    overallConversionRate: 15.9
  }

  const channelPerformance: ChannelMetrics[] = [
    { method: 'SMS', shares: 450, clicks: 248, conversions: 89, clickThroughRate: 55.1, conversionRate: 35.9, revenue: 31150, averageOrderValue: 350 },
    { method: 'Email', shares: 380, clicks: 171, conversions: 52, clickThroughRate: 45.0, conversionRate: 30.4, revenue: 18200, averageOrderValue: 350 },
    { method: 'WhatsApp', shares: 215, clicks: 118, conversions: 38, clickThroughRate: 54.9, conversionRate: 32.2, revenue: 13300, averageOrderValue: 350 },
    { method: 'Instagram', shares: 120, clicks: 54, conversions: 12, clickThroughRate: 45.0, conversionRate: 22.2, revenue: 4200, averageOrderValue: 350 },
    { method: 'Facebook', shares: 80, clicks: 32, conversions: 7, clickThroughRate: 40.0, conversionRate: 21.9, revenue: 2450, averageOrderValue: 350 }
  ]

  const monthlyTrend: MonthlyTrend[] = [
    { month: 'Jul 2024', shares: 156, clicks: 78, signups: 39, completed: 28, revenue: 9800 },
    { month: 'Aug 2024', shares: 189, clicks: 95, signups: 48, completed: 35, revenue: 12250 },
    { month: 'Sep 2024', shares: 212, clicks: 106, signups: 53, completed: 38, revenue: 13300 },
    { month: 'Oct 2024', shares: 198, clicks: 99, signups: 50, completed: 36, revenue: 12600 },
    { month: 'Nov 2024', shares: 234, clicks: 117, signups: 59, completed: 42, revenue: 14700 },
    { month: 'Dec 2024', shares: 256, clicks: 128, signups: 63, completed: 47, revenue: 16450 }
  ]

  const tierBreakdown: TierBreakdown[] = [
    { tier: 'BRONZE', count: 156, totalReferrals: 312, totalEarnings: 7800, averageReferralsPerUser: 2.0 },
    { tier: 'SILVER', count: 42, totalReferrals: 378, totalEarnings: 9450, averageReferralsPerUser: 9.0 },
    { tier: 'GOLD', count: 18, totalReferrals: 378, totalEarnings: 11340, averageReferralsPerUser: 21.0 },
    { tier: 'PLATINUM', count: 6, totalReferrals: 234, totalEarnings: 9360, averageReferralsPerUser: 39.0 }
  ]

  const topReferrers: TopReferrer[] = [
    { id: '1', patientId: 'p1', patientName: 'Jessica Martinez', email: 'jessica.m@email.com', referralCode: 'JESS2024', tier: 'PLATINUM', totalReferrals: 47, qualifiedReferrals: 42, totalEarnings: 2100, availableCredits: 450 },
    { id: '2', patientId: 'p2', patientName: 'Amanda Chen', email: 'amanda.c@email.com', referralCode: 'AMANDA24', tier: 'PLATINUM', totalReferrals: 43, qualifiedReferrals: 38, totalEarnings: 1900, availableCredits: 375 },
    { id: '3', patientId: 'p3', patientName: 'Sarah Thompson', email: 'sarah.t@email.com', referralCode: 'SARAH2024', tier: 'GOLD', totalReferrals: 28, qualifiedReferrals: 24, totalEarnings: 1200, availableCredits: 225 },
    { id: '4', patientId: 'p4', patientName: 'Emily Rodriguez', email: 'emily.r@email.com', referralCode: 'EMILY24', tier: 'GOLD', totalReferrals: 22, qualifiedReferrals: 19, totalEarnings: 950, availableCredits: 175 },
    { id: '5', patientId: 'p5', patientName: 'Michelle Park', email: 'michelle.p@email.com', referralCode: 'MPARK24', tier: 'SILVER', totalReferrals: 14, qualifiedReferrals: 12, totalEarnings: 600, availableCredits: 125 }
  ]

  // Funnel data for chart
  const funnelData = [
    { name: 'Shares', value: funnel.shares, fill: '#9333ea' },
    { name: 'Clicks', value: funnel.clicks, fill: '#a855f7' },
    { name: 'Signups', value: funnel.signups, fill: '#c084fc' },
    { name: 'First Visits', value: funnel.firstVisits, fill: '#d8b4fe' },
    { name: 'Qualified', value: funnel.qualified, fill: '#10b981' }
  ]

  const pieColors = ['#9333ea', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
  const tierColors = {
    BRONZE: '#cd7f32',
    SILVER: '#c0c0c0',
    GOLD: '#ffd700',
    PLATINUM: '#e5e4e2'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true)
    try {
      // Export top referrers data
      const exportedData = topReferrers.map(r => ({
        patientName: r.patientName,
        email: r.email,
        referralCode: r.referralCode,
        tier: r.tier,
        totalReferrals: r.totalReferrals,
        qualifiedReferrals: r.qualifiedReferrals,
        totalEarnings: r.totalEarnings,
        availableCredits: r.availableCredits
      }))

      exportData({
        filename: `referral-analytics-${new Date().toISOString().split('T')[0]}`,
        format,
        columns: columnPresets.topReferrers,
        data: exportedData,
        title: 'Referral Analytics Report',
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Referral Analytics</h2>
            <p className="text-gray-600">Track referral program performance and ROI</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="thisYear">This Year</option>
              <option value="last30Days">Last 30 Days</option>
              <option value="last90Days">Last 90 Days</option>
            </select>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 inline mr-2" />
              Filters
            </button>
            <div className="relative group">
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isExporting}
              >
                <Download className="w-4 h-4 inline mr-2" />
                {isExporting ? 'Exporting...' : 'Export'}
              </button>
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('xlsx')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
                >
                  Export Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <Users className="w-6 h-6 text-purple-600" />
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              12.5%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.totalReferrals}</p>
          <p className="text-sm text-gray-600">Total Referrals</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="text-green-600">{overview.qualifiedReferrals} qualified</span>
            <span className="text-gray-400">|</span>
            <span className="text-yellow-600">{overview.pendingReferrals} pending</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              600%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.programROI}%</p>
          <p className="text-sm text-gray-600">Program ROI</p>
          <p className="text-xs text-gray-500 mt-2">
            Revenue: {formatCurrency(overview.totalRevenueGenerated)} | Cost: {formatCurrency(overview.programCost)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              8.3%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(overview.totalRevenueGenerated)}</p>
          <p className="text-sm text-gray-600">Revenue Generated</p>
          <p className="text-xs text-gray-500 mt-2">
            Avg Value: {formatCurrency(overview.averageReferralValue)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <Zap className="w-6 h-6 text-pink-600" />
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              0.12
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{overview.viralCoefficient}</p>
          <p className="text-sm text-gray-600">Viral Coefficient</p>
          <p className="text-xs text-gray-500 mt-2">
            {overview.viralCoefficient > 1 ? 'Organic growth!' : 'Building momentum'}
          </p>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <div className="space-y-3 w-full max-w-md">
              {funnelData.map((stage, idx) => {
                const width = (stage.value / funnelData[0].value) * 100
                const nextStage = funnelData[idx + 1]
                const conversionRate = nextStage
                  ? ((nextStage.value / stage.value) * 100).toFixed(1)
                  : null

                return (
                  <div key={stage.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{stage.name}</span>
                      <span className="text-gray-900 font-semibold">{stage.value.toLocaleString()}</span>
                    </div>
                    <div className="relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2 h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${width}%`,
                          backgroundColor: stage.fill,
                          minWidth: '60px'
                        }}
                      />
                    </div>
                    {conversionRate && (
                      <div className="flex justify-center mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 rotate-90" />
                          {conversionRate}% conversion
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Click-through Rate</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{funnel.clickThroughRate}%</p>
              <p className="text-xs text-purple-700">Shares to clicks</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Signup Rate</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{funnel.signupRate}%</p>
              <p className="text-xs text-blue-700">Clicks to signups</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Visit Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{funnel.visitRate}%</p>
              <p className="text-xs text-green-700">Signups to first visit</p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-medium text-pink-900">Overall Conversion</span>
              </div>
              <p className="text-2xl font-bold text-pink-900">{funnel.overallConversionRate}%</p>
              <p className="text-xs text-pink-700">Shares to qualified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Performance & Top Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={channelPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="method" type="category" width={80} />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'revenue') return formatCurrency(value)
                  if (name === 'conversionRate') return `${value}%`
                  return value
                }}
              />
              <Legend />
              <Bar dataKey="conversions" fill="#9333ea" name="Conversions" />
              <Bar dataKey="conversionRate" fill="#10b981" name="Conv. Rate %" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {channelPerformance.slice(0, 3).map((channel, idx) => (
              <div key={channel.method} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: pieColors[idx] }}
                  />
                  <span className="text-gray-700">{channel.method}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{formatCurrency(channel.revenue)}</span>
                  <span className="text-gray-500 ml-2">({channel.conversions} conv.)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Referrers</h3>
            <button className="text-sm text-purple-600 hover:text-purple-700">View All</button>
          </div>
          <div className="space-y-4">
            {topReferrers.map((referrer, idx) => (
              <div key={referrer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">#{idx + 1}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{referrer.patientName}</p>
                    <span
                      className="px-2 py-0.5 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor: `${tierColors[referrer.tier]}20`,
                        color: referrer.tier === 'PLATINUM' ? '#6b7280' : tierColors[referrer.tier]
                      }}
                    >
                      {referrer.tier}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {referrer.qualifiedReferrals} qualified of {referrer.totalReferrals} total
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(referrer.totalEarnings)}</p>
                  <p className="text-xs text-green-600">{formatCurrency(referrer.availableCredits)} available</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `$${value/1000}k`} />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === 'revenue') return formatCurrency(value)
                return value
              }}
            />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="shares" stroke="#9333ea" fill="#9333ea" fillOpacity={0.3} name="Shares" />
            <Area yAxisId="left" type="monotone" dataKey="completed" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Completed" />
            <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tier Breakdown & Program Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Distribution</h3>
          <div className="grid grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie
                  data={tierBreakdown}
                  dataKey="count"
                  nameKey="tier"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={false}
                >
                  {tierBreakdown.map((entry) => (
                    <Cell key={`cell-${entry.tier}`} fill={tierColors[entry.tier]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {tierBreakdown.map((tier) => (
                <div key={tier.tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tierColors[tier.tier] }}
                    />
                    <span className="text-sm text-gray-700">{tier.tier}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{tier.count}</p>
                    <p className="text-xs text-gray-500">{tier.averageReferralsPerUser} avg ref.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Program Rewards Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rewards Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Total Rewards Earned</p>
                  <p className="text-sm text-green-700">By all referrers</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(tierBreakdown.reduce((sum, t) => sum + t.totalEarnings, 0))}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Active Referrers</p>
                  <p className="text-sm text-blue-700">With qualified referrals</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {tierBreakdown.reduce((sum, t) => sum + t.count, 0)}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Avg. Earnings Per Referrer</p>
                  <p className="text-sm text-purple-700">Across all tiers</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(Math.round(
                  tierBreakdown.reduce((sum, t) => sum + t.totalEarnings, 0) /
                  tierBreakdown.reduce((sum, t) => sum + t.count, 0)
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-900 mb-2">Key Insights</h4>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                SMS referrals have the highest conversion rate at {channelPerformance[0].conversionRate}% - consider SMS-first campaigns
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Viral coefficient of {overview.viralCoefficient} indicates {overview.viralCoefficient > 1 ? 'organic growth - each referrer brings more than one new patient' : 'growing momentum towards viral threshold'}
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Program ROI of {overview.programROI}% - every $1 spent on rewards generates ${(overview.programROI / 100 + 1).toFixed(2)} in revenue
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Top 5 referrers account for {Math.round(topReferrers.reduce((sum, r) => sum + r.qualifiedReferrals, 0) / overview.qualifiedReferrals * 100)}% of qualified referrals - consider VIP program
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
