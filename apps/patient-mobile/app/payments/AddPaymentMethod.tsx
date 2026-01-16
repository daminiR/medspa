import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { paymentService } from '@/services/payments/stripe';

export default function AddPaymentMethodScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [isHsaFsa, setIsHsaFsa] = useState(false);
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateCard = (): boolean => {
    if (cardNumber.replace(/\s/g, '').length < 13) {
      Alert.alert('Invalid Card', 'Please enter a valid card number.');
      return false;
    }
    
    const expiryParts = expiry.split('/');
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY).');
      return false;
    }
    
    const month = parseInt(expiryParts[0]);
    if (month < 1 || month > 12) {
      Alert.alert('Invalid Expiry', 'Please enter a valid month (01-12).');
      return false;
    }
    
    if (cvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV.');
      return false;
    }
    
    if (zipCode.length < 5) {
      Alert.alert('Invalid ZIP', 'Please enter a valid ZIP code.');
      return false;
    }
    
    if (!cardholderName.trim()) {
      Alert.alert('Missing Name', 'Please enter the cardholder name.');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateCard()) return;
    
    setLoading(true);
    try {
      const expiryParts = expiry.split('/');
      const cardDetails = {
        number: cardNumber.replace(/\s/g, ''),
        expMonth: parseInt(expiryParts[0]),
        expYear: parseInt('20' + expiryParts[1]),
        cvc: cvv,
        name: cardholderName,
        addressZip: zipCode,
      };
      
      await paymentService.addPaymentMethod(cardDetails, isHsaFsa);
      Alert.alert('Success', 'Payment method added successfully.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', error.message || 'Failed to add payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Payment Method</Text>
            <View style={styles.headerSpacer} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(100)}>
            <View style={styles.cardPreview}>
              <LinearGradient
                colors={isHsaFsa ? ['#10B981', '#059669'] : ['#8B5CF6', '#7C3AED']}
                style={styles.cardPreviewGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardPreviewTop}>
                  <Ionicons name="card" size={32} color="rgba(255,255,255,0.9)" />
                  {isHsaFsa && (
                    <View style={styles.hsaBadge}>
                      <Ionicons name="medical" size={14} color="#FFFFFF" />
                      <Text style={styles.hsaBadgeText}>HSA/FSA</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardPreviewNumber}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </Text>
                <View style={styles.cardPreviewBottom}>
                  <View>
                    <Text style={styles.cardPreviewLabel}>CARDHOLDER</Text>
                    <Text style={styles.cardPreviewValue}>
                      {cardholderName || 'YOUR NAME'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
                    <Text style={styles.cardPreviewValue}>
                      {expiry || 'MM/YY'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  maxLength={19}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={expiry}
                    onChangeText={(text) => setExpiry(formatExpiry(text))}
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    secureTextEntry
                    value={cvv}
                    onChangeText={(text) => setCvv(text.replace(/\D/g, '').substring(0, 4))}
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ZIP Code</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="12345"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={zipCode}
                  onChangeText={(text) => setZipCode(text.replace(/\D/g, '').substring(0, 5))}
                  maxLength={5}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.hsaFsaToggle}
              onPress={() => setIsHsaFsa(!isHsaFsa)}
            >
              <View style={[styles.checkbox, isHsaFsa && styles.checkboxChecked]}>
                {isHsaFsa && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hsaFsaToggleLabel}>This is an HSA/FSA card</Text>
                <Text style={styles.hsaFsaToggleText}>
                  Use for eligible medical services with automatic IIAS-compliant receipts
                </Text>
              </View>
            </TouchableOpacity>

            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              style={styles.infoBox}
            >
              <Ionicons name="shield-checkmark" size={20} color="#D97706" />
              <Text style={styles.infoText}>
                Your card details are securely encrypted and processed by Stripe.
              </Text>
            </LinearGradient>
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#9CA3AF', '#6B7280'] : ['#8B5CF6', '#7C3AED']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Add Card</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937' },
  headerSpacer: { width: 40 },
  cardPreview: { marginBottom: 32 },
  cardPreviewGradient: { borderRadius: 20, padding: 24, minHeight: 200, justifyContent: 'space-between' },
  cardPreviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hsaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  hsaBadgeText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  cardPreviewNumber: { fontSize: 22, fontWeight: '600', color: '#FFFFFF', letterSpacing: 2, marginVertical: 16 },
  cardPreviewBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPreviewLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  cardPreviewValue: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  input: { flex: 1, fontSize: 16, color: '#1F2937' },
  inputRow: { flexDirection: 'row', gap: 16 },
  hsaFsaToggle: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#10B981', borderColor: '#10B981' },
  hsaFsaToggleLabel: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  hsaFsaToggleText: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12 },
  infoText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 16, backgroundColor: '#F9FAFB', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  saveButton: { borderRadius: 16, overflow: 'hidden' },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
