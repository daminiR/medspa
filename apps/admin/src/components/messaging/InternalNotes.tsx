'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Lock, Send, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface InternalNote {
  id: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: Date
  mentions?: string[]
}

interface InternalNotesProps {
  notes: InternalNote[]
  onAddNote: (content: string, mentions: string[]) => void
  staffMembers: { id: string; name: string; avatar?: string }[]
}

export function InternalNotes({ notes, onAddNote, staffMembers }: InternalNotesProps) {
  const [noteContent, setNoteContent] = useState('')
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [filteredStaff, setFilteredStaff] = useState<typeof staffMembers>([])
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle @ mention detection
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const text = noteContent
    const cursor = textarea.selectionStart

    // Find @ symbol before cursor
    const textBeforeCursor = text.substring(0, cursor)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1)
      // Check if there's a space after @, if so, close dropdown
      if (textAfterAt.includes(' ')) {
        setShowMentionDropdown(false)
        return
      }

      // Show dropdown and filter staff
      setMentionQuery(textAfterAt)
      const filtered = staffMembers.filter(staff =>
        staff.name.toLowerCase().includes(textAfterAt.toLowerCase())
      )
      setFilteredStaff(filtered)
      setShowMentionDropdown(filtered.length > 0)
      setSelectedMentionIndex(0)
    } else {
      setShowMentionDropdown(false)
    }
  }, [noteContent, staffMembers])

  // Handle keyboard navigation in mention dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedMentionIndex(prev =>
          prev < filteredStaff.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(filteredStaff[selectedMentionIndex])
      } else if (e.key === 'Escape') {
        setShowMentionDropdown(false)
      }
    } else {
      // Handle Cmd+Enter or Ctrl+Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    }
  }

  // Insert mention into text
  const insertMention = (staff: { id: string; name: string; avatar?: string }) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const text = noteContent
    const cursor = textarea.selectionStart
    const textBeforeCursor = text.substring(0, cursor)
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
    const textAfterCursor = text.substring(cursor)

    const newText =
      text.substring(0, lastAtSymbol) +
      `@${staff.name} ` +
      textAfterCursor

    setNoteContent(newText)
    setShowMentionDropdown(false)

    // Set cursor position after mention
    setTimeout(() => {
      const newCursorPos = lastAtSymbol + staff.name.length + 2
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  // Extract mentions from content
  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  // Handle submit
  const handleSubmit = () => {
    if (!noteContent.trim()) return

    const mentions = extractMentions(noteContent)
    onAddNote(noteContent, mentions)
    setNoteContent('')
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Highlight mentions in note content
  const renderNoteContent = (content: string) => {
    const parts = content.split(/(@\w+(?:\s+\w+)*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 font-medium bg-blue-50 px-1 rounded">
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  // Sort notes newest first
  const sortedNotes = [...notes].sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-amber-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <Lock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-900">Internal Notes</h3>
            <p className="text-xs text-amber-700">Staff only - not visible to patients</p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
          Private
        </span>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-amber-50/30">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="h-8 w-8 text-amber-300 mx-auto mb-2" />
            <p className="text-sm text-amber-600">No internal notes yet</p>
            <p className="text-xs text-amber-500 mt-1">Add notes that only staff can see</p>
          </div>
        ) : (
          sortedNotes.map(note => (
            <div
              key={note.id}
              className="bg-white border border-amber-200 rounded-lg p-3 shadow-sm hover:shadow transition-shadow"
            >
              {/* Note Header */}
              <div className="flex items-start gap-3 mb-2">
                {/* Author Avatar */}
                {note.authorAvatar ? (
                  <img
                    src={note.authorAvatar}
                    alt={note.authorName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {getInitials(note.authorName)}
                  </div>
                )}

                {/* Author Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">
                      {note.authorName}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Private indicator */}
                <Lock className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              </div>

              {/* Note Content */}
              <div className="text-sm text-gray-700 leading-relaxed pl-11">
                {renderNoteContent(note.content)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Note Input */}
      <div className="border-t border-amber-200 bg-amber-50 p-4">
        <div className="relative">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add internal note... (only visible to staff) Type @ to mention"
            className="w-full px-4 py-3 pr-12 bg-amber-100 border-2 border-amber-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm placeholder-amber-600"
            rows={3}
            style={{ minHeight: '80px', maxHeight: '200px' }}
          />

          {/* Mention Dropdown */}
          {showMentionDropdown && (
            <div
              ref={dropdownRef}
              className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10"
            >
              {filteredStaff.map((staff, index) => (
                <button
                  key={staff.id}
                  onClick={() => insertMention(staff)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 transition-colors ${
                    index === selectedMentionIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  {staff.avatar ? (
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      {getInitials(staff.name)}
                    </div>
                  )}
                  <span className="text-sm text-gray-900">{staff.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!noteContent.trim()}
            className="absolute bottom-3 right-3 p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-600 transition-all shadow-sm"
            title="Add note (Cmd+Enter)"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Help Text */}
        <div className="flex items-center justify-between mt-2 text-xs text-amber-700">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Private to staff
            </span>
            <span>Type @ to mention staff</span>
          </div>
          <span className="text-amber-600">
            <kbd className="px-1.5 py-0.5 bg-amber-100 rounded text-[10px] font-mono">
              ⌘
            </kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 bg-amber-100 rounded text-[10px] font-mono">
              Enter
            </kbd>
            {' to submit'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default InternalNotes
