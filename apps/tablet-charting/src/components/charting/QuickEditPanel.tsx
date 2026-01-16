import { useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import { InjectionPoint } from '../../stores/chartingStore'
import { FACE_ZONES, INJECTION_DEPTHS, INJECTION_TECHNIQUES } from '../../types'

interface QuickEditPanelProps {
  point: InjectionPoint
  onUpdateUnits: (delta: number) => void
  onDelete: () => void
  onClose: () => void
}

export function QuickEditPanel({ point, onUpdateUnits, onDelete, onClose }: QuickEditPanelProps) {
  const zone = FACE_ZONES.find((z) => z.id === point.zoneId)
  const depth = INJECTION_DEPTHS.find((d) => d.id === point.depthId)
  const technique = INJECTION_TECHNIQUES.find((t) => t.id === point.techniqueId)

  const handleIncrement = useCallback(
    (amount: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onUpdateUnits(amount)
    },
    [onUpdateUnits]
  )

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    onDelete()
  }, [onDelete])

  const isNeurotoxin = point.productType === 'neurotoxin'
  const value = isNeurotoxin ? point.units || 0 : point.volume || 0
  const unit = isNeurotoxin ? 'units' : 'mL'
  const smallIncrement = isNeurotoxin ? 1 : 0.1
  const largeIncrement = isNeurotoxin ? 5 : 0.5

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.zoneName}>{zone?.name || 'Custom Point'}</Text>
          {zone?.anatomicalName && (
            <Text style={styles.anatomicalName}>{zone.anatomicalName}</Text>
          )}
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Value Editor */}
      <View style={styles.valueEditor}>
        <View style={styles.valueButtons}>
          <TouchableOpacity
            style={styles.valueButton}
            onPress={() => handleIncrement(-largeIncrement)}
          >
            <Text style={styles.valueButtonText}>-{isNeurotoxin ? '5' : '.5'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.valueButton}
            onPress={() => handleIncrement(-smallIncrement)}
          >
            <Text style={styles.valueButtonText}>-{isNeurotoxin ? '1' : '.1'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.valueDisplay}>
          <Text style={styles.valueNumber}>
            {isNeurotoxin ? value : value.toFixed(1)}
          </Text>
          <Text style={styles.valueUnit}>{unit}</Text>
        </View>

        <View style={styles.valueButtons}>
          <TouchableOpacity
            style={styles.valueButton}
            onPress={() => handleIncrement(smallIncrement)}
          >
            <Text style={styles.valueButtonText}>+{isNeurotoxin ? '1' : '.1'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.valueButton}
            onPress={() => handleIncrement(largeIncrement)}
          >
            <Text style={styles.valueButtonText}>+{isNeurotoxin ? '5' : '.5'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Presets */}
      <View style={styles.presets}>
        <Text style={styles.presetsLabel}>Quick Set:</Text>
        <View style={styles.presetButtons}>
          {(isNeurotoxin ? [5, 10, 15, 20, 25] : [0.3, 0.5, 0.8, 1.0, 1.5]).map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[styles.presetButton, value === preset && styles.presetButtonActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                onUpdateUnits(preset - value)
              }}
            >
              <Text
                style={[styles.presetButtonText, value === preset && styles.presetButtonTextActive]}
              >
                {isNeurotoxin ? preset : preset.toFixed(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Depth</Text>
          <View style={[styles.detailBadge, { backgroundColor: depth?.color || '#e2e8f0' }]}>
            <Text style={styles.detailBadgeText}>{depth?.name || 'Not set'}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Technique</Text>
          <Text style={styles.detailValue}>
            {technique?.icon} {technique?.name || 'Not set'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Product</Text>
          <Text style={styles.detailValue}>
            {point.productType === 'neurotoxin' ? '💉 Botox' : '💧 Juvederm'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑️ Remove Point</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  anatomicalName: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  valueEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  valueButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  valueButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  valueDisplay: {
    alignItems: 'center',
  },
  valueNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  valueUnit: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  presets: {
    marginBottom: 16,
  },
  presetsLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  presetButtonTextActive: {
    color: '#ffffff',
  },
  details: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
  },
  detailBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e293b',
  },
  actions: {
    flexDirection: 'row',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },
})
