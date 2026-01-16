import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PaymentMethod } from '@medical-spa/types';
import { paymentService } from '@/services/payments/stripe';

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPaymentMethods();
  };

  const handleAddPaymentMethod = () => {
    router.push('/payments/AddPaymentMethod');
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await paymentService.setDefaultPaymentMethod(methodId);
      await loadPaymentMethods();
    } catch (error) {
      console.error('Error setting default:', error);
      Alert.alert('Error', 'Failed to set default payment method.');
    }
  };

  const handleToggleHsaFsa = async (methodId: string, currentValue: boolean) => {
    try {
      await paymentService.toggleHsaFsa(methodId, !currentValue);
      await loadPaymentMethods();
    } catch (error) {
      console.error('Error toggling HSA/FSA:', error);
      Alert.alert('Error', 'Failed to update payment method.');
    }
  };

  const handleDeletePaymentMethod = (method: PaymentMethod) => {
    Alert.alert(
      'Delete Payment Method',
      `Are you sure you want to delete ${method.cardBrand} ending in ${method.cardLast4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentService.deletePaymentMethod(method.id);
              await loadPaymentMethods();
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method.');
            }
          },
        },
      ]
    );
  };

  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
      case 'mastercard':
      case 'amex':
      case 'discover':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const renderPaymentMethod = (method: PaymentMethod, index: number) => {
    const isHsaFsa = method.type === 'hsa' || method.type === 'fsa' || method.hsaFsaVerified;

    return (
      <Animated.View
        key={method.id}
        entering={FadeInDown.duration(400).delay(index * 100)}
        style={styles.paymentMethodCard}
      >
        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <View style={styles.cardIconContainer}>
              <Ionicons name={getCardIcon(method.cardBrand) as any} size={24} color="#8B5CF6" />
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardBrand}>
                {method.cardBrand || 'Card'} •••• {method.cardLast4}
              </Text>
              <Text style={styles.cardExpiry}>
                Expires {method.cardExpMonth?.toString().padStart(2, '0')}/{method.cardExpYear}
              </Text>
              {isHsaFsa && (
                <View style={styles.hsaFsaBadge}>
                  <Ionicons name="medical" size={12} color="#10B981" />
                  <Text style={styles.hsaFsaText}>
                    {method.type === 'hsa' ? 'HSA' : method.type === 'fsa' ? 'FSA' : 'HSA/FSA'} Enabled
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleDeletePaymentMethod(method)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              !method.isDefault && styles.actionButtonPrimary,
            ]}
            onPress={() => handleSetDefault(method.id)}
            disabled={method.isDefault}
          >
            <Ionicons
              name={method.isDefault ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={18}
              color={method.isDefault ? '#10B981' : '#8B5CF6'}
            />
            <Text
              style={[
                styles.actionButtonText,
                method.isDefault && styles.actionButtonTextDisabled,
              ]}
            >
              {method.isDefault ? 'Default' : 'Set as Default'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              isHsaFsa && styles.actionButtonActive,
            ]}
            onPress={() => handleToggleHsaFsa(method.id, isHsaFsa)}
          >
            <Ionicons
              name={isHsaFsa ? 'medical' : 'medical-outline'}
              size={18}
              color={isHsaFsa ? '#10B981' : '#6B7280'}
            />
            <Text
              style={[
                styles.actionButtonText,
                isHsaFsa && styles.actionButtonTextActive,
              ]}
            >
              {isHsaFsa ? 'HSA/FSA Card' : 'Mark as HSA/FSA'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View entering={FadeInDown.duration(600)} style={styles.emptyState}>
      <LinearGradient
        colors={['#F5F3FF', '#FFFFFF']}
        style={styles.emptyStateIcon}
      >
        <Ionicons name="card-outline" size={48} color="#8B5CF6" />
      </LinearGradient>
      <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
      <Text style={styles.emptyStateText}>
        Add a payment method to quickly pay for appointments and services.
      </Text>
      <Text style={styles.emptyStateSubtext}>
        HSA/FSA cards accepted for eligible medical services.
      </Text>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <LinearGradient
            colors={['#ECFDF5', '#D1FAE5']}
            style={styles.infoBanner}
          >
            <View style={styles.infoBannerIcon}>
              <Ionicons name="information-circle" size={24} color="#10B981" />
            </View>
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>HSA/FSA Accepted</Text>
              <Text style={styles.infoBannerText}>
                Use your HSA or FSA card for eligible medical services. We'll automatically generate IIAS-compliant receipts.
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {paymentMethods.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map((method, index) => renderPaymentMethod(method, index))}
          </View>
        )}

        <Animated.View
          entering={FadeInDown.duration(600).delay(paymentMethods.length * 100 + 200)}
        >
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPaymentMethod}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(paymentMethods.length * 100 + 300)}
        >
          <View style={styles.securityNotice}>
            <Ionicons name="lock-closed" size={16} color="#6B7280" />
            <Text style={styles.securityNoticeText}>
              Your payment information is encrypted and securely stored using Stripe.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937' },
  headerSpacer: { width: 40 },
  infoBanner: { flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 24, gap: 12 },
  infoBannerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  infoBannerContent: { flex: 1 },
  infoBannerTitle: { fontSize: 15, fontWeight: '600', color: '#065F46', marginBottom: 4 },
  infoBannerText: { fontSize: 13, color: '#047857', lineHeight: 18 },
  paymentMethodsList: { gap: 16, marginBottom: 24 },
  paymentMethodCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, position: 'relative' },
  defaultBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  defaultBadgeText: { fontSize: 11, fontWeight: '600', color: '#10B981' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardInfo: { flexDirection: 'row', flex: 1, gap: 12 },
  cardIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  cardDetails: { flex: 1 },
  cardBrand: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  cardExpiry: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  hsaFsaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  hsaFsaText: { fontSize: 11, fontWeight: '600', color: '#10B981' },
  deleteButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
  actionButtonPrimary: { backgroundColor: '#F5F3FF', borderColor: '#E9D5FF' },
  actionButtonActive: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: '#8B5CF6' },
  actionButtonTextDisabled: { color: '#10B981' },
  actionButtonTextActive: { color: '#10B981' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyStateIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyStateTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  emptyStateText: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 8, paddingHorizontal: 24 },
  emptyStateSubtext: { fontSize: 13, color: '#10B981', textAlign: 'center', fontWeight: '500' },
  addButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  addButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16 },
  addButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  securityNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24 },
  securityNoticeText: { fontSize: 12, color: '#6B7280', textAlign: 'center', flex: 1 },
});
