'use client'

import {
  Wrench,
  Target,
  Edit3,
  Grid,
  Paintbrush,
  MoveRight,
  Type,
  Shapes,
  Ruler,
  GitBranch,
  Activity,
  AlertTriangle,
  PanelLeftClose,
  Maximize2,
  Eye,
  EyeOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { ToolVisibilitySettings as ToolVisibilitySettingsType, ThemeClasses } from './types'

interface ToolVisibilitySettingsProps {
  toolVisibility: ToolVisibilitySettingsType
  onUpdate: (updates: Partial<ToolVisibilitySettingsType>) => void
  themeClasses: ThemeClasses
}

interface ToolToggleItemProps {
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  checked: boolean
  onChange: (checked: boolean) => void
  isBasic?: boolean
  themeClasses: ThemeClasses
}

function ToolToggleItem({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
  isBasic = false,
  themeClasses,
}: ToolToggleItemProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${themeClasses.panelBg} ${isBasic ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${checked ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-medium ${themeClasses.textPrimary}`}>{label}</span>
            {isBasic && (
              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">Always On</span>
            )}
          </div>
          <p className={`text-sm ${themeClasses.textMuted}`}>{description}</p>
        </div>
      </div>
      <button
        onClick={() => !isBasic && onChange(!checked)}
        disabled={isBasic}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          isBasic ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  )
}

export function ToolVisibilitySettings({
  toolVisibility,
  onUpdate,
  themeClasses,
}: ToolVisibilitySettingsProps) {
  const enabledCount = Object.values(toolVisibility).filter(Boolean).length

  const updateToolVisibility = (key: keyof ToolVisibilitySettingsType, value: boolean) => {
    onUpdate({ [key]: value })
  }

  const enableAll = () => {
    onUpdate({
      brushTool: true,
      arrowTool: true,
      textLabels: true,
      shapeTool: true,
      measurementTool: true,
      cannulaPathTool: true,
      veinDrawingTool: true,
      dangerZoneOverlay: true,
      showCalibrationControls: true,
      showAdvancedPanels: true,
      compactMode: false,
    })
    toast.success('All advanced tools enabled')
  }

  const resetToSimple = () => {
    onUpdate({
      brushTool: false,
      arrowTool: false,
      textLabels: false,
      shapeTool: false,
      measurementTool: false,
      cannulaPathTool: false,
      veinDrawingTool: false,
      dangerZoneOverlay: false,
      showCalibrationControls: false,
      showAdvancedPanels: false,
      compactMode: false,
    })
    toast.success('Reset to simple mode')
  }

  return (
    <div className="mb-6">
      <div className={`rounded-lg border ${themeClasses.panelBg} overflow-hidden`}>
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wrench className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Tool Visibility</h3>
              <p className="text-sm text-gray-500">
                Control which tools appear in the charting toolbar. Keep it simple by default.
              </p>
            </div>
            <span className="ml-auto px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full">
              {enabledCount} enabled
            </span>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Basic Tools Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Basic Tools (Always Available)
            </h4>
            <div className="grid gap-2">
              <ToolToggleItem
                label="Select Tool"
                description="Select and move elements on the canvas"
                icon={Target}
                checked={true}
                onChange={() => {}}
                isBasic={true}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Freehand/Pen"
                description="Draw freely on the canvas"
                icon={Edit3}
                checked={true}
                onChange={() => {}}
                isBasic={true}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Zone Tool"
                description="Draw rectangular treatment zones"
                icon={Grid}
                checked={true}
                onChange={() => {}}
                isBasic={true}
                themeClasses={themeClasses}
              />
            </div>
          </div>

          {/* Advanced Drawing Tools Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Advanced Drawing Tools
            </h4>
            <div className="grid gap-2">
              <ToolToggleItem
                label="Brush Tool"
                description="Paint treatment areas with customizable brush"
                icon={Paintbrush}
                checked={toolVisibility.brushTool}
                onChange={(val) => updateToolVisibility('brushTool', val)}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Arrow Tool"
                description="Draw directional arrows for thread lifts and flow"
                icon={MoveRight}
                checked={toolVisibility.arrowTool}
                onChange={(val) => updateToolVisibility('arrowTool', val)}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Text Labels"
                description="Add text annotations (Avoid, Bruise, Notes)"
                icon={Type}
                checked={toolVisibility.textLabels}
                onChange={(val) => updateToolVisibility('textLabels', val)}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Shape Tool"
                description="Draw circles, rectangles, and freeform areas"
                icon={Shapes}
                checked={toolVisibility.shapeTool}
                onChange={(val) => updateToolVisibility('shapeTool', val)}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Measurement Tool"
                description="Measure distances for brow lift, lip ratio, symmetry"
                icon={Ruler}
                checked={toolVisibility.measurementTool}
                onChange={(val) => updateToolVisibility('measurementTool', val)}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Cannula Path Tool"
                description="Document cannula entry points and fanning paths"
                icon={GitBranch}
                checked={toolVisibility.cannulaPathTool}
                onChange={(val) => updateToolVisibility('cannulaPathTool', val)}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Smooth Pen Tool"
                description="Draw freely with smooth pen strokes"
                icon={Activity}
                checked={toolVisibility.veinDrawingTool}
                onChange={(val) => updateToolVisibility('veinDrawingTool', val)}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Anatomical Safety Overlay"
                description="Display arteries (red), nerves (yellow), and vascular danger zones on face chart to help prevent blindness and tissue necrosis"
                icon={AlertTriangle}
                checked={toolVisibility.dangerZoneOverlay}
                onChange={(val) => updateToolVisibility('dangerZoneOverlay', val)}
                themeClasses={themeClasses}
              />
            </div>
          </div>

          {/* UI Settings Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              UI Settings
            </h4>
            <div className="grid gap-2">
              <ToolToggleItem
                label="Show Calibration Controls"
                description="Display calibration options for the measurement tool"
                icon={Ruler}
                checked={toolVisibility.showCalibrationControls}
                onChange={(val) => updateToolVisibility('showCalibrationControls', val)}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Show Advanced Panels"
                description="Display additional detail panels in the charting view"
                icon={PanelLeftClose}
                checked={toolVisibility.showAdvancedPanels}
                onChange={(val) => updateToolVisibility('showAdvancedPanels', val)}
                themeClasses={themeClasses}
              />
              <ToolToggleItem
                label="Compact Mode"
                description="Use smaller UI elements for more canvas space"
                icon={Maximize2}
                checked={toolVisibility.compactMode}
                onChange={(val) => updateToolVisibility('compactMode', val)}
                themeClasses={themeClasses}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={enableAll}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Enable All
            </button>
            <button
              onClick={resetToSimple}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Simple Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
