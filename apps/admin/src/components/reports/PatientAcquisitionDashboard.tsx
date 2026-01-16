'use client'

import { useState } from 'react'
import {
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Filter,
  Download,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  MessageSquare,
  Phone,
  Calendar,
  Gift,
  Search,
  Instagram,
  Share2,
  Clock
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
  LineChart,
  Line
} from 'recharts'
import { exportData, columnPresets, formatters } from '@/lib/export'

// Types
interface AcquisitionSource {
  source: string
  count: number
  percentage: number
  revenue: number
  averageLTV: number
  averageFirstVisitValue: number
  retentionRate90Day: number
}

interface NewVsReturning {
  new: number
  returning: number
  newPercentage: number
  returningPercentage: number
  newRevenue: number
  returningRevenue: number
}

interface CohortData {
  cohortMonth: string
  newPatients: number
  month1Retention: number
  month2Retention: number
  month3Retention: number
  month6Retention: number
  averageLTV: number
  totalRevenue: number
}

interface ChurnRiskMetrics {
  atRisk30Days: number
  atRisk60Days: number
  atRisk90Days: number
  atRisk120Days: number
  churned: number
  totalAtRisk: number
  atRiskRevenue: number
}

interface AcquisitionTrend {
  date: string
  newPatients: number
  returningPatients: number
  referralPatients: number
  onlineBookings: number
  walkIns: number
}

export function PatientAcquisitionDashboard() {
  const [dateRange, setDateRange] = useState('thisMonth')
  const [isExporting, setIsExporting] = useState(false)

  // Mock data - In production, this would come from API
  const totalNewPatients = 156
  const totalReturningPatients = 423
  const previousNewPatients = 138
  const newPatientsChange = ((totalNewPatients - previousNewPatients) / previousNewPatients) * 100

  const bySource: AcquisitionSource[] = [
    { source: 'Online Booking', count: 52, percentage: 33.3, revenue: 18200, averageLTV: 2850, averageFirstVisitValue: 350, retentionRate90Day: 78 },
    { source: 'Referral', count: 38, percentage: 24.4, revenue: 13300, averageLTV: 4200, averageFirstVisitValue: 350, retentionRate90Day: 89 },
    { source: 'Walk-in', count: 24, percentage: 15.4, revenue: 8400, averageLTV: 1950, averageFirstVisitValue: 350, retentionRate90Day: 62 },
    { source: 'Google Organic', count: 18, percentage: 11.5, revenue: 6300, averageLTV: 2400, averageFirstVisitValue: 350, retentionRate90Day: 71 },
    { source: 'Instagram', count: 12, percentage: 7.7, revenue: 4200, averageLTV: 2100, averageFirstVisitValue: 350, retentionRate90Day: 65 },
    { source: 'Google Ads', count: 8, percentage: 5.1, revenue: 2800, averageLTV: 1800, averageFirstVisitValue: 350, retentionRate90Day: 58 },
    { source: 'Phone', count: 4, percentage: 2.6, revenue: 1400, averageLTV: 2200, averageFirstVisitValue: 350, retentionRate90Day: 72 }
  ]

  const newVsReturning: NewVsReturning = {
    new: totalNewPatients,
    returning: totalReturningPatients,
    newPercentage: 27,
    returningPercentage: 73,
    newRevenue: 54600,
    returningRevenue: 190350
  }

  const cohortAnalysis: CohortData[] = [
    { cohortMonth: 'Jul 2024', newPatients: 142, month1Retention: 68, month2Retention: 52, month3Retention: 45, month6Retention: 38, averageLTV: 1680, totalRevenue: 238560 },
    { cohortMonth: 'Aug 2024', newPatients: 138, month1Retention: 71, month2Retention: 55, month3Retention: 48, month6Retention: 0, averageLTV: 1420, totalRevenue: 195960 },
    { cohortMonth: 'Sep 2024', newPatients: 151, month1Retention: 69, month2Retention: 54, month3Retention: 0, month6Retention: 0, averageLTV: 1150, totalRevenue: 173650 },
    { cohortMonth: 'Oct 2024', newPatients: 145, month1Retention: 72, month2Retention: 0, month3Retention: 0, month6Retention: 0, averageLTV: 870, totalRevenue: 126150 },
    { cohortMonth: 'Nov 2024', newPatients: 149, month1Retention: 74, month2Retention: 0, month3Retention: 0, month6Retention: 0, averageLTV: 620, totalRevenue: 92380 },
    { cohortMonth: 'Dec 2024', newPatients: 156, month1Retention: 0, month2Retention: 0, month3Retention: 0, month6Retention: 0, averageLTV: 350, totalRevenue: 54600 }
  ]

  const churnRisk: ChurnRiskMetrics = {
    atRisk30Days: 23,
    atRisk60Days: 45,
    atRisk90Days: 67,
    atRisk120Days: 34,
    churned: 34,
    totalAtRisk: 169,
    atRiskRevenue: 422500
  }

  const acquisitionTrend: AcquisitionTrend[] = [
    { date: 'Dec 1', newPatients: 5, returningPatients: 14, referralPatients: 2, onlineBookings: 3, walkIns: 1 },
    { date: 'Dec 2', newPatients: 4, returningPatients: 12, referralPatients: 1, onlineBookings: 2, walkIns: 1 },
    { date: 'Dec 3', newPatients: 6, returningPatients: 15, referralPatients: 2, onlineBookings: 3, walkIns: 2 },
    { date: 'Dec 4', newPatients: 7, returningPatients: 18, referralPatients: 3, onlineBookings: 4, walkIns: 1 },
    { date: 'Dec 5', newPatients: 8, returningPatients: 20, referralPatients: 2, onlineBookings: 5, walkIns: 2 },
    { date: 'Dec 6', newPatients: 9, returningPatients: 22, referralPatients: 3, onlineBookings: 4, walkIns: 2 },
    { date: 'Dec 7', newPatients: 6, returningPatients: 16, referralPatients: 2, onlineBookings: 3, walkIns: 1 },
    { date: 'Dec 8', newPatients: 5, returningPatients: 13, referralPatients: 1, onlineBookings: 2, walkIns: 1 },
    { date: 'Dec 9', newPatients: 4, returningPatients: 11, referralPatients: 1, onlineBookings: 2, walkIns: 0 },
    { date: 'Dec 10', newPatients: 7, returningPatients: 17, referralPatients: 2, onlineBookings: 3, walkIns: 2 },
    { date: 'Dec 11', newPatients: 8, returningPatients: 19, referralPatients: 3, onlineBookings: 4, walkIns: 1 },
    { date: 'Dec 12', newPatients: 6, returningPatients: 15, referralPatients: 2, onlineBookings: 3, walkIns: 1 },
    { date: 'Dec 13', newPatients: 7, returningPatients: 16, referralPatients: 2, onlineBookings: 4, walkIns: 2 },
    { date: 'Dec 14', newPatients: 5, returningPatients: 14, referralPatients: 1, onlineBookings: 2, walkIns: 1 }
  ]

  const pieColors = ['#9333ea', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

  const sourceIcons: Record<string, any> = {
    'Online Booking': Globe,
    'Referral': Gift,
    'Walk-in': Users,
    'Google Organic': Search,
    'Instagram': Instagram,
    'Google Ads': Search,
    'Phone': Phone
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
      const exportedData = bySource.map(s => ({
        source: s.source,
        count: s.count,
        percentage: s.percentage,
        revenue: s.revenue,
        averageLTV: s.averageLTV,
        retentionRate90Day: s.retentionRate90Day
      }))

      exportData({
        filename: `patient-acquisition-${new Date().toISOString().split('T')[0]}`,
        format,
        columns: columnPresets.patientAcquisition,
        data: exportedData,
        title: 'Patient Acquisition Report',
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Get retention heatmap color
  const getRetentionColor = (value: number) => {
    if (value === 0) return 'bg-gray-100 text-gray-400'
    if (value >= 70) return 'bg-green-500 text-white'
    if (value >= 50) return 'bg-green-300 text-green-900'
    if (value >= 30) return 'bg-yellow-300 text-yellow-900'
    return 'bg-red-300 text-red-900'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Patient Acquisition Analytics</h2>
            <p className="text-gray-600">Track where patients come from and how they engage</p>
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
            <UserPlus className="w-6 h-6 text-purple-600" />
            <div className={`flex items-center gap-1 text-sm ${newPatientsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {newPatientsChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(newPatientsChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalNewPatients}</p>
          <p className="text-sm text-gray-600">New Patients (MTD)</p>
          <p className="text-xs text-gray-500 mt-1">vs {previousNewPatients} last month</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <UserCheck className="w-6 h-6 text-green-600" />
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              5.2%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalReturningPatients}</p>
          <p className="text-sm text-gray-600">Returning Patients</p>
          <p className="text-xs text-gray-500 mt-1">{newVsReturning.returningPercentage}% of total visits</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <Gift className="w-6 h-6 text-pink-600" />
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUpRight className="w-4 h-4" />
              18.2%
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">24.4%</p>
          <p className="text-sm text-gray-600">Referral Rate</p>
          <p className="text-xs text-gray-500 mt-1">Industry avg: 3.6%</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{churnRisk.totalAtRisk}</p>
          <p className="text-sm text-gray-600">At-Risk Patients</p>
          <p className="text-xs text-amber-600 mt-1">{formatCurrency(churnRisk.atRiskRevenue)} potential loss</p>
        </div>
      </div>

      {/* Source Attribution & New vs Returning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Attribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Acquisition by Source</h3>
          <div className="grid grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie
                  data={bySource}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={false}
                >
                  {bySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="space-y-2 overflow-y-auto max-h-[200px]">
              {bySource.map((source, idx) => {
                const Icon = sourceIcons[source.source] || Globe
                return (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                      />
                      <Icon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-700 truncate max-w-[80px]">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold">{source.count}</p>
                      <p className="text-xs text-gray-500">{source.percentage}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* New vs Returning */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New vs Returning Patients</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#9333ea"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${newVsReturning.newPercentage * 3.52} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{newVsReturning.newPercentage}%</p>
                    <p className="text-xs text-gray-500">New</p>
                  </div>
                </div>
              </div>
              <p className="mt-2 font-medium text-gray-900">{newVsReturning.new} New Patients</p>
              <p className="text-sm text-gray-500">{formatCurrency(newVsReturning.newRevenue)} revenue</p>
            </div>

            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${newVsReturning.returningPercentage * 3.52} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{newVsReturning.returningPercentage}%</p>
                    <p className="text-xs text-gray-500">Returning</p>
                  </div>
                </div>
              </div>
              <p className="mt-2 font-medium text-gray-900">{newVsReturning.returning} Returning</p>
              <p className="text-sm text-gray-500">{formatCurrency(newVsReturning.returningRevenue)} revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Source Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acquisition Source Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Source</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Patients</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">%</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">First Visit Rev</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Avg LTV</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">90-Day Retention</th>
              </tr>
            </thead>
            <tbody>
              {bySource.map((source, idx) => {
                const Icon = sourceIcons[source.source] || Globe
                return (
                  <tr key={source.source} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                        />
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{source.source}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900">{source.count}</td>
                    <td className="text-right py-3 px-4 text-gray-600">{source.percentage}%</td>
                    <td className="text-right py-3 px-4 text-gray-900">{formatCurrency(source.revenue)}</td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">{formatCurrency(source.averageLTV)}</td>
                    <td className="text-right py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        source.retentionRate90Day >= 75 ? 'bg-green-100 text-green-700' :
                        source.retentionRate90Day >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {source.retentionRate90Day}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Retention Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cohort</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">New</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Month 1</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Month 2</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Month 3</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Month 6</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Avg LTV</th>
              </tr>
            </thead>
            <tbody>
              {cohortAnalysis.map((cohort) => (
                <tr key={cohort.cohortMonth} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{cohort.cohortMonth}</td>
                  <td className="text-center py-3 px-4 text-gray-900">{cohort.newPatients}</td>
                  <td className="text-center py-3 px-2">
                    <span className={`inline-block w-12 py-1 rounded text-xs font-medium ${getRetentionColor(cohort.month1Retention)}`}>
                      {cohort.month1Retention > 0 ? `${cohort.month1Retention}%` : '-'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className={`inline-block w-12 py-1 rounded text-xs font-medium ${getRetentionColor(cohort.month2Retention)}`}>
                      {cohort.month2Retention > 0 ? `${cohort.month2Retention}%` : '-'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className={`inline-block w-12 py-1 rounded text-xs font-medium ${getRetentionColor(cohort.month3Retention)}`}>
                      {cohort.month3Retention > 0 ? `${cohort.month3Retention}%` : '-'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className={`inline-block w-12 py-1 rounded text-xs font-medium ${getRetentionColor(cohort.month6Retention)}`}>
                      {cohort.month6Retention > 0 ? `${cohort.month6Retention}%` : '-'}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 font-medium text-gray-900">{formatCurrency(cohort.averageLTV)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <span className="text-gray-500">Retention Rate:</span>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-500"></span>
            <span>≥70%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-300"></span>
            <span>50-69%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-yellow-300"></span>
            <span>30-49%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-red-300"></span>
            <span>&lt;30%</span>
          </div>
        </div>
      </div>

      {/* Churn Risk & Acquisition Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Risk Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Risk Analysis</h3>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">30 Days No Visit</span>
                </div>
                <span className="text-2xl font-bold text-yellow-900">{churnRisk.atRisk30Days}</span>
              </div>
              <p className="text-sm text-yellow-700">Should receive re-engagement campaign</p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">60 Days No Visit</span>
                </div>
                <span className="text-2xl font-bold text-orange-900">{churnRisk.atRisk60Days}</span>
              </div>
              <p className="text-sm text-orange-700">High priority - send special offer</p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">90+ Days No Visit</span>
                </div>
                <span className="text-2xl font-bold text-red-900">{churnRisk.atRisk90Days + churnRisk.atRisk120Days}</span>
              </div>
              <p className="text-sm text-red-700">At risk of churning - immediate action needed</p>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total at-risk revenue</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(churnRisk.atRiskRevenue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Acquisition Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Acquisition Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={acquisitionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="newPatients" stackId="1" stroke="#9333ea" fill="#9333ea" fillOpacity={0.6} name="New" />
              <Area type="monotone" dataKey="referralPatients" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} name="Referral" />
              <Area type="monotone" dataKey="onlineBookings" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Online" />
              <Area type="monotone" dataKey="walkIns" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Walk-in" />
            </AreaChart>
          </ResponsiveContainer>
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
                Referral patients have the highest LTV ({formatCurrency(bySource.find(s => s.source === 'Referral')?.averageLTV || 0)}) and 89% 90-day retention - invest more in referral program
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Walk-ins have lowest retention (62%) - improve follow-up for this segment
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                {churnRisk.totalAtRisk} patients at risk representing {formatCurrency(churnRisk.atRiskRevenue)} - launch re-engagement campaign
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                Online booking now accounts for 33.3% of new patients - ensure booking experience is optimized
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
