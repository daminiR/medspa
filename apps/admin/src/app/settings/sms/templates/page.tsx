'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import {
  Plus,
  X,
  Save,
  Trash2,
  Edit2,
  ArrowLeft,
  AlertCircle,
  Check,
  RefreshCw,
  MessageSquare,
  Copy,
  Eye,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

// Variable definitions
const AVAILABLE_VARIABLES = [
  { key: 'patient_name', label: 'Patient Name', example: 'Sarah' },
  { key: 'appointment_date', label: 'Appointment Date', example: '12/15/2024' },
  { key: 'appointment_time', label: 'Appointment Time', example: '2:00 PM' },
  { key: 'service_name', label: 'Service Name', example: 'Botox Treatment' },
  { key: 'clinic_name', label: 'Clinic Name', example: 'Luxe Medical Spa' },
  { key: 'clinic_phone', label: 'Clinic Phone', example: '(555) 123-4567' }
]

type TemplateCategory = 'appointment' | 'post-care' | 'marketing' | 'custom'

// Default templates
const DEFAULT_TEMPLATES: {
  id: string
  name: string
  category: TemplateCategory
  content: string
  useCount: number
  createdDate: string
}[] = [
  {
    id: '1',
    name: 'Appointment Confirmation',
    category: 'appointment',
    content: 'Hi {patient_name}, your {service_name} appointment is confirmed for {appointment_date} at {appointment_time}. Reply C to confirm or R to reschedule. {clinic_name}',
    useCount: 1245,
    createdDate: '2024-01-15'
  },
  {
    id: '2',
    name: '24 Hour Reminder',
    category: 'appointment',
    content: 'Reminder {patient_name}: You have {service_name} scheduled for tomorrow at {appointment_time}. Call {clinic_phone} to reschedule.',
    useCount: 892,
    createdDate: '2024-01-15'
  },
  {
    id: '3',
    name: '2 Hour Reminder',
    category: 'appointment',
    content: 'Hi {patient_name}! Your {service_name} appointment starts in 2 hours at {appointment_time}. See you soon!',
    useCount: 756,
    createdDate: '2024-01-15'
  },
  {
    id: '4',
    name: 'Post-Care Follow-up',
    category: 'post-care',
    content: 'Hi {patient_name}, thank you for choosing {clinic_name} for your {service_name}! Please follow post-care instructions and contact us at {clinic_phone} with any questions.',
    useCount: 534,
    createdDate: '2024-01-20'
  },
  {
    id: '5',
    name: 'Review Request',
    category: 'marketing',
    content: 'Hi {patient_name}! We\'d love to hear about your {service_name} experience at {clinic_name}. Please leave us a review!',
    useCount: 312,
    createdDate: '2024-02-01'
  }
]

interface Template {
  id: string
  name: string
  category: 'appointment' | 'post-care' | 'marketing' | 'custom'
  content: string
  useCount: number
  createdDate: string
}

interface EditingTemplate extends Omit<Template, 'id'> {
  id?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  appointment: 'Appointment',
  'post-care': 'Post-Care',
  marketing: 'Marketing',
  custom: 'Custom'
}

const CATEGORY_COLORS: Record<string, string> = {
  appointment: 'bg-blue-100 text-blue-800',
  'post-care': 'bg-green-100 text-green-800',
  marketing: 'bg-purple-100 text-purple-800',
  custom: 'bg-gray-100 text-gray-800'
}

export default function SMSTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smsTemplates')
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES
    }
    return DEFAULT_TEMPLATES
  })

  const [activeCategory, setActiveCategory] = useState<string>('appointment')
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EditingTemplate | null>(null)
  const [formData, setFormData] = useState<EditingTemplate>({
    name: '',
    category: 'custom',
    content: '',
    useCount: 0,
    createdDate: new Date().toISOString().split('T')[0]
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [hasChanges, setHasChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Get templates for active category
  const filteredTemplates = templates.filter(t => t.category === activeCategory)

  // Calculate character count
  const charCount = formData.content.length
  const segments = Math.ceil(charCount / 160) || 0

  // Preview data for template preview
  const sampleData: Record<string, string> = {
    patient_name: 'Sarah',
    appointment_date: '12/15/2024',
    appointment_time: '2:00 PM',
    service_name: 'Botox Treatment',
    clinic_name: 'Luxe Medical Spa',
    clinic_phone: '(555) 123-4567'
  }

  // Generate preview text
  const generatePreview = (content: string) => {
    let preview = content
    AVAILABLE_VARIABLES.forEach(variable => {
      preview = preview.replace(
        new RegExp(`\\{${variable.key}\\}`, 'g'),
        sampleData[variable.key]
      )
    })
    return preview
  }

  // Save templates to localStorage
  const saveTemplates = (newTemplates: Template[]) => {
    setSaveStatus('saving')
    localStorage.setItem('smsTemplates', JSON.stringify(newTemplates))

    setTimeout(() => {
      setSaveStatus('saved')
      setHasChanges(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 500)
  }

  // Open create modal
  const openCreateModal = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      category: activeCategory as 'appointment' | 'post-care' | 'marketing' | 'custom',
      content: '',
      useCount: 0,
      createdDate: new Date().toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  // Open edit modal
  const openEditModal = (template: Template) => {
    setEditingTemplate(template)
    setFormData(template)
    setShowModal(true)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setEditingTemplate(null)
  }

  // Save template
  const saveTemplate = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    let newTemplates
    if (editingTemplate?.id) {
      newTemplates = templates.map(t =>
        t.id === editingTemplate.id ? { ...formData, id: editingTemplate.id } as Template : t
      )
    } else {
      const newTemplate: Template = {
        ...formData,
        id: Date.now().toString(),
        useCount: 0,
        createdDate: new Date().toISOString().split('T')[0]
      }
      newTemplates = [newTemplate, ...templates]
    }

    setTemplates(newTemplates)
    saveTemplates(newTemplates)
    closeModal()
  }

  // Delete template
  const deleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      const newTemplates = templates.filter(t => t.id !== id)
      setTemplates(newTemplates)
      saveTemplates(newTemplates)
    }
  }

  // Insert variable at cursor
  const insertVariable = (variableKey: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value

      const newText = text.slice(0, start) + `{${variableKey}}` + text.slice(end)
      setFormData({ ...formData, content: newText })

      setTimeout(() => {
        textarea.focus()
        const newPosition = start + variableKey.length + 2
        textarea.setSelectionRange(newPosition, newPosition)
      }, 0)
    }
  }

  // Copy template
  const copyTemplate = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all templates to defaults? Custom templates will be removed.')) {
      setTemplates(DEFAULT_TEMPLATES)
      saveTemplates(DEFAULT_TEMPLATES)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/settings/sms"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">SMS Templates</h1>
            </div>
          </div>
          <p className="text-gray-500 ml-12">Manage SMS message templates with variable placeholders</p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </button>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Unsaved changes
              </span>
            )}
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Defaults
            </button>
            <button
              onClick={() => saveTemplates(templates)}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                hasChanges
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const count = templates.filter(t => t.category === key).length
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex-1 px-4 py-3 text-center font-medium transition-colors border-b-2 ${
                    activeCategory === key
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                  <span className="ml-2 inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Templates List */}
          <div className="p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No templates in this category yet</p>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create First Template
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${CATEGORY_COLORS[template.category]}`}>
                            {CATEGORY_LABELS[template.category]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-gray-600 text-sm">
                            <BarChart3 className="h-4 w-4" />
                            {template.useCount}
                          </div>
                          <p className="text-xs text-gray-500">uses</p>
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="mb-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Preview:</p>
                      <p className="line-clamp-2">{generatePreview(template.content)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Created: {new Date(template.createdDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyTemplate(template.content)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy template"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(template)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit template"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-6 flex items-center justify-between sticky top-0">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTemplate?.id ? 'Edit Template' : 'Create New Template'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    setHasChanges(true)
                  }}
                  placeholder="e.g., Appointment Confirmation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value as 'appointment' | 'post-care' | 'marketing' | 'custom' })
                    setHasChanges(true)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="appointment">Appointment</option>
                  <option value="post-care">Post-Care</option>
                  <option value="marketing">Marketing</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Message Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Text *
                </label>
                <textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e.target.value })
                    setHasChanges(true)
                  }}
                  placeholder="Type your message here. Use {variable_name} for placeholders..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />

                {/* Character Count */}
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className={charCount > 160 ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                      {charCount} characters
                    </span>
                    {segments > 0 && (
                      <span className={segments > 1 ? 'text-orange-600 font-medium ml-2' : 'ml-2'}>
                        ({segments} SMS segment{segments > 1 ? 's' : ''})
                      </span>
                    )}
                  </p>
                  {charCount > 160 && (
                    <div className="flex items-center gap-1 text-orange-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Will be split into multiple messages
                    </div>
                  )}
                </div>
              </div>

              {/* Variable Helper */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-3">Available Variables - Click to insert:</p>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_VARIABLES.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => insertVariable(variable.key)}
                      className="text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors text-sm"
                    >
                      <div className="font-medium text-blue-900">{variable.label}</div>
                      <div className="text-xs text-blue-700">{`{${variable.key}}`}</div>
                      <div className="text-xs text-blue-600">e.g., {variable.example}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Preview with Sample Data
                  </label>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    {showPreview ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showPreview && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">{generatePreview(formData.content)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end gap-3 sticky bottom-0">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                {editingTemplate?.id ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-2">How to use SMS Templates:</p>
            <ul className="list-disc list-inside space-y-1 text-purple-700">
              <li>Use variables like {'{patient_name}'} to personalize messages dynamically</li>
              <li>SMS messages are split into segments at 160 characters each</li>
              <li>Preview shows how your template looks with sample data</li>
              <li>All templates are saved locally and synced across your account</li>
              <li>Use count tracks how many times each template has been sent</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
