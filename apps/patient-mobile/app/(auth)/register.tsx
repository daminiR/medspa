import { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/auth';

export default function RegisterScreen() {
  const [step, setStep] = useState<'info' | 'verify'>('info');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    isPasskeyAvailable,
    registerPasskey,
    sendMagicLink,
  } = useAuthStore();

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  const isFormValid = () => {
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      isValidEmail(email) &&
      acceptedTerms
    );
  };

  const handleRegister = async () => {
    if (!isFormValid()) {
      Alert.alert('Invalid Form', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      // If passkeys are available, offer to set one up
      if (isPasskeyAvailable) {
        Alert.alert(
          'Set Up Passkey',
          'Would you like to set up Face ID / Touch ID for faster sign-in?',
          [
            {
              text: 'Skip',
              style: 'cancel',
              onPress: () => continueWithEmail(),
            },
            {
              text: 'Set Up',
              onPress: () => setupPasskey(),
            },
          ]
        );
      } else {
        await continueWithEmail();
      }
    } catch (error: any) {
      Alert.alert('Registration Error', error.message || 'Failed to create account.');
      setIsSubmitting(false);
    }
  };

  const setupPasskey = async () => {
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await registerPasskey(email, fullName);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      // Passkey setup failed, fall back to email
      await continueWithEmail();
    }
  };

  const continueWithEmail = async () => {
    try {
      await sendMagicLink(email);
      router.push({
        pathname: '/(auth)/verify-email',
        params: {
          email,
          isNewUser: 'true',
          firstName,
          lastName,
          phone: phone.replace(/\D/g, ''),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Join us for a personalized beauty experience
          </Text>
        </Animated.View>

        {/* Benefits */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.benefitsContainer}>
          <BenefitItem icon="calendar" text="Easy appointment booking" />
          <BenefitItem icon="images" text="Track your transformation" />
          <BenefitItem icon="gift" text="Exclusive member rewards" />
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.formContainer}>
          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.inputLabel}>First name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            <View style={styles.nameField}>
              <Text style={styles.inputLabel}>Last name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.inputLabel}>Email address *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>
          </View>

          {/* Phone (Optional) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.inputLabel}>Phone number (optional)</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.phonePrefix}>+1</Text>
              <TextInput
                style={[styles.inputWithIcon, styles.phoneInput]}
                placeholder="(555) 123-4567"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={(text) => setPhone(formatPhoneNumber(text))}
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={14}
              />
            </View>
            <Text style={styles.inputHint}>
              For appointment reminders & SMS notifications
            </Text>
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Passkey Info */}
          {isPasskeyAvailable && (
            <View style={styles.passkeyInfo}>
              <LinearGradient
                colors={['#F5F3FF', '#FEF3F2']}
                style={styles.passkeyInfoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.passkeyInfoIcon}>
                  <Ionicons name="finger-print" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.passkeyInfoContent}>
                  <Text style={styles.passkeyInfoTitle}>
                    Fast & Secure Sign-in
                  </Text>
                  <Text style={styles.passkeyInfoText}>
                    You'll be able to set up Face ID or Touch ID after registration
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !isFormValid() && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.duration(400).delay(400)} style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              style={styles.footerLink}
              onPress={() => router.push('/(auth)/login')}
            >
              Sign in
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIcon}>
        <Ionicons name={icon as any} size={16} color="#8B5CF6" />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
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
    marginBottom: 24,
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
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6D28D9',
  },
  formContainer: {
    gap: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  fieldContainer: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
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
  inputWithIcon: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  phonePrefix: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginRight: 8,
  },
  phoneInput: {
    paddingLeft: 0,
  },
  inputHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  termsLink: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  passkeyInfo: {
    marginTop: 4,
  },
  passkeyInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  passkeyInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passkeyInfoContent: {
    flex: 1,
  },
  passkeyInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  passkeyInfoText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
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
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
