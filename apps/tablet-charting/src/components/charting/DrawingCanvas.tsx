import { useCallback, useState, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native'
import { Canvas, Path, Skia, useCanvasRef } from '@shopify/react-native-skia'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface Point {
  x: number
  y: number
}

interface DrawingPath {
  id: string
  points: Point[]
  color: string
  strokeWidth: number
  type: 'pen' | 'marker' | 'eraser'
}

interface DrawingCanvasProps {
  width?: number
  height?: number
  onSave?: (paths: DrawingPath[]) => void
  initialPaths?: DrawingPath[]
  backgroundImage?: string
}

const COLORS = [
  { id: 'purple', color: '#8b5cf6', label: 'Neurotoxin' },
  { id: 'pink', color: '#ec4899', label: 'Filler' },
  { id: 'blue', color: '#3b82f6', label: 'Mark' },
  { id: 'red', color: '#ef4444', label: 'Warning' },
  { id: 'green', color: '#22c55e', label: 'Complete' },
  { id: 'black', color: '#1e293b', label: 'Notes' },
]

const BRUSH_SIZES = [
  { id: 'fine', width: 2, label: 'Fine' },
  { id: 'medium', width: 4, label: 'Medium' },
  { id: 'thick', width: 8, label: 'Thick' },
  { id: 'marker', width: 16, label: 'Marker' },
]

export function DrawingCanvas({
  width = SCREEN_WIDTH * 0.6,
  height = 500,
  onSave,
  initialPaths = [],
}: DrawingCanvasProps) {
  const canvasRef = useCanvasRef()
  const [paths, setPaths] = useState<DrawingPath[]>(initialPaths)
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null)
  const [selectedColor, setSelectedColor] = useState(COLORS[0].color)
  const [selectedBrushSize, setSelectedBrushSize] = useState(BRUSH_SIZES[1].width)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [showTools, setShowTools] = useState(true)

  // Shared values for gesture handling
  const pathPoints = useSharedValue<Point[]>([])

  const createSkiaPath = useCallback((points: Point[]) => {
    const path = Skia.Path.Make()
    if (points.length < 2) return path

    path.moveTo(points[0].x, points[0].y)

    // Use quadratic curves for smoother lines
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      path.quadTo(points[i].x, points[i].y, xc, yc)
    }

    // Connect to last point
    if (points.length > 1) {
      const lastPoint = points[points.length - 1]
      path.lineTo(lastPoint.x, lastPoint.y)
    }

    return path
  }, [])

  const handleDrawStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }, [])

  const handleDrawEnd = useCallback(
    (points: Point[]) => {
      if (points.length < 2) return

      const newPath: DrawingPath = {
        id: `path-${Date.now()}`,
        points: [...points],
        color: tool === 'eraser' ? '#ffffff' : selectedColor,
        strokeWidth: tool === 'eraser' ? selectedBrushSize * 3 : selectedBrushSize,
        type: tool === 'eraser' ? 'eraser' : 'pen',
      }

      setPaths((prev) => [...prev, newPath])
      setCurrentPath(null)
    },
    [selectedColor, selectedBrushSize, tool]
  )

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      'worklet'
      pathPoints.value = [{ x: event.x, y: event.y }]
      runOnJS(handleDrawStart)()
    })
    .onUpdate((event) => {
      'worklet'
      pathPoints.value = [...pathPoints.value, { x: event.x, y: event.y }]
      runOnJS(setCurrentPath)({
        id: 'current',
        points: pathPoints.value,
        color: tool === 'eraser' ? '#ffffff' : selectedColor,
        strokeWidth: tool === 'eraser' ? selectedBrushSize * 3 : selectedBrushSize,
        type: tool === 'eraser' ? 'eraser' : 'pen',
      })
    })
    .onEnd(() => {
      'worklet'
      runOnJS(handleDrawEnd)(pathPoints.value)
      pathPoints.value = []
    })
    .minDistance(1)
    .minPointers(1)
    .maxPointers(1)

  const handleUndo = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setPaths((prev) => prev.slice(0, -1))
  }, [])

  const handleClear = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    setPaths([])
  }, [])

  const handleSave = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onSave?.(paths)
  }, [paths, onSave])

  return (
    <View style={styles.container}>
      {/* Canvas */}
      <GestureDetector gesture={panGesture}>
        <View style={[styles.canvasContainer, { width, height }]}>
          <Canvas ref={canvasRef} style={[styles.canvas, { width, height }]}>
            {/* Render saved paths */}
            {paths.map((pathData) => (
              <Path
                key={pathData.id}
                path={createSkiaPath(pathData.points)}
                color={pathData.color}
                style="stroke"
                strokeWidth={pathData.strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            ))}

            {/* Render current drawing path */}
            {currentPath && currentPath.points.length > 1 && (
              <Path
                path={createSkiaPath(currentPath.points)}
                color={currentPath.color}
                style="stroke"
                strokeWidth={currentPath.strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            )}
          </Canvas>
        </View>
      </GestureDetector>

      {/* Tools Toggle */}
      <TouchableOpacity
        style={styles.toolsToggle}
        onPress={() => setShowTools(!showTools)}
      >
        <Text style={styles.toolsToggleText}>{showTools ? '◀' : '▶'} Tools</Text>
      </TouchableOpacity>

      {/* Tools Panel */}
      {showTools && (
        <View style={styles.toolsPanel}>
          {/* Tool Selection */}
          <View style={styles.toolSection}>
            <Text style={styles.toolSectionTitle}>Tool</Text>
            <View style={styles.toolButtons}>
              <TouchableOpacity
                style={[styles.toolButton, tool === 'pen' && styles.toolButtonActive]}
                onPress={() => setTool('pen')}
              >
                <Text style={styles.toolButtonText}>✏️ Pen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toolButton, tool === 'eraser' && styles.toolButtonActive]}
                onPress={() => setTool('eraser')}
              >
                <Text style={styles.toolButtonText}>🧹 Eraser</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.toolSection}>
            <Text style={styles.toolSectionTitle}>Color</Text>
            <View style={styles.colorPalette}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.colorButton,
                    { backgroundColor: c.color },
                    selectedColor === c.color && styles.colorButtonSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync()
                    setSelectedColor(c.color)
                  }}
                />
              ))}
            </View>
          </View>

          {/* Brush Size */}
          <View style={styles.toolSection}>
            <Text style={styles.toolSectionTitle}>Size</Text>
            <View style={styles.brushSizes}>
              {BRUSH_SIZES.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.brushButton,
                    selectedBrushSize === b.width && styles.brushButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync()
                    setSelectedBrushSize(b.width)
                  }}
                >
                  <View
                    style={[
                      styles.brushPreview,
                      {
                        width: b.width * 2,
                        height: b.width * 2,
                        backgroundColor: selectedColor,
                      },
                    ]}
                  />
                  <Text style={styles.brushLabel}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.toolSection}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleUndo}
                disabled={paths.length === 0}
              >
                <Text style={styles.actionButtonText}>↩️ Undo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClear}
                disabled={paths.length === 0}
              >
                <Text style={styles.actionButtonText}>🗑️ Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={handleSave}
              >
                <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                  💾 Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Drawing Stats */}
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              {paths.length} stroke{paths.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  canvasContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  canvas: {
    backgroundColor: 'transparent',
  },
  toolsToggle: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 10,
  },
  toolsToggleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  toolsPanel: {
    width: 180,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toolSection: {
    marginBottom: 16,
  },
  toolSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  toolButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toolButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  toolButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  toolButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#1e293b',
    transform: [{ scale: 1.1 }],
  },
  brushSizes: {
    flexDirection: 'row',
    gap: 6,
  },
  brushButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  brushButtonActive: {
    backgroundColor: '#f3e8ff',
  },
  brushPreview: {
    borderRadius: 100,
    marginBottom: 4,
  },
  brushLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  actionButtonTextPrimary: {
    color: '#ffffff',
  },
  stats: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statsText: {
    fontSize: 11,
    color: '#94a3b8',
  },
})
