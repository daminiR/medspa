import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAuthStore } from '@/store/auth';

const CODE_LENGTH = 6;

export default function VerifyPhoneScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');

  const inputRef = useRef<TextInput>(null);
  const { sendSmsOtp, verifySmsOtp } = useAuthStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (code.length === CODE_LENGTH) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH || isVerifying) return;

    setIsVerifying(true);
    setError('');
    Keyboard.dismiss();

    try {
      await verifySmsOtp(phone, code);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid code. Please try again.');
      setCode('');
      inputRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setError('');
    try {
      await sendSmsOtp(phone);
      setCountdown(60);
      Alert.alert('Code Sent', 'A new verification code has been sent to your phone.');
    } catch (error: any) {
      setError(error.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const formatPhone = (phoneNumber: string) => {
    if (phoneNumber.length === 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    return phoneNumber;
  };

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= CODE_LENGTH) {
      setCode(cleaned);
      setError('');
    }
  };

  const renderCodeBoxes = () => {
    const boxes = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      const isFocused = code.length === i;
      const isFilled = code.length > i;
      const digit = code[i] || '';

      boxes.push(
        <View
          key={i}
          style={[
            styles.codeBox,
            isFocused && styles.codeBoxFocused,
            isFilled && styles.codeBoxFilled,
            error && code.length === 0 && styles.codeBoxError,
          ]}
        >
          <Text style={styles.codeDigit}>{digit}</Text>
        </View>
      );
    }
    return boxes;
  };

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
            <Ionicons name="phone-portrait" size={48} color="#8B5CF6" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.phoneText}>+1 {formatPhone(phone)}</Text>
          </Text>
        </Animated.View>

        {/* Hidden Input */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoFocus
        />

        {/* Code Display */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
          <TouchableOpacity
            style={styles.codeContainer}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={0.9}
          >
            {renderCodeBoxes()}
          </TouchableOpacity>
        </Animated.View>

        {/* Error Message */}
        {error ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        {/* Verifying Indicator */}
        {isVerifying && (
          <View style={styles.verifyingContainer}>
            <ActivityIndicator size="small" color="#8B5CF6" />
            <Text style={styles.verifyingText}>Verifying...</Text>
          </View>
        )}

        {/* Resend */}
        <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>
              Resend in {countdown}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <Text style={styles.resendLink}>Resend code</Text>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View entering={FadeInDown.duration(600).delay(800)} style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Use a different number</Text>
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
    paddingHorizontal: 24,
    paddingTop: 40,
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
  phoneText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFocused: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
  },
  codeBoxFilled: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  codeBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  verifyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  verifyingText: {
    fontSize: 14,
    color: '#6B7280',
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
