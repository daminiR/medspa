import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { generateQRCodeUrl } from '../../services/referral/codeGenerator';

interface QRCodeDisplayProps {
  shareUrl: string;
  referralCode: string;
}

export default function QRCodeDisplay({ shareUrl, referralCode }: QRCodeDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const qrCodeUrl = generateQRCodeUrl(shareUrl);

  const handleShare = async () => {
    try {
      // Download QR code to temp file
      const fileUri = `${FileSystem.cacheDirectory}qr-code-${referralCode}.png`;
      await FileSystem.downloadAsync(qrCodeUrl, fileUri);
      
      // Share the image
      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your referral QR code',
      });
    } catch (err) {
      console.error('Error sharing QR code:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan to Book</Text>
      <Text style={styles.subtitle}>
        Share this QR code for easy sign-ups
      </Text>

      <View style={styles.qrContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        )}
        
        <Image
          source={{ uri: qrCodeUrl }}
          style={styles.qrCode}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError('Failed to load QR code');
          }}
        />
        
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <View style={styles.codeDisplay}>
        <Text style={styles.codeLabel}>Code:</Text>
        <Text style={styles.code}>{referralCode}</Text>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={20} color="#8B5CF6" />
        <Text style={styles.shareButtonText}>Share QR Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  qrContainer: {
    width: 240,
    height: 240,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  code: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F3FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
});
