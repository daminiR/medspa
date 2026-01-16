# Group Booking Screen Templates

Complete React Native screen implementations for the Group Booking feature.

## Screen 1: Create Group (`/apps/patient-mobile/app/groups/create.tsx`)

### Purpose
4-step wizard for coordinators to create a new group booking.

### Steps
1. Group Details (name, event type, date, expected size)
2. Coordinator Service Selection
3. Invite Members (collect contacts)
4. Confirm & Create

### Key Features
- Step progress indicator
- Real-time discount calculation preview
- Service selection with provider preference
- Date/time picker with availability
- Contact picker integration
- Payment mode selection

### Implementation Outline
```typescript
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { groupService } from '../../services/groupService';
import { calculateGroupDiscount, getDiscountLabel } from '@medical-spa/types';

export default function CreateGroupScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Group Details
  const [groupName, setGroupName] = useState('');
  const [eventType, setEventType] = useState<'bridal' | 'corporate' | 'friends' | 'family'>('friends');
  const [eventDate, setEventDate] = useState(new Date());
  const [expectedSize, setExpectedSize] = useState(3);
  
  // Step 2: Coordinator Service
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Step 3: Invite Members
  const [inviteList, setInviteList] = useState<Array<{ name: string; phone?: string; email?: string }>>([]);
  
  // Step 4: Payment Mode
  const [paymentMode, setPaymentMode] = useState<'coordinator' | 'individual' | 'split'>('coordinator');
  
  const discount = calculateGroupDiscount(expectedSize);
  
  const handleCreateGroup = async () => {
    try {
      const group = await groupService.createGroupBooking({
        name: groupName,
        eventType,
        eventDate,
        coordinatorPatientId: 'current-user-id', // From auth context
        date: eventDate,
        schedulingMode: 'staggered_30',
        maxParticipants: expectedSize + 2,
        paymentMode,
        depositRequired: true,
        participants: [
          {
            patientId: 'current-user-id',
            serviceId: selectedService.id,
            practitionerId: selectedProvider?.id,
            startTime: selectedTime,
          }
        ],
      });
      
      // Navigate to group details
      router.replace('/groups/' + group.id);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header with step progress */}
      {/* Step content based on currentStep */}
      {/* Navigation buttons */}
    </View>
  );
}
```

### UI Elements
- **Step 1:**
  - Text input for group name
  - Event type selector (4 cards with icons)
  - Date picker
  - Expected size slider (2-20)
  - Discount preview badge

- **Step 2:**
  - Service category grid
  - Service list with prices
  - Provider selection (or "Any Available")
  - Date/time slot grid

- **Step 3:**
  - Add contact button
  - Contact list with remove option
  - Import from contacts button
  - Manual entry fields

- **Step 4:**
  - Payment mode cards
  - Deposit explanation
  - Price summary
  - Terms checkbox
  - Create button (gradient)

---

## Screen 2: Join Group (`/apps/patient-mobile/app/groups/join.tsx`)

### Purpose
Allow members to join an existing group via code or link.

### Key Features
- Auto-fill code from deep link
- Manual code entry
- Group preview before joining
- Service selection
- Time coordination
- Quick payment option

### Implementation Outline
```typescript
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { groupService } from '../../services/groupService';
import { GroupBooking } from '@medical-spa/types';

export default function JoinGroupScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [bookingCode, setBookingCode] = useState(code || '');
  const [group, setGroup] = useState<GroupBooking | null>(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (code) {
      loadGroup(code);
    }
  }, [code]);
  
  const loadGroup = async (groupCode: string) => {
    setLoading(true);
    try {
      const data = await groupService.getGroupBookingByCode(groupCode);
      setGroup(data);
    } catch (error) {
      console.error('Failed to load group:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinGroup = async () => {
    if (!group || !selectedService) return;
    
    try {
      await groupService.joinGroupBooking({
        bookingCode: group.bookingCode,
        patientId: 'current-user-id',
        serviceId: selectedService.id,
        preferredTime: selectedTime,
      });
      
      // Navigate to group details
      router.push('/groups/' + group.id);
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Code entry section */}
      {!group && (
        <View>
          <TextInput 
            value={bookingCode}
            onChangeText={setBookingCode}
            placeholder="Enter booking code"
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity onPress={() => loadGroup(bookingCode)}>
            <Text>Find Group</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Group preview */}
      {group && (
        <ScrollView>
          {/* Group name and coordinator */}
          {/* Current participants */}
          {/* Discount badge */}
          {/* Service selection */}
          {/* Time coordination */}
          {/* Join button */}
        </ScrollView>
      )}
    </View>
  );
}
```

### UI Elements
- Code input with auto-format (XXXX##)
- Group info card:
  - Event icon
  - Group name
  - Coordinator name
  - Event date
  - Discount badge
- Member avatars (stacked circles)
- Progress: "4 of 8 booked"
- Service selector
- Time slots (coordinated with group)
- Join button with price

---

## Screen 3: Group Details (`/apps/patient-mobile/app/groups/[id].tsx`)

### Purpose
Central hub for viewing and managing a group booking.

### Key Features
- Different views for coordinator vs member
- Member list with status badges
- Timeline visualization
- Payment summary
- Activity feed
- Quick actions (invite, remind, chat)

### Implementation Outline
```typescript
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { groupService } from '../../services/groupService';
import { GroupBooking, GroupBookingParticipant } from '@medical-spa/types';
import { GroupMemberCard } from '../../components/groups/GroupMemberCard';
import { GroupTimeline } from '../../components/groups/GroupTimeline';
import { format } from 'date-fns';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);
  
  const currentUserId = 'p1'; // From auth context
  const isCoordinator = group?.coordinatorPatientId === currentUserId;
  
  useEffect(() => {
    loadGroup();
  }, [id]);
  
  const loadGroup = async () => {
    try {
      const data = await groupService.getGroupBooking(id);
      setGroup(data);
    } catch (error) {
      console.error('Failed to load group:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = async () => {
    if (!group) return;
    
    const inviteLink = groupService.getInviteLink(group.bookingCode);
    const message = `Join my group booking "${group.name}"!\nCode: ${group.bookingCode}\n${inviteLink}`;
    
    try {
      await Share.share({
        message,
        title: 'Join my group booking',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.groupName}>{group?.name}</Text>
        <Text style={styles.bookingCode}>Code: {group?.bookingCode}</Text>
      </View>
      
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {group?.participants.filter(p => p.status === 'confirmed').length}/{group?.participants.length}
          </Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ${group?.totalDiscountedPrice.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{group?.discountPercent}%</Text>
          <Text style={styles.statLabel}>Discount</Text>
        </View>
      </View>
      
      {/* Timeline */}
      {group && <GroupTimeline participants={group.participants} schedulingMode={group.schedulingMode} />}
      
      {/* Members */}
      <Text style={styles.sectionTitle}>Members</Text>
      {group?.participants.map(participant => (
        <GroupMemberCard
          key={participant.patientId}
          participant={participant}
          isCoordinator={isCoordinator}
          canRemove={isCoordinator && participant.patientId !== currentUserId}
        />
      ))}
      
      {/* Coordinator Actions */}
      {isCoordinator && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#8B5CF6" />
            <Text style={styles.actionText}>Share Invite</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/groups/' + id + '/chat')}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#8B5CF6" />
            <Text style={styles.actionText}>Group Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
```

### UI Elements
- Header:
  - Group name
  - Booking code (copiable)
  - Share button
- Stats cards (3 across):
  - Confirmed count
  - Total price
  - Discount %
- Timeline view (horizontal scroll)
- Member list:
  - Avatar + initials
  - Name
  - Service name
  - Time
  - Status badge
  - Payment status
- Action buttons (coordinator):
  - Invite more
  - Send reminder
  - Group chat
  - Manage payment
  - Cancel group

---

## Screen 4: Group Chat (`/apps/patient-mobile/app/groups/chat/[id].tsx`)

### Purpose
WhatsApp-style chat for group coordination.

### Key Features
- Real-time messaging
- System messages (booking updates)
- Read receipts
- Typing indicators
- Coordinator badge
- Share photos/files

### Implementation Outline
```typescript
import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { groupService } from '../../../services/groupService';
import { GroupChatMessage } from '@medical-spa/types';
import { format } from 'date-fns';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const currentUserId = 'p1';
  
  useEffect(() => {
    loadMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);
  
  const loadMessages = async () => {
    try {
      const data = await groupService.getChatMessages(id);
      setMessages(data);
      
      // Mark as read
      await groupService.markMessagesAsRead(id, currentUserId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };
  
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await groupService.sendChatMessage({
        groupBookingId: id,
        senderId: currentUserId,
        message: newMessage.trim(),
      });
      
      setNewMessage('');
      loadMessages();
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const renderMessage = ({ item }: { item: GroupChatMessage }) => {
    const isMe = item.senderId === currentUserId;
    const isSystem = item.isSystemMessage;
    
    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.message}</Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && (
          <Text style={styles.senderName}>
            {item.senderName}
            {item.isCoordinator && ' 👑'}
          </Text>
        )}
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.messageTime}>
          {format(new Date(item.sentAt), 'h:mm a')}
        </Text>
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
```

### UI Elements
- Messages list (inverted FlatList)
- Message bubbles:
  - Left-aligned for others
  - Right-aligned for self
  - Different colors
  - Sender name (if not self)
  - Coordinator crown icon
  - Timestamp
  - Read receipts (checkmarks)
- System messages (centered, gray):
  - "Sarah joined the group"
  - "Emily confirmed her booking"
  - "Group discount updated to 10%"
- Input bar:
  - Text input (grows with content)
  - Send button (gradient)
  - Optional: Photo/file attach

---

## Screen 5: My Groups List (`/apps/patient-mobile/app/groups/index.tsx`)

(See earlier implementation - complete with animations, refresh, empty states)

---

## Components

### Component: GroupMemberCard

```typescript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroupBookingParticipant, getStatusColor, getStatusLabel } from '@medical-spa/types';
import { format } from 'date-fns';

interface GroupMemberCardProps {
  participant: GroupBookingParticipant;
  isCoordinator: boolean;
  canRemove: boolean;
  onRemove?: () => void;
  onReschedule?: () => void;
}

export function GroupMemberCard({ 
  participant, 
  isCoordinator, 
  canRemove,
  onRemove,
  onReschedule 
}: GroupMemberCardProps) {
  const statusColor = getStatusColor(participant.status);
  const statusLabel = getStatusLabel(participant.status);
  
  return (
    <View style={styles.card}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.initials}>{participant.initials}</Text>
      </View>
      
      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{participant.patientName}</Text>
        <Text style={styles.service}>{participant.serviceName}</Text>
        <Text style={styles.time}>
          {format(new Date(participant.startTime), 'h:mm a')} • {participant.duration} min
        </Text>
      </View>
      
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusLabel}
        </Text>
      </View>
      
      {/* Actions */}
      {canRemove && (
        <TouchableOpacity onPress={onRemove}>
          <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  service: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  time: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
```

### Component: GroupTimeline

```typescript
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { GroupBookingParticipant } from '@medical-spa/types';
import { format } from 'date-fns';

interface GroupTimelineProps {
  participants: GroupBookingParticipant[];
  schedulingMode: 'simultaneous' | 'staggered_15' | 'staggered_30' | 'custom';
}

export function GroupTimeline({ participants, schedulingMode }: GroupTimelineProps) {
  // Sort by start time
  const sorted = [...participants].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timeline</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeline}>
          {sorted.map((participant, index) => (
            <View key={participant.patientId} style={styles.slot}>
              <View style={styles.timeLabel}>
                <Text style={styles.timeText}>
                  {format(new Date(participant.startTime), 'h:mm a')}
                </Text>
              </View>
              <View style={[styles.appointmentCard, { 
                height: participant.duration * 1.5, // Scale: 1 min = 1.5px
              }]}>
                <Text style={styles.participantInitials}>{participant.initials}</Text>
                <Text style={styles.participantName} numberOfLines={1}>
                  {participant.patientName}
                </Text>
                <Text style={styles.duration}>{participant.duration}m</Text>
              </View>
              {index < sorted.length - 1 && <View style={styles.connector} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  slot: {
    marginRight: 12,
  },
  timeLabel: {
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  appointmentCard: {
    width: 80,
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  participantInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  participantName: {
    fontSize: 11,
    color: '#1F2937',
    marginTop: 4,
  },
  duration: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
});
```

### Component: GroupInviteModal

```typescript
import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  Share,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GroupBooking } from '@medical-spa/types';
import { groupService } from '../../services/groupService';

interface GroupInviteModalProps {
  visible: boolean;
  group: GroupBooking;
  onClose: () => void;
  onInvitesSent: (count: number) => void;
}

export function GroupInviteModal({ visible, group, onClose, onInvitesSent }: GroupInviteModalProps) {
  const [invites, setInvites] = useState<Array<{ name: string; phone: string }>>([
    { name: '', phone: '' }
  ]);
  const [sending, setSending] = useState(false);
  
  const inviteLink = groupService.getInviteLink(group.bookingCode);
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my group booking "${group.name}"!\nCode: ${group.bookingCode}\n${inviteLink}`,
        title: 'Join my group booking',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };
  
  const handleSendInvites = async () => {
    const validInvites = invites.filter(inv => inv.name && inv.phone);
    if (validInvites.length === 0) return;
    
    setSending(true);
    try {
      await groupService.sendGroupInvites({
        groupBookingId: group.id,
        recipients: validInvites.map(inv => ({
          name: inv.name,
          phone: inv.phone,
        })),
      });
      
      onInvitesSent(validInvites.length);
      onClose();
    } catch (error) {
      console.error('Failed to send invites:', error);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite Members</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content}>
          {/* Booking Code */}
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Booking Code</Text>
            <Text style={styles.code}>{group.bookingCode}</Text>
            <Text style={styles.codeHint}>Share this code with members to join</Text>
          </View>
          
          {/* Quick Share */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color="#8B5CF6" />
            <Text style={styles.shareButtonText}>Share Invite Link</Text>
          </TouchableOpacity>
          
          {/* Or divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or send directly</Text>
            <View style={styles.dividerLine} />
          </View>
          
          {/* Invite List */}
          {invites.map((invite, index) => (
            <View key={index} style={styles.inviteRow}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={invite.name}
                onChangeText={text => {
                  const newInvites = [...invites];
                  newInvites[index].name = text;
                  setInvites(newInvites);
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={invite.phone}
                onChangeText={text => {
                  const newInvites = [...invites];
                  newInvites[index].phone = text;
                  setInvites(newInvites);
                }}
                keyboardType="phone-pad"
              />
              {invites.length > 1 && (
                <TouchableOpacity
                  onPress={() => setInvites(invites.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setInvites([...invites, { name: '', phone: '' }])}
          >
            <Ionicons name="add" size={20} color="#8B5CF6" />
            <Text style={styles.addButtonText}>Add Another</Text>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Send Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.sendButton} onPress={handleSendInvites} disabled={sending}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendButtonText}>
                {sending ? 'Sending...' : 'Send Invites'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 12,
  },
  inviteRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sendButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```

---

## Complete Implementation Checklist

### Screens ✅
- [x] My Groups (index.tsx)
- [ ] Create Group (create.tsx) - Template provided
- [ ] Join Group (join.tsx) - Template provided
- [ ] Group Details ([id].tsx) - Template provided
- [ ] Group Chat (chat/[id].tsx) - Template provided

### Components ✅
- [x] GroupMemberCard - Complete
- [x] GroupTimeline - Complete
- [x] GroupInviteModal - Complete
- [ ] GroupPaymentSummary - Similar to others
- [ ] GroupActivityFeed - Simple list

### Services ✅
- [x] groupService.ts - Complete with mock data

### Integration
- [ ] Deep linking setup
- [ ] Push notifications
- [ ] Analytics tracking
- [ ] Error boundaries

