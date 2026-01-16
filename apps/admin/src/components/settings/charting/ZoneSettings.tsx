'use client'

import { Plus, Trash2, Eye, EyeOff, Grid } from 'lucide-react'
import toast from 'react-hot-toast'
import { AccordionSection } from './AccordionSection'
import type { TreatmentZone, ThemeClasses } from './types'

interface ZoneSettingsProps {
  zones: TreatmentZone[]
  isOpen: boolean
  onToggle: () => void
  onAdd: () => void
  onUpdate: (zoneId: string, updates: Partial<TreatmentZone>) => void
  onRemove: (zoneId: string) => void
  themeClasses: ThemeClasses
}

export function ZoneSettings({
  zones,
  isOpen,
  onToggle,
  onAdd,
  onUpdate,
  onRemove,
  themeClasses,
}: ZoneSettingsProps) {
  const activeCount = zones.filter(z => z.isActive).length

  const handleRemove = (zoneId: string) => {
    if (confirm('Remove this zone?')) {
      onRemove(zoneId)
      toast.success('Zone removed')
    }
  }

  return (
    <AccordionSection
      title="Treatment Zones"
      description="Configure treatment areas and anatomical zones"
      icon={Grid}
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
            Add Zone
          </button>
        </div>

        <div className="grid gap-2">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${themeClasses.panelBg} ${!zone.isActive ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => onUpdate(zone.id, { isActive: !zone.isActive })}
                className={`p-1 rounded ${zone.isActive ? 'text-green-500' : themeClasses.textMuted}`}
              >
                {zone.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <input
                type="text"
                value={zone.name}
                onChange={(e) => onUpdate(zone.id, { name: e.target.value })}
                className={`flex-1 px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
              />
              <input
                type="text"
                value={zone.anatomicalName || ''}
                onChange={(e) => onUpdate(zone.id, { anatomicalName: e.target.value })}
                placeholder="Anatomical name"
                className={`w-48 px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
              />
              <input
                type="text"
                value={zone.category}
                onChange={(e) => onUpdate(zone.id, { category: e.target.value })}
                placeholder="Category"
                className={`w-32 px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
              />
              {zone.isCustom && (
                <button
                  onClick={() => handleRemove(zone.id)}
                  className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AccordionSection>
  )
}
