/**
 * NotificationPrompt Component
 *
 * Beautiful modal that explains notification benefits and requests permission.
 * Shows once per install unless dismissed.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  hasShownNotificationPrompt,
  markNotificationPromptShown,
} from '@/services/notifications/pushNotifications';

interface NotificationPromptProps {
  onEnablePress: () => Promise<boolean>;
  onMaybeLaterPress?: () => void;
  visible?: boolean;
  onDismiss?: () => void;
}

const { width } = Dimensions.get('window');

export function NotificationPrompt({
  onEnablePress,
  onMaybeLaterPress,
  visible: controlledVisible,
  onDismiss,
}: NotificationPromptProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isControlled = controlledVisible !== undefined;
  const visible = isControlled ? controlledVisible : internalVisible;

  useEffect(() => {
    if (!isControlled) {
      checkShouldShow();
    }
  }, [isControlled]);

  async function checkShouldShow() {
    const hasShown = await hasShownNotificationPrompt();
    if (!hasShown) {
      // Wait a bit before showing to not overwhelm user
      setTimeout(() => {
        setInternalVisible(true);
      }, 2000);
    }
  }

  async function handleEnablePress() {
    setIsLoading(true);
    try {
      const success = await onEnablePress();
      
      if (success) {
        await markNotificationPromptShown();
        handleDismiss();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setIsLoading(false);
    }
  }

  async function handleMaybeLaterPress() {
    await markNotificationPromptShown();
    onMaybeLaterPress?.();
    handleDismiss();
  }

  function handleDismiss() {
    if (isControlled) {
      onDismiss?.();
    } else {
      setInternalVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleMaybeLaterPress}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={64} color="#667eea" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Stay in the Loop</Text>

            {/* Description */}
            <Text style={styles.description}>
              Get timely reminders and updates about your beauty journey
            </Text>

            {/* Benefits */}
            <View style={styles.benefitsList}>
              <BenefitItem
                icon="calendar"
                text="Appointment reminders 24h and 2h before"
              />
              <BenefitItem
                icon="chatbubble"
                text="Instant messages from your providers"
              />
              <BenefitItem
                icon="gift"
                text="Exclusive offers and reward updates"
              />
              <BenefitItem
                icon="star"
                text="Points earned and referral bonuses"
              />
            </View>

            {/* Enable button */}
            <TouchableOpacity
              style={[styles.enableButton, isLoading && styles.enableButtonDisabled]}
              onPress={handleEnablePress}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.enableButtonText}>
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </Text>
            </TouchableOpacity>

            {/* Maybe later button */}
            <TouchableOpacity
              style={styles.maybeLaterButton}
              onPress={handleMaybeLaterPress}
              disabled={isLoading}
              activeOpacity={0.6}
            >
              <Text style={styles.maybeLaterButtonText}>Maybe Later</Text>
            </TouchableOpacity>

            {/* Privacy note */}
            <Text style={styles.privacyNote}>
              You can change your notification preferences anytime in Settings
            </Text>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

interface BenefitItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

function BenefitItem({ icon, text }: BenefitItemProps) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIconContainer}>
        <Ionicons name={icon} size={20} color="#667eea" />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: width - 48,
    maxWidth: 400,
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    lineHeight: 20,
  },
  enableButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#667eea',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  enableButtonDisabled: {
    opacity: 0.6,
  },
  enableButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  maybeLaterButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  maybeLaterButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999999',
  },
  privacyNote: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 16,
  },
});
