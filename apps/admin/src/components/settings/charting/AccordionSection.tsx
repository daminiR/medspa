'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ThemeClasses } from './types'

interface AccordionSectionProps {
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  badge?: number
  themeClasses: ThemeClasses
}

export function AccordionSection({
  title,
  description,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  badge,
  themeClasses
}: AccordionSectionProps) {
  return (
    <div className={`rounded-lg border ${themeClasses.panelBg} mb-4 overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 ${themeClasses.hoverBg} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${themeClasses.textSecondary}`} />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${themeClasses.textPrimary}`}>{title}</span>
              {badge !== undefined && badge > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className={`text-sm ${themeClasses.textMuted}`}>{description}</p>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className={`w-5 h-5 ${themeClasses.textMuted}`} />
        ) : (
          <ChevronRight className={`w-5 h-5 ${themeClasses.textMuted}`} />
        )}
      </button>
      {isOpen && (
        <div className={`p-4 border-t ${themeClasses.divider}`}>
          {children}
        </div>
      )}
    </div>
  )
}
