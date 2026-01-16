'use client'

import { Plus, Trash2, Eye, EyeOff, Sparkles, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { AccordionSection } from './AccordionSection'
import type { DocumentationTemplate, ThemeClasses } from './types'

interface TemplateSettingsProps {
  templates: DocumentationTemplate[]
  isOpen: boolean
  onToggle: () => void
  onAdd: () => void
  onUpdate: (templateId: string, updates: Partial<DocumentationTemplate>) => void
  onRemove: (templateId: string) => void
  themeClasses: ThemeClasses
}

export function TemplateSettings({
  templates,
  isOpen,
  onToggle,
  onAdd,
  onUpdate,
  onRemove,
  themeClasses,
}: TemplateSettingsProps) {
  const activeCount = templates.filter(t => t.isActive).length

  const handleRemove = (templateId: string) => {
    if (confirm('Remove this template?')) {
      onRemove(templateId)
      toast.success('Template removed')
    }
  }

  return (
    <AccordionSection
      title="Documentation Templates"
      description="Configure charting and note templates"
      icon={FileText}
      isOpen={isOpen}
      onToggle={onToggle}
      badge={activeCount}
      themeClasses={themeClasses}
    >
      <div className="space-y-3">
        <div className="flex justify-end">
          <button
            onClick={onAdd}
            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </button>
        </div>

        <div className="grid gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 rounded-lg border ${themeClasses.panelBg} ${!template.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs ${themeClasses.textMuted}`}>Template Name</label>
                    <input
                      type="text"
                      value={template.name}
                      onChange={(e) => onUpdate(template.id, { name: e.target.value })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${themeClasses.textMuted}`}>Category</label>
                    <input
                      type="text"
                      value={template.category}
                      onChange={(e) => onUpdate(template.id, { category: e.target.value })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onUpdate(template.id, { isActive: !template.isActive })}
                    className={`p-1 rounded ${template.isActive ? 'text-green-500' : themeClasses.textMuted}`}
                  >
                    {template.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onUpdate(template.id, { isDefault: !template.isDefault })}
                    className={`p-1 rounded ${template.isDefault ? 'text-yellow-500' : themeClasses.textMuted}`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(template.id)}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className={`text-xs ${themeClasses.textMuted}`}>Template Content (use {'{variable}'} for placeholders)</label>
                <textarea
                  value={template.template}
                  onChange={(e) => onUpdate(template.id, { template: e.target.value })}
                  rows={3}
                  className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                />
              </div>
              {template.variables.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.variables.map(v => (
                    <span key={v} className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                      {'{' + v + '}'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AccordionSection>
  )
}
