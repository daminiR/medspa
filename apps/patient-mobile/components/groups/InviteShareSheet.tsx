import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface InviteShareSheetProps {
  bookingCode: string;
  groupName: string;
  eventDate: Date;
  onClose: () => void;
}

export default function InviteShareSheet({
  bookingCode,
  groupName,
  eventDate,
  onClose,
}: InviteShareSheetProps) {
  const inviteLink = `https://app.medspa.com/group/${bookingCode}`;
  const inviteMessage = `You're invited to join "${groupName}" on ${eventDate.toLocaleDateString()}!\n\nJoin using code: ${bookingCode}\nOr click: ${inviteLink}`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(bookingCode);
    Alert.alert('Copied!', 'Booking code copied to clipboard');
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert('Copied!', 'Invite link copied to clipboard');
  };

  const handleShareNative = async () => {
    try {
      const result = await Share.share({
        message: inviteMessage,
        title: `Join ${groupName}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share invite');
    }
  };

  const shareOptions = [
    {
      id: 'native',
      icon: 'share-social',
      label: 'Share via...',
      color: '#8B5CF6',
      action: handleShareNative,
    },
    {
      id: 'sms',
      icon: 'chatbubble',
      label: 'SMS',
      color: '#10B981',
      action: () => {
        // Would open SMS with pre-filled message in production
        Alert.alert('SMS', 'Opens default SMS app with invite message');
      },
    },
    {
      id: 'email',
      icon: 'mail',
      label: 'Email',
      color: '#3B82F6',
      action: () => {
        // Would open email with pre-filled content in production
        Alert.alert('Email', 'Opens default email app with invite');
      },
    },
    {
      id: 'whatsapp',
      icon: 'logo-whatsapp',
      label: 'WhatsApp',
      color: '#25D366',
      action: () => {
        // Would open WhatsApp with message in production
        Alert.alert('WhatsApp', 'Opens WhatsApp with invite message');
      },
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Share Invite</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Booking Code Card */}
      <View style={styles.codeCard}>
        <View style={styles.codeHeader}>
          <Ionicons name="key" size={20} color="#8B5CF6" />
          <Text style={styles.codeLabel}>Booking Code</Text>
        </View>
        <Text style={styles.code}>{bookingCode}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
          <Ionicons name="copy-outline" size={16} color="#8B5CF6" />
          <Text style={styles.copyButtonText}>Copy Code</Text>
        </TouchableOpacity>
      </View>

      {/* Invite Link */}
      <View style={styles.linkCard}>
        <View style={styles.linkHeader}>
          <Ionicons name="link" size={18} color="#6B7280" />
          <Text style={styles.linkLabel}>Invite Link</Text>
        </View>
        <Text style={styles.link} numberOfLines={1}>{inviteLink}</Text>
        <TouchableOpacity style={styles.copyLinkButton} onPress={handleCopyLink}>
          <Ionicons name="copy-outline" size={16} color="#6B7280" />
          <Text style={styles.copyLinkButtonText}>Copy Link</Text>
        </TouchableOpacity>
      </View>

      {/* Share Options */}
      <View style={styles.shareOptions}>
        <Text style={styles.shareOptionsTitle}>Share via</Text>
        <View style={styles.shareGrid}>
          {shareOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.shareOption}
              onPress={option.action}
            >
              <View style={[styles.shareIcon, { backgroundColor: `${option.color}15` }]}>
                <Ionicons name={option.icon as any} size={24} color={option.color} />
              </View>
              <Text style={styles.shareLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
        <Text style={styles.instructionsText}>
          Share the booking code or link with friends to invite them to your group
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeCard: {
    backgroundColor: '#F5F3FF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 4,
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  linkCard: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  linkLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  link: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 12,
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  copyLinkButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  shareOptions: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  shareOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shareOption: {
    alignItems: 'center',
    width: '22%',
  },
  shareIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shareLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
  },
  instructionsText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
});
