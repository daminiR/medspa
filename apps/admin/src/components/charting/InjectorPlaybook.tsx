'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  useChartingSettings,
  TreatmentTemplate,
  TreatmentZone,
  ProductPreset
} from '@/contexts/ChartingSettingsContext'
import { useChartingTheme } from '@/contexts/ChartingThemeContext'
import {
  Book,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Star,
  StarOff,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Syringe,
  Sparkles,
  Droplets,
  Clock,
  Users,
  Target,
  Layers,
  Check,
  AlertCircle,
  FileText,
  Filter,
  Search,
  MoreVertical,
  Share2,
  Download,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'

// =============================================================================
// TYPES
// =============================================================================

interface PlaybookProtocol {
  id: string
  name: string
  description: string
  category: 'neurotoxin' | 'filler' | 'combination'
  zones: {
    zoneId: string
    units?: number
    volume?: number
    depthId: string
    techniqueId: string
    needleGaugeId: string
    notes?: string
  }[]
  products: string[]
  estimatedTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  contraindications?: string[]
  tips?: string[]
  isPersonal: boolean // vs shared/team protocol
  isFavorite: boolean
  createdBy: string
  createdAt: Date
  lastUsed?: Date
  useCount: number
}

interface InjectorPlaybookProps {
  providerId: string
  providerName: string
  onApplyProtocol?: (protocol: PlaybookProtocol) => void
  onClose?: () => void
  isModal?: boolean
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InjectorPlaybook({
  providerId,
  providerName,
  onApplyProtocol,
  onClose,
  isModal = false
}: InjectorPlaybookProps) {
  // Theme context for dark/light mode
  const { isDark } = useChartingTheme()

  const {
    settings,
    getActiveZones,
    getActiveProducts,
    getActiveTemplates,
    addTreatmentTemplate,
    updateTreatmentTemplate,
    removeTreatmentTemplate,
    getZoneById,
    getDepthById,
    getTechniqueById,
    getNeedleGaugeById,
    getProductById
  } = useChartingSettings()

  // State
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'neurotoxin' | 'filler' | 'combination'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [editingProtocol, setEditingProtocol] = useState<PlaybookProtocol | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null)

  // Convert templates to protocols (with additional metadata)
  const protocols = useMemo((): PlaybookProtocol[] => {
    return settings.treatmentTemplates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description || '',
      category: template.category as 'neurotoxin' | 'filler' | 'combination',
      zones: template.zones.map(z => ({
        zoneId: z.zoneId,
        units: z.units,
        volume: z.volume,
        depthId: z.depth,
        techniqueId: z.technique,
        needleGaugeId: z.needleGauge
      })),
      products: template.products,
      estimatedTime: template.estimatedTime,
      difficulty: 'intermediate' as const,
      isPersonal: template.createdBy === providerId,
      isFavorite: template.isDefault,
      createdBy: template.createdBy || 'System',
      createdAt: template.createdAt,
      useCount: 0
    }))
  }, [settings.treatmentTemplates, providerId])

  // Filter protocols
  const filteredProtocols = useMemo(() => {
    return protocols.filter(p => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false
      if (showFavoritesOnly && !p.isFavorite) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [protocols, selectedCategory, showFavoritesOnly, searchQuery])

  // Group by category
  const groupedProtocols = useMemo(() => {
    const groups: Record<string, PlaybookProtocol[]> = {
      neurotoxin: [],
      filler: [],
      combination: []
    }
    filteredProtocols.forEach(p => {
      groups[p.category]?.push(p)
    })
    return groups
  }, [filteredProtocols])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleApplyProtocol = useCallback((protocol: PlaybookProtocol) => {
    onApplyProtocol?.(protocol)
    toast.success(`Applied "${protocol.name}"`, { icon: '⚡' })
  }, [onApplyProtocol])

  const handleToggleFavorite = useCallback((protocolId: string) => {
    const template = settings.treatmentTemplates.find(t => t.id === protocolId)
    if (template) {
      updateTreatmentTemplate(protocolId, { isDefault: !template.isDefault })
      toast.success(template.isDefault ? 'Removed from favorites' : 'Added to favorites')
    }
  }, [settings.treatmentTemplates, updateTreatmentTemplate])

  const handleDuplicateProtocol = useCallback((protocol: PlaybookProtocol) => {
    const template = settings.treatmentTemplates.find(t => t.id === protocol.id)
    if (template) {
      addTreatmentTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        zones: [...template.zones],
        products: [...template.products],
        estimatedTime: template.estimatedTime,
        isDefault: false,
        isActive: true,
        createdBy: providerId
      })
      toast.success('Protocol duplicated')
    }
  }, [settings.treatmentTemplates, addTreatmentTemplate, providerId])

  const handleDeleteProtocol = useCallback((protocolId: string) => {
    if (confirm('Are you sure you want to delete this protocol?')) {
      removeTreatmentTemplate(protocolId)
      toast.success('Protocol deleted')
    }
  }, [removeTreatmentTemplate])

  const handleCreateNew = useCallback(() => {
    setIsCreating(true)
    setEditingProtocol({
      id: '',
      name: '',
      description: '',
      category: 'neurotoxin',
      zones: [],
      products: [],
      estimatedTime: 15,
      difficulty: 'intermediate',
      isPersonal: true,
      isFavorite: false,
      createdBy: providerId,
      createdAt: new Date(),
      useCount: 0
    })
  }, [providerId])

  const handleSaveProtocol = useCallback((protocol: PlaybookProtocol) => {
    if (!protocol.name.trim()) {
      toast.error('Protocol name is required')
      return
    }

    if (isCreating) {
      addTreatmentTemplate({
        name: protocol.name,
        description: protocol.description,
        category: protocol.category,
        zones: protocol.zones.map(z => ({
          zoneId: z.zoneId,
          units: z.units,
          volume: z.volume,
          depth: z.depthId,
          technique: z.techniqueId,
          needleGauge: z.needleGaugeId,
          notes: z.notes
        })),
        products: protocol.products,
        estimatedTime: protocol.estimatedTime,
        isDefault: protocol.isFavorite,
        isActive: true,
        createdBy: providerId
      })
      toast.success('Protocol created!')
    } else {
      updateTreatmentTemplate(protocol.id, {
        name: protocol.name,
        description: protocol.description,
        category: protocol.category,
        zones: protocol.zones.map(z => ({
          zoneId: z.zoneId,
          units: z.units,
          volume: z.volume,
          depth: z.depthId,
          technique: z.techniqueId,
          needleGauge: z.needleGaugeId,
          notes: z.notes
        })),
        products: protocol.products,
        estimatedTime: protocol.estimatedTime,
        isDefault: protocol.isFavorite
      })
      toast.success('Protocol updated!')
    }

    setEditingProtocol(null)
    setIsCreating(false)
  }, [isCreating, addTreatmentTemplate, updateTreatmentTemplate, providerId])

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const containerClass = isModal
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50'
    : ''

  const contentClass = isModal
    ? `rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`
    : `rounded-xl border shadow-sm overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDark
            ? 'border-gray-700 bg-gradient-to-r from-purple-900/30 to-pink-900/30'
            : 'border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Injector Playbook</h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{providerName}'s personal protocols & techniques</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Protocol
              </button>
              {isModal && onClose && (
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg ${
                    isDark
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`px-6 py-3 border-b flex items-center gap-4 ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'
        }`}>
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>

          {/* Category Filter */}
          <div className={`flex rounded-lg p-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {['all', 'neurotoxin', 'filler', 'combination'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? isDark
                      ? 'bg-gray-600 text-purple-400 shadow-sm'
                      : 'bg-white text-purple-700 shadow-sm'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cat === 'all' ? 'All' : cat === 'neurotoxin' ? (
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Toxin</span>
                ) : cat === 'filler' ? (
                  <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> Filler</span>
                ) : 'Combo'}
              </button>
            ))}
          </div>

          {/* Favorites Filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
              showFavoritesOnly
                ? isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                : isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </button>
        </div>

        {/* Protocol List */}
        <div className="flex-1 overflow-y-auto p-6">
          {editingProtocol ? (
            <ProtocolEditor
              protocol={editingProtocol}
              isNew={isCreating}
              onSave={handleSaveProtocol}
              onCancel={() => {
                setEditingProtocol(null)
                setIsCreating(false)
              }}
              getZoneById={getZoneById}
              getProductById={getProductById}
              activeZones={getActiveZones('face')}
              activeProducts={getActiveProducts()}
              isDark={isDark}
            />
          ) : filteredProtocols.length === 0 ? (
            <div className="text-center py-12">
              <Book className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No protocols found</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchQuery ? 'Try a different search term' : 'Create your first protocol to get started'}
              </p>
              <button
                onClick={handleCreateNew}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                Create Protocol
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Neurotoxin Protocols */}
              {groupedProtocols.neurotoxin.length > 0 && (
                <ProtocolGroup
                  title="Neurotoxin Protocols"
                  icon={<Sparkles className="w-4 h-4" />}
                  color="purple"
                  protocols={groupedProtocols.neurotoxin}
                  expandedProtocol={expandedProtocol}
                  onToggleExpand={setExpandedProtocol}
                  onApply={handleApplyProtocol}
                  onEdit={setEditingProtocol}
                  onDuplicate={handleDuplicateProtocol}
                  onDelete={handleDeleteProtocol}
                  onToggleFavorite={handleToggleFavorite}
                  getZoneById={getZoneById}
                  getProductById={getProductById}
                />
              )}

              {/* Filler Protocols */}
              {groupedProtocols.filler.length > 0 && (
                <ProtocolGroup
                  title="Filler Protocols"
                  icon={<Droplets className="w-4 h-4" />}
                  color="pink"
                  protocols={groupedProtocols.filler}
                  expandedProtocol={expandedProtocol}
                  onToggleExpand={setExpandedProtocol}
                  onApply={handleApplyProtocol}
                  onEdit={setEditingProtocol}
                  onDuplicate={handleDuplicateProtocol}
                  onDelete={handleDeleteProtocol}
                  onToggleFavorite={handleToggleFavorite}
                  getZoneById={getZoneById}
                  getProductById={getProductById}
                />
              )}

              {/* Combination Protocols */}
              {groupedProtocols.combination.length > 0 && (
                <ProtocolGroup
                  title="Combination Protocols"
                  icon={<Syringe className="w-4 h-4" />}
                  color="indigo"
                  protocols={groupedProtocols.combination}
                  expandedProtocol={expandedProtocol}
                  onToggleExpand={setExpandedProtocol}
                  onApply={handleApplyProtocol}
                  onEdit={setEditingProtocol}
                  onDuplicate={handleDuplicateProtocol}
                  onDelete={handleDeleteProtocol}
                  onToggleFavorite={handleToggleFavorite}
                  getZoneById={getZoneById}
                  getProductById={getProductById}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
          isDark
            ? 'border-gray-700 bg-gray-800/50 text-gray-400'
            : 'border-gray-100 bg-gray-50 text-gray-500'
        }`}>
          <div className="flex items-center gap-4">
            <span>{protocols.length} total protocols</span>
            <span>{protocols.filter(p => p.isPersonal).length} personal</span>
            <span>{protocols.filter(p => p.isFavorite).length} favorites</span>
          </div>
          <div className="flex items-center gap-2">
            <button className={`flex items-center gap-1 ${
              isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
            }`}>
              <Upload className="w-3 h-3" />
              Import
            </button>
            <button className={`flex items-center gap-1 ${
              isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
            }`}>
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// PROTOCOL GROUP COMPONENT
// =============================================================================

interface ProtocolGroupProps {
  title: string
  icon: React.ReactNode
  color: 'purple' | 'pink' | 'indigo'
  protocols: PlaybookProtocol[]
  expandedProtocol: string | null
  onToggleExpand: (id: string | null) => void
  onApply: (protocol: PlaybookProtocol) => void
  onEdit: (protocol: PlaybookProtocol) => void
  onDuplicate: (protocol: PlaybookProtocol) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  getZoneById: (id: string) => TreatmentZone | undefined
  getProductById: (id: string) => ProductPreset | undefined
}

function ProtocolGroup({
  title,
  icon,
  color,
  protocols,
  expandedProtocol,
  onToggleExpand,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  getZoneById,
  getProductById
}: ProtocolGroupProps) {
  const colorClasses = {
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100' }
  }

  const colors = colorClasses[color]

  return (
    <div>
      <div className={`flex items-center gap-2 px-3 py-2 ${colors.bg} rounded-t-lg border ${colors.border} border-b-0`}>
        <span className={colors.text}>{icon}</span>
        <h3 className={`font-medium ${colors.text}`}>{title}</h3>
        <span className={`px-2 py-0.5 ${colors.badge} ${colors.text} text-xs rounded-full`}>
          {protocols.length}
        </span>
      </div>

      <div className={`border ${colors.border} border-t-0 rounded-b-lg divide-y divide-gray-100`}>
        {protocols.map(protocol => (
          <ProtocolCard
            key={protocol.id}
            protocol={protocol}
            isExpanded={expandedProtocol === protocol.id}
            onToggleExpand={() => onToggleExpand(expandedProtocol === protocol.id ? null : protocol.id)}
            onApply={() => onApply(protocol)}
            onEdit={() => onEdit(protocol)}
            onDuplicate={() => onDuplicate(protocol)}
            onDelete={() => onDelete(protocol.id)}
            onToggleFavorite={() => onToggleFavorite(protocol.id)}
            getZoneById={getZoneById}
            getProductById={getProductById}
            color={color}
          />
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// PROTOCOL CARD COMPONENT
// =============================================================================

interface ProtocolCardProps {
  protocol: PlaybookProtocol
  isExpanded: boolean
  onToggleExpand: () => void
  onApply: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  getZoneById: (id: string) => TreatmentZone | undefined
  getProductById: (id: string) => ProductPreset | undefined
  color: 'purple' | 'pink' | 'indigo'
}

function ProtocolCard({
  protocol,
  isExpanded,
  onToggleExpand,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  getZoneById,
  getProductById,
  color
}: ProtocolCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Calculate totals
  const totalUnits = protocol.zones.reduce((sum, z) => sum + (z.units || 0), 0)
  const totalVolume = protocol.zones.reduce((sum, z) => sum + (z.volume || 0), 0)

  const colorClasses = {
    purple: { button: 'bg-purple-600 hover:bg-purple-700', light: 'bg-purple-100 text-purple-700' },
    pink: { button: 'bg-pink-600 hover:bg-pink-700', light: 'bg-pink-100 text-pink-700' },
    indigo: { button: 'bg-indigo-600 hover:bg-indigo-700', light: 'bg-indigo-100 text-indigo-700' }
  }

  const colors = colorClasses[color]

  return (
    <div className="bg-white">
      {/* Card Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onToggleExpand}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{protocol.name}</h4>
              {protocol.isFavorite && (
                <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
              )}
              {protocol.isPersonal && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                  Personal
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {protocol.zones.length} zones
              </span>
              {totalUnits > 0 && (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {totalUnits}u
                </span>
              )}
              {totalVolume > 0 && (
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  {totalVolume.toFixed(1)}ml
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {protocol.estimatedTime}min
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onApply}
            className={`px-4 py-2 ${colors.button} text-white rounded-lg text-sm font-medium transition-colors`}
          >
            Apply
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => { onToggleFavorite(); setShowMenu(false) }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    {protocol.isFavorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    {protocol.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  </button>
                  <button
                    onClick={() => { onEdit(); setShowMenu(false) }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit protocol
                  </button>
                  <button
                    onClick={() => { onDuplicate(); setShowMenu(false) }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { onDelete(); setShowMenu(false) }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 mt-2 pt-3">
          {protocol.description && (
            <p className="text-sm text-gray-600 mb-4">{protocol.description}</p>
          )}

          {/* Zone Breakdown */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Injection Points</p>
            <div className="grid grid-cols-2 gap-2">
              {protocol.zones.map((zone, idx) => {
                const zoneInfo = getZoneById(zone.zoneId)
                return (
                  <div
                    key={idx}
                    className={`px-3 py-2 ${colors.light} rounded-lg text-sm`}
                  >
                    <p className="font-medium">{zoneInfo?.name || zone.zoneId}</p>
                    <p className="text-xs opacity-75">
                      {zone.units ? `${zone.units} units` : `${zone.volume}ml`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Products Used */}
          {protocol.products.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Products</p>
              <div className="flex flex-wrap gap-2">
                {protocol.products.map(productId => {
                  const product = getProductById(productId)
                  return (
                    <span
                      key={productId}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {product?.name || productId}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// PROTOCOL EDITOR COMPONENT
// =============================================================================

interface ProtocolEditorProps {
  protocol: PlaybookProtocol
  isNew: boolean
  onSave: (protocol: PlaybookProtocol) => void
  onCancel: () => void
  getZoneById: (id: string) => TreatmentZone | undefined
  getProductById: (id: string) => ProductPreset | undefined
  activeZones: TreatmentZone[]
  activeProducts: ProductPreset[]
  isDark?: boolean
}

function ProtocolEditor({
  protocol: initialProtocol,
  isNew,
  onSave,
  onCancel,
  getZoneById,
  getProductById,
  activeZones,
  activeProducts,
  isDark = false
}: ProtocolEditorProps) {
  const [protocol, setProtocol] = useState<PlaybookProtocol>(initialProtocol)
  const [selectedZoneToAdd, setSelectedZoneToAdd] = useState('')

  const handleAddZone = () => {
    if (!selectedZoneToAdd) return

    const zone = getZoneById(selectedZoneToAdd)
    if (!zone) return

    setProtocol(prev => ({
      ...prev,
      zones: [...prev.zones, {
        zoneId: selectedZoneToAdd,
        units: zone.defaultUnits,
        volume: zone.defaultVolume,
        depthId: zone.defaultDepth,
        techniqueId: zone.defaultTechnique,
        needleGaugeId: zone.defaultNeedleGauge
      }]
    }))
    setSelectedZoneToAdd('')
  }

  const handleRemoveZone = (index: number) => {
    setProtocol(prev => ({
      ...prev,
      zones: prev.zones.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateZone = (index: number, updates: Partial<PlaybookProtocol['zones'][0]>) => {
    setProtocol(prev => ({
      ...prev,
      zones: prev.zones.map((z, i) => i === index ? { ...z, ...updates } : z)
    }))
  }

  return (
    <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {isNew ? 'Create New Protocol' : 'Edit Protocol'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className={isDark ? 'px-4 py-2 text-gray-400 hover:text-gray-200' : 'px-4 py-2 text-gray-600 hover:text-gray-800'}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(protocol)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Protocol
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Protocol Name</label>
            <input
              type="text"
              value={protocol.name}
              onChange={(e) => setProtocol(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Full Face Refresh"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
            <select
              value={protocol.category}
              onChange={(e) => setProtocol(prev => ({ ...prev, category: e.target.value as any }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="neurotoxin">Neurotoxin</option>
              <option value="filler">Filler</option>
              <option value="combination">Combination</option>
            </select>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
          <textarea
            value={protocol.description}
            onChange={(e) => setProtocol(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe this protocol..."
            rows={2}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Estimated Time (min)</label>
            <input
              type="number"
              value={protocol.estimatedTime}
              onChange={(e) => setProtocol(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
              min={1}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={protocol.isFavorite}
                onChange={(e) => setProtocol(prev => ({ ...prev, isFavorite: e.target.checked }))}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Add to favorites</span>
            </label>
          </div>
        </div>

        {/* Zones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Injection Zones</label>

          {/* Add Zone */}
          <div className="flex items-center gap-2 mb-4">
            <select
              value={selectedZoneToAdd}
              onChange={(e) => setSelectedZoneToAdd(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a zone to add...</option>
              {activeZones
                .filter(z => !protocol.zones.some(pz => pz.zoneId === z.id))
                .map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))
              }
            </select>
            <button
              onClick={handleAddZone}
              disabled={!selectedZoneToAdd}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Zone List */}
          <div className="space-y-2">
            {protocol.zones.map((zone, idx) => {
              const zoneInfo = getZoneById(zone.zoneId)
              const isNeurotoxin = protocol.category === 'neurotoxin'

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{zoneInfo?.name || zone.zoneId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={isNeurotoxin ? zone.units || 0 : zone.volume || 0}
                      onChange={(e) => handleUpdateZone(idx, isNeurotoxin
                        ? { units: parseFloat(e.target.value) || 0 }
                        : { volume: parseFloat(e.target.value) || 0 }
                      )}
                      step={isNeurotoxin ? 1 : 0.1}
                      min={0}
                      className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center"
                    />
                    <span className="text-sm text-gray-500">{isNeurotoxin ? 'units' : 'ml'}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveZone(idx)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>

          {protocol.zones.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-white border border-dashed border-gray-300 rounded-lg">
              <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No zones added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InjectorPlaybook
