import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { useChartingStore, TreatmentPhoto } from '../../src/stores/chartingStore'
import { PHOTO_ANGLE_GUIDES } from '../../src/types'

const PHOTO_TYPES = [
  { id: 'before', label: 'Before', color: '#3b82f6', icon: '📸' },
  { id: 'after', label: 'After', color: '#22c55e', icon: '✨' },
  { id: 'during', label: 'During', color: '#f59e0b', icon: '💉' },
  { id: 'progress', label: 'Progress', color: '#8b5cf6', icon: '📊' },
] as const

export default function PhotosScreen() {
  const { currentPatient, photos, addPhoto, removePhoto } = useChartingStore()
  const [selectedType, setSelectedType] = useState<TreatmentPhoto['type']>('before')
  const [selectedAngle, setSelectedAngle] = useState<TreatmentPhoto['angle']>('front')
  const [hasConsent, setHasConsent] = useState(false)

  const handleTakePhoto = useCallback(async () => {
    if (!hasConsent) {
      Alert.alert(
        'Photo Consent Required',
        'Please confirm patient consent before taking photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'I Confirm Consent',
            onPress: () => {
              setHasConsent(true)
              launchCamera()
            },
          },
        ]
      )
      return
    }
    await launchCamera()
  }, [hasConsent, selectedType, selectedAngle])

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
    })

    if (!result.canceled && result.assets[0]) {
      addPhoto({
        uri: result.assets[0].uri,
        type: selectedType,
        angle: selectedAngle,
      })
    }
  }

  const handlePickFromLibrary = useCallback(async () => {
    if (!hasConsent) {
      Alert.alert(
        'Photo Consent Required',
        'Please confirm patient consent before adding photos.',
        [{ text: 'OK' }]
      )
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
    })

    if (!result.canceled && result.assets[0]) {
      addPhoto({
        uri: result.assets[0].uri,
        type: selectedType,
        angle: selectedAngle,
      })
    }
  }, [hasConsent, selectedType, selectedAngle, addPhoto])

  const handleDeletePhoto = useCallback(
    (photoId: string) => {
      Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removePhoto(photoId),
        },
      ])
    },
    [removePhoto]
  )

  const getPhotosByType = (type: TreatmentPhoto['type']) => {
    return photos.filter((p) => p.type === type)
  }

  if (!currentPatient) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.noPatient}>
          <Text style={styles.noPatientIcon}>📸</Text>
          <Text style={styles.noPatientTitle}>No Patient Selected</Text>
          <Text style={styles.noPatientText}>
            Please select a patient from the Patients tab to capture photos
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.patientBadge}>
            <Text style={styles.patientName}>
              {currentPatient.firstName} {currentPatient.lastName}
            </Text>
            <Text style={styles.photoCount}>{photos.length} photos</Text>
          </View>

          {/* Consent Toggle */}
          <TouchableOpacity
            style={[styles.consentToggle, hasConsent && styles.consentToggleActive]}
            onPress={() => setHasConsent(!hasConsent)}
          >
            <Text style={styles.consentToggleText}>
              {hasConsent ? '✓ ' : ''}Photo Consent
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainArea}>
          {/* Controls Panel */}
          <View style={styles.controlsPanel}>
            {/* Photo Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photo Type</Text>
              <View style={styles.typeGrid}>
                {PHOTO_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeButton,
                      selectedType === type.id && { borderColor: type.color, backgroundColor: `${type.color}15` },
                    ]}
                    onPress={() => setSelectedType(type.id as TreatmentPhoto['type'])}
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text style={[styles.typeLabel, selectedType === type.id && { color: type.color }]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Angle Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Camera Angle</Text>
              <View style={styles.angleGrid}>
                {PHOTO_ANGLE_GUIDES.map((guide) => (
                  <TouchableOpacity
                    key={guide.id}
                    style={[
                      styles.angleButton,
                      selectedAngle === guide.angle && styles.angleButtonActive,
                    ]}
                    onPress={() => setSelectedAngle(guide.angle)}
                  >
                    <Text style={styles.angleIcon}>{guide.icon}</Text>
                    <Text style={styles.angleLabel}>{guide.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Capture Buttons */}
            <View style={styles.captureButtons}>
              <TouchableOpacity
                style={[styles.captureButton, !hasConsent && styles.captureButtonDisabled]}
                onPress={handleTakePhoto}
              >
                <Text style={styles.captureButtonIcon}>📷</Text>
                <Text style={styles.captureButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.captureButton, styles.captureButtonSecondary, !hasConsent && styles.captureButtonDisabled]}
                onPress={handlePickFromLibrary}
              >
                <Text style={styles.captureButtonIcon}>🖼️</Text>
                <Text style={[styles.captureButtonText, styles.captureButtonTextSecondary]}>
                  From Library
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Photo Gallery */}
          <View style={styles.galleryPanel}>
            <Text style={styles.galleryTitle}>Photo Gallery</Text>

            {PHOTO_TYPES.map((type) => {
              const typePhotos = getPhotosByType(type.id as TreatmentPhoto['type'])
              if (typePhotos.length === 0) return null

              return (
                <View key={type.id} style={styles.typeSection}>
                  <View style={[styles.typeBadge, { backgroundColor: `${type.color}20` }]}>
                    <Text style={[styles.typeBadgeText, { color: type.color }]}>
                      {type.icon} {type.label} ({typePhotos.length})
                    </Text>
                  </View>
                  <FlatList
                    horizontal
                    data={typePhotos}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.photoCard}
                        onLongPress={() => handleDeletePhoto(item.id)}
                      >
                        <Image source={{ uri: item.uri }} style={styles.photoImage} />
                        <View style={styles.photoOverlay}>
                          <Text style={styles.photoAngle}>
                            {PHOTO_ANGLE_GUIDES.find((g) => g.angle === item.angle)?.name || item.angle}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.photoList}
                  />
                </View>
              )
            })}

            {photos.length === 0 && (
              <View style={styles.emptyGallery}>
                <Text style={styles.emptyIcon}>📸</Text>
                <Text style={styles.emptyText}>No photos yet</Text>
                <Text style={styles.emptyHint}>
                  Capture before/after photos to document treatment
                </Text>
              </View>
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
    justifyContent: 'space-between',
    marginBottom: 16,
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
  photoCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  consentToggle: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  consentToggleActive: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  consentToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  controlsPanel: {
    width: 320,
    gap: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  angleGrid: {
    gap: 8,
  },
  angleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  angleButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#faf5ff',
  },
  angleIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  angleLabel: {
    fontSize: 14,
    color: '#1e293b',
  },
  captureButtons: {
    gap: 8,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  captureButtonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowOpacity: 0,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  captureButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  captureButtonTextSecondary: {
    color: '#64748b',
  },
  galleryPanel: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  typeSection: {
    marginBottom: 16,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  photoList: {
    gap: 12,
  },
  photoCard: {
    width: 160,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
  },
  photoAngle: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  emptyGallery: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
})
