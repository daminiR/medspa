'use client'

import React, { useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import {
  Plus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Edit,
  Users,
  TrendingUp,
  MessageSquare,
  Calendar,
  Zap,
  Filter,
  X,
  ChevronDown,
  AlertTriangle,
  CheckCheck,
  Percent,
} from 'lucide-react'
import { format, formatDistanceToNow, addDays, subDays } from 'date-fns'

// Campaign type
type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed'

interface Campaign {
  id: string
  name: string
  status: CampaignStatus
  audienceType: string
  audienceCount: number
  consentCount: number
  message: string
  messageLength: number
  sentAt: Date | null
  scheduledFor: Date | null
  stats: {
    sent: number
    delivered: number
    clicked: number
    failed: number
  }
  creditsCost: number
}

// Mock data for campaigns
const mockCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    name: 'Holiday Special - Winter Promotion',
    status: 'sent' as CampaignStatus,
    audienceType: 'all_patients',
    audienceCount: 2340,
    consentCount: 2087,
    message: 'This winter, get 20% off all treatments! Book your appointment today.',
    messageLength: 72,
    sentAt: subDays(new Date(), 5),
    scheduledFor: null,
    stats: {
      sent: 2087,
      delivered: 1998,
      clicked: 456,
      failed: 89,
    },
    creditsCost: 2087,
  },
  {
    id: 'camp-002',
    name: 'Post-Care Follow-up - Botox Patients',
    status: 'sent' as CampaignStatus,
    audienceType: 'last_visit_30days',
    audienceCount: 432,
    consentCount: 398,
    message: 'How are you loving your results? Reply with any questions about post-care!',
    messageLength: 81,
    sentAt: subDays(new Date(), 2),
    scheduledFor: null,
    stats: {
      sent: 398,
      delivered: 387,
      clicked: 52,
      failed: 11,
    },
    creditsCost: 398,
  },
  {
    id: 'camp-003',
    name: 'VIP Exclusive - New Treatment Alert',
    status: 'scheduled' as CampaignStatus,
    audienceType: 'vip',
    audienceCount: 156,
    consentCount: 148,
    message: 'Exclusive VIP preview: We just launched a new non-invasive skin tightening treatment!',
    messageLength: 88,
    sentAt: null,
    scheduledFor: addDays(new Date(), 3),
    stats: {
      sent: 0,
      delivered: 0,
      clicked: 0,
      failed: 0,
    },
    creditsCost: 148,
  },
  {
    id: 'camp-004',
    name: 'Appointment Reminder - Tomorrow Appointments',
    status: 'failed' as CampaignStatus,
    audienceType: 'custom',
    audienceCount: 78,
    consentCount: 72,
    message: "You have an appointment tomorrow at 2:00 PM. Please arrive 10 minutes early.",
    messageLength: 85,
    sentAt: subDays(new Date(), 1),
    scheduledFor: null,
    stats: {
      sent: 65,
      delivered: 62,
      clicked: 8,
      failed: 7,
    },
    creditsCost: 72,
  },
  {
    id: 'camp-005',
    name: 'Re-engagement Campaign - 90+ Days No Visit',
    status: 'draft' as CampaignStatus,
    audienceType: 'custom',
    audienceCount: 567,
    consentCount: 512,
    message: "We miss you! Come back and enjoy 15% off your next appointment. Valid for 30 days.",
    messageLength: 89,
    sentAt: null,
    scheduledFor: null,
    stats: {
      sent: 0,
      delivered: 0,
      clicked: 0,
      failed: 0,
    },
    creditsCost: 512,
  },
]

const audienceOptions = [
  { id: 'all_patients', name: 'All Patients', count: 2340 },
  { id: 'last_visit_30days', name: 'Last Visit > 30 Days', count: 1234 },
  { id: 'vip', name: 'VIPs Only', count: 156 },
  { id: 'custom', name: 'Custom Filter', count: 0 },
]

interface Campaign {
  id: string
  name: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  audienceType: string
  audienceCount: number
  consentCount: number
  message: string
  messageLength: number
  sentAt: Date | null
  scheduledFor: Date | null
  stats: {
    sent: number
    delivered: number
    clicked: number
    failed: number
  }
  creditsCost: number
}

interface CampaignBuilderState {
  name: string
  audience: string
  message: string
  scheduleMode: 'now' | 'later'
  scheduledDate: Date | null
  scheduledTime: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'sent' | 'failed'>('all')
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [smsCredits, setSmsCredits] = useState(500)

  const [builderState, setBuilderState] = useState<CampaignBuilderState>({
    name: '',
    audience: 'all_patients',
    message: '',
    scheduleMode: 'now',
    scheduledDate: new Date(),
    scheduledTime: '09:00',
  })

  // Get selected audience details
  const selectedAudience = audienceOptions.find(a => a.id === builderState.audience)
  const estimatedRecipientsWithConsent = selectedAudience?.id === 'custom'
    ? Math.floor(builderState.message.length > 0 ? 200 : 0)
    : Math.floor((selectedAudience?.count || 0) * 0.85) // Estimate 85% have marketing consent

  const estimatedCreditsNeeded = Math.ceil(builderState.message.length / 160) * estimatedRecipientsWithConsent

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      const aDate = a.sentAt || a.scheduledFor || new Date()
      const bDate = b.sentAt || b.scheduledFor || new Date()
      return bDate.getTime() - aDate.getTime()
    })
  }, [campaigns, statusFilter, searchQuery])

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId)

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <AlertCircle className="h-4 w-4" />
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      case 'sent':
        return <CheckCircle2 className="h-4 w-4" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  // Calculate delivery rate percentage
  const getDeliveryRate = (campaign: Campaign): number => {
    if (campaign.stats.sent === 0) return 0
    return Math.round((campaign.stats.delivered / campaign.stats.sent) * 100)
  }

  // Calculate click rate percentage
  const getClickRate = (campaign: Campaign): number => {
    if (campaign.stats.delivered === 0) return 0
    return Math.round((campaign.stats.clicked / campaign.stats.delivered) * 100)
  }

  // Handle campaign creation
  const handleCreateCampaign = () => {
    if (!builderState.name.trim() || !builderState.message.trim()) {
      alert('Please fill in campaign name and message')
      return
    }

    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: builderState.name,
      status: builderState.scheduleMode === 'later' ? 'scheduled' : 'sent',
      audienceType: builderState.audience,
      audienceCount: selectedAudience?.count || 0,
      consentCount: estimatedRecipientsWithConsent,
      message: builderState.message,
      messageLength: builderState.message.length,
      sentAt: builderState.scheduleMode === 'later' ? null : new Date(),
      scheduledFor: builderState.scheduleMode === 'later' ? builderState.scheduledDate : null,
      stats: {
        sent: builderState.scheduleMode === 'later' ? 0 : estimatedRecipientsWithConsent,
        delivered: builderState.scheduleMode === 'later' ? 0 : Math.floor(estimatedRecipientsWithConsent * 0.95),
        clicked: builderState.scheduleMode === 'later' ? 0 : Math.floor(estimatedRecipientsWithConsent * 0.15),
        failed: builderState.scheduleMode === 'later' ? 0 : Math.floor(estimatedRecipientsWithConsent * 0.05),
      },
      creditsCost: estimatedCreditsNeeded,
    }

    setCampaigns([newCampaign, ...campaigns])
    setSmsCredits(Math.max(0, smsCredits - estimatedCreditsNeeded))

    // Reset form
    setBuilderState({
      name: '',
      audience: 'all_patients',
      message: '',
      scheduleMode: 'now',
      scheduledDate: new Date(),
      scheduledTime: '09:00',
    })
    setShowCampaignBuilder(false)
    alert('Campaign created successfully!')
  }

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(campaigns.filter(c => c.id !== id))
      setSelectedCampaignId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketing SMS Campaigns</h1>
              <p className="text-gray-500 mt-1">
                Create and manage marketing campaigns - separate from transactional messages for TCPA compliance
              </p>
            </div>
            <button
              onClick={() => setShowCampaignBuilder(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" />
              New Campaign
            </button>
          </div>
        </div>

        {/* Credit System Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">SMS Credits Available</p>
                <p className="text-3xl font-bold text-gray-900">{smsCredits}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {showCampaignBuilder && (
            <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-4 bg-amber-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-800 mb-1">This Campaign Will Use</p>
                  <p className="text-3xl font-bold text-amber-900">{estimatedCreditsNeeded}</p>
                  <p className="text-xs text-amber-700 mt-1">credits (≈{estimatedRecipientsWithConsent} patients)</p>
                </div>
                {estimatedCreditsNeeded > smsCredits && (
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-sm"
                />
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-lg outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Campaign List Items */}
            <div className="space-y-3">
              {filteredCampaigns.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No campaigns found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first campaign to get started'}
                  </p>
                </div>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => setSelectedCampaignId(campaign.id)}
                    className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedCampaignId === campaign.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(campaign.status)}`}>
                            {getStatusIcon(campaign.status)}
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{campaign.message}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Audience & Stats Row */}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>{campaign.consentCount} with consent</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>{Math.ceil(campaign.messageLength / 160)} SMS</span>
                      </div>
                    </div>

                    {/* Stats Row - Only show if campaign has been sent */}
                    {(campaign.status === 'sent' || campaign.status === 'failed') && (
                      <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Sent</p>
                          <p className="font-bold text-gray-900">{campaign.stats.sent}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Delivered %</p>
                          <p className="font-bold text-gray-900">{getDeliveryRate(campaign)}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Click Rate</p>
                          <p className="font-bold text-gray-900">{getClickRate(campaign)}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Failed</p>
                          <p className="font-bold text-red-600">{campaign.stats.failed}</p>
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {campaign.status === 'scheduled'
                          ? `Scheduled: ${format(campaign.scheduledFor!, 'MMM d, yyyy h:mm a')}`
                          : campaign.sentAt
                            ? `Sent ${formatDistanceToNow(campaign.sentAt, { addSuffix: true })}`
                            : 'Draft'}
                      </span>
                      <span className="text-blue-600 font-medium">{campaign.creditsCost} credits</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Campaign Builder Sidebar */}
          {showCampaignBuilder ? (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Campaign Builder</h2>
                  <button
                    onClick={() => setShowCampaignBuilder(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Campaign Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                    <input
                      type="text"
                      value={builderState.name}
                      onChange={(e) => setBuilderState({ ...builderState, name: e.target.value })}
                      placeholder="e.g., Holiday Special Offer"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Audience Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <select
                      value={builderState.audience}
                      onChange={(e) => setBuilderState({ ...builderState, audience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {audienceOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                          {option.count > 0 && ` (${option.count} patients)`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Consent Warning */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800">
                        <p className="font-medium mb-1">Marketing Consent Check</p>
                        <p>
                          {estimatedRecipientsWithConsent} patients have marketing consent.
                          Opted-out patients will be excluded automatically.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Message Composer */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <span className={`text-xs font-medium ${builderState.message.length > 320 ? 'text-red-600' : builderState.message.length > 160 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {builderState.message.length}/320
                      </span>
                    </div>
                    <textarea
                      value={builderState.message}
                      onChange={(e) => setBuilderState({ ...builderState, message: e.target.value.slice(0, 320) })}
                      placeholder="Write your marketing message here..."
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Your message will be sent as {Math.ceil(builderState.message.length / 160)} SMS(es)
                    </p>
                  </div>

                  {/* Schedule Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Delivery</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBuilderState({ ...builderState, scheduleMode: 'now' })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          builderState.scheduleMode === 'now'
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <Send className="h-4 w-4 inline mr-1" />
                        Send Now
                      </button>
                      <button
                        onClick={() => setBuilderState({ ...builderState, scheduleMode: 'later' })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          builderState.scheduleMode === 'later'
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Schedule
                      </button>
                    </div>
                  </div>

                  {/* Schedule Date/Time */}
                  {builderState.scheduleMode === 'later' && (
                    <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={format(builderState.scheduledDate || new Date(), 'yyyy-MM-dd')}
                          onChange={(e) => {
                            const newDate = new Date(e.target.value)
                            setBuilderState({ ...builderState, scheduledDate: newDate })
                          }}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                        <input
                          type="time"
                          value={builderState.scheduledTime}
                          onChange={(e) => setBuilderState({ ...builderState, scheduledTime: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Preview Button */}
                  <button
                    onClick={() => setShowPreview(true)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Message
                  </button>

                  {/* Credit Check */}
                  {estimatedCreditsNeeded > smsCredits && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-800 font-medium">
                        Insufficient credits! You need {estimatedCreditsNeeded - smsCredits} more credits.
                      </p>
                    </div>
                  )}

                  {/* Create Button */}
                  <button
                    onClick={handleCreateCampaign}
                    disabled={!builderState.name || !builderState.message || estimatedCreditsNeeded > smsCredits}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCheck className="h-4 w-4" />
                    {builderState.scheduleMode === 'later' ? 'Schedule Campaign' : 'Send Campaign'}
                  </button>
                </div>
              </div>
            </div>
          ) : selectedCampaignId ? (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto">
                {selectedCampaign && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">Campaign Details</h2>
                      <button
                        onClick={() => setSelectedCampaignId(null)}
                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusBadge(selectedCampaign.status)}`}>
                          {getStatusIcon(selectedCampaign.status)}
                          {selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}
                        </span>
                      </div>

                      {/* Campaign Info */}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Campaign Name</p>
                        <p className="text-sm font-medium text-gray-900">{selectedCampaign.name}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Target Audience</p>
                        <p className="text-sm font-medium text-gray-900">
                          {audienceOptions.find(a => a.id === selectedCampaign.audienceType)?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{selectedCampaign.consentCount} patients with consent</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Message</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg break-words">
                          {selectedCampaign.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.ceil(selectedCampaign.messageLength / 160)} SMS ({selectedCampaign.messageLength} chars)
                        </p>
                      </div>

                      {/* Stats */}
                      {(selectedCampaign.status === 'sent' || selectedCampaign.status === 'failed') && (
                        <div>
                          <p className="text-xs text-gray-600 mb-2 font-medium">Performance</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Sent</span>
                              <span className="font-medium text-gray-900">{selectedCampaign.stats.sent}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: '100%' }}
                              ></div>
                            </div>

                            <div className="flex justify-between text-xs mt-3">
                              <span className="text-gray-600">Delivered</span>
                              <span className="font-medium text-gray-900">{getDeliveryRate(selectedCampaign)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${getDeliveryRate(selectedCampaign)}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between text-xs mt-3">
                              <span className="text-gray-600">Click Rate</span>
                              <span className="font-medium text-gray-900">{getClickRate(selectedCampaign)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${getClickRate(selectedCampaign)}%` }}
                              ></div>
                            </div>

                            {selectedCampaign.stats.failed > 0 && (
                              <>
                                <div className="flex justify-between text-xs mt-3">
                                  <span className="text-gray-600">Failed</span>
                                  <span className="font-medium text-red-600">{selectedCampaign.stats.failed}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-red-600 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        selectedCampaign.stats.sent > 0
                                          ? (selectedCampaign.stats.failed / selectedCampaign.stats.sent) * 100
                                          : 0
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">
                          {selectedCampaign.status === 'scheduled'
                            ? 'Scheduled for'
                            : selectedCampaign.sentAt
                              ? 'Sent'
                              : 'Created'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedCampaign.status === 'scheduled'
                            ? format(selectedCampaign.scheduledFor!, 'MMM d, yyyy h:mm a')
                            : selectedCampaign.sentAt
                              ? format(selectedCampaign.sentAt, 'MMM d, yyyy h:mm a')
                              : 'Draft'}
                        </p>
                      </div>

                      {/* Credits Used */}
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-900 font-medium">Credits Used</span>
                          <span className="text-lg font-bold text-blue-900">{selectedCampaign.creditsCost}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-4 border-t border-gray-200">
                        {selectedCampaign.status === 'draft' && (
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2">
                            <Send className="h-4 w-4" />
                            Send Campaign
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCampaign(selectedCampaign.id)}
                          className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Campaign
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Message Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Message Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-white/70 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-600 text-white rounded-lg p-4 mb-4">
                <p className="text-sm">{builderState.message}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Message Length</span>
                  <span className="font-medium text-gray-900">{builderState.message.length} characters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SMS Parts</span>
                  <span className="font-medium text-gray-900">{Math.ceil(builderState.message.length / 160)} SMS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipients</span>
                  <span className="font-medium text-gray-900">{estimatedRecipientsWithConsent} patients</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">Total Credits</span>
                  <span className="font-bold text-blue-600">{estimatedCreditsNeeded}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
