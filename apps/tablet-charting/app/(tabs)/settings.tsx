import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../../src/stores/authStore'
import { useChartingStore } from '../../src/stores/chartingStore'

export default function SettingsScreen() {
  const { provider, logout } = useAuthStore()
  const { pendingSessions, syncPendingSessions } = useChartingStore()

  const [hapticEnabled, setHapticEnabled] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [showZoneLabels, setShowZoneLabels] = useState(true)
  const [defaultProductType, setDefaultProductType] = useState<'neurotoxin' | 'filler'>('neurotoxin')

  const handleSync = async () => {
    if (pendingSessions.length === 0) {
      Alert.alert('All Synced', 'No pending sessions to sync.')
      return
    }

    try {
      await syncPendingSessions()
      Alert.alert('Success', `Synced ${pendingSessions.length} session(s) successfully.`)
    } catch (error) {
      Alert.alert('Sync Failed', 'Unable to sync sessions. Please try again.')
    }
  }

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: logout,
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Provider Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Provider Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {provider?.name.split(' ').map((n) => n[0]).join('') || 'P'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{provider?.name || 'Provider'}</Text>
              <Text style={styles.profileRole}>{provider?.role || 'Injector'}</Text>
              <Text style={styles.profileEmail}>{provider?.email}</Text>
            </View>
          </View>
        </View>

        {/* Sync Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync Status</Text>
          <View style={styles.syncCard}>
            <View style={styles.syncInfo}>
              <Text style={styles.syncLabel}>Pending Sessions</Text>
              <Text style={[styles.syncValue, pendingSessions.length > 0 && styles.syncWarning]}>
                {pendingSessions.length}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.syncButton, pendingSessions.length === 0 && styles.syncButtonDisabled]}
              onPress={handleSync}
              disabled={pendingSessions.length === 0}
            >
              <Text style={styles.syncButtonText}>🔄 Sync Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Charting Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Charting Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>Vibrate when tapping zones</Text>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }}
              thumbColor={hapticEnabled ? '#8b5cf6' : '#94a3b8'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-Save</Text>
              <Text style={styles.settingDescription}>Save chart automatically</Text>
            </View>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }}
              thumbColor={autoSave ? '#8b5cf6' : '#94a3b8'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Zone Labels</Text>
              <Text style={styles.settingDescription}>Display anatomical names on chart</Text>
            </View>
            <Switch
              value={showZoneLabels}
              onValueChange={setShowZoneLabels}
              trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }}
              thumbColor={showZoneLabels ? '#8b5cf6' : '#94a3b8'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Default Product Type</Text>
              <Text style={styles.settingDescription}>Initial product selection</Text>
            </View>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  defaultProductType === 'neurotoxin' && styles.toggleOptionActive,
                ]}
                onPress={() => setDefaultProductType('neurotoxin')}
              >
                <Text
                  style={[
                    styles.toggleOptionText,
                    defaultProductType === 'neurotoxin' && styles.toggleOptionTextActive,
                  ]}
                >
                  Tox
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  defaultProductType === 'filler' && styles.toggleOptionActive,
                ]}
                onPress={() => setDefaultProductType('filler')}
              >
                <Text
                  style={[
                    styles.toggleOptionText,
                    defaultProductType === 'filler' && styles.toggleOptionTextActive,
                  ]}
                >
                  Filler
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Alert.alert('Treatment Templates', 'Manage Treatment Templates feature coming soon.', [{ text: 'OK' }])
            }}
          >
            <Text style={styles.actionIcon}>📖</Text>
            <Text style={styles.actionLabel}>Manage Treatment Templates</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Alert.alert('Product Library', 'Product Library feature coming soon.', [{ text: 'OK' }])
            }}
          >
            <Text style={styles.actionIcon}>💉</Text>
            <Text style={styles.actionLabel}>Product Library</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Alert.alert('Session History', 'View Session History feature coming soon.', [{ text: 'OK' }])
            }}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>View Session History</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Alert.alert('Help & Support', 'Help & Support feature coming soon.', [{ text: 'OK' }])
            }}
          >
            <Text style={styles.actionIcon}>❓</Text>
            <Text style={styles.actionLabel}>Help & Support</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2024.12.11</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device</Text>
              <Text style={styles.infoValue}>iPad Pro</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Luxe MedSpa Charting</Text>
          <Text style={styles.footerSubtext}>HIPAA Compliant • Secure • Encrypted</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  profileRole: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncLabel: {
    fontSize: 16,
    color: '#1e293b',
  },
  syncValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22c55e',
  },
  syncWarning: {
    color: '#f59e0b',
  },
  syncButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  syncButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  settingDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  toggleOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleOptionActive: {
    backgroundColor: '#8b5cf6',
  },
  toggleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  toggleOptionTextActive: {
    color: '#ffffff',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  actionArrow: {
    fontSize: 24,
    color: '#94a3b8',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 24,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
})
