/**
 * PatientContextSidebar Component
 *
 * Right sidebar showing patient information, appointment context, and quick actions.
 * Provides at-a-glance patient details to help staff respond appropriately.
 * Now includes AI Dalphene tab for deeper AI interactions (Intercom/Zendesk pattern).
 */

'use client'

import React, { useState } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  MessageCircle,
  User,
  FileText,
  Bell,
  ChevronRight,
  CheckCheck,
  Sparkles,
  Send,
  Lightbulb,
  Brain,
  Search,
  BookOpen,
  Zap
} from 'lucide-react'
import type { ConversationPatient } from '@/hooks/useConversations'

interface PatientContextSidebarProps {
  patient: ConversationPatient
  onClose?: () => void
  onSnooze?: () => void
  conversationStatus?: 'open' | 'snoozed' | 'closed'
}

type TabType = 'patient' | 'delphi'

// AI Dalphene suggested actions
const suggestedActions = [
  { id: 1, label: 'Draft a reminder for their appointment', icon: Bell },
  { id: 2, label: 'Generate post-care instructions', icon: FileText },
  { id: 3, label: 'Suggest follow-up time', icon: Calendar },
]

// Knowledge base articles
const knowledgeArticles = [
  { id: 1, title: 'Botox Post-Care Instructions', relevance: 95 },
  { id: 2, title: 'Appointment Rescheduling Policy', relevance: 88 },
  { id: 3, title: 'Payment Plans FAQ', relevance: 72 },
]

export default function PatientContextSidebar({
  patient,
  onClose,
  onSnooze,
  conversationStatus = 'open',
}: PatientContextSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('patient')
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [kbSearch, setKbSearch] = useState('')

  // Mock detected intent and sentiment from conversation
  const detectedIntent = 'scheduling'
  const sentiment = 'neutral'

  const handleAiSubmit = () => {
    if (!aiQuery.trim()) return
    setIsAiLoading(true)
    setTimeout(() => {
      setAiResponse(`Based on ${patient.name}'s history, I recommend: ${aiQuery.includes('appointment') ? 'They typically prefer morning appointments on weekdays. Their last visit was for Botox, so a follow-up in 2-3 weeks would be ideal.' : 'I can help you draft a personalized response based on their treatment history and preferences.'}`)
      setIsAiLoading(false)
    }, 1000)
  }

  const handleSuggestedAction = (action: string) => {
    setAiQuery(action)
    setIsAiLoading(true)
    setTimeout(() => {
      if (action.includes('reminder')) {
        setAiResponse(`Draft reminder for ${patient.name}:\n\n"Hi ${patient.name.split(' ')[0]}, this is a friendly reminder about your upcoming appointment${patient.nextAppointment ? ` on ${patient.nextAppointment}` : ''}. Please arrive 10 minutes early. Reply CONFIRM to confirm or call us to reschedule."`)
      } else if (action.includes('post-care')) {
        setAiResponse(`Post-care instructions for ${patient.name}:\n\n"Thank you for your visit today! Here are your post-care reminders:\n- Avoid touching the treated area for 4 hours\n- No strenuous exercise for 24 hours\n- Stay upright for 4 hours\n- Results visible in 7-14 days\n\nCall us if you have any concerns!"`)
      } else if (action.includes('follow-up')) {
        setAiResponse(`Based on ${patient.name}'s treatment history and typical protocols, I suggest scheduling a follow-up in 2-3 weeks. Their preferred times are weekday mornings. Would you like me to check availability?`)
      }
      setIsAiLoading(false)
    }, 800)
  }

  const getSentimentColor = (s: string) => {
    switch (s) {
      case 'happy': return 'bg-green-100 text-green-700'
      case 'concerned': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case 'scheduling': return 'Scheduling Request'
      case 'post-care': return 'Post-Care Question'
      case 'billing': return 'Billing Inquiry'
      case 'general': return 'General Inquiry'
      default: return 'Unknown Intent'
    }
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab('patient')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'patient'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <User className="h-4 w-4" />
          Patient Info
        </button>
        <button
          onClick={() => setActiveTab('delphi')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'delphi'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Dalphene
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'delphi' ? (
          /* AI Dalphene Tab Content */
          <div className="p-4 space-y-5">
            {/* Ask AI Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-600" />
                Ask AI
              </h4>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                    placeholder="Ask about this patient..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAiSubmit}
                    disabled={!aiQuery.trim() || isAiLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-indigo-600 hover:text-indigo-700 disabled:text-gray-300"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                {isAiLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    Thinking...
                  </div>
                )}
                {aiResponse && !isAiLoading && (
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-800 whitespace-pre-line">{aiResponse}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Actions */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-indigo-600" />
                Suggested Actions
              </h4>
              <div className="space-y-2">
                {suggestedActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleSuggestedAction(action.label)}
                    className="w-full px-3 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-lg text-sm text-left transition-colors flex items-center gap-2 group"
                  >
                    <action.icon className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" />
                    <span className="text-gray-700 group-hover:text-indigo-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Analysis */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-600" />
                Message Analysis
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Detected Intent</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {getIntentLabel(detectedIntent)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Sentiment</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getSentimentColor(sentiment)}`}>
                    {sentiment}
                  </span>
                </div>
              </div>
            </div>

            {/* Knowledge Base */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                Knowledge Base
              </h4>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={kbSearch}
                    onChange={(e) => setKbSearch(e.target.value)}
                    placeholder="Search help articles..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase font-medium">Relevant Articles</p>
                  {knowledgeArticles
                    .filter(a => !kbSearch || a.title.toLowerCase().includes(kbSearch.toLowerCase()))
                    .map((article) => (
                    <button
                      key={article.id}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-gray-700 group-hover:text-indigo-600">{article.title}</span>
                      <span className="text-xs text-gray-400">{article.relevance}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Patient Info Tab Content (Original Content) */
          <>
            {/* Patient Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-b from-indigo-50/50 to-white">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-3 shadow-lg">
                  {patient.initials}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-sm text-gray-500">Patient since 2023</p>
              </div>

              {/* SMS Opt-in Status */}
              <div className="mb-4">
                <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${
                  patient.smsOptIn
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {patient.smsOptIn ? (
                    <>
                      <CheckCheck className="h-4 w-4" />
                      <span className="text-sm font-medium">SMS Active</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Email Only</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `tel:${patient.phone}`}
                  className="flex-1 px-3 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center gap-2 text-indigo-700 text-sm font-medium transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </button>
                <button
                  onClick={() => window.location.href = `mailto:${patient.email}`}
                  className="flex-1 px-3 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center gap-2 text-indigo-700 text-sm font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
              </div>
            </div>

            {/* Conversation Actions */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="space-y-2">
                {conversationStatus !== 'closed' && (
                  <button
                    onClick={onClose}
                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Close Conversation
                  </button>
                )}
                {conversationStatus !== 'snoozed' && (
                  <button
                    onClick={onSnooze}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm"
                  >
                    <Clock className="h-4 w-4" />
                    Snooze
                  </button>
                )}
              </div>
            </div>

            {/* Patient Information */}
            <div className="p-6 space-y-6">
              {/* Appointments */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Appointments
                </h4>
                <div className="space-y-3">
                  {patient.lastAppointment && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">Last Visit</span>
                        <Clock className="h-3 w-3 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{patient.lastAppointment}</p>
                    </div>
                  )}
                  {patient.nextAppointment && (
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-medium text-indigo-600 uppercase">Next Visit</span>
                        <Calendar className="h-3 w-3 text-indigo-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{patient.nextAppointment}</p>
                    </div>
                  )}
                  {!patient.nextAppointment && patient.lastAppointment && (
                    <button className="w-full px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                      Schedule Appointment
                    </button>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-600" />
                  Contact Info
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>
              </div>

              {/* Contact Preferences */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-indigo-600" />
                  Preferences
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Preferred Contact</span>
                    <span className="font-medium text-gray-900 capitalize">{patient.preferredChannel}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">SMS Reminders</span>
                    <span className={`font-medium ${patient.smsOptIn ? 'text-green-600' : 'text-gray-500'}`}>
                      {patient.smsOptIn ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Email Reminders</span>
                    <span className="font-medium text-green-600">Enabled</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors flex items-center justify-between group">
                    <span className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-400" />
                      Send Reminder
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                  <button className="w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors flex items-center justify-between group">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      Send Forms
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                  <button className="w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors flex items-center justify-between group">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      View Full Profile
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                  <button className="w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors flex items-center justify-between group">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      Schedule Appointment
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
