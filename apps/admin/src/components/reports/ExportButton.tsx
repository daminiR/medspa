'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown, FileSpreadsheet, FileText, Check, AlertCircle } from 'lucide-react'
import { exportData, ExportOptions, ExportColumn } from '@/lib/export'

interface ExportButtonProps {
  data: Record<string, any>[]
  columns: ExportColumn[]
  filename: string
  title?: string
  dateRange?: { start: string; end: string }
  disabled?: boolean
  variant?: 'default' | 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error'

export function ExportButton({
  data,
  columns,
  filename,
  title,
  dateRange,
  disabled = false,
  variant = 'default',
  size = 'md'
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset status after success/error
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setStatus('idle')
        setError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const handleExport = async (format: 'csv' | 'xlsx') => {
    if (disabled || data.length === 0) return

    setStatus('exporting')
    setError(null)
    setIsOpen(false)

    try {
      const options: ExportOptions = {
        filename: `${filename}-${new Date().toISOString().split('T')[0]}`,
        format,
        columns,
        data,
        title,
        dateRange
      }

      const result = exportData(options)

      if (result.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setError(result.error || 'Export failed')
      }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Export failed')
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-purple-600 text-white hover:bg-purple-700 border-purple-600'
      case 'outline':
        return 'bg-transparent text-gray-700 hover:bg-gray-50 border-gray-300'
      default:
        return 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-base'
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'exporting':
        return (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  const getButtonText = () => {
    switch (status) {
      case 'exporting':
        return 'Exporting...'
      case 'success':
        return 'Exported!'
      case 'error':
        return 'Failed'
      default:
        return 'Export'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || status === 'exporting' || data.length === 0}
        className={`
          inline-flex items-center gap-2 rounded-lg border font-medium
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getVariantClasses()}
          ${getSizeClasses()}
        `}
      >
        {getIcon()}
        <span>{getButtonText()}</span>
        {status === 'idle' && (
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Error tooltip */}
      {status === 'error' && error && (
        <div className="absolute top-full left-0 mt-1 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 whitespace-nowrap z-20">
          {error}
        </div>
      )}

      {/* Dropdown menu */}
      {isOpen && status === 'idle' && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium">Export as CSV</p>
                <p className="text-xs text-gray-500">Comma-separated values</p>
              </div>
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <div>
                <p className="font-medium">Export as Excel</p>
                <p className="text-xs text-gray-500">Microsoft Excel format</p>
              </div>
            </button>
          </div>
          {data.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
              <p className="text-xs text-gray-500">{data.length} rows to export</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Preset export configurations
export const exportPresets = {
  referrals: {
    columns: [
      { key: 'id', header: 'Referral ID' },
      { key: 'referrerName', header: 'Referrer Name' },
      { key: 'refereeName', header: 'Referee Name' },
      { key: 'status', header: 'Status' },
      { key: 'referrerReward', header: 'Referrer Reward' },
      { key: 'refereeReward', header: 'Referee Reward' },
      { key: 'createdAt', header: 'Created' },
      { key: 'completedAt', header: 'Completed' },
    ]
  },
  topReferrers: {
    columns: [
      { key: 'patientName', header: 'Patient Name' },
      { key: 'email', header: 'Email' },
      { key: 'referralCode', header: 'Referral Code' },
      { key: 'tier', header: 'Tier' },
      { key: 'totalReferrals', header: 'Total Referrals' },
      { key: 'qualifiedReferrals', header: 'Qualified' },
      { key: 'totalEarnings', header: 'Total Earnings' },
      { key: 'availableCredits', header: 'Available Credits' },
    ]
  },
  patientAcquisition: {
    columns: [
      { key: 'source', header: 'Source' },
      { key: 'count', header: 'Patients' },
      { key: 'percentage', header: 'Percentage' },
      { key: 'revenue', header: 'First Visit Revenue' },
      { key: 'averageLTV', header: 'Avg LTV' },
      { key: 'retentionRate90Day', header: '90-Day Retention' },
    ]
  },
  appointments: {
    columns: [
      { key: 'id', header: 'Appointment ID' },
      { key: 'patientName', header: 'Patient' },
      { key: 'serviceName', header: 'Service' },
      { key: 'practitionerName', header: 'Provider' },
      { key: 'startTime', header: 'Date/Time' },
      { key: 'duration', header: 'Duration (min)' },
      { key: 'status', header: 'Status' },
      { key: 'price', header: 'Price' },
    ]
  },
  revenue: {
    columns: [
      { key: 'date', header: 'Date' },
      { key: 'gross', header: 'Gross Revenue' },
      { key: 'net', header: 'Net Revenue' },
      { key: 'appointments', header: 'Appointments' },
      { key: 'services', header: 'Services Revenue' },
      { key: 'products', header: 'Products Revenue' },
      { key: 'tips', header: 'Tips' },
    ]
  }
}
