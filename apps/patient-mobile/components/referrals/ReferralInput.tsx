import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { isValidCodeFormat } from '../../services/referral/codeGenerator';
import { referralService } from '../../services/referrals/referralService';

interface ReferralInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidCode?: (referrerName: string, reward: number) => void;
  autoFocus?: boolean;
}

export default function ReferralInput({
  value,
  onChangeText,
  onValidCode,
  autoFocus = false,
}: ReferralInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [referrerName, setReferrerName] = useState<string>('');
  const [reward, setReward] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Debounce validation
  useEffect(() => {
    if (value.length < 6) {
      setValidationState('idle');
      return;
    }

    const timer = setTimeout(() => {
      validateCode(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  const validateCode = async (code: string) => {
    if (!isValidCodeFormat(code)) {
      setValidationState('invalid');
      setErrorMessage('Invalid code format');
      return;
    }

    setIsValidating(true);
    try {
      const response = await referralService.validateReferralCode(code);
      
      if (response.valid && response.referrerName) {
        setValidationState('valid');
        setReferrerName(response.referrerName);
        setReward(response.reward?.amount || 50);
        setErrorMessage('');
        onValidCode?.(response.referrerName, response.reward?.amount || 50);
      } else {
        setValidationState('invalid');
        setErrorMessage(response.message || 'Invalid referral code');
      }
    } catch (error) {
      setValidationState('invalid');
      setErrorMessage('Unable to verify code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    onChangeText('');
    setValidationState('idle');
    setReferrerName('');
    setErrorMessage('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Referral Code (Optional)</Text>
      <Text style={styles.hint}>Have a friend's referral code? Enter it to get a discount!</Text>

      <View style={styles.inputContainer}>
        <View style={[
          styles.inputWrapper,
          validationState === 'valid' && styles.inputWrapperValid,
          validationState === 'invalid' && styles.inputWrapperInvalid,
        ]}>
          <Ionicons 
            name="gift-outline" 
            size={20} 
            color={validationState === 'valid' ? '#10B981' : '#9CA3AF'}
            style={styles.inputIcon}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Enter code (e.g., LUXE-SARAH-X7K2)"
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={(text) => onChangeText(text.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus={autoFocus}
            maxLength={20}
          />

          {isValidating && (
            <ActivityIndicator size="small" color="#8B5CF6" style={styles.indicator} />
          )}

          {!isValidating && value.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {validationState === 'valid' && !isValidating && (
            <Animated.View entering={ZoomIn.duration(300)}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </Animated.View>
          )}

          {validationState === 'invalid' && !isValidating && (
            <Animated.View entering={ZoomIn.duration(300)}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </Animated.View>
          )}
        </View>
      </View>

      {/* Success Message */}
      {validationState === 'valid' && referrerName && (
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)} style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={16} color="#10B981" />
          </View>
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>Valid Code!</Text>
            <Text style={styles.successText}>
              Referred by <Text style={styles.referrerName}>{referrerName}</Text>. 
              You'll get <Text style={styles.rewardAmount}>${reward} off</Text> your first service!
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Error Message */}
      {validationState === 'invalid' && errorMessage && (
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)} style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </Animated.View>
      )}

      {/* Skip Option */}
      {value.length === 0 && (
        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Don't have a code? Skip for now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  hint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  inputWrapperValid: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  inputWrapperInvalid: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  indicator: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  successText: {
    fontSize: 13,
    color: '#059669',
    lineHeight: 18,
  },
  referrerName: {
    fontWeight: '600',
  },
  rewardAmount: {
    fontWeight: '700',
    color: '#10B981',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
});
