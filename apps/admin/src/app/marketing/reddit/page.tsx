'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  SkipForward,
  CheckCircle,
  Send,
  Clock,
  TrendingUp,
  MessageSquare,
} from 'lucide-react'
import { RedditProspect, RedditStatusCounts } from '@/types/reddit'

type TabType = 'prospects' | 'history'

export default function RedditOutreachPage() {
  const [activeTab, setActiveTab] = useState<TabType>('prospects')
  const [prospects, setProspects] = useState<RedditProspect[]>([])
  const [statusCounts, setStatusCounts] = useState<RedditStatusCounts>({
    new: 0,
    drafted: 0,
    approved: 0,
    posted: 0,
    skipped: 0,
  })
  const [loading, setLoading] = useState(true)
  const [discovering, setDiscovering] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Load prospects
  useEffect(() => {
    loadProspects()
  }, [activeTab])

  const loadProspects = async () => {
    try {
      setLoading(true)
      const statusFilter = activeTab === 'prospects' ? '' : 'posted,skipped'
      const response = await fetch(`/api/marketing/reddit/prospects?${statusFilter ? `status=${statusFilter}` : ''}`)
      const data = await response.json()

      if (data.success) {
        setProspects(data.data)
        setStatusCounts(data.statusCounts)
      }
    } catch (error) {
      console.error('Failed to load prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDiscover = async () => {
    try {
      setDiscovering(true)
      const response = await fetch('/api/marketing/reddit/discover', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        // Refresh prospects list
        await loadProspects()
        alert(`Discovered ${data.data.length} new prospects!`)
      }
    } catch (error) {
      console.error('Failed to discover prospects:', error)
      alert('Failed to discover new prospects')
    } finally {
      setDiscovering(false)
    }
  }

  const handleRegenerateDraft = async (prospectId: string) => {
    try {
      setActionLoading(prospectId)
      const response = await fetch('/api/marketing/reddit/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId }),
      })
      const data = await response.json()

      if (data.success) {
        // Update prospect in state
        setProspects(prev =>
          prev.map(p => (p.id === prospectId ? data.data : p))
        )
      }
    } catch (error) {
      console.error('Failed to regenerate draft:', error)
      alert('Failed to regenerate draft')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSkip = async (prospectId: string) => {
    try {
      setActionLoading(prospectId)
      const response = await fetch('/api/marketing/reddit/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId, status: 'skipped' }),
      })
      const data = await response.json()

      if (data.success) {
        // Remove from current view
        setProspects(prev => prev.filter(p => p.id !== prospectId))
        setStatusCounts(prev => ({
          ...prev,
          skipped: prev.skipped + 1,
          [data.data.status]: Math.max(0, prev[data.data.status as keyof RedditStatusCounts] - 1),
        }))
      }
    } catch (error) {
      console.error('Failed to skip prospect:', error)
      alert('Failed to skip prospect')
    } finally {
      setActionLoading(null)
    }
  }

  const handleOpenInReddit = async (prospect: RedditProspect) => {
    // Copy draft to clipboard
    if (prospect.draftResponse) {
      try {
        await navigator.clipboard.writeText(prospect.draftResponse)
        // Show temporary success message
        alert('Draft copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
      }
    }

    // Open URL in new tab
    window.open(prospect.url, '_blank')

    // Mark as approved
    try {
      await fetch('/api/marketing/reddit/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId: prospect.id, status: 'approved' }),
      })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handlePostViaAPI = async (prospectId: string, draftResponse: string) => {
    try {
      setActionLoading(prospectId)
      const response = await fetch('/api/marketing/reddit/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId, draftResponse }),
      })
      const data = await response.json()

      if (data.success) {
        // Remove from current view or update status
        setProspects(prev => prev.filter(p => p.id !== prospectId))
        setStatusCounts(prev => ({
          ...prev,
          posted: prev.posted + 1,
        }))
        alert('Comment posted successfully!')
      } else {
        alert(`Failed to post: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
      alert('Failed to post comment')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateDraft = async (prospectId: string, newDraft: string) => {
    try {
      await fetch('/api/marketing/reddit/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId, draftResponse: newDraft }),
      })
      // Update local state
      setProspects(prev =>
        prev.map(p => (p.id === prospectId ? { ...p, draftResponse: newDraft } : p))
      )
    } catch (error) {
      console.error('Failed to update draft:', error)
    }
  }

  // Filter prospects by search
  const filteredProspects = prospects.filter(p => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      p.title.toLowerCase().includes(query) ||
      p.subreddit.toLowerCase().includes(query) ||
      p.originalText.toLowerCase().includes(query)
    )
  })

  // Separate prospects for tabs
  const activeProspects = filteredProspects.filter(
    p => p.status === 'new' || p.status === 'drafted' || p.status === 'approved'
  )
  const historyProspects = filteredProspects.filter(
    p => p.status === 'posted' || p.status === 'skipped'
  )

  const displayProspects = activeTab === 'prospects' ? activeProspects : historyProspects

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reddit Outreach</h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor and respond to relevant Reddit conversations
              </p>
            </div>
            <Button
              onClick={handleDiscover}
              disabled={discovering}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${discovering ? 'animate-spin' : ''}`} />
              Discover New
            </Button>
          </div>

          {/* Status Counts */}
          <div className="grid grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">New</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.new}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Drafted</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.drafted}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Posted</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.posted}</p>
                  </div>
                  <Send className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Skipped</p>
                    <p className="text-2xl font-bold text-gray-900">{statusCounts.skipped}</p>
                  </div>
                  <SkipForward className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'prospects' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('prospects')}
            >
              Prospects ({activeProspects.length})
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('history')}
            >
              History ({historyProspects.length})
            </Button>
          </div>

          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prospects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Prospects List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : displayProspects.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No prospects found</p>
            <p className="text-sm text-gray-500">
              {activeTab === 'prospects'
                ? 'Click "Discover New" to find relevant Reddit conversations'
                : 'No posted or skipped prospects yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayProspects.map(prospect => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                onRegenerateDraft={handleRegenerateDraft}
                onSkip={handleSkip}
                onOpenInReddit={handleOpenInReddit}
                onPostViaAPI={handlePostViaAPI}
                onUpdateDraft={handleUpdateDraft}
                isLoading={actionLoading === prospect.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ProspectCardProps {
  prospect: RedditProspect
  onRegenerateDraft: (id: string) => void
  onSkip: (id: string) => void
  onOpenInReddit: (prospect: RedditProspect) => void
  onPostViaAPI: (id: string, draft: string) => void
  onUpdateDraft: (id: string, draft: string) => void
  isLoading: boolean
}

function ProspectCard({
  prospect,
  onRegenerateDraft,
  onSkip,
  onOpenInReddit,
  onPostViaAPI,
  onUpdateDraft,
  isLoading,
}: ProspectCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDraft, setEditedDraft] = useState(prospect.draftResponse || '')

  const handleSaveDraft = () => {
    onUpdateDraft(prospect.id, editedDraft)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedDraft(prospect.draftResponse || '')
    setIsEditing(false)
  }

  const getStatusBadge = () => {
    const badges = {
      new: 'bg-blue-100 text-blue-800',
      drafted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      posted: 'bg-purple-100 text-purple-800',
      skipped: 'bg-gray-100 text-gray-800',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[prospect.status]}`}>
        {prospect.status.charAt(0).toUpperCase() + prospect.status.slice(1)}
      </span>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                r/{prospect.subreddit}
              </span>
              {getStatusBadge()}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {prospect.score}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {prospect.ageHours < 1
                    ? `${Math.round(prospect.ageHours * 60)}m ago`
                    : `${Math.round(prospect.ageHours)}h ago`}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{prospect.title}</h3>
            <p className="text-sm text-gray-600">{prospect.snippet}</p>
          </div>
        </div>

        {/* Original Text */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 mb-1">Original Post</p>
          <p className="text-sm text-gray-700">{prospect.originalText}</p>
        </div>

        {/* AI Draft Response */}
        {prospect.draftResponse && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">AI-Generated Response</p>
              {!isEditing && prospect.status !== 'posted' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-6 text-xs"
                >
                  Edit
                </Button>
              )}
            </div>
            {isEditing ? (
              <div>
                <textarea
                  value={editedDraft}
                  onChange={e => setEditedDraft(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[150px] text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={handleSaveDraft}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{prospect.draftResponse}</p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {prospect.errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{prospect.errorMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        {prospect.status !== 'posted' && prospect.status !== 'skipped' && (
          <div className="flex gap-2">
            {!prospect.draftResponse ? (
              <Button
                onClick={() => onRegenerateDraft(prospect.id)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Generate Draft
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => onRegenerateDraft(prospect.id)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenInReddit(prospect)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <Copy className="h-4 w-4" />
                  Open & Copy
                </Button>
                <Button
                  onClick={() => onPostViaAPI(prospect.id, prospect.draftResponse!)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Post via API
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              onClick={() => onSkip(prospect.id)}
              disabled={isLoading}
              className="flex items-center gap-2 ml-auto"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>
          </div>
        )}

        {/* History Status Info */}
        {(prospect.status === 'posted' || prospect.status === 'skipped') && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {prospect.status === 'posted' && prospect.postedAt && (
                <>Posted {new Date(prospect.postedAt).toLocaleString()}</>
              )}
              {prospect.status === 'skipped' && prospect.skippedAt && (
                <>Skipped {new Date(prospect.skippedAt).toLocaleString()}</>
              )}
            </span>
            <a
              href={prospect.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
            >
              <ExternalLink className="h-4 w-4" />
              View on Reddit
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
