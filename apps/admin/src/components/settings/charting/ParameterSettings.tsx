'use client'

import { Plus, Trash2, Eye, EyeOff, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import { AccordionSection } from './AccordionSection'
import type { TreatmentParameter, ThemeClasses } from './types'

interface ParameterSettingsProps {
  parameters: TreatmentParameter[]
  isOpen: boolean
  onToggle: () => void
  onAdd: () => void
  onUpdate: (paramId: string, updates: Partial<TreatmentParameter>) => void
  onRemove: (paramId: string) => void
  themeClasses: ThemeClasses
}

export function ParameterSettings({
  parameters,
  isOpen,
  onToggle,
  onAdd,
  onUpdate,
  onRemove,
  themeClasses,
}: ParameterSettingsProps) {
  const activeCount = parameters.filter(p => p.isActive).length

  const handleRemove = (paramId: string) => {
    if (confirm('Remove this parameter?')) {
      onRemove(paramId)
      toast.success('Parameter removed')
    }
  }

  return (
    <AccordionSection
      title="Default Parameters & Ranges"
      description="Configure default settings and value ranges"
      icon={Settings}
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
            Add Parameter
          </button>
        </div>

        <div className="grid gap-3">
          {parameters.map((param) => (
            <div
              key={param.id}
              className={`p-4 rounded-lg border ${themeClasses.panelBg} ${!param.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-5 gap-3">
                  <div>
                    <label className={`text-xs ${themeClasses.textMuted}`}>Name</label>
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) => onUpdate(param.id, { name: e.target.value })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${themeClasses.textMuted}`}>Default Value</label>
                    <input
                      type="text"
                      value={String(param.defaultValue)}
                      onChange={(e) => onUpdate(param.id, { defaultValue: e.target.value })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${themeClasses.textMuted}`}>Unit</label>
                    <input
                      type="text"
                      value={param.unit}
                      onChange={(e) => onUpdate(param.id, { unit: e.target.value })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${themeClasses.textMuted}`}>Min</label>
                    <input
                      type="number"
                      value={param.minValue ?? ''}
                      onChange={(e) => onUpdate(param.id, { minValue: e.target.value ? Number(e.target.value) : undefined })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs ${themeClasses.textMuted}`}>Max</label>
                    <input
                      type="number"
                      value={param.maxValue ?? ''}
                      onChange={(e) => onUpdate(param.id, { maxValue: e.target.value ? Number(e.target.value) : undefined })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onUpdate(param.id, { isActive: !param.isActive })}
                    className={`p-1 rounded ${param.isActive ? 'text-green-500' : themeClasses.textMuted}`}
                  >
                    {param.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleRemove(param.id)}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {param.description && (
                <p className={`text-sm mt-2 ${themeClasses.textMuted}`}>{param.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AccordionSection>
  )
}
