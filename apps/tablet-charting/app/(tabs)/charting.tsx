import { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useChartingStore } from '../../src/stores/chartingStore'
import { FACE_ZONES, PRODUCTS, INJECTION_DEPTHS, INJECTION_TECHNIQUES } from '../../src/types'
import { InteractiveFaceChart } from '../../src/components/charting/InteractiveFaceChart'
import { QuickEditPanel } from '../../src/components/charting/QuickEditPanel'
import { DrawingCanvas } from '../../src/components/charting/DrawingCanvas'
import { FaceChart3D, InjectionPoint3D } from '../../src/components/charting/FaceChart3D'
import * as THREE from 'three'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

type ChartMode = 'zones' | 'freehand' | 'draw' | '3d'

export default function ChartingScreen() {
  const {
    currentPatient,
    productType,
    setProductType,
    drawingMode,
    setDrawingMode,
    injectionPoints,
    selectedPointId,
    selectPoint,
    addInjectionPoint,
    updateInjectionPoint,
    removeInjectionPoint,
    clearAllPoints,
    addAnnotation,
    saveSession,
  } = useChartingStore()

  const [showZoneList, setShowZoneList] = useState(false)
  const [chartMode, setChartMode] = useState<ChartMode>('zones')
  const [injectionPoints3D, setInjectionPoints3D] = useState<InjectionPoint3D[]>([])
  const [selected3DPointId, setSelected3DPointId] = useState<string | null>(null)

  // 3D Point handlers
  const handleAdd3DPoint = useCallback(
    (position: THREE.Vector3) => {
      const newPoint: InjectionPoint3D = {
        id: `3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position,
        units: productType === 'neurotoxin' ? 5 : undefined,
        volume: productType === 'filler' ? 0.5 : undefined,
        depthId: 'mid-dermis',
        techniqueId: 'serial-puncture',
        needleGaugeId: productType === 'neurotoxin' ? '30g' : '27g-cannula',
        timestamp: new Date(),
        productType,
      }
      setInjectionPoints3D((prev) => [...prev, newPoint])
      setSelected3DPointId(newPoint.id)
    },
    [productType]
  )

  const handleUpdate3DPoint = useCallback((id: string, updates: Partial<InjectionPoint3D>) => {
    setInjectionPoints3D((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }, [])

  const handleRemove3DPoint = useCallback((id: string) => {
    setInjectionPoints3D((prev) => prev.filter((p) => p.id !== id))
    if (selected3DPointId === id) {
      setSelected3DPointId(null)
    }
  }, [selected3DPointId])

  const selectedPoint = selectedPointId
    ? injectionPoints.find((p) => p.id === selectedPointId)
    : null

  const totalUnits = injectionPoints
    .filter((p) => p.productType === 'neurotoxin')
    .reduce((sum, p) => sum + (p.units || 0), 0)

  const totalVolume = injectionPoints
    .filter((p) => p.productType === 'filler')
    .reduce((sum, p) => sum + (p.volume || 0), 0)

  const handleZonePress = useCallback(
    (zoneId: string, x: number, y: number) => {
      const zone = FACE_ZONES.find((z) => z.id === zoneId)
      if (!zone) return

      // Check if point already exists at this zone
      const existingPoint = injectionPoints.find((p) => p.zoneId === zoneId)
      if (existingPoint) {
        selectPoint(existingPoint.id)
        return
      }

      // Add new injection point
      addInjectionPoint({
        zoneId,
        x: zone.x,
        y: zone.y,
        units: productType === 'neurotoxin' ? zone.defaultUnits : undefined,
        volume: productType === 'filler' ? zone.defaultVolume : undefined,
        depthId: zone.recommendedDepth,
        techniqueId: zone.recommendedTechnique,
        needleGaugeId: productType === 'neurotoxin' ? '30g' : '25g-cannula',
        productType,
      })
    },
    [addInjectionPoint, injectionPoints, productType, selectPoint]
  )

  const handleFreehandPress = useCallback(
    (x: number, y: number) => {
      addInjectionPoint({
        zoneId: 'freehand',
        x,
        y,
        units: productType === 'neurotoxin' ? 5 : undefined,
        volume: productType === 'filler' ? 0.5 : undefined,
        depthId: 'mid-dermis',
        techniqueId: 'serial-puncture',
        needleGaugeId: productType === 'neurotoxin' ? '30g' : '27g-cannula',
        productType,
      })
    },
    [addInjectionPoint, productType]
  )

  const handleUpdateUnits = useCallback(
    (delta: number) => {
      if (!selectedPointId) return
      const point = injectionPoints.find((p) => p.id === selectedPointId)
      if (!point) return

      if (point.productType === 'neurotoxin') {
        const newUnits = Math.max(0, (point.units || 0) + delta)
        updateInjectionPoint(selectedPointId, { units: newUnits })
      } else {
        const newVolume = Math.max(0, (point.volume || 0) + delta * 0.1)
        updateInjectionPoint(selectedPointId, { volume: Math.round(newVolume * 10) / 10 })
      }
    },
    [selectedPointId, injectionPoints, updateInjectionPoint]
  )

  const handleSaveDrawing = useCallback(
    (paths: { x: number; y: number }[][]) => {
      // Save each path as a freehand annotation to the charting store
      paths.forEach((pathPoints) => {
        if (pathPoints.length > 0) {
          addAnnotation({
            type: 'line',
            points: pathPoints,
            color: productType === 'neurotoxin' ? '#8b5cf6' : '#ec4899',
            strokeWidth: 2,
          })
        }
      })
      
      Alert.alert(
        'Drawing Saved',
        'Your drawing has been saved to the charting session.',
        [{ text: 'OK' }]
      )
    },
    [addAnnotation, productType]
  )

  const handleSaveChart = useCallback(() => {
    if (!currentPatient) {
      Alert.alert('No Patient', 'Please select a patient before saving.')
      return
    }

    saveSession()
    Alert.alert(
      'Chart Saved',
      'Chart for ' + currentPatient.firstName + ' ' + currentPatient.lastName + ' has been saved.',
      [{ text: 'OK' }]
    )
  }, [currentPatient, saveSession])

  if (!currentPatient) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.noPatient}>
          <Text style={styles.noPatientIcon}>👤</Text>
          <Text style={styles.noPatientTitle}>No Patient Selected</Text>
          <Text style={styles.noPatientText}>
            Please select a patient from the Patients tab to start charting
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.content}>
        {/* Header with patient info and controls */}
        <View style={styles.header}>
          <View style={styles.patientBadge}>
            <Text style={styles.patientName}>
              {currentPatient.firstName} {currentPatient.lastName}
            </Text>
            <Text style={styles.patientMrn}>{currentPatient.mrn}</Text>
          </View>

          {/* Product Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                productType === 'neurotoxin' && styles.toggleButtonActive,
              ]}
              onPress={() => setProductType('neurotoxin')}
            >
              <Text
                style={[
                  styles.toggleText,
                  productType === 'neurotoxin' && styles.toggleTextActive,
                ]}
              >
                💉 Neurotoxin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                productType === 'filler' && styles.toggleButtonActive,
              ]}
              onPress={() => setProductType('filler')}
            >
              <Text
                style={[
                  styles.toggleText,
                  productType === 'filler' && styles.toggleTextActive,
                ]}
              >
                💧 Filler
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chart Mode Toggle */}
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                chartMode === 'zones' && styles.modeButtonActive,
              ]}
              onPress={() => {
                setChartMode('zones')
                setDrawingMode('zones')
              }}
            >
              <Text style={[styles.modeText, chartMode === 'zones' && styles.modeTextActive]}>
                📍 Zones
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                chartMode === 'freehand' && styles.modeButtonActive,
              ]}
              onPress={() => {
                setChartMode('freehand')
                setDrawingMode('freehand')
              }}
            >
              <Text style={[styles.modeText, chartMode === 'freehand' && styles.modeTextActive]}>
                👆 Freehand
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                chartMode === 'draw' && styles.modeButtonActive,
              ]}
              onPress={() => setChartMode('draw')}
            >
              <Text style={[styles.modeText, chartMode === 'draw' && styles.modeTextActive]}>
                ✏️ Draw
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                chartMode === '3d' && styles.modeButtonActive,
              ]}
              onPress={() => setChartMode('3d')}
            >
              <Text style={[styles.modeText, chartMode === '3d' && styles.modeTextActive]}>
                🎲 3D
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main charting area */}
        <View style={styles.mainArea}>
          {/* Face Chart, Drawing Canvas, or 3D */}
          <View style={styles.chartContainer}>
            {chartMode === 'draw' ? (
              <DrawingCanvas
                width={SCREEN_WIDTH * 0.55}
                height={SCREEN_HEIGHT * 0.7}
                onSave={handleSaveDrawing}
              />
            ) : chartMode === '3d' ? (
              <FaceChart3D
                productType={productType}
                injectionPoints={injectionPoints3D}
                onAddPoint={handleAdd3DPoint}
                onSelectPoint={setSelected3DPointId}
                onUpdatePoint={handleUpdate3DPoint}
                onRemovePoint={handleRemove3DPoint}
                selectedPointId={selected3DPointId}
              />
            ) : (
              <InteractiveFaceChart
                injectionPoints={injectionPoints}
                selectedPointId={selectedPointId}
                productType={productType}
                drawingMode={drawingMode}
                onZonePress={handleZonePress}
                onFreehandPress={handleFreehandPress}
                onPointSelect={selectPoint}
              />
            )}
          </View>

          {/* Side Panel */}
          <View style={styles.sidePanel}>
            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Treatment Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Units:</Text>
                <Text style={styles.summaryValue}>{totalUnits}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Volume:</Text>
                <Text style={styles.summaryValue}>{totalVolume.toFixed(1)} mL</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Injection Sites:</Text>
                <Text style={styles.summaryValue}>{injectionPoints.length}</Text>
              </View>
            </View>

            {/* Quick Edit Panel */}
            {selectedPoint && (
              <QuickEditPanel
                point={selectedPoint}
                onUpdateUnits={handleUpdateUnits}
                onDelete={() => removeInjectionPoint(selectedPoint.id)}
                onClose={() => selectPoint(null)}
              />
            )}

            {/* Actions */}
            <View style={styles.actionsCard}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={clearAllPoints}
              >
                <Text style={styles.actionButtonText}>🗑️ Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={handleSaveChart}
              >
                <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>
                  ✓ Save Chart
                </Text>
              </TouchableOpacity>
            </View>

            {/* Zone List Toggle */}
            <TouchableOpacity
              style={styles.zoneListToggle}
              onPress={() => setShowZoneList(!showZoneList)}
            >
              <Text style={styles.zoneListToggleText}>
                {showZoneList ? '▼' : '▶'} Injection Points ({injectionPoints.length})
              </Text>
            </TouchableOpacity>

            {showZoneList && (
              <ScrollView style={styles.zoneList}>
                {injectionPoints.map((point) => {
                  const zone = FACE_ZONES.find((z) => z.id === point.zoneId)
                  return (
                    <TouchableOpacity
                      key={point.id}
                      style={[
                        styles.zoneListItem,
                        selectedPointId === point.id && styles.zoneListItemSelected,
                      ]}
                      onPress={() => selectPoint(point.id)}
                    >
                      <Text style={styles.zoneListName}>
                        {zone?.name || 'Custom Point'}
                      </Text>
                      <Text style={styles.zoneListValue}>
                        {point.units ? `${point.units}u` : `${point.volume}mL`}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noPatient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noPatientIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noPatientTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  noPatientText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  patientBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  patientMrn: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  modeTextActive: {
    color: '#1e293b',
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  chartContainer: {
    flex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  sidePanel: {
    flex: 1,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionsCard: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonPrimary: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  actionButtonTextPrimary: {
    color: '#ffffff',
  },
  zoneListToggle: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  zoneListToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  zoneList: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 200,
  },
  zoneListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  zoneListItemSelected: {
    backgroundColor: '#faf5ff',
  },
  zoneListName: {
    fontSize: 14,
    color: '#1e293b',
  },
  zoneListValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
})
