import { useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  GestureResponderEvent,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { InjectionPoint } from '../../stores/chartingStore'
import { FACE_ZONES } from '../../types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface InteractiveFaceChartProps {
  injectionPoints: InjectionPoint[]
  selectedPointId: string | null
  productType: 'neurotoxin' | 'filler'
  drawingMode: 'zones' | 'freehand'
  onZonePress: (zoneId: string, x: number, y: number) => void
  onFreehandPress: (x: number, y: number) => void
  onPointSelect: (id: string | null) => void
}

export function InteractiveFaceChart({
  injectionPoints,
  selectedPointId,
  productType,
  drawingMode,
  onZonePress,
  onFreehandPress,
  onPointSelect,
}: InteractiveFaceChartProps) {
  const chartRef = useRef<View>(null)
  const chartLayout = useRef({ width: 0, height: 0, x: 0, y: 0 })

  const handleLayout = useCallback((event: any) => {
    const { width, height, x, y } = event.nativeEvent.layout
    chartLayout.current = { width, height, x, y }
  }, [])

  const handleChartPress = useCallback(
    (event: GestureResponderEvent) => {
      if (drawingMode !== 'freehand') return

      const { locationX, locationY } = event.nativeEvent
      const { width, height } = chartLayout.current

      // Convert to percentage
      const xPercent = (locationX / width) * 100
      const yPercent = (locationY / height) * 100

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onFreehandPress(xPercent, yPercent)
    },
    [drawingMode, onFreehandPress]
  )

  const handleZonePress = useCallback(
    (zone: typeof FACE_ZONES[0]) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      onZonePress(zone.id, zone.x, zone.y)
    },
    [onZonePress]
  )

  const handlePointPress = useCallback(
    (pointId: string) => {
      Haptics.selectionAsync()
      onPointSelect(pointId)
    },
    [onPointSelect]
  )

  const getPointColor = (point: InjectionPoint) => {
    if (point.productType === 'neurotoxin') {
      return '#8b5cf6' // Purple for neurotoxin
    }
    return '#ec4899' // Pink for filler
  }

  const getZoneColor = (zoneId: string) => {
    const hasInjection = injectionPoints.some((p) => p.zoneId === zoneId)
    if (hasInjection) {
      return productType === 'neurotoxin' ? '#8b5cf6' : '#ec4899'
    }
    return '#94a3b8'
  }

  return (
    <View style={styles.container}>
      {/* Face Image Container */}
      <View
        ref={chartRef}
        style={styles.chartContainer}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => drawingMode === 'freehand'}
        onResponderRelease={handleChartPress}
      >
        {/* Face silhouette background */}
        <View style={styles.faceOutline}>
          {/* Simple SVG-like face representation using shapes */}
          <View style={styles.faceOval} />
          <View style={styles.hairline} />
          <View style={[styles.eye, styles.leftEye]} />
          <View style={[styles.eye, styles.rightEye]} />
          <View style={styles.nose} />
          <View style={styles.mouth} />
          <View style={[styles.ear, styles.leftEar]} />
          <View style={[styles.ear, styles.rightEar]} />
        </View>

        {/* Zone Markers (when in zones mode) */}
        {drawingMode === 'zones' &&
          FACE_ZONES.map((zone) => {
            const hasInjection = injectionPoints.some((p) => p.zoneId === zone.id)
            const point = injectionPoints.find((p) => p.zoneId === zone.id)
            const isSelected = point?.id === selectedPointId

            return (
              <TouchableOpacity
                key={zone.id}
                style={[
                  styles.zoneMarker,
                  {
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    backgroundColor: hasInjection ? getZoneColor(zone.id) : '#e2e8f0',
                    borderColor: isSelected ? '#1e293b' : 'transparent',
                    borderWidth: isSelected ? 3 : 0,
                    transform: [
                      { translateX: -16 },
                      { translateY: -16 },
                      { scale: isSelected ? 1.2 : 1 },
                    ],
                  },
                ]}
                onPress={() => (point ? handlePointPress(point.id) : handleZonePress(zone))}
                activeOpacity={0.7}
              >
                {hasInjection && point && (
                  <Text style={styles.zoneValue}>
                    {point.units ? point.units : point.volume?.toFixed(1)}
                  </Text>
                )}
              </TouchableOpacity>
            )
          })}

        {/* Freehand Points */}
        {injectionPoints
          .filter((p) => p.zoneId === 'freehand' || !FACE_ZONES.find((z) => z.id === p.zoneId))
          .map((point) => {
            const isSelected = point.id === selectedPointId
            return (
              <TouchableOpacity
                key={point.id}
                style={[
                  styles.freehandMarker,
                  {
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    backgroundColor: getPointColor(point),
                    borderColor: isSelected ? '#1e293b' : 'transparent',
                    borderWidth: isSelected ? 3 : 0,
                    transform: [
                      { translateX: -14 },
                      { translateY: -14 },
                      { scale: isSelected ? 1.2 : 1 },
                    ],
                  },
                ]}
                onPress={() => handlePointPress(point.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.freehandValue}>
                  {point.units ? point.units : point.volume?.toFixed(1)}
                </Text>
              </TouchableOpacity>
            )
          })}

        {/* Mode indicator */}
        <View style={styles.modeIndicator}>
          <Text style={styles.modeIndicatorText}>
            {drawingMode === 'zones' ? 'Tap zones to add' : 'Tap anywhere to add'}
          </Text>
        </View>
      </View>

      {/* Zone Category Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
          <Text style={styles.legendText}>Neurotoxin</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ec4899' }]} />
          <Text style={styles.legendText}>Filler</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#e2e8f0' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faceOutline: {
    position: 'absolute',
    top: '10%',
    left: '25%',
    width: '50%',
    height: '80%',
  },
  faceOval: {
    position: 'absolute',
    top: '5%',
    left: '10%',
    width: '80%',
    height: '90%',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fef7f7',
  },
  hairline: {
    position: 'absolute',
    top: '3%',
    left: '15%',
    width: '70%',
    height: '15%',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#d1d5db',
  },
  eye: {
    position: 'absolute',
    width: '18%',
    height: '8%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  leftEye: {
    top: '30%',
    left: '22%',
  },
  rightEye: {
    top: '30%',
    right: '22%',
  },
  nose: {
    position: 'absolute',
    top: '40%',
    left: '43%',
    width: '14%',
    height: '20%',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#d1d5db',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  mouth: {
    position: 'absolute',
    top: '65%',
    left: '32%',
    width: '36%',
    height: '8%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff1f2',
  },
  ear: {
    position: 'absolute',
    width: '10%',
    height: '15%',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 20,
    backgroundColor: '#fef7f7',
  },
  leftEar: {
    top: '35%',
    left: '-5%',
  },
  rightEar: {
    top: '35%',
    right: '-5%',
  },
  zoneMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zoneValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  freehandMarker: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  freehandValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  modeIndicator: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeIndicatorText: {
    fontSize: 12,
    color: '#ffffff',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
})
