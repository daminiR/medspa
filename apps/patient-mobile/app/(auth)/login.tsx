import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuthStore } from '@/store/auth';

type AuthMethod = 'email' | 'phone' | 'passkey';

export default function LoginScreen() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneInputRef = useRef<TextInput>(null);

  const {
    isPasskeyAvailable,
    isBiometricAvailable,
    biometricType,
    sendMagicLink,
    sendSmsOtp,
    authenticateWithPasskey,
    authenticateWithBiometric,
  } = useAuthStore();

  const handleEmailSubmit = async () => {
    if (!email.trim() || !isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendMagicLink(email);
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send login link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneSubmit = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendSmsOtp(cleanPhone);
      router.push({
        pathname: '/(auth)/verify-phone',
        params: { phone: cleanPhone },
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setIsSubmitting(true);
    try {
      await authenticateWithPasskey();
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Passkey Error', error.message || 'Failed to authenticate with passkey.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsSubmitting(true);
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        router.replace('/(tabs)/dashboard');
      }
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message || 'Biometric authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const parts = [match[1], match[2], match[3]].filter(Boolean);
      if (parts.length === 0) return '';
      if (parts.length === 1) return parts[0];
      if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
      return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
    }
    return text;
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getBiometricLabel = () => {
    if (biometricType === 'facial') {
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    }
    return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to manage your appointments and more
          </Text>
        </Animated.View>

        {/* Auth Method Tabs */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, authMethod === 'email' && styles.tabActive]}
            onPress={() => setAuthMethod('email')}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={authMethod === 'email' ? '#8B5CF6' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, authMethod === 'email' && styles.tabTextActive]}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, authMethod === 'phone' && styles.tabActive]}
            onPress={() => setAuthMethod('phone')}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color={authMethod === 'phone' ? '#8B5CF6' : '#9CA3AF'}
            />
            <Text style={[styles.tabText, authMethod === 'phone' && styles.tabTextActive]}>
              Phone
            </Text>
          </TouchableOpacity>
          {isPasskeyAvailable && (
            <TouchableOpacity
              style={[styles.tab, authMethod === 'passkey' && styles.tabActive]}
              onPress={() => setAuthMethod('passkey')}
            >
              <Ionicons
                name="key-outline"
                size={20}
                color={authMethod === 'passkey' ? '#8B5CF6' : '#9CA3AF'}
              />
              <Text style={[styles.tabText, authMethod === 'passkey' && styles.tabTextActive]}>
                Passkey
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Email Input */}
        {authMethod === 'email' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="send"
                onSubmitEditing={handleEmailSubmit}
              />
            </View>
            <Text style={styles.inputHint}>
              We'll send you a magic link to sign in instantly
            </Text>

            <TouchableOpacity
              style={[styles.submitButton, !email.trim() && styles.submitButtonDisabled]}
              onPress={handleEmailSubmit}
              disabled={isSubmitting || !email.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Send Magic Link</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Phone Input */}
        {authMethod === 'phone' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.phonePrefix}>+1</Text>
              <TextInput
                ref={phoneInputRef}
                style={[styles.input, styles.phoneInput]}
                placeholder="(555) 123-4567"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                keyboardType="phone-pad"
                autoComplete="tel"
                returnKeyType="send"
                onSubmitEditing={handlePhoneSubmit}
                maxLength={14}
              />
            </View>
            <Text style={styles.inputHint}>
              We'll text you a 6-digit verification code
            </Text>

            <TouchableOpacity
              style={[styles.submitButton, phone.replace(/\D/g, '').length < 10 && styles.submitButtonDisabled]}
              onPress={handlePhoneSubmit}
              disabled={isSubmitting || phone.replace(/\D/g, '').length < 10}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Send Code</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Passkey */}
        {authMethod === 'passkey' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.inputContainer}>
            <View style={styles.passkeyContainer}>
              <View style={styles.passkeyIcon}>
                <Ionicons name="finger-print" size={48} color="#8B5CF6" />
              </View>
              <Text style={styles.passkeyTitle}>Sign in with Passkey</Text>
              <Text style={styles.passkeyDescription}>
                Use your device's biometrics or security key for instant,
                passwordless authentication
              </Text>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handlePasskeyLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="key" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Continue with Passkey</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Biometric Quick Access */}
        {isBiometricAvailable && authMethod !== 'passkey' && (
          <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.biometricContainer}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={isSubmitting}
            >
              <Ionicons
                name={biometricType === 'facial' ? 'scan-outline' : 'finger-print-outline'}
                size={24}
                color="#8B5CF6"
              />
              <Text style={styles.biometricButtonText}>
                Sign in with {getBiometricLabel()}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Footer */}
        <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text
              style={styles.footerLink}
              onPress={() => router.push('/(auth)/register')}
            >
              Sign up
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#8B5CF6',
  },
  inputContainer: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  phonePrefix: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginRight: 8,
    paddingLeft: 4,
  },
  phoneInput: {
    paddingLeft: 0,
  },
  inputHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: -8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  passkeyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  passkeyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  passkeyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  passkeyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  biometricContainer: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  biometricButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#6B7280',
  },
  footerLink: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
