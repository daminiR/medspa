import { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useChartingStore, Patient } from '../../src/stores/chartingStore'
import { useAuthStore } from '../../src/stores/authStore'

// Mock patient data - in production, this would come from API
const MOCK_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    dateOfBirth: '1985-03-15',
    mrn: 'MRN-10001',
    phone: '(555) 123-4567',
    email: 'emily.r@email.com',
    allergies: ['Lidocaine'],
    lastVisit: new Date('2024-11-15'),
  },
  {
    id: 'pat-002',
    firstName: 'Jennifer',
    lastName: 'Chen',
    dateOfBirth: '1990-07-22',
    mrn: 'MRN-10002',
    phone: '(555) 234-5678',
    email: 'jchen@email.com',
    allergies: [],
    lastVisit: new Date('2024-12-01'),
  },
  {
    id: 'pat-003',
    firstName: 'Sarah',
    lastName: 'Thompson',
    dateOfBirth: '1978-11-08',
    mrn: 'MRN-10003',
    phone: '(555) 345-6789',
    email: 'sthompson@email.com',
    allergies: ['Aspirin'],
    lastVisit: new Date('2024-10-20'),
  },
  {
    id: 'pat-004',
    firstName: 'Michael',
    lastName: 'Johnson',
    dateOfBirth: '1982-05-30',
    mrn: 'MRN-10004',
    phone: '(555) 456-7890',
    email: 'mjohnson@email.com',
    allergies: [],
    lastVisit: new Date('2024-11-28'),
  },
  {
    id: 'pat-005',
    firstName: 'Amanda',
    lastName: 'Williams',
    dateOfBirth: '1995-01-12',
    mrn: 'MRN-10005',
    phone: '(555) 567-8901',
    email: 'awilliams@email.com',
    allergies: ['Latex'],
    lastVisit: new Date('2024-12-05'),
  },
  {
    id: 'pat-006',
    firstName: 'David',
    lastName: 'Lee',
    dateOfBirth: '1988-09-25',
    mrn: 'MRN-10006',
    phone: '(555) 678-9012',
    email: 'dlee@email.com',
    allergies: [],
  },
]

export default function PatientsScreen() {
  const router = useRouter()
  const { startSession, currentPatient } = useChartingStore()
  const { provider } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const filteredPatients = MOCK_PATIENTS.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
  )

  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient)
  }, [])

  const handleStartSession = useCallback(() => {
    if (selectedPatient && provider) {
      startSession(selectedPatient, provider.id)
      router.push('/(tabs)/charting')
    }
  }, [selectedPatient, provider, startSession, router])

  const formatDate = (date?: Date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getAge = (dob: string) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const renderPatientCard = ({ item }: { item: Patient }) => {
    const isSelected = selectedPatient?.id === item.id
    const isCurrent = currentPatient?.id === item.id

    return (
      <TouchableOpacity
        style={[
          styles.patientCard,
          isSelected && styles.patientCardSelected,
          isCurrent && styles.patientCardCurrent,
        ]}
        onPress={() => handleSelectPatient(item)}
        activeOpacity={0.7}
      >
        <View style={styles.patientAvatar}>
          <Text style={styles.avatarText}>{getInitials(item.firstName, item.lastName)}</Text>
        </View>
        <View style={styles.patientInfo}>
          <View style={styles.patientHeader}>
            <Text style={styles.patientName}>
              {item.firstName} {item.lastName}
            </Text>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>In Session</Text>
              </View>
            )}
          </View>
          <Text style={styles.patientMrn}>{item.mrn}</Text>
          <View style={styles.patientDetails}>
            <Text style={styles.patientDetail}>
              {getAge(item.dateOfBirth)} years • {item.phone}
            </Text>
          </View>
          {item.allergies && item.allergies.length > 0 && (
            <View style={styles.allergiesContainer}>
              <Text style={styles.allergiesLabel}>Allergies:</Text>
              <Text style={styles.allergiesText}>{item.allergies.join(', ')}</Text>
            </View>
          )}
          <Text style={styles.lastVisit}>Last visit: {formatDate(item.lastVisit)}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, MRN, or phone..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.resultCount}>
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.mainContent}>
          {/* Patient List */}
          <View style={styles.patientList}>
            <FlatList
              data={filteredPatients}
              renderItem={renderPatientCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>

          {/* Patient Details / Action Panel */}
          <View style={styles.detailPanel}>
            {selectedPatient ? (
              <View style={styles.detailContent}>
                <View style={styles.detailHeader}>
                  <View style={styles.detailAvatar}>
                    <Text style={styles.detailAvatarText}>
                      {getInitials(selectedPatient.firstName, selectedPatient.lastName)}
                    </Text>
                  </View>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailName}>
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </Text>
                    <Text style={styles.detailMrn}>{selectedPatient.mrn}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Patient Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date of Birth</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedPatient.dateOfBirth).toLocaleDateString()} (
                      {getAge(selectedPatient.dateOfBirth)} y/o)
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedPatient.phone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{selectedPatient.email}</Text>
                  </View>
                </View>

                {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                  <View style={styles.alertSection}>
                    <Text style={styles.alertTitle}>⚠️ Allergies</Text>
                    {selectedPatient.allergies.map((allergy, index) => (
                      <Text key={index} style={styles.alertItem}>
                        • {allergy}
                      </Text>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStartSession}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>Start Charting Session</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewHistoryButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    Alert.alert(
                      'Treatment History',
                      'Treatment history feature coming soon.',
                      [{ text: 'OK' }]
                    )
                  }}
                >
                  <Text style={styles.viewHistoryText}>View Treatment History</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyDetail}>
                <Text style={styles.emptyIcon}>👆</Text>
                <Text style={styles.emptyTitle}>Select a Patient</Text>
                <Text style={styles.emptyText}>
                  Choose a patient from the list to start a charting session
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
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  resultCount: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  patientList: {
    flex: 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  listContent: {
    padding: 8,
  },
  separator: {
    height: 8,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  patientCardSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#faf5ff',
  },
  patientCardCurrent: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  patientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
  },
  patientInfo: {
    flex: 1,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  currentBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  patientMrn: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  patientDetails: {
    marginTop: 4,
  },
  patientDetail: {
    fontSize: 14,
    color: '#64748b',
  },
  allergiesContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  allergiesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  allergiesText: {
    fontSize: 12,
    color: '#dc2626',
    marginLeft: 4,
  },
  lastVisit: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  detailPanel: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  detailContent: {
    flex: 1,
    padding: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  detailAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailAvatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  detailMrn: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  alertSection: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  alertItem: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  viewHistoryButton: {
    marginTop: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  viewHistoryText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyDetail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
})
