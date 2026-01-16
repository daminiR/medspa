import { useState, useCallback, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
} from 'react-native'
import * as Haptics from 'expo-haptics'

interface VoiceDictationProps {
  onTranscript: (text: string) => void
  placeholder?: string
}

export function VoiceDictation({ onTranscript, placeholder = 'Tap to speak...' }: VoiceDictationProps) {
  const [isListening, setIsListening] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Pulse animation for recording indicator
  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isListening, pulseAnim])

  const startListening = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsListening(true)
    setShowModal(true)
    setTranscript('')
    setInterimTranscript('')

    // Note: React Native doesn't have native speech recognition
    // In production, you would use:
    // - expo-speech-recognition (community package)
    // - @react-native-voice/voice
    // - Or integrate with a cloud service like Google Cloud Speech-to-Text

    // For demo, we'll simulate transcription
    simulateTranscription()
  }, [])

  const stopListening = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setIsListening(false)
  }, [])

  const handleConfirm = useCallback(() => {
    if (transcript.trim()) {
      onTranscript(transcript.trim())
    }
    setShowModal(false)
    setTranscript('')
    setInterimTranscript('')
  }, [transcript, onTranscript])

  const handleCancel = useCallback(() => {
    setIsListening(false)
    setShowModal(false)
    setTranscript('')
    setInterimTranscript('')
  }, [])

  // Simulate transcription for demo purposes
  const simulateTranscription = () => {
    const phrases = [
      'Patient presents for routine neuromodulator treatment.',
      'Reports satisfactory results from previous treatment.',
      'Desires treatment of forehead lines and crow\'s feet.',
      'No new allergies or medications since last visit.',
      'Moderate dynamic rhytids of the forehead and glabella.',
    ]

    let currentPhrase = 0
    let currentChar = 0

    const interval = setInterval(() => {
      if (currentPhrase >= phrases.length) {
        clearInterval(interval)
        setIsListening(false)
        return
      }

      const phrase = phrases[currentPhrase]
      if (currentChar < phrase.length) {
        setInterimTranscript(phrase.substring(0, currentChar + 1))
        currentChar++
      } else {
        setTranscript((prev) => (prev ? prev + ' ' + phrase : phrase))
        setInterimTranscript('')
        currentPhrase++
        currentChar = 0
      }
    }, 50)

    // Cleanup after 10 seconds max
    setTimeout(() => {
      clearInterval(interval)
      setIsListening(false)
    }, 10000)
  }

  return (
    <>
      <TouchableOpacity style={styles.dictateButton} onPress={startListening}>
        <Text style={styles.dictateIcon}>🎤</Text>
        <Text style={styles.dictateText}>{placeholder}</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Voice Dictation</Text>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Recording Indicator */}
            <View style={styles.recordingContainer}>
              <Animated.View
                style={[
                  styles.recordingIndicator,
                  isListening && styles.recordingIndicatorActive,
                  { transform: [{ scale: isListening ? pulseAnim : 1 }] },
                ]}
              >
                <Text style={styles.recordingIcon}>{isListening ? '🔴' : '⚫'}</Text>
              </Animated.View>
              <Text style={styles.recordingStatus}>
                {isListening ? 'Listening...' : 'Tap to start'}
              </Text>
            </View>

            {/* Transcript Display */}
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>Transcript</Text>
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptText}>
                  {transcript}
                  {interimTranscript && (
                    <Text style={styles.interimText}> {interimTranscript}</Text>
                  )}
                  {!transcript && !interimTranscript && (
                    <Text style={styles.placeholderText}>
                      Your dictation will appear here...
                    </Text>
                  )}
                </Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              {isListening ? (
                <TouchableOpacity style={styles.stopButton} onPress={stopListening}>
                  <Text style={styles.stopButtonText}>⏹ Stop</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.startButton} onPress={startListening}>
                  <Text style={styles.startButtonText}>🎤 Start Dictation</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, !transcript && styles.confirmButtonDisabled]}
                onPress={handleConfirm}
                disabled={!transcript}
              >
                <Text style={styles.confirmButtonText}>Insert Text</Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <Text style={styles.infoText}>
              💡 Tip: Speak clearly and pause between sentences
            </Text>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  dictateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  dictateIcon: {
    fontSize: 18,
  },
  dictateText: {
    fontSize: 14,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  recordingIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingIndicatorActive: {
    backgroundColor: '#fef2f2',
  },
  recordingIcon: {
    fontSize: 32,
  },
  recordingStatus: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  transcriptContainer: {
    marginBottom: 24,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  transcriptBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  transcriptText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  interimText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  controls: {
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
})
