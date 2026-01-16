import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HsaFsaBadgeProps {
  eligibleAmount: number;
  totalAmount: number;
  showSavings?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function HsaFsaBadge({ eligibleAmount, totalAmount, showSavings = true, size = 'medium' }: HsaFsaBadgeProps) {
  const [infoVisible, setInfoVisible] = useState(false);
  const savingsPercent = totalAmount > 0 ? Math.round((eligibleAmount / totalAmount) * 100) : 0;
  const estimatedTaxSavings = eligibleAmount * 0.25;

  return (<TouchableOpacity style={{ borderRadius: 16, overflow: 'hidden', marginVertical: 8 }} onPress={() => setInfoVisible(true)} activeOpacity={0.8}><LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={{ padding: 12 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="medical" size={18} color="#10B981" /></View><View style={{ flex: 1 }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: 4 }}>HSA/FSA Eligible</Text><Text style={{ fontSize: 20, fontWeight: '700', color: '#10B981' }}>${eligibleAmount.toFixed(2)}</Text></View></View></LinearGradient></TouchableOpacity>);
}
