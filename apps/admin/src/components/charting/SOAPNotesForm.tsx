'use client'

import { useState, useCallback } from 'react'
import {
  FileText,
  User,
  Eye,
  ClipboardCheck,
  Calendar,
  Save,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Mic,
  MicOff,
  Clock
} from 'lucide-react'
import { useChartingTheme } from '@/contexts/ChartingThemeContext'

export interface SOAPNotes {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

interface SOAPNotesFormProps {
  initialNotes?: SOAPNotes
  onSave?: (notes: SOAPNotes) => void
  onChange?: (notes: SOAPNotes) => void
  readOnly?: boolean
  patientName?: string
  treatmentType?: string
  autoSave?: boolean
  lastSaved?: Date
}

// SOAP section configuration with tooltips and placeholders
const SOAP_SECTIONS = [
  {
    key: 'subjective' as const,
    label: 'Subjective',
    shortLabel: 'S',
    icon: User,
    color: 'blue',
    tooltip: 'What the patient reports - their concerns, symptoms, goals, medical history relevant to today',
    placeholder: `Patient reports:
• Chief complaint and concerns
• Relevant medical history
• Current medications
• Allergies (confirm NKA or list)
• Previous treatment experience
• Goals and expectations for today's treatment`,
    examples: [
      'Patient presents for routine Botox maintenance. Reports satisfaction with previous treatment results. No new allergies or medications. Goals: soften forehead lines and crow\'s feet.',
      'Patient desires lip augmentation. First time filler patient. Concerns about looking "overdone." Wants natural, subtle enhancement. NKDA. Not on blood thinners.',
    ]
  },
  {
    key: 'objective' as const,
    label: 'Objective',
    shortLabel: 'O',
    icon: Eye,
    color: 'green',
    tooltip: 'What you observe - skin condition, measurements, vitals, areas to treat',
    placeholder: `Clinical observations:
• Skin assessment (type, condition, laxity)
• Areas of concern identified
• Facial analysis/symmetry
• Signs of aging (static/dynamic lines)
• Previous treatment evidence
• Photos taken (before)`,
    examples: [
      'Fitzpatrick Type II. Moderate dynamic rhytids of the forehead and glabella. Crow\'s feet visible at rest. Good skin quality, no active lesions. Previous Botox evident with partial return of movement. Before photos taken: frontal, 45° bilateral.',
      'Full, well-hydrated lips. Slight asymmetry with left side appearing smaller. No signs of previous filler complications. Skin intact, no cold sores. Vermillion border well-defined.',
    ]
  },
  {
    key: 'assessment' as const,
    label: 'Assessment',
    shortLabel: 'A',
    icon: ClipboardCheck,
    color: 'purple',
    tooltip: 'Clinical evaluation - is patient a good candidate, contraindications, risk factors',
    placeholder: `Clinical assessment:
• Diagnosis/indication for treatment
• Patient candidacy evaluation
• Risk factors identified
• Contraindications reviewed
• Expected outcomes discussed
• Informed consent obtained`,
    examples: [
      'Good candidate for neurotoxin treatment. No contraindications identified. Discussed realistic expectations, potential side effects (bruising, asymmetry), and timeline for results. Informed consent signed.',
      'Appropriate candidate for HA filler lip augmentation. No history of cold sores. Discussed risk of bruising, swelling, and rare complications including vascular occlusion. Patient verbalized understanding. Consent documented.',
    ]
  },
  {
    key: 'plan' as const,
    label: 'Plan',
    shortLabel: 'P',
    icon: Calendar,
    color: 'orange',
    tooltip: 'Treatment performed - products used, quantities, injection sites, aftercare given, follow-up plan',
    placeholder: `Treatment plan & documentation:
• Products used (name, lot#, expiration)
• Units/volume per area
• Injection technique
• Immediate post-treatment assessment
• Aftercare instructions provided
• Follow-up recommendations
• Next appointment scheduled`,
    examples: [
      'Botox Cosmetic (Lot: ABC123, Exp: 03/2025) administered:\n- Forehead: 20 units\n- Glabella: 20 units  \n- Crow\'s feet: 12 units per side\nTotal: 64 units. Ice applied post-treatment. Aftercare instructions provided. Follow-up in 2 weeks.',
      'Juvederm Ultra XC 1mL (Lot: XYZ789, Exp: 12/2025) administered to lips:\n- Upper lip: 0.5mL\n- Lower lip: 0.5mL\nTechnique: Serial puncture with 30G needle. Gentle massage performed. Ice applied. Post-care instructions given. Return in 2 weeks for assessment.',
    ]
  }
]

const getColorClasses = (color: string, isDark: boolean = false) => {
  if (isDark) {
    const darkColors: Record<string, { bg: string; border: string; text: string; lightBg: string }> = {
      blue: { bg: 'bg-blue-600', border: 'border-blue-800', text: 'text-blue-400', lightBg: 'bg-blue-900/30' },
      green: { bg: 'bg-green-600', border: 'border-green-800', text: 'text-green-400', lightBg: 'bg-green-900/30' },
      purple: { bg: 'bg-purple-600', border: 'border-purple-800', text: 'text-purple-400', lightBg: 'bg-purple-900/30' },
      orange: { bg: 'bg-orange-600', border: 'border-orange-800', text: 'text-orange-400', lightBg: 'bg-orange-900/30' },
    }
    return darkColors[color] || darkColors.blue
  }
  const colors: Record<string, { bg: string; border: string; text: string; lightBg: string }> = {
    blue: { bg: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-600', lightBg: 'bg-blue-50' },
    green: { bg: 'bg-green-500', border: 'border-green-200', text: 'text-green-600', lightBg: 'bg-green-50' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-600', lightBg: 'bg-purple-50' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-200', text: 'text-orange-600', lightBg: 'bg-orange-50' },
  }
  return colors[color] || colors.blue
}

export function SOAPNotesForm({
  initialNotes,
  onSave,
  onChange,
  readOnly = false,
  patientName,
  treatmentType,
  autoSave = false,
  lastSaved
}: SOAPNotesFormProps) {
  // Theme context for dark/light mode
  const { isDark } = useChartingTheme()

  const [notes, setNotes] = useState<SOAPNotes>(initialNotes || {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  })
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['subjective', 'objective', 'assessment', 'plan'])
  )
  const [showExamples, setShowExamples] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isRecording, setIsRecording] = useState<string | null>(null)

  const handleChange = useCallback((key: keyof SOAPNotes, value: string) => {
    const newNotes = { ...notes, [key]: value }
    setNotes(newNotes)
    setIsDirty(true)
    onChange?.(newNotes)
  }, [notes, onChange])

  const handleSave = () => {
    onSave?.(notes)
    setIsDirty(false)
  }

  const handleReset = () => {
    if (initialNotes) {
      setNotes(initialNotes)
      setIsDirty(false)
    }
  }

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedSections(newExpanded)
  }

  const insertExample = (key: keyof SOAPNotes, example: string) => {
    handleChange(key, example)
    setShowExamples(null)
  }

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }

  const getTotalWordCount = () => {
    return Object.values(notes).reduce((sum, text) => sum + getWordCount(text), 0)
  }

  const getCompletionStatus = () => {
    const filled = Object.values(notes).filter(v => v.trim().length > 0).length
    return { filled, total: 4, percentage: Math.round((filled / 4) * 100) }
  }

  const completion = getCompletionStatus()

  return (
    <div className={`rounded-lg shadow-sm border transition-colors ${
      isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDark
          ? 'border-gray-700 bg-gradient-to-r from-green-900/30 to-blue-900/30'
          : 'border-gray-200 bg-gradient-to-r from-green-50 to-blue-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>SOAP Notes</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {patientName && <span className="font-medium">{patientName}</span>}
                {patientName && treatmentType && <span className="mx-1">-</span>}
                {treatmentType && <span>{treatmentType}</span>}
                {!patientName && !treatmentType && 'Clinical documentation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Completion indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-24 h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{completion.filled}/4</span>
            </div>

            {/* Word count */}
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {getTotalWordCount()} words
            </div>

            {/* Last saved indicator */}
            {lastSaved && (
              <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                <Clock className="w-3 h-3" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SOAP Sections */}
      <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
        {SOAP_SECTIONS.map((section) => {
          const Icon = section.icon
          const colors = getColorClasses(section.color, isDark)
          const isExpanded = expandedSections.has(section.key)
          const wordCount = getWordCount(notes[section.key])
          const hasContent = notes[section.key].trim().length > 0

          return (
            <div key={section.key} className="relative">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.key)}
                className={`w-full px-6 py-3 flex items-center justify-between transition-colors ${
                  isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{section.shortLabel}</span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{section.label}</span>
                      {hasContent && (
                        <span className={`px-2 py-0.5 ${colors.lightBg} ${colors.text} text-xs rounded-full`}>
                          {wordCount} words
                        </span>
                      )}
                      {!hasContent && !readOnly && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                          Empty
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Tooltip trigger */}
                  <div className="relative group">
                    <Info className={`w-4 h-4 cursor-help ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`} />
                    <div className={`absolute right-0 top-6 w-64 p-3 text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${
                      isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-900 text-white'
                    }`}>
                      {section.tooltip}
                      <div className={`absolute -top-1 right-4 w-2 h-2 transform rotate-45 ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`} />
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                </div>
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className={`px-6 pb-4 ${colors.lightBg} border-l-4 ${colors.border}`}>
                  {/* Textarea */}
                  <div className="relative">
                    <textarea
                      value={notes[section.key]}
                      onChange={(e) => handleChange(section.key, e.target.value)}
                      readOnly={readOnly}
                      rows={6}
                      className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-${section.color}-500 focus:border-transparent resize-none transition-all ${
                        isDark
                          ? readOnly
                            ? 'bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500'
                          : readOnly
                            ? 'bg-gray-50 border-gray-300 cursor-not-allowed'
                            : 'bg-white border-gray-300'
                      }`}
                      placeholder={section.placeholder}
                    />

                    {/* Voice dictation button (placeholder for future) */}
                    {!readOnly && (
                      <button
                        onClick={() => setIsRecording(isRecording === section.key ? null : section.key)}
                        className={`absolute top-3 right-3 p-2 rounded-lg transition-colors ${
                          isRecording === section.key
                            ? 'bg-red-100 text-red-600'
                            : isDark
                              ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Voice dictation (coming soon)"
                        disabled
                      >
                        {isRecording === section.key ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Examples toggle */}
                  {!readOnly && (
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        onClick={() => setShowExamples(showExamples === section.key ? null : section.key)}
                        className={`text-sm ${colors.text} hover:underline flex items-center gap-1`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {showExamples === section.key ? 'Hide examples' : 'View examples'}
                      </button>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {wordCount} words
                      </span>
                    </div>
                  )}

                  {/* Example templates */}
                  {showExamples === section.key && (
                    <div className="mt-3 space-y-2">
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Example templates:</p>
                      {section.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border cursor-pointer group transition-colors ${
                            isDark
                              ? 'bg-gray-800 border-gray-600 hover:border-gray-500'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => insertExample(section.key, example)}
                        >
                          <p className={`text-sm whitespace-pre-wrap line-clamp-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {example}
                          </p>
                          <p className={`text-xs mt-2 ${
                            isDark
                              ? 'text-gray-500 group-hover:text-gray-400'
                              : 'text-gray-400 group-hover:text-gray-600'
                          }`}>
                            Click to use this template
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Actions */}
      {!readOnly && (
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDark
            ? 'border-gray-700 bg-gray-800/50'
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {autoSave ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Auto-save enabled
              </span>
            ) : isDirty ? (
              <span className="flex items-center gap-1 text-amber-500">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                Unsaved changes
              </span>
            ) : (
              <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>All changes saved</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isDirty && initialNotes && (
              <button
                onClick={handleReset}
                className={`px-4 py-2 flex items-center gap-2 ${
                  isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Notes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
