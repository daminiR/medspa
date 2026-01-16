import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Share as RNShare,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  referralCode: string;
  shareUrl: string;
  onShare?: (method: string) => void;
}

interface ShareOption {
  id: string;
  icon: string;
  label: string;
  color: string;
  method: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'COPY';
}

export default function ShareModal({
  visible,
  onClose,
  referralCode,
  shareUrl,
  onShare,
}: ShareModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const shareOptions: ShareOption[] = [
    { id: 'sms', icon: 'chatbubble', label: 'SMS', color: '#10B981', method: 'SMS' },
    { id: 'email', icon: 'mail', label: 'Email', color: '#3B82F6', method: 'EMAIL' },
    { id: 'whatsapp', icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366', method: 'WHATSAPP' },
    { id: 'instagram', icon: 'logo-instagram', label: 'Instagram', color: '#E4405F', method: 'INSTAGRAM' },
    { id: 'facebook', icon: 'logo-facebook', label: 'Facebook', color: '#1877F2', method: 'FACEBOOK' },
    { id: 'twitter', icon: 'logo-twitter', label: 'Twitter', color: '#1DA1F2', method: 'TWITTER' },
  ];

  const getShareMessage = (method: ShareOption['method']): string => {
    const messages = {
      SMS: `Try Luxe MedSpa! Use my code ${referralCode} for $25 off your first service. They're amazing! ${shareUrl}`,
      EMAIL: `Hi!\n\nI thought you'd love Luxe MedSpa! They have incredible treatments and amazing results.\n\nUse my referral code ${referralCode} to get $25 off your first service, and I'll earn a credit too!\n\nBook your appointment here: ${shareUrl}\n\nYou're going to love it!\n\nBest,`,
      WHATSAPP: `Try Luxe MedSpa! Use my code ${referralCode} for $25 off. They're amazing! ${shareUrl}`,
      INSTAGRAM: `Get $25 off @LuxeMedSpa with code ${referralCode}! Link in bio`,
      FACEBOOK: `Just tried Luxe MedSpa and the results are incredible! Use my code ${referralCode} for $25 off your first service. ${shareUrl}`,
      TWITTER: `Get $25 off @LuxeMedSpa with my code ${referralCode}! Amazing treatments and results. ${shareUrl}`,
    };
    return messages[method];
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    onShare?.('COPY');
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
    onShare?.('COPY');
  };

  const handleShare = async (option: ShareOption) => {
    const message = getShareMessage(option.method);

    try {
      switch (option.method) {
        case 'SMS':
          if (Platform.OS === 'ios') {
            await Linking.openURL(`sms:&body=${encodeURIComponent(message)}`);
          } else {
            await Linking.openURL(`sms:?body=${encodeURIComponent(message)}`);
          }
          break;

        case 'EMAIL':
          await Linking.openURL(
            `mailto:?subject=${encodeURIComponent('Get $25 off at Luxe MedSpa!')}&body=${encodeURIComponent(message)}`
          );
          break;

        case 'WHATSAPP':
          await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
          break;

        case 'FACEBOOK':
          await RNShare.share({
            message: message,
            url: shareUrl,
          });
          break;

        case 'TWITTER':
          await Linking.openURL(
            `twitter://post?message=${encodeURIComponent(message)}`
          );
          break;

        case 'INSTAGRAM':
          // Instagram doesn't support direct sharing with pre-filled text
          // Copy to clipboard and open Instagram
          await Clipboard.setStringAsync(message);
          Alert.alert(
            'Message Copied',
            'Your referral message has been copied. Paste it in your Instagram story or post!',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Instagram', onPress: () => Linking.openURL('instagram://') },
            ]
          );
          break;
      }

      onShare?.(option.method);
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to native share
      try {
        await RNShare.share({
          message: message,
        });
        onShare?.(option.method);
      } catch (shareError) {
        Alert.alert('Error', 'Could not open share dialog');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          style={styles.modal}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Share Your Code</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Referral Code Display */}
            <Animated.View
              entering={FadeIn.delay(100)}
              style={styles.codeContainer}
            >
              <Text style={styles.codeLabel}>Your Referral Code</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{referralCode}</Text>
                <TouchableOpacity
                  onPress={handleCopyCode}
                  style={styles.copyButton}
                >
                  <Ionicons
                    name={copiedCode ? 'checkmark-circle' : 'copy-outline'}
                    size={24}
                    color={copiedCode ? '#10B981' : '#8B5CF6'}
                  />
                </TouchableOpacity>
              </View>
              {copiedCode && (
                <Animated.Text entering={FadeIn} style={styles.copiedText}>
                  Copied to clipboard!
                </Animated.Text>
              )}
            </Animated.View>

            {/* Share Options */}
            <View style={styles.shareOptionsContainer}>
              <Text style={styles.sectionTitle}>Share via</Text>
              <View style={styles.shareGrid}>
                {shareOptions.map((option, index) => (
                  <Animated.View
                    key={option.id}
                    entering={FadeIn.delay(200 + index * 50)}
                  >
                    <TouchableOpacity
                      style={styles.shareOption}
                      onPress={() => handleShare(option)}
                    >
                      <View
                        style={[
                          styles.shareIconContainer,
                          { backgroundColor: `${option.color}15` },
                        ]}
                      >
                        <Ionicons
                          name={option.icon as any}
                          size={28}
                          color={option.color}
                        />
                      </View>
                      <Text style={styles.shareLabel}>{option.label}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Copy Link Button */}
            <Animated.View entering={FadeIn.delay(600)}>
              <TouchableOpacity
                style={styles.copyLinkButton}
                onPress={handleCopyLink}
              >
                <Ionicons name="link" size={20} color="#8B5CF6" />
                <Text style={styles.copyLinkText}>Copy Referral Link</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Preview Message */}
            <Animated.View
              entering={FadeIn.delay(700)}
              style={styles.previewContainer}
            >
              <Text style={styles.previewLabel}>Message Preview</Text>
              <View style={styles.previewBox}>
                <Text style={styles.previewText}>
                  {getShareMessage('SMS')}
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#DDD6FE',
  },
  codeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  copiedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
    marginTop: 8,
    textAlign: 'center',
  },
  shareOptionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  shareOption: {
    alignItems: 'center',
    width: 80,
  },
  shareIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5F3FF',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  copyLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  previewContainer: {
    paddingHorizontal: 24,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  previewBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
