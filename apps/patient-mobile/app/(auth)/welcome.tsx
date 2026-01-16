import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useAuthStore } from '@/store/auth';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const {
    isPasskeyAvailable,
    isBiometricAvailable,
    biometricType,
    checkBiometricAvailability,
    authenticateWithPasskey,
    isLoading,
  } = useAuthStore();

  const [showPasskeyOption, setShowPasskeyOption] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    // Check if user has registered passkeys before
    checkExistingPasskeys();
  }, []);

  const checkExistingPasskeys = async () => {
    // In production, check if user has passkeys registered
    // For now, show passkey option if available
    if (isPasskeyAvailable) {
      setShowPasskeyOption(true);
    }
  };

  const handlePasskeyLogin = async () => {
    try {
      await authenticateWithPasskey();
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      // Fall back to regular login
      router.push('/(auth)/login');
    }
  };

  const getBiometricIcon = () => {
    if (biometricType === 'facial') {
      return 'scan-outline';
    } else if (biometricType === 'fingerprint') {
      return 'finger-print-outline';
    }
    return 'key-outline';
  };

  const getBiometricLabel = () => {
    if (biometricType === 'facial') {
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    } else if (biometricType === 'fingerprint') {
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    }
    return 'Passkey';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F4FF', '#FFFFFF', '#FFF8F0']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Logo and Branding */}
      <Animated.View
        entering={FadeInDown.duration(800).delay(200)}
        style={styles.headerContainer}
      >
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#A78BFA']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={32} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text style={styles.brandName}>Luxe MedSpa</Text>
        <Text style={styles.tagline}>Your beauty, elevated</Text>
      </Animated.View>

      {/* Hero Image/Illustration */}
      <Animated.View
        entering={FadeIn.duration(1000).delay(400)}
        style={styles.heroContainer}
      >
        <View style={styles.heroPlaceholder}>
          <Ionicons name="leaf-outline" size={80} color="#8B5CF6" />
          <Text style={styles.heroText}>Premium Aesthetic Care</Text>
        </View>
      </Animated.View>

      {/* Features List */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(600)}
        style={styles.featuresContainer}
      >
        <FeatureItem
          icon="calendar-outline"
          text="Book appointments instantly"
        />
        <FeatureItem
          icon="images-outline"
          text="Track your transformation"
        />
        <FeatureItem
          icon="wallet-outline"
          text="Manage payments & rewards"
        />
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(800)}
        style={styles.actionsContainer}
      >
        {/* Passkey/Biometric Quick Login */}
        {(showPasskeyOption || isBiometricAvailable) && (
          <TouchableOpacity
            style={styles.passkeyButton}
            onPress={handlePasskeyLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.passkeyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons
                name={getBiometricIcon()}
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.passkeyText}>
                Sign in with {getBiometricLabel()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Regular Sign In */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        {/* Create Account */}
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.createAccountText}>
            New here? <Text style={styles.createAccountLink}>Create Account</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <Animated.View
        entering={FadeIn.duration(400).delay(1000)}
        style={styles.footer}
      >
        <Text style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text style={styles.footerLink}>Terms</Text> &{' '}
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as any} size={20} color="#8B5CF6" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: height * 0.08,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroPlaceholder: {
    width: width * 0.7,
    height: width * 0.5,
    backgroundColor: '#F5F3FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  featuresContainer: {
    paddingHorizontal: 32,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 12,
  },
  passkeyButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  passkeyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  passkeyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signInButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
  createAccountButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  createAccountText: {
    fontSize: 15,
    color: '#6B7280',
  },
  createAccountLink: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#8B5CF6',
  },
});
