'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navigation } from '@/components/Navigation'
import { useChartingTheme, getThemeClasses } from '@/contexts/ChartingThemeContext'
import toast from 'react-hot-toast'
import {
  Save,
  RotateCcw,
  AlertCircle,
  Info,
  Download,
} from 'lucide-react'

// Import modular components
import {
  ToolVisibilitySettings,
  ProductSettings,
  ParameterSettings,
  NeedleSizeSettings,
  ZoneSettings,
  TemplateSettings,
  DEFAULT_ALL_SETTINGS,
  CATEGORY_TABS,
  STORAGE_KEY,
} from '@/components/settings/charting'

import type {
  TreatmentCategory,
  AllChartingSettings,
  CategorySettings,
  DeviceProduct,
  TreatmentParameter,
  NeedleCannulaSize,
  TreatmentZone,
  DocumentationTemplate,
  ToolVisibilitySettings as ToolVisibilitySettingsInterface,
} from '@/components/settings/charting/types'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChartingSettingsPage() {
  const { setTheme } = useChartingTheme()
  // Force light mode for settings page
  const themeClasses = getThemeClasses('light')
  const isDark = false

  const [activeCategory, setActiveCategory] = useState<TreatmentCategory>('injectables')
  const [settings, setSettings] = useState<AllChartingSettings>(DEFAULT_ALL_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    products: true,
    parameters: false,
    needles: false,
    zones: false,
    templates: false,
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings({ ...DEFAULT_ALL_SETTINGS, ...parsed })
      }
    } catch (error) {
      console.error('Error loading charting tool settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      setHasUnsavedChanges(false)
      // Dispatch event so FloatingToolPalette and other components can update
      window.dispatchEvent(new CustomEvent('chartingToolSettingsUpdated', { detail: settings }))
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    }
  }, [settings])

  // Update category settings
  const updateCategorySettings = useCallback((
    category: TreatmentCategory,
    updates: Partial<CategorySettings>
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], ...updates }
    }))
    setHasUnsavedChanges(true)
  }, [])

  // Toggle accordion section
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Import default presets for a category
  const importDefaults = (category: TreatmentCategory) => {
    const defaults = DEFAULT_ALL_SETTINGS[category]
    setSettings(prev => ({
      ...prev,
      [category]: defaults
    }))
    setHasUnsavedChanges(true)
    toast.success(`Default presets imported for ${CATEGORY_TABS.find(t => t.id === category)?.label}`)
  }

  // Reset all settings
  const resetAllSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      setSettings(DEFAULT_ALL_SETTINGS)
      localStorage.removeItem(STORAGE_KEY)
      toast.success('All settings reset to defaults')
      setHasUnsavedChanges(false)
    }
  }

  // =============================================================================
  // PRODUCT HANDLERS
  // =============================================================================

  const addProduct = () => {
    const newProduct: DeviceProduct = {
      id: `prod-${Date.now()}`,
      name: 'New Product',
      brand: '',
      category: '',
      isActive: true,
      isDefault: false,
    }
    updateCategorySettings(activeCategory, {
      products: [...settings[activeCategory].products, newProduct]
    })
  }

  const updateProduct = (productId: string, updates: Partial<DeviceProduct>) => {
    updateCategorySettings(activeCategory, {
      products: settings[activeCategory].products.map(p =>
        p.id === productId ? { ...p, ...updates } : p
      )
    })
  }

  const removeProduct = (productId: string) => {
    updateCategorySettings(activeCategory, {
      products: settings[activeCategory].products.filter(p => p.id !== productId)
    })
  }

  // =============================================================================
  // PARAMETER HANDLERS
  // =============================================================================

  const addParameter = () => {
    const newParam: TreatmentParameter = {
      id: `param-${Date.now()}`,
      name: 'New Parameter',
      defaultValue: '',
      unit: '',
      isActive: true,
    }
    updateCategorySettings(activeCategory, {
      parameters: [...settings[activeCategory].parameters, newParam]
    })
  }

  const updateParameter = (paramId: string, updates: Partial<TreatmentParameter>) => {
    updateCategorySettings(activeCategory, {
      parameters: settings[activeCategory].parameters.map(p =>
        p.id === paramId ? { ...p, ...updates } : p
      )
    })
  }

  const removeParameter = (paramId: string) => {
    updateCategorySettings(activeCategory, {
      parameters: settings[activeCategory].parameters.filter(p => p.id !== paramId)
    })
  }

  // =============================================================================
  // NEEDLE SIZE HANDLERS
  // =============================================================================

  const addNeedleSize = () => {
    const newSize: NeedleCannulaSize = {
      id: `size-${Date.now()}`,
      gauge: '',
      length: '',
      type: 'needle',
      recommendedFor: [],
      isActive: true,
      isDefault: false,
    }
    updateCategorySettings(activeCategory, {
      needlesSizes: [...settings[activeCategory].needlesSizes, newSize]
    })
  }

  const updateNeedleSize = (sizeId: string, updates: Partial<NeedleCannulaSize>) => {
    updateCategorySettings(activeCategory, {
      needlesSizes: settings[activeCategory].needlesSizes.map(s =>
        s.id === sizeId ? { ...s, ...updates } : s
      )
    })
  }

  const removeNeedleSize = (sizeId: string) => {
    updateCategorySettings(activeCategory, {
      needlesSizes: settings[activeCategory].needlesSizes.filter(s => s.id !== sizeId)
    })
  }

  // =============================================================================
  // ZONE HANDLERS
  // =============================================================================

  const addZone = () => {
    const newZone: TreatmentZone = {
      id: `zone-${Date.now()}`,
      name: 'New Zone',
      category: '',
      isActive: true,
      isCustom: true,
    }
    updateCategorySettings(activeCategory, {
      zones: [...settings[activeCategory].zones, newZone]
    })
  }

  const updateZone = (zoneId: string, updates: Partial<TreatmentZone>) => {
    updateCategorySettings(activeCategory, {
      zones: settings[activeCategory].zones.map(z =>
        z.id === zoneId ? { ...z, ...updates } : z
      )
    })
  }

  const removeZone = (zoneId: string) => {
    updateCategorySettings(activeCategory, {
      zones: settings[activeCategory].zones.filter(z => z.id !== zoneId)
    })
  }

  // =============================================================================
  // TEMPLATE HANDLERS
  // =============================================================================

  const addTemplate = () => {
    const newTemplate: DocumentationTemplate = {
      id: `tmpl-${Date.now()}`,
      name: 'New Template',
      category: '',
      template: '',
      variables: [],
      isActive: true,
      isDefault: false,
    }
    updateCategorySettings(activeCategory, {
      templates: [...settings[activeCategory].templates, newTemplate]
    })
  }

  const updateTemplate = (templateId: string, updates: Partial<DocumentationTemplate>) => {
    updateCategorySettings(activeCategory, {
      templates: settings[activeCategory].templates.map(t =>
        t.id === templateId ? { ...t, ...updates } : t
      )
    })
  }

  const removeTemplate = (templateId: string) => {
    updateCategorySettings(activeCategory, {
      templates: settings[activeCategory].templates.filter(t => t.id !== templateId)
    })
  }

  // =============================================================================
  // TOOL VISIBILITY HANDLER
  // =============================================================================

  const updateToolVisibility = (updates: Partial<ToolVisibilitySettingsInterface>) => {
    setSettings(prev => ({
      ...prev,
      toolVisibility: { ...prev.toolVisibility, ...updates }
    }))
    setHasUnsavedChanges(true)
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  const categorySettings = settings[activeCategory]
  const showNeedleSizes = categorySettings.needlesSizes.length > 0 ||
    ['injectables', 'threads', 'iv-therapy', 'weight-loss', 'skin-treatments', 'hair-restoration', 'hormone-therapy', 'sexual-wellness', 'vein-treatments', 'acne-programs'].includes(activeCategory)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex">
        {/* Sidebar with Category Tabs */}
        <div className="w-72 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Treatment Tool Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Customize charting for all treatments</p>
          </div>

          <nav className="p-2">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon
              const activeCount = settings[tab.id].products.filter(p => p.isActive).length
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors mb-1 ${
                    activeCategory === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{tab.label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeCategory === tab.id
                          ? 'bg-purple-200 text-purple-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {activeCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{tab.description}</p>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Actions at bottom */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => importDefaults(activeCategory)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Import Defaults
            </button>
            <button
              onClick={resetAllSettings}
              className="w-full px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {CATEGORY_TABS.find(t => t.id === activeCategory)?.label} Settings
                </h1>
                <p className="text-gray-500 mt-1">
                  {CATEGORY_TABS.find(t => t.id === activeCategory)?.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <span className="text-sm text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Unsaved changes
                  </span>
                )}
                <button
                  onClick={saveSettings}
                  disabled={!hasUnsavedChanges}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    hasUnsavedChanges
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>

            {/* Tool Visibility Section - Global */}
            <ToolVisibilitySettings
              toolVisibility={settings.toolVisibility}
              onUpdate={updateToolVisibility}
              themeClasses={themeClasses}
            />

            {/* Products Section */}
            <ProductSettings
              products={categorySettings.products}
              isOpen={openSections.products}
              onToggle={() => toggleSection('products')}
              onAdd={addProduct}
              onUpdate={updateProduct}
              onRemove={removeProduct}
              themeClasses={themeClasses}
              isDark={isDark}
            />

            {/* Parameters Section */}
            <ParameterSettings
              parameters={categorySettings.parameters}
              isOpen={openSections.parameters}
              onToggle={() => toggleSection('parameters')}
              onAdd={addParameter}
              onUpdate={updateParameter}
              onRemove={removeParameter}
              themeClasses={themeClasses}
            />

            {/* Needle Sizes Section - Only show for relevant categories */}
            {showNeedleSizes && (
              <NeedleSizeSettings
                needleSizes={categorySettings.needlesSizes}
                isOpen={openSections.needles}
                onToggle={() => toggleSection('needles')}
                onAdd={addNeedleSize}
                onUpdate={updateNeedleSize}
                onRemove={removeNeedleSize}
                themeClasses={themeClasses}
                isDark={isDark}
              />
            )}

            {/* Zones Section */}
            <ZoneSettings
              zones={categorySettings.zones}
              isOpen={openSections.zones}
              onToggle={() => toggleSection('zones')}
              onAdd={addZone}
              onUpdate={updateZone}
              onRemove={removeZone}
              themeClasses={themeClasses}
            />

            {/* Templates Section */}
            <TemplateSettings
              templates={categorySettings.templates}
              isOpen={openSections.templates}
              onToggle={() => toggleSection('templates')}
              onAdd={addTemplate}
              onUpdate={updateTemplate}
              onRemove={removeTemplate}
              themeClasses={themeClasses}
            />

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Settings are saved per category</p>
                <p className="text-sm text-blue-600 mt-1">
                  Changes are automatically saved to your browser. Use &quot;Import Defaults&quot; to restore
                  default presets for any category, or &quot;Reset All&quot; to restore everything.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
