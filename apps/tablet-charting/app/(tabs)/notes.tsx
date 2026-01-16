import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useChartingStore } from '../../src/stores/chartingStore'
import { VoiceDictation } from '../../src/components/ui/VoiceDictation'

const SOAP_SECTIONS = [
  {
    key: 'subjective',
    title: 'Subjective',
    icon: '💬',
    placeholder: 'Patient reports...\n\nChief complaint, medical history, goals, concerns...',
    examples: [
      'Patient presents for routine neuromodulator treatment',
      'Reports satisfactory results from previous treatment',
      'Desires treatment of forehead lines and crow\'s feet',
      'No new allergies or medications since last visit',
    ],
  },
  {
    key: 'objective',
    title: 'Objective',
    icon: '🔍',
    placeholder: 'Clinical observations...\n\nSkin assessment, measurements, photos taken...',
    examples: [
      'Moderate dynamic rhytids of the forehead and glabella',
      'Mild lateral canthal lines bilaterally',
      'Skin type: Fitzpatrick III',
      'Pre-treatment photos obtained',
    ],
  },
  {
    key: 'assessment',
    title: 'Assessment',
    icon: '📋',
    placeholder: 'Clinical assessment...\n\nPatient candidacy, risk evaluation, contraindications...',
    examples: [
      'Good candidate for neuromodulator treatment',
      'No contraindications identified',
      'Appropriate expectations discussed',
      'Consent obtained and documented',
    ],
  },
  {
    key: 'plan',
    title: 'Plan',
    icon: '📝',
    placeholder: 'Treatment plan...\n\nProducts used, units/volume, technique, aftercare, follow-up...',
    examples: [
      'Botox 20 units to glabella, 10 units to forehead',
      'Botox 12 units to lateral canthal lines bilaterally',
      'Standard aftercare instructions provided',
      'Follow-up in 2 weeks for assessment',
    ],
  },
] as const

export default function NotesScreen() {
  const { currentPatient, soapNotes, updateSOAPNotes, injectionPoints } = useChartingStore()
  const [expandedSection, setExpandedSection] = useState<string | null>('subjective')
  const [showExamples, setShowExamples] = useState<string | null>(null)

  const handleInsertExample = useCallback(
    (sectionKey: string, example: string) => {
      const currentValue = soapNotes[sectionKey as keyof typeof soapNotes] || ''
      const newValue = currentValue ? `${currentValue}\n${example}` : example
      updateSOAPNotes({ [sectionKey]: newValue })
      setShowExamples(null)
    },
    [soapNotes, updateSOAPNotes]
  )

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }

  const getTotalWordCount = () => {
    return Object.values(soapNotes).reduce((sum, text) => sum + getWordCount(text), 0)
  }

  const getCompletionPercentage = () => {
    const filledSections = Object.values(soapNotes).filter((text) => text.trim().length > 0).length
    return Math.round((filledSections / 4) * 100)
  }

  const generateTreatmentSummary = useCallback(() => {
    const totalUnits = injectionPoints
      .filter((p) => p.productType === 'neurotoxin')
      .reduce((sum, p) => sum + (p.units || 0), 0)
    const totalVolume = injectionPoints
      .filter((p) => p.productType === 'filler')
      .reduce((sum, p) => sum + (p.volume || 0), 0)

    let summary = 'Treatment Summary:\n'
    if (totalUnits > 0) {
      summary += `- Total neurotoxin: ${totalUnits} units\n`
    }
    if (totalVolume > 0) {
      summary += `- Total filler: ${totalVolume.toFixed(1)} mL\n`
    }
    summary += `- Injection sites: ${injectionPoints.length}\n`

    const currentPlan = soapNotes.plan || ''
    updateSOAPNotes({ plan: currentPlan ? `${currentPlan}\n\n${summary}` : summary })
  }, [injectionPoints, soapNotes.plan, updateSOAPNotes])

  if (!currentPatient) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.noPatient}>
          <Text style={styles.noPatientIcon}>📝</Text>
          <Text style={styles.noPatientTitle}>No Patient Selected</Text>
          <Text style={styles.noPatientText}>
            Please select a patient from the Patients tab to document notes
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.patientBadge}>
              <Text style={styles.patientName}>
                {currentPatient.firstName} {currentPatient.lastName}
              </Text>
              <Text style={styles.patientMrn}>{currentPatient.mrn}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{getTotalWordCount()}</Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{getCompletionPercentage()}%</Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.generateButton} onPress={generateTreatmentSummary}>
              <Text style={styles.generateButtonText}>📊 Auto-fill from Chart</Text>
            </TouchableOpacity>
          </View>

          {/* SOAP Sections */}
          <ScrollView style={styles.sectionsContainer} showsVerticalScrollIndicator={false}>
            {SOAP_SECTIONS.map((section) => {
              const isExpanded = expandedSection === section.key
              const value = soapNotes[section.key as keyof typeof soapNotes] || ''
              const wordCount = getWordCount(value)

              return (
                <View key={section.key} style={styles.section}>
                  <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => setExpandedSection(isExpanded ? null : section.key)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sectionTitleRow}>
                      <Text style={styles.sectionIcon}>{section.icon}</Text>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      {value.trim().length > 0 && (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedBadgeText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.sectionMeta}>
                      <Text style={styles.wordCount}>{wordCount} words</Text>
                      <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.sectionContent}>
                      <TextInput
                        style={styles.textInput}
                        multiline
                        placeholder={section.placeholder}
                        placeholderTextColor="#94a3b8"
                        value={value}
                        onChangeText={(text) => updateSOAPNotes({ [section.key]: text })}
                        textAlignVertical="top"
                      />

                      <View style={styles.sectionActions}>
                        <TouchableOpacity
                          style={styles.examplesButton}
                          onPress={() =>
                            setShowExamples(showExamples === section.key ? null : section.key)
                          }
                        >
                          <Text style={styles.examplesButtonText}>
                            {showExamples === section.key ? '▼' : '▶'} Example phrases
                          </Text>
                        </TouchableOpacity>

                        <VoiceDictation
                          placeholder="🎤 Dictate"
                          onTranscript={(text) => {
                            const currentValue = soapNotes[section.key as keyof typeof soapNotes] || ''
                            const newValue = currentValue ? `${currentValue}\n${text}` : text
                            updateSOAPNotes({ [section.key]: newValue })
                          }}
                        />
                      </View>

                      {showExamples === section.key && (
                        <View style={styles.examplesContainer}>
                          {section.examples.map((example, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.exampleItem}
                              onPress={() => handleInsertExample(section.key, example)}
                            >
                              <Text style={styles.exampleText}>{example}</Text>
                              <Text style={styles.insertText}>+ Insert</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )
            })}

            {/* Save Button */}
            <View style={styles.saveContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                activeOpacity={0.8}
                onPress={() => {
                  if (!currentPatient) {
                    Alert.alert('No Patient', 'Please select a patient before saving.', [{ text: 'OK' }])
                    return
                  }
                  Alert.alert(
                    'SOAP Notes Saved',
                    'SOAP notes for ' + currentPatient.firstName + ' ' + currentPatient.lastName + ' have been saved.',
                    [{ text: 'OK' }]
                  )
                }}
              >
                <Text style={styles.saveButtonText}>Save SOAP Notes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoid: {
    flex: 1,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  generateButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 'auto',
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  sectionsContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  expandIcon: {
    fontSize: 12,
    color: '#64748b',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 150,
    marginTop: 12,
    lineHeight: 24,
  },
  sectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  examplesButton: {
    padding: 8,
  },
  examplesButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  voiceButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  voiceButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  examplesContainer: {
    marginTop: 12,
    gap: 8,
  },
  exampleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  exampleText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    marginRight: 12,
  },
  insertText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  saveContainer: {
    paddingVertical: 16,
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
})
