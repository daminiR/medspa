'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { 
  MessageCircle,
  Plus,
  X,
  Save,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Check,
  Settings,
  ArrowLeft,
  Copy,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

// Default quick replies structure
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

export default function QuickRepliesSettings() {
  const [quickReplies, setQuickReplies] = useState<Record<string, string[]>>(() => {
    // Load from localStorage or use defaults
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quickReplies')
      return saved ? JSON.parse(saved) : defaultQuickReplies
    }
    return defaultQuickReplies
  })
  
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [editingReply, setEditingReply] = useState<{category: string, index: number} | null>(null)
  const [editingReplyText, setEditingReplyText] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [hasChanges, setHasChanges] = useState(false)

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Add new category
  const addCategory = () => {
    if (newCategory && !quickReplies[newCategory.toLowerCase()]) {
      const categoryKey = newCategory.toLowerCase().replace(/\s+/g, '_')
      setQuickReplies(prev => ({
        ...prev,
        [categoryKey]: []
      }))
      setExpandedCategories(prev => new Set([...prev, categoryKey]))
      setNewCategory('')
      setShowNewCategory(false)
      setHasChanges(true)
    }
  }

  // Delete category
  const deleteCategory = (category: string) => {
    if (confirm(`Are you sure you want to delete the "${category}" category and all its replies?`)) {
      setQuickReplies(prev => {
        const newReplies = { ...prev }
        delete newReplies[category]
        return newReplies
      })
      setHasChanges(true)
    }
  }

  // Rename category
  const renameCategory = (oldKey: string) => {
    if (newCategoryName && newCategoryName !== oldKey) {
      const newKey = newCategoryName.toLowerCase().replace(/\s+/g, '_')
      setQuickReplies(prev => {
        const newReplies = { ...prev }
        newReplies[newKey] = prev[oldKey]
        delete newReplies[oldKey]
        return newReplies
      })
      setEditingCategory(null)
      setNewCategoryName('')
      setHasChanges(true)
    }
  }

  // Add reply to category
  const addReply = (category: string) => {
    setQuickReplies(prev => ({
      ...prev,
      [category]: [...prev[category], '']
    }))
    // Start editing the new reply immediately
    const newIndex = quickReplies[category].length
    setEditingReply({ category, index: newIndex })
    setEditingReplyText('')
    setHasChanges(true)
  }

  // Update reply
  const updateReply = (category: string, index: number, text: string) => {
    setQuickReplies(prev => ({
      ...prev,
      [category]: prev[category].map((r, i) => i === index ? text : r)
    }))
    setEditingReply(null)
    setEditingReplyText('')
    setHasChanges(true)
  }

  // Delete reply
  const deleteReply = (category: string, index: number) => {
    setQuickReplies(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }))
    setHasChanges(true)
  }

  // Save to localStorage
  const saveChanges = () => {
    setSaveStatus('saving')
    localStorage.setItem('quickReplies', JSON.stringify(quickReplies))
    
    // Dispatch custom event to notify messages page
    window.dispatchEvent(new CustomEvent('quickRepliesUpdated', { 
      detail: quickReplies 
    }))
    
    setTimeout(() => {
      setSaveStatus('saved')
      setHasChanges(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 500)
  }

  // Reset to defaults
  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all quick replies to defaults? This will remove all custom categories and replies.')) {
      setQuickReplies(defaultQuickReplies)
      setHasChanges(true)
    }
  }

  // Get display name for category
  const getCategoryDisplayName = (key: string) => {
    if (key === 'postCare') return 'Post-Care'
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Link 
              href="/settings"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Quick Reply Settings</h1>
          </div>
          <p className="text-gray-500 ml-12">Customize quick reply templates for messaging</p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewCategory(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset to Defaults
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Unsaved changes
                </span>
              )}
              <button
                onClick={saveChanges}
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
        </div>

        {/* New Category Input */}
        {showNewCategory && (
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 mb-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                placeholder="Enter category name..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={addCategory}
                disabled={!newCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowNewCategory(false)
                  setNewCategory('')
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {Object.entries(quickReplies).map(([category, replies]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    
                    {editingCategory === category ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') renameCategory(category)
                            if (e.key === 'Escape') {
                              setEditingCategory(null)
                              setNewCategoryName('')
                            }
                          }}
                          className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => renameCategory(category)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(null)
                            setNewCategoryName('')
                          }}
                          className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {getCategoryDisplayName(category)}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category)
                        setNewCategoryName(category)
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Rename category"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Category Content */}
              {expandedCategories.has(category) && (
                <div className="p-4">
                  <div className="space-y-2">
                    {replies.map((reply, index) => (
                      <div key={index} className="group relative">
                        {editingReply?.category === category && editingReply?.index === index ? (
                          <div className="flex items-start gap-2">
                            <textarea
                              value={editingReplyText}
                              onChange={(e) => setEditingReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  updateReply(category, index, editingReplyText)
                                }
                                if (e.key === 'Escape') {
                                  setEditingReply(null)
                                  setEditingReplyText('')
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={2}
                              placeholder="Enter quick reply message..."
                              autoFocus
                            />
                            <button
                              onClick={() => updateReply(category, index, editingReplyText)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingReply(null)
                                setEditingReplyText('')
                              }}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="flex-1 text-sm text-gray-700">{reply || <span className="italic text-gray-400">Empty reply</span>}</p>
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(reply)
                                }}
                                className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                                title="Copy"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingReply({ category, index })
                                  setEditingReplyText(reply)
                                }}
                                className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                                title="Edit"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteReply(category, index)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Reply Button */}
                    <button
                      onClick={() => addReply(category)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How to use Quick Replies:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Categories help organize replies by context (appointments, post-care, etc.)</li>
                <li>Add custom categories for specific workflows or departments</li>
                <li>Click on any reply in the messaging interface to instantly insert it</li>
                <li>Changes save locally and sync immediately with the messaging page</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}