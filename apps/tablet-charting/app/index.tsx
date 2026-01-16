import { useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '../src/stores/authStore'

export default function SplashScreen() {
  const router = useRouter()
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      // Auto-navigate after splash
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)/patients')
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isLoading, isAuthenticated])

  const handleGetStarted = () => {
    router.replace('/(tabs)/patients')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>L</Text>
          </View>
          <Text style={styles.appName}>Luxe MedSpa</Text>
          <Text style={styles.tagline}>Provider Charting</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="face"
            title="Interactive Face Charts"
            description="Mark injection sites with precision using Apple Pencil"
          />
          <FeatureItem
            icon="camera"
            title="Photo Documentation"
            description="Capture before/after photos with built-in comparison"
          />
          <FeatureItem
            icon="notes"
            title="SOAP Notes"
            description="Complete clinical documentation with voice dictation"
          />
          <FeatureItem
            icon="sync"
            title="Offline Ready"
            description="Chart anywhere, sync when connected"
          />
        </View>

        {/* Action Button */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#8b5cf6" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        )}

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  )
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  const iconMap: Record<string, string> = {
    face: '🎨',
    camera: '📸',
    notes: '📝',
    sync: '🔄',
  }

  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{iconMap[icon]}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 18,
    color: '#64748b',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 48,
    maxWidth: 800,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 340,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  loader: {
    marginVertical: 24,
  },
  version: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 24,
  },
})
