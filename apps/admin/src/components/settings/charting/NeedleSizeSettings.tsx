'use client'

import { Plus, Trash2, Eye, EyeOff, Sparkles, Syringe } from 'lucide-react'
import toast from 'react-hot-toast'
import { AccordionSection } from './AccordionSection'
import type { NeedleCannulaSize, ThemeClasses } from './types'

interface NeedleSizeSettingsProps {
  needleSizes: NeedleCannulaSize[]
  isOpen: boolean
  onToggle: () => void
  onAdd: () => void
  onUpdate: (sizeId: string, updates: Partial<NeedleCannulaSize>) => void
  onRemove: (sizeId: string) => void
  themeClasses: ThemeClasses
  isDark?: boolean
}

export function NeedleSizeSettings({
  needleSizes,
  isOpen,
  onToggle,
  onAdd,
  onUpdate,
  onRemove,
  themeClasses,
  isDark = false,
}: NeedleSizeSettingsProps) {
  const activeCount = needleSizes.filter(s => s.isActive).length

  const handleRemove = (sizeId: string) => {
    if (confirm('Remove this needle/cannula size?')) {
      onRemove(sizeId)
      toast.success('Size removed')
    }
  }

  return (
    <AccordionSection
      title="Needle & Cannula Sizes"
      description="Configure available needle and cannula options"
      icon={Syringe}
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
            Add Size
          </button>
        </div>

        <div className={`rounded-lg border ${themeClasses.divider} overflow-hidden`}>
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Active</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Gauge</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Length</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Type</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Recommended For</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Default</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeClasses.divider}`}>
              {needleSizes.map((size) => (
                <tr key={size.id} className={!size.isActive ? 'opacity-50' : ''}>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onUpdate(size.id, { isActive: !size.isActive })}
                      className={`p-1 rounded ${size.isActive ? 'text-green-500' : themeClasses.textMuted}`}
                    >
                      {size.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={size.gauge}
                      onChange={(e) => onUpdate(size.id, { gauge: e.target.value })}
                      className={`w-20 px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={size.length}
                      onChange={(e) => onUpdate(size.id, { length: e.target.value })}
                      className={`w-24 px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={size.type}
                      onChange={(e) => onUpdate(size.id, { type: e.target.value as 'needle' | 'cannula' })}
                      className={`px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    >
                      <option value="needle">Needle</option>
                      <option value="cannula">Cannula</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={size.recommendedFor.join(', ')}
                      onChange={(e) => onUpdate(size.id, { recommendedFor: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                      placeholder="Enter uses separated by comma"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onUpdate(size.id, { isDefault: !size.isDefault })}
                      className={`p-1 rounded ${size.isDefault ? 'text-yellow-500' : themeClasses.textMuted}`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemove(size.id)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AccordionSection>
  )
}
