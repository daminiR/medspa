'use client'

import React, { useState, useMemo, useRef } from 'react'
import { Navigation } from '@/components/Navigation'
import {
  MessageCircle,
  Plus,
  X,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Check,
  ArrowLeft,
  Copy,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  Bell,
  Eye,
  Shield,
  Hash
} from 'lucide-react'
import Link from 'next/link'
import { useQuickReplies } from '@/hooks/useQuickReplies'
import {
  SMS_TEMPLATE_TOKENS,
  TOKEN_CATEGORIES,
  generatePreview,
  calculateCharacterCount,
  checkHIPAACompliance,
  type CharacterCountResult
} from '@/utils/templateTokens'

export default function QuickRepliesSettings() {
  const {
    quickReplies,
    categories,
    rawReplies,
    isLoading,
    error,
    isOnline,
    addReply,
    updateReply,
    deleteReply,
    addCategory,
    deleteCategory,
    resetToDefaults,
    refresh
  } = useQuickReplies()

  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newCategoryDisplayName, setNewCategoryDisplayName] = useState('')
  const [editingReply, setEditingReply] = useState<{category: string, index: number, id: string} | null>(null)
  const [editingReplyText, setEditingReplyText] = useState('')
  const [newReplyCategory, setNewReplyCategory] = useState<string | null>(null)
  const [newReplyText, setNewReplyText] = useState('')
  const [operationStatus, setOperationStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [showPreview, setShowPreview] = useState<string | null>(null)
  const [showTokenPicker, setShowTokenPicker] = useState<'editing' | 'new' | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const newTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Check if a category is SMS template category
  const isSMSTemplateCategory = (category: string) => category === 'smsReminderTemplates'

  // Get character count info for a template
  const getCharCountInfo = (text: string): CharacterCountResult => {
    return calculateCharacterCount(text)
  }

  // Insert token at cursor position
  const insertToken = (token: string, isNewReply: boolean) => {
    const textarea = isNewReply ? newTextareaRef.current : textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentText = isNewReply ? newReplyText : editingReplyText
    const newText = currentText.substring(0, start) + token + currentText.substring(end)

    if (isNewReply) {
      setNewReplyText(newText)
    } else {
      setEditingReplyText(newText)
    }

    // Focus and set cursor position after token
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + token.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  // Get replies by category with their IDs
  const repliesByCategory = useMemo(() => {
    const grouped: Record<string, Array<{id: string, content: string, index: number}>> = {}
    rawReplies.forEach((reply, index) => {
      if (!grouped[reply.category]) {
        grouped[reply.category] = []
      }
      grouped[reply.category].push({
        id: reply.id,
        content: reply.content,
        index
      })
    })
    return grouped
  }, [rawReplies])

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
  const handleAddCategory = async () => {
    if (newCategory && !quickReplies[newCategory.toLowerCase()]) {
      const categoryKey = newCategory.toLowerCase().replace(/\s+/g, '_')
      const displayName = newCategoryDisplayName || newCategory

      setOperationStatus('saving')
      try {
        await addCategory(categoryKey, displayName)
        setExpandedCategories(prev => new Set([...Array.from(prev), categoryKey]))
        setNewCategory('')
        setNewCategoryDisplayName('')
        setShowNewCategory(false)
        setOperationStatus('saved')
        setTimeout(() => setOperationStatus('idle'), 2000)
      } catch {
        setOperationStatus('error')
        setTimeout(() => setOperationStatus('idle'), 3000)
      }
    }
  }

  // Delete category
  const handleDeleteCategory = async (category: string) => {
    if (confirm(`Are you sure you want to delete the "${category}" category and all its replies?`)) {
      setOperationStatus('saving')
      try {
        await deleteCategory(category)
        setOperationStatus('saved')
        setTimeout(() => setOperationStatus('idle'), 2000)
      } catch {
        setOperationStatus('error')
        setTimeout(() => setOperationStatus('idle'), 3000)
      }
    }
  }

  // Add reply to category
  const handleAddReply = async (category: string) => {
    if (newReplyText.trim()) {
      setOperationStatus('saving')
      try {
        await addReply(category, newReplyText.trim())
        setNewReplyCategory(null)
        setNewReplyText('')
        setOperationStatus('saved')
        setTimeout(() => setOperationStatus('idle'), 2000)
      } catch {
        setOperationStatus('error')
        setTimeout(() => setOperationStatus('idle'), 3000)
      }
    }
  }

  // Update reply
  const handleUpdateReply = async (id: string, text: string) => {
    if (text.trim()) {
      setOperationStatus('saving')
      try {
        await updateReply(id, text.trim())
        setEditingReply(null)
        setEditingReplyText('')
        setOperationStatus('saved')
        setTimeout(() => setOperationStatus('idle'), 2000)
      } catch {
        setOperationStatus('error')
        setTimeout(() => setOperationStatus('idle'), 3000)
      }
    }
  }

  // Delete reply
  const handleDeleteReply = async (id: string) => {
    setOperationStatus('saving')
    try {
      await deleteReply(id)
      setOperationStatus('saved')
      setTimeout(() => setOperationStatus('idle'), 2000)
    } catch {
      setOperationStatus('error')
      setTimeout(() => setOperationStatus('idle'), 3000)
    }
  }

  // Reset to defaults
  const handleResetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all quick replies to defaults? This will remove all custom categories and replies.')) {
      setOperationStatus('saving')
      try {
        await resetToDefaults()
        setOperationStatus('saved')
        setTimeout(() => setOperationStatus('idle'), 2000)
      } catch {
        setOperationStatus('error')
        setTimeout(() => setOperationStatus('idle'), 3000)
      }
    }
  }

  // Get display name for category
  const getCategoryDisplayName = (key: string) => {
    const cat = categories.find(c => c.name === key)
    if (cat) return cat.displayName
    if (key === 'postCare') return 'Post-Care'
    if (key === 'smsReminderTemplates') return 'SMS Reminder Templates'
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  }

  // Get icon for category
  const getCategoryIcon = (key: string) => {
    if (key === 'smsReminderTemplates') return <Bell className="h-5 w-5 text-purple-600" />
    return null
  }

  // Token Picker Component
  const TokenPickerDropdown = ({ isNewReply }: { isNewReply: boolean }) => (
    <div className="absolute z-20 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-h-64 overflow-y-auto">
      <div className="text-xs font-medium text-gray-500 mb-2">Click a token to insert</div>
      {Object.entries(TOKEN_CATEGORIES).map(([category, tokens]) => (
        <div key={category} className="mb-3">
          <div className="text-xs font-semibold text-gray-700 capitalize mb-1">{category}</div>
          <div className="flex flex-wrap gap-1">
            {tokens.map((tokenDef) => (
              <button
                key={tokenDef.token}
                type="button"
                onClick={() => {
                  insertToken(tokenDef.token, isNewReply)
                  setShowTokenPicker(null)
                }}
                className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                title={`${tokenDef.description} (e.g., ${tokenDef.example})`}
              >
                {tokenDef.token}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // Character Counter Component
  const CharacterCounter = ({ text }: { text: string }) => {
    const info = getCharCountInfo(text)
    return (
      <div className={`text-xs flex items-center gap-1 ${
        info.status === 'ok' ? 'text-gray-500' :
        info.status === 'warning' ? 'text-amber-600' :
        'text-red-600'
      }`}>
        <Hash className="h-3 w-3" />
        <span>{info.message}</span>
        {info.segments > 1 && (
          <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
            {info.segments} SMS
          </span>
        )}
      </div>
    )
  }

  // Preview Modal Component
  const PreviewModal = ({ content, onClose }: { content: string; onClose: () => void }) => {
    const preview = generatePreview(content)
    const hipaaCheck = checkHIPAACompliance(content)

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Message Preview</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Template with tokens:</div>
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 font-mono">
              {content}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Preview with example values:</div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-800">
              {preview}
            </div>
          </div>

          <CharacterCounter text={content} />

          {!hipaaCheck.compliant && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-amber-800">HIPAA Warning</div>
                  <ul className="text-xs text-amber-700 mt-1">
                    {hipaaCheck.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-4 w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading quick replies...</span>
          </div>
        </div>
      </div>
    )
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

        {/* Connection Status */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-amber-800">
              <WifiOff className="h-5 w-5" />
              <span className="font-medium">Offline Mode</span>
              <span className="text-sm text-amber-600">Changes are saved locally and will sync when connection is restored.</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
              <button onClick={refresh} className="ml-auto text-sm underline">Retry</button>
            </div>
          </div>
        )}

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
                onClick={handleResetToDefaults}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset to Defaults
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isOnline ? (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Wifi className="h-4 w-4" />
                  Connected
                </span>
              ) : (
                <span className="text-sm text-amber-600 flex items-center gap-1">
                  <WifiOff className="h-4 w-4" />
                  Offline
                </span>
              )}

              {operationStatus === 'saving' && (
                <span className="text-sm text-blue-600 flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              )}
              {operationStatus === 'saved' && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Saved
                </span>
              )}
              {operationStatus === 'error' && (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Error saving
                </span>
              )}
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
                placeholder="Category key (e.g., followup)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <input
                type="text"
                value={newCategoryDisplayName}
                onChange={(e) => setNewCategoryDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Display name (e.g., Follow-Up)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowNewCategory(false)
                  setNewCategory('')
                  setNewCategoryDisplayName('')
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
          {Object.keys(quickReplies).length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No quick replies yet. Add a category to get started.</p>
            </div>
          ) : (
            Object.entries(quickReplies).map(([category, replies]) => {
              const categoryReplies = repliesByCategory[category] || []

              return (
                <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Category Header */}
                  <div className={`p-4 border-b ${isSMSTemplateCategory(category) ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
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

                        <div className="flex items-center gap-3">
                          {getCategoryIcon(category)}
                          <h3 className="text-lg font-medium text-gray-900">
                            {getCategoryDisplayName(category)}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${isSMSTemplateCategory(category) ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                            {replies.length} {replies.length === 1 ? 'template' : 'templates'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* HIPAA Warning for SMS Templates */}
                    {isSMSTemplateCategory(category) && expandedCategories.has(category) && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-amber-800">
                            <span className="font-medium">HIPAA Compliance:</span> SMS is not encrypted. Never include specific diagnoses, conditions, or treatment details. Use generic terms like &quot;appointment&quot; instead of procedure names that reveal health information.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category Content */}
                  {expandedCategories.has(category) && (
                    <div className="p-4">
                      <div className="space-y-2">
                        {categoryReplies.map((reply, index) => (
                          <div key={reply.id} className="group relative">
                            {editingReply?.id === reply.id ? (
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 relative">
                                    <textarea
                                      ref={textareaRef}
                                      value={editingReplyText}
                                      onChange={(e) => setEditingReplyText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault()
                                          handleUpdateReply(reply.id, editingReplyText)
                                        }
                                        if (e.key === 'Escape') {
                                          setEditingReply(null)
                                          setEditingReplyText('')
                                          setShowTokenPicker(null)
                                        }
                                      }}
                                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                                        isSMSTemplateCategory(category) ? 'border-purple-300 focus:ring-purple-500' : 'border-gray-300 focus:ring-blue-500'
                                      }`}
                                      rows={3}
                                      placeholder={isSMSTemplateCategory(category) ? 'Enter SMS template with {{tokens}}...' : 'Enter quick reply message...'}
                                      autoFocus
                                    />
                                    {showTokenPicker === 'editing' && isSMSTemplateCategory(category) && (
                                      <TokenPickerDropdown isNewReply={false} />
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={() => handleUpdateReply(reply.id, editingReplyText)}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                      title="Save"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingReply(null)
                                        setEditingReplyText('')
                                        setShowTokenPicker(null)
                                      }}
                                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                      title="Cancel"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                {/* Token picker and char counter for SMS templates */}
                                {isSMSTemplateCategory(category) && (
                                  <div className="flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => setShowTokenPicker(showTokenPicker === 'editing' ? null : 'editing')}
                                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                                    >
                                      <Plus className="h-3 w-3" />
                                      Insert Token
                                    </button>
                                    <CharacterCounter text={editingReplyText} />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors ${
                                isSMSTemplateCategory(category) ? 'bg-purple-50/50' : 'bg-gray-50'
                              }`}>
                                {isSMSTemplateCategory(category) ? (
                                  <Bell className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm text-gray-700 font-mono">{reply.content || <span className="italic text-gray-400">Empty template</span>}</p>
                                  {/* Show char count for SMS templates */}
                                  {isSMSTemplateCategory(category) && reply.content && (
                                    <div className="mt-1">
                                      <CharacterCounter text={reply.content} />
                                    </div>
                                  )}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                  {/* Preview button for SMS templates */}
                                  {isSMSTemplateCategory(category) && (
                                    <button
                                      onClick={() => setShowPreview(reply.content)}
                                      className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                                      title="Preview"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(reply.content)
                                    }}
                                    className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                                    title="Copy"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingReply({ category, index, id: reply.id })
                                      setEditingReplyText(reply.content)
                                    }}
                                    className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReply(reply.id)}
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

                        {/* Add Reply Form */}
                        {newReplyCategory === category ? (
                          <div className="space-y-2 mt-2">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 relative">
                                <textarea
                                  ref={newTextareaRef}
                                  value={newReplyText}
                                  onChange={(e) => setNewReplyText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault()
                                      handleAddReply(category)
                                    }
                                    if (e.key === 'Escape') {
                                      setNewReplyCategory(null)
                                      setNewReplyText('')
                                      setShowTokenPicker(null)
                                    }
                                  }}
                                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                                    isSMSTemplateCategory(category) ? 'border-purple-300 focus:ring-purple-500' : 'border-gray-300 focus:ring-blue-500'
                                  }`}
                                  rows={3}
                                  placeholder={isSMSTemplateCategory(category) ? 'Enter SMS template with {{tokens}}...' : 'Enter new quick reply...'}
                                  autoFocus
                                />
                                {showTokenPicker === 'new' && isSMSTemplateCategory(category) && (
                                  <TokenPickerDropdown isNewReply={true} />
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleAddReply(category)}
                                  disabled={!newReplyText.trim()}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                                  title="Save"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setNewReplyCategory(null)
                                    setNewReplyText('')
                                    setShowTokenPicker(null)
                                  }}
                                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            {/* Token picker and char counter for SMS templates */}
                            {isSMSTemplateCategory(category) && (
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => setShowTokenPicker(showTokenPicker === 'new' ? null : 'new')}
                                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  Insert Token
                                </button>
                                {newReplyText && <CharacterCounter text={newReplyText} />}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setNewReplyCategory(category)}
                            className={`w-full p-3 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center gap-2 ${
                              isSMSTemplateCategory(category)
                                ? 'border-purple-300 text-purple-500 hover:border-purple-400 hover:text-purple-600'
                                : 'border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600'
                            }`}
                          >
                            <Plus className="h-4 w-4" />
                            {isSMSTemplateCategory(category) ? 'Add Template' : 'Add Reply'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
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
                <li>Changes sync automatically with the backend API{!isOnline && ' (offline mode: changes saved locally)'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* SMS Template Instructions */}
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-purple-800">
              <p className="font-medium mb-1">SMS Reminder Templates:</p>
              <ul className="list-disc list-inside space-y-1 text-purple-700">
                <li>Use tokens like <code className="bg-purple-100 px-1 rounded">{'{{firstName}}'}</code> for personalization</li>
                <li>Keep messages under 160 characters for single SMS segment</li>
                <li>Include reply keywords: &quot;Reply C to confirm, R to reschedule&quot;</li>
                <li>Avoid including treatment details (HIPAA compliance)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal content={showPreview} onClose={() => setShowPreview(null)} />
      )}
    </div>
  )
}
