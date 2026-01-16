'use client'

import { Plus, Trash2, Eye, EyeOff, Sparkles, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { AccordionSection } from './AccordionSection'
import type { DeviceProduct, ThemeClasses } from './types'

interface ProductSettingsProps {
  products: DeviceProduct[]
  isOpen: boolean
  onToggle: () => void
  onAdd: () => void
  onUpdate: (productId: string, updates: Partial<DeviceProduct>) => void
  onRemove: (productId: string) => void
  themeClasses: ThemeClasses
  isDark?: boolean
}

export function ProductSettings({
  products,
  isOpen,
  onToggle,
  onAdd,
  onUpdate,
  onRemove,
  themeClasses,
  isDark = false,
}: ProductSettingsProps) {
  const activeCount = products.filter(p => p.isActive).length

  const handleRemove = (productId: string) => {
    if (confirm('Remove this product?')) {
      onRemove(productId)
      toast.success('Product removed')
    }
  }

  return (
    <AccordionSection
      title="Products & Devices"
      description="Configure available products and devices"
      icon={Package}
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
            Add Product
          </button>
        </div>

        <div className={`rounded-lg border ${themeClasses.divider} overflow-hidden`}>
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Active</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Name</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Brand</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Category</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Default</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${themeClasses.textMuted}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeClasses.divider}`}>
              {products.map((product) => (
                <tr key={product.id} className={!product.isActive ? 'opacity-50' : ''}>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onUpdate(product.id, { isActive: !product.isActive })}
                      className={`p-1 rounded ${product.isActive ? 'text-green-500' : themeClasses.textMuted}`}
                    >
                      {product.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => onUpdate(product.id, { name: e.target.value })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={product.brand}
                      onChange={(e) => onUpdate(product.id, { brand: e.target.value })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={product.category}
                      onChange={(e) => onUpdate(product.id, { category: e.target.value })}
                      className={`w-full px-2 py-1 text-sm rounded border ${themeClasses.input} ${themeClasses.inputFocus}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onUpdate(product.id, { isDefault: !product.isDefault })}
                      className={`p-1 rounded ${product.isDefault ? 'text-yellow-500' : themeClasses.textMuted}`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemove(product.id)}
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
