'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Navigation } from '@/components/Navigation'
import { 
  MessageSquare,
  Send,
  Search,
  Phone,
  Mail,
  MoreVertical,
  Star,
  Clock,
  CheckCheck,
  Check,
  AlertCircle,
  Paperclip,
  Calendar,
  MapPin,
  Bell,
  MessageCircle,
  Smartphone,
  Loader2,
  RefreshCw,
  Settings,
  FileText,
  Users,
  ChevronRight,
  Eye,
  X,
  ExternalLink,
  ClipboardCheck,
  FileSignature
} from 'lucide-react'
import { format, formatDistanceToNow, subHours, subDays } from 'date-fns'

// Mock data with SMS focus
const generateConversations = () => {
  const conversations = [
    {
      id: 1,
      patient: {
        id: 'p1',
        name: 'Sarah Johnson',
        initials: 'SJ',
        phone: '+17652500332', // Your verified number for testing
        email: 'sarah.j@email.com',
        lastAppointment: 'Botox - 2 days ago',
        nextAppointment: 'Follow-up - Next Tuesday 2:00 PM',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Thank you! See you next week for my follow-up.',
      lastMessageTime: subHours(new Date(), 2),
      unread: 0,
      starred: false,
      status: 'read',
      channel: 'sms',
      messages: [
        { id: 1, sender: 'clinic', text: 'Hi Sarah! Your follow-up appointment is confirmed for Tuesday at 2:00 PM.', time: subDays(new Date(), 2), status: 'delivered', channel: 'sms' },
        { id: 2, sender: 'patient', text: 'Great! Should I avoid anything before coming in?', time: subDays(new Date(), 1), status: 'received', channel: 'sms' },
        { id: 3, sender: 'clinic', text: 'Just avoid any blood thinners and alcohol 24 hours before. Also, please arrive with a clean face.', time: subDays(new Date(), 1), status: 'delivered', channel: 'sms' },
        { id: 4, sender: 'patient', text: 'Thank you! See you next week for my follow-up.', time: subHours(new Date(), 2), status: 'received', channel: 'sms' }
      ]
    },
    {
      id: 2,
      patient: {
        id: 'p2',
        name: 'Michael Chen',
        initials: 'MC',
        phone: '+17652500332', // Your verified number for testing
        email: 'mchen@email.com',
        lastAppointment: 'Consultation - 1 week ago',
        nextAppointment: 'Filler - Tomorrow 2:00 PM',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Can I arrive 15 minutes early tomorrow to fill out paperwork?',
      lastMessageTime: subHours(new Date(), 0.5),
      unread: 1,
      starred: true,
      status: 'unread',
      channel: 'sms',
      messages: [
        { id: 1, sender: 'patient', text: 'Hi, I have an appointment tomorrow', time: subHours(new Date(), 1), status: 'received', channel: 'sms' },
        { id: 2, sender: 'patient', text: 'Can I arrive 15 minutes early tomorrow to fill out paperwork?', time: subHours(new Date(), 0.5), status: 'received', channel: 'sms' }
      ]
    },
    {
      id: 3,
      patient: {
        id: 'p3',
        name: 'Emily Rodriguez',
        initials: 'ER',
        phone: '+17652500332', // Your verified number for testing
        email: 'emily.r@email.com',
        lastAppointment: 'Chemical Peel - Yesterday',
        nextAppointment: null,
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Is it normal for my skin to feel a bit tight today?',
      lastMessageTime: subHours(new Date(), 4),
      unread: 2,
      starred: false,
      status: 'unread',
      channel: 'sms',
      messages: [
        { id: 1, sender: 'patient', text: 'Hi, I had a chemical peel yesterday', time: subHours(new Date(), 5), status: 'received', channel: 'sms' },
        { id: 2, sender: 'patient', text: 'Is it normal for my skin to feel a bit tight today?', time: subHours(new Date(), 4), status: 'received', channel: 'sms' }
      ]
    }
  ]
  return conversations
}

// Default quick reply templates for medical spa
const defaultQuickReplies = {
  appointment: [
    'Your appointment is confirmed. See you soon!',
    'Please call us at 555-0100 to reschedule.',
    'Reply C to confirm or R to reschedule your appointment.',
  ],
  postCare: [
    'That\'s normal. Apply ice if needed and keep the area moisturized.',
    'Some tightness is normal. Use gentle cleanser and moisturize well.',
    'Avoid sun exposure and use SPF 30+ daily.',
  ],
  general: [
    'Thank you for your message. We\'ll respond shortly.',
    'Please call us at 555-0100 for immediate assistance.',
    'Our office hours are Mon-Fri 9AM-6PM, Sat 10AM-4PM.',
  ]
}

// Common forms and paperwork templates
const formTemplates = {
  intake: {
    botox: {
      id: 'form-botox',
      name: 'Botox Consent Form',
      description: 'Consent for neurotoxin injections',
      requiredFor: ['Botox', 'Dysport', 'Xeomin'],
      validFor: 'per-visit', // or '6-months', '1-year'
      fields: ['medical_history', 'allergies', 'medications', 'signature'],
      estimatedTime: '5-7 minutes',
      message: 'Please complete your Botox consent form before your appointment: [LINK]',
      previewContent: {
        title: 'Botox/Neurotoxin Treatment Consent',
        sections: [
          'Patient Information & Medical History',
          'Understanding of Treatment & Risks',
          'Pre/Post Treatment Instructions',
          'Consent & Authorization',
          'Patient Signature & Date'
        ]
      }
    },
    filler: {
      id: 'form-filler',
      name: 'Dermal Filler Consent',
      description: 'Consent for dermal filler treatments',
      requiredFor: ['Juvederm', 'Restylane', 'Sculptra'],
      validFor: 'per-visit',
      fields: ['medical_history', 'allergies', 'medications', 'signature'],
      estimatedTime: '5-7 minutes',
      message: 'Please review and sign your filler consent form: [LINK]',
      previewContent: {
        title: 'Dermal Filler Treatment Consent',
        sections: [
          'Patient Information',
          'Treatment Areas & Product Selection',
          'Medical History & Contraindications',
          'Risks & Complications',
          'Consent & E-Signature'
        ]
      }
    },
    general: {
      id: 'form-intake',
      name: 'New Patient Intake',
      description: 'General medical history and information',
      requiredFor: ['New Patient'],
      validFor: '1-year',
      fields: ['demographics', 'medical_history', 'insurance', 'emergency_contact', 'signature'],
      estimatedTime: '10-15 minutes',
      message: 'Welcome! Please complete your new patient forms: [LINK]',
      previewContent: {
        title: 'New Patient Registration',
        sections: [
          'Personal Information',
          'Insurance Information',
          'Medical History',
          'Current Medications',
          'Emergency Contact'
        ]
      }
    },
    hipaa: {
      id: 'form-hipaa',
      name: 'HIPAA Privacy Notice',
      description: 'Privacy practices acknowledgment',
      requiredFor: ['All Services'],
      validFor: 'permanent',
      fields: ['acknowledgment', 'signature'],
      estimatedTime: '2-3 minutes',
      message: 'Please review our HIPAA privacy practices: [LINK]',
      previewContent: {
        title: 'HIPAA Privacy Notice',
        sections: [
          'How We Use Your Information',
          'Your Privacy Rights',
          'Information Sharing Practices',
          'Acknowledgment of Receipt'
        ]
      }
    }
  },
  postCare: {
    botox: {
      id: 'care-botox',
      name: 'Botox Post-Care Instructions',
      description: 'Care instructions after neurotoxin treatment',
      message: 'Your Botox post-care instructions: • No lying flat for 4 hours • No exercise for 24 hours • No facial massage for 2 weeks • Click for full instructions: [LINK]',
      previewContent: {
        title: 'Botox Aftercare Instructions',
        instructions: [
          'Remain upright for 4 hours',
          'No strenuous exercise for 24 hours',
          'Avoid facial massage for 2 weeks',
          'Do not rub or press on treated areas',
          'Results visible in 3-7 days, full effect at 2 weeks'
        ]
      }
    },
    filler: {
      id: 'care-filler',
      name: 'Filler Post-Care Instructions',
      description: 'Care instructions after dermal filler',
      message: 'Your filler aftercare: • Apply ice for swelling • Avoid alcohol 24hrs • Sleep elevated • Full instructions: [LINK]',
      previewContent: {
        title: 'Filler Aftercare Instructions',
        instructions: [
          'Apply ice to reduce swelling',
          'Avoid alcohol for 24 hours',
          'Sleep with head elevated for 2 nights',
          'Gentle massage as directed',
          'Avoid intense heat/cold for 2 weeks'
        ]
      }
    },
    chemical_peel: {
      id: 'care-peel',
      name: 'Chemical Peel Aftercare',
      description: 'Post-peel skin care instructions',
      message: 'Post-peel care: • Keep skin moisturized • SPF 30+ daily • No exfoliants for 1 week • Details: [LINK]',
      previewContent: {
        title: 'Chemical Peel Aftercare',
        instructions: [
          'Keep skin moisturized at all times',
          'Apply SPF 30+ sunscreen daily',
          'No exfoliants or retinoids for 1 week',
          'Avoid direct sun exposure',
          'Expect peeling days 3-5'
        ]
      }
    }
  }
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(2)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [selectedQuickReplyCategory, setSelectedQuickReplyCategory] = useState('appointment')
  const [showTodayOnly, setShowTodayOnly] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'appointment-today' | 'post-care' | 'paperwork'>('all')
  const [showFormsPanel, setShowFormsPanel] = useState(false)
  const [selectedFormCategory, setSelectedFormCategory] = useState<'intake' | 'postCare'>('intake')
  const [previewingForm, setPreviewingForm] = useState<any>(null)
  const [sentForms, setSentForms] = useState<Record<string, { formId: string; sentAt: Date; status: 'sent' | 'viewed' | 'completed' }[]>>({})
  const [quickReplies, setQuickReplies] = useState<Record<string, string[]>>(defaultQuickReplies)
  
  // Load custom quick replies from localStorage
  useEffect(() => {
    const loadQuickReplies = () => {
      const saved = localStorage.getItem('quickReplies')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setQuickReplies(parsed)
          // Set first category as selected if current doesn't exist
          const categories = Object.keys(parsed)
          if (!categories.includes(selectedQuickReplyCategory) && categories.length > 0) {
            setSelectedQuickReplyCategory(categories[0])
          }
        } catch (e) {
          console.error('Failed to load custom quick replies:', e)
        }
      }
    }
    
    // Load on mount
    loadQuickReplies()
    
    // Listen for updates from settings page
    const handleUpdate = (e: CustomEvent) => {
      setQuickReplies(e.detail)
      const categories = Object.keys(e.detail)
      if (!categories.includes(selectedQuickReplyCategory) && categories.length > 0) {
        setSelectedQuickReplyCategory(categories[0])
      }
    }
    
    window.addEventListener('quickRepliesUpdated', handleUpdate as any)
    return () => window.removeEventListener('quickRepliesUpdated', handleUpdate as any)
  }, [selectedQuickReplyCategory])
  
  const conversations = useMemo(() => generateConversations(), [])
  const selectedConv = conversations.find(c => c.id === selectedConversation)
  const selectedPatient = selectedConv?.patient
  const currentMessages = selectedConv?.messages || []
  
  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations
    
    if (filterType === 'unread') {
      filtered = filtered.filter(c => c.unread > 0)
    } else if (filterType === 'starred') {
      filtered = filtered.filter(c => c.starred)
    } else if (filterType === 'sms') {
      filtered = filtered.filter(c => c.channel === 'sms')
    }
    
    // Priority filters for front desk workflow
    if (priorityFilter === 'appointment-today') {
      filtered = filtered.filter(c => c.patient.nextAppointment?.includes('Today') || c.patient.nextAppointment?.includes('Tomorrow'))
    } else if (priorityFilter === 'post-care') {
      filtered = filtered.filter(c => c.patient.lastAppointment?.includes('Yesterday') || c.patient.lastAppointment?.includes('days ago'))
    } else if (priorityFilter === 'paperwork') {
      filtered = filtered.filter(c => c.lastMessage.toLowerCase().includes('form') || c.lastMessage.toLowerCase().includes('paperwork'))
    }
    
    // Show only today's conversations
    if (showTodayOnly) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter(c => {
        const msgDate = new Date(c.lastMessageTime)
        msgDate.setHours(0, 0, 0, 0)
        return msgDate.getTime() === today.getTime()
      })
    }
    
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patient.phone.includes(searchQuery)
      )
    }
    
    // Sort by most recent first
    filtered.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime())
    
    return filtered
  }, [conversations, filterType, searchQuery, showTodayOnly, priorityFilter])
  
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  // Track form send
  const sendForm = (form: any) => {
    const patientId = selectedPatient?.id
    if (!patientId) return
    
    // Track the form send
    setSentForms(prev => ({
      ...prev,
      [patientId]: [
        ...(prev[patientId] || []),
        {
          formId: form.id,
          sentAt: new Date(),
          status: 'sent'
        }
      ]
    }))
    
    // Set the message text
    setMessageText(form.message)
    setShowFormsPanel(false)
    setPreviewingForm(null)
  }
  
  // Get forms sent to current patient
  const getPatientForms = () => {
    if (!selectedPatient) return []
    return sentForms[selectedPatient.id] || []
  }
  
  // Check if form was recently sent
  const wasFormRecentlySent = (formId: string) => {
    const forms = getPatientForms()
    const recentForm = forms.find(f => f.formId === formId)
    if (!recentForm) return false
    
    const hoursSinceSent = (new Date().getTime() - recentForm.sentAt.getTime()) / (1000 * 60 * 60)
    return hoursSinceSent < 24
  }

  // Send SMS message
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedPatient) return
    
    setSendingMessage(true)
    
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedPatient.phone,
          message: messageText,
          patientId: selectedPatient.id,
          type: 'manual'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Add message to conversation (in production, refetch from database)
        const newMessage = {
          id: Date.now(),
          sender: 'clinic',
          text: messageText,
          time: new Date(),
          status: 'sent',
          channel: 'sms'
        }
        
        // Update local state
        if (selectedConv) {
          selectedConv.messages.push(newMessage)
        }
        
        setMessageText('')
      } else {
        console.error('Failed to send SMS:', data.error)
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
      alert('Error sending message. Please check your connection.')
    } finally {
      setSendingMessage(false)
    }
  }

  // Send appointment reminder
  const sendAppointmentReminder = async (type: string) => {
    if (!selectedPatient?.nextAppointment) return
    
    try {
      const response = await fetch('/api/sms/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          appointments: [{
            patientName: selectedPatient.name.split(' ')[0],
            patientPhone: selectedPatient.phone,
            appointmentDate: 'Tomorrow',
            appointmentTime: '2:00 PM',
            service: 'Filler',
            appointmentId: 'apt-123',
            patientId: selectedPatient.id
          }]
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Reminder sent successfully!')
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Manage patient communications and SMS messaging</p>
        </div>
        
        {/* Main Content */}
        <div className="flex h-[calc(100vh-240px)] bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Conversations List */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              {totalUnread > 0 && (
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  {totalUnread} new
                </span>
              )}
            </div>
            
            {/* Search with smart suggestions */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, phone, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Quick Priority Filters */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Quick Filters</span>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={showTodayOnly}
                    onChange={(e) => setShowTodayOnly(e.target.checked)}
                    className="mr-1 rounded"
                  />
                  <span className="text-gray-600">Today only</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setPriorityFilter(priorityFilter === 'appointment-today' ? 'all' : 'appointment-today')}
                  className={`px-2 py-1 text-xs rounded flex items-center justify-center gap-1 ${
                    priorityFilter === 'appointment-today'
                      ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  Today's Appts
                </button>
                <button
                  onClick={() => setPriorityFilter(priorityFilter === 'post-care' ? 'all' : 'post-care')}
                  className={`px-2 py-1 text-xs rounded flex items-center justify-center gap-1 ${
                    priorityFilter === 'post-care'
                      ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <AlertCircle className="h-3 w-3" />
                  Post-Care
                </button>
                <button
                  onClick={() => setPriorityFilter(priorityFilter === 'paperwork' ? 'all' : 'paperwork')}
                  className={`px-2 py-1 text-xs rounded flex items-center justify-center gap-1 ${
                    priorityFilter === 'paperwork'
                      ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  Paperwork
                </button>
                <button
                  onClick={() => {
                    setFilterType('unread')
                    setPriorityFilter('all')
                  }}
                  className={`px-2 py-1 text-xs rounded flex items-center justify-center gap-1 ${
                    filterType === 'unread'
                      ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="h-3 w-3" />
                  Unread ({totalUnread})
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  filterType === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  filterType === 'unread' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilterType('sms')}
                className={`px-3 py-1 text-sm rounded-lg flex items-center space-x-1 ${
                  filterType === 'sms' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MessageCircle className="h-3 w-3" />
                <span>SMS</span>
              </button>
              <button
                onClick={() => setFilterType('starred')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  filterType === 'starred' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Starred
              </button>
            </div>
          </div>
          
          {/* Results Counter */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
              {filteredConversations.length > 0 && (
                <button className="text-blue-600 hover:text-blue-700">
                  Mark all read
                </button>
              )}
            </div>
          </div>
          
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {searchQuery ? `No conversations found for "${searchQuery}"` : 'No conversations match your filters'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilterType('all')
                    setPriorityFilter('all')
                    setShowTodayOnly(false)
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  selectedConversation === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold relative">
                      {conversation.patient.initials}
                      {conversation.channel === 'sms' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-2.5 w-2.5 text-white fill-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {conversation.patient.name}
                          </p>
                          {conversation.starred && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          )}
                          {conversation.patient.nextAppointment?.includes('Today') && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded">
                              Appt Today
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 truncate ${
                          conversation.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-400">
                            {conversation.patient.phone}
                          </p>
                          {conversation.patient.lastAppointment?.includes('Yesterday') && (
                            <span className="text-[10px] text-amber-600">• Post-care follow-up</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(conversation.lastMessageTime, { addSuffix: true })}
                        </p>
                        {conversation.unread > 0 && (
                          <span className="mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
        
        {/* Conversation View */}
        <div className="flex-1 flex flex-col">
          {selectedPatient ? (
            <>
              {/* Conversation Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {selectedPatient.initials}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedPatient.name}</h2>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedPatient.phone}
                        </span>
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {selectedPatient.email}
                        </span>
                        {selectedPatient.smsOptIn && (
                          <span className="flex items-center text-green-600">
                            <CheckCheck className="h-3 w-3 mr-1" />
                            SMS Enabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => window.location.href = `tel:${selectedPatient.phone}`}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Phone className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Patient Info Bar */}
              <div className="bg-blue-50 px-6 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-6">
                  {selectedPatient.lastAppointment && (
                    <span className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      Last: {selectedPatient.lastAppointment}
                    </span>
                  )}
                  {selectedPatient.nextAppointment && (
                    <span className="flex items-center text-blue-700 font-medium">
                      <Calendar className="h-4 w-4 mr-1 text-blue-600" />
                      Next: {selectedPatient.nextAppointment}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => sendAppointmentReminder('reminder_24hr')}
                    className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Send Reminder</span>
                  </button>
                  <span className="text-gray-400">|</span>
                  <button className="text-blue-600 hover:text-blue-700">View Profile →</button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {currentMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'clinic' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${message.sender === 'clinic' ? 'order-2' : ''}`}>
                      <div className={`rounded-lg px-4 py-2 ${
                        message.sender === 'clinic'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${
                        message.sender === 'clinic' ? 'justify-end' : ''
                      }`}>
                        <span>{format(message.time, 'h:mm a')}</span>
                        {message.channel === 'sms' && (
                          <MessageCircle className="h-3 w-3 text-green-500" />
                        )}
                        {message.sender === 'clinic' && (
                          <>
                            {message.status === 'delivered' && <CheckCheck className="h-3 w-3 text-blue-600" />}
                            {message.status === 'sent' && <Check className="h-3 w-3 text-gray-400" />}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                {/* Forms Panel (shows above input when active) */}
                {showFormsPanel && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">Send Forms & Documents</h3>
                      <button
                        onClick={() => setShowFormsPanel(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* Form Category Tabs */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setSelectedFormCategory('intake')}
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${
                          selectedFormCategory === 'intake'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Consent Forms
                      </button>
                      <button
                        onClick={() => setSelectedFormCategory('postCare')}
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${
                          selectedFormCategory === 'postCare'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Post-Care Instructions
                      </button>
                    </div>
                    
                    {/* Forms Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(formTemplates[selectedFormCategory]).map(([key, form]) => {
                        const recentlySent = wasFormRecentlySent(form.id)
                        return (
                          <div
                            key={key}
                            className={`relative p-3 bg-white border rounded-lg transition-colors ${
                              recentlySent 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                            }`}
                          >
                            {recentlySent && (
                              <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-green-600 text-white text-[10px] rounded-full">
                                Sent today
                              </div>
                            )}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{form.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{form.description}</p>
                              </div>
                              {selectedFormCategory === 'intake' ? (
                                <FileSignature className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                              )}
                            </div>
                            
                            {selectedFormCategory === 'intake' && 'validFor' in form && (
                              <div className="mb-2 flex items-center gap-2">
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  Valid: {form.validFor}
                                </span>
                                {form.estimatedTime && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                                    {form.estimatedTime}
                                  </span>
                                )}
                                {form.fields.includes('signature') && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                                    E-Sign
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="flex gap-1">
                              <button
                                onClick={() => setPreviewingForm(form)}
                                className="flex-1 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Preview
                              </button>
                              <button
                                onClick={() => sendForm(form)}
                                className="flex-1 px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                                disabled={recentlySent}
                              >
                                <Send className="h-3 w-3" />
                                {recentlySent ? 'Sent' : 'Send'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Smart Suggestion */}
                    {selectedPatient?.nextAppointment?.includes('Filler') && selectedFormCategory === 'intake' && (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-xs text-amber-800">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          Patient has Filler appointment tomorrow - consider sending filler consent form
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-end space-x-3">
                  <button 
                    onClick={() => setShowFormsPanel(!showFormsPanel)}
                    className={`p-2 rounded-lg transition-colors ${
                      showFormsPanel ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Send forms and documents"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      placeholder="Type an SMS message..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={1}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {messageText.length}/160
                    </div>
                  </div>
                  <button 
                    onClick={sendMessage}
                    disabled={!messageText.trim() || sendingMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>Send SMS</span>
                  </button>
                </div>
                
                {/* Quick Responses */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Quick Replies:</span>
                      {Object.keys(quickReplies).map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedQuickReplyCategory(category)}
                          className={`text-xs px-2 py-1 rounded-full ${
                            selectedQuickReplyCategory === category
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {category === 'postCare' 
                            ? 'Post-Care' 
                            : category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                    <a 
                      href="/settings/quick-replies"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Settings className="h-3 w-3" />
                      Customize
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies[selectedQuickReplyCategory] && quickReplies[selectedQuickReplyCategory].length > 0 ? (
                      quickReplies[selectedQuickReplyCategory].map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => setMessageText(reply)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                          title="Click to use this reply"
                        >
                          {reply}
                        </button>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        No quick replies in this category. 
                        <a href="/settings/quick-replies" className="text-blue-600 hover:text-blue-700 ml-1">
                          Add some →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Patient Sidebar */}
        {selectedPatient && (
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-3">
                {selectedPatient.initials}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedPatient.name}</h3>
              <p className="text-sm text-gray-500">Patient since 2023</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Preferences</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <MessageCircle className="h-4 w-4 text-gray-400 mr-2" />
                      SMS Reminders
                    </span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      Email Reminders
                    </span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{selectedPatient.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">San Francisco, CA</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Reminder Settings</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm">
                    <span>48hr Reminder</span>
                    <input type="checkbox" defaultChecked={true} className="rounded" />
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span>24hr Reminder</span>
                    <input type="checkbox" defaultChecked={true} className="rounded" />
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span>2hr Reminder</span>
                    <input type="checkbox" defaultChecked={true} className="rounded" />
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Forms & Documents</h4>
                <div className="space-y-2 mb-4">
                  {getPatientForms().length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getPatientForms().slice(-3).reverse().map((form, index) => {
                        const template = Object.values(formTemplates.intake).find(t => t.id === form.formId) ||
                                      Object.values(formTemplates.postCare).find(t => t.id === form.formId)
                        if (!template) return null
                        
                        return (
                          <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">{template.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                form.status === 'completed' 
                                  ? 'bg-green-100 text-green-700'
                                  : form.status === 'viewed'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {form.status}
                              </span>
                            </div>
                            <div className="text-gray-500 mt-0.5">
                              Sent {formatDistanceToNow(form.sentAt, { addSuffix: true })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No forms sent yet</p>
                  )}
                  <button 
                    onClick={() => setShowFormsPanel(true)}
                    className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Send Forms
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
                    Send Appointment Reminder
                  </button>
                  <button className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
                    View Full Profile
                  </button>
                  <button className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
                    Schedule Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Form Preview Modal */}
      {previewingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewingForm.name}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{previewingForm.description}</p>
              </div>
              <button
                onClick={() => setPreviewingForm(null)}
                className="p-2 hover:bg-white/70 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-180px)]">
              {/* Form Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {previewingForm.estimatedTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Completion time:</span>
                      <span className="font-medium text-gray-900">{previewingForm.estimatedTime}</span>
                    </div>
                  )}
                  {previewingForm.validFor && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Valid for:</span>
                      <span className="font-medium text-gray-900">{previewingForm.validFor}</span>
                    </div>
                  )}
                  {previewingForm.fields?.includes('signature') && (
                    <div className="flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">E-Signature required</span>
                    </div>
                  )}
                  {previewingForm.requiredFor && (
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Required for:</span>
                      <span className="font-medium text-gray-900">{previewingForm.requiredFor.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  {previewingForm.previewContent?.title || 'Form Preview'}
                </h4>
                
                {previewingForm.previewContent?.sections && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">This form includes the following sections:</p>
                    <div className="space-y-2">
                      {previewingForm.previewContent.sections.map((section: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700">{section}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {previewingForm.previewContent?.instructions && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Instructions included:</p>
                    <ul className="space-y-2">
                      {previewingForm.previewContent.instructions.map((instruction: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Form Tracking Info */}
              {getPatientForms().filter(f => f.formId === previewingForm.id).length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <CheckCheck className="h-4 w-4" />
                    <span>
                      This form was sent to {selectedPatient?.name} {' '}
                      {formatDistanceToNow(
                        getPatientForms().find(f => f.formId === previewingForm.id)?.sentAt || new Date(),
                        { addSuffix: true }
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Patient will receive a secure link to complete this form electronically
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewingForm(null)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    sendForm(previewingForm)
                  }}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  disabled={wasFormRecentlySent(previewingForm.id)}
                >
                  <Send className="h-4 w-4" />
                  {wasFormRecentlySent(previewingForm.id) ? 'Already Sent' : 'Send to Patient'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}