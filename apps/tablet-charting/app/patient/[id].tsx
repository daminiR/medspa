import { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useChartingStore, Patient } from '../../src/stores/chartingStore'
import { useAuthStore } from '../../src/stores/authStore'

// Mock patient data - matches the data structure from patients.tsx
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

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { startSession } = useChartingStore()
  const { provider } = useAuthStore()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch patient
    const fetchPatient = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      const foundPatient = MOCK_PATIENTS.find((p) => p.id === id)
      setPatient(foundPatient || null)
      setLoading(false)
    }
    fetchPatient()
  }, [id])

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

  const formatDate = (date?: Date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return \`\${firstName.charAt(0)}\${lastName.charAt(0)}\`.toUpperCase()
  }

  const handleStartSession = () => {
    if (patient && provider) {
      startSession(patient, provider.id)
      router.push('/(tabs)/charting')
    }
  }

  const handleClose = () => {
    router.back()
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading patient...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>!</Text>
          <Text style={styles.errorTitle}>Patient Not Found</Text>
          <Text style={styles.errorText}>
            The requested patient could not be found.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(patient.firstName, patient.lastName)}
            </Text>
          </View>
          <Text style={styles.patientName}>
            {patient.firstName} {patient.lastName}
          </Text>
          <Text style={styles.patientMrn}>{patient.mrn}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Patient Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>
              {new Date(patient.dateOfBirth).toLocaleDateString()} ({getAge(patient.dateOfBirth)} y/o)
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{patient.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{patient.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Visit</Text>
            <Text style={styles.infoValue}>{formatDate(patient.lastVisit)}</Text>
          </View>
        </View>

        {/* Allergies Section */}
        {patient.allergies && patient.allergies.length > 0 && (
          <View style={styles.allergiesSection}>
            <Text style={styles.allergiesTitle}>Allergies</Text>
            <View style={styles.allergiesList}>
              {patient.allergies.map((allergy, index) => (
                <View key={index} style={styles.allergyTag}>
                  <Text style={styles.allergyText}>{allergy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartSession}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Start Charting Session</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>View Treatment History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>View Photos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    color: '#dc2626',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#ffffff',
  },
  patientName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  patientMrn: {
    fontSize: 16,
    color: '#64748b',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 15,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  allergiesSection: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  allergiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 12,
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  allergyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },
  actionsSection: {
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
})
