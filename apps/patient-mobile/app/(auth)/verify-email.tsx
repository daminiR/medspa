import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAuthStore } from '@/store/auth';

export default function VerifyEmailScreen() {
  const { email, isNewUser, firstName, lastName, phone } = useLocalSearchParams<{
    email: string;
    isNewUser?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>();

  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { sendMagicLink } = useAuthStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      await sendMagicLink(email);
      setCountdown(60);
    } catch (error) {
      // Handle error
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail" size={48} color="#8B5CF6" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a magic link to{'\n'}
            <Text style={styles.emailText}>{maskedEmail}</Text>
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.instructionsContainer}>
          <View style={styles.instruction}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Open the email on this device
            </Text>
          </View>
          <View style={styles.instruction}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Tap the "Sign In" button
            </Text>
          </View>
          <View style={styles.instruction}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              You'll be automatically signed in
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the email?</Text>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>
              Resend in {countdown}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <Text style={styles.resendLink}>Resend email</Text>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(800)} style={styles.tipContainer}>
          <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
          <Text style={styles.tipText}>
            Check your spam folder if you don't see the email
          </Text>
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View entering={FadeInDown.duration(600).delay(1000)} style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Use a different email</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  instructionsContainer: {
    marginTop: 32,
    gap: 16,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  instructionText: {
    fontSize: 15,
    color: '#374151',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  countdownText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
});
