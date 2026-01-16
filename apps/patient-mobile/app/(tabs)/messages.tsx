import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  sender: 'patient' | 'provider' | 'ai';
  timestamp: Date;
  read: boolean;
  aiSuggested?: boolean;
}

interface Conversation {
  id: string;
  provider: {
    name: string;
    role: string;
    avatar?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

// Mock data
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    provider: {
      name: 'Dr. Sarah Chen',
      role: 'Medical Director',
    },
    lastMessage: {
      id: 'm1',
      text: 'Your Botox results are looking great! Let me know if you have any questions.',
      sender: 'provider',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    unreadCount: 1,
  },
  {
    id: '2',
    provider: {
      name: 'Emma Wilson',
      role: 'Aesthetician',
    },
    lastMessage: {
      id: 'm2',
      text: 'Thank you! I\'ll see you at your next HydraFacial appointment.',
      sender: 'patient',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true,
    },
    unreadCount: 0,
  },
  {
    id: 'ai',
    provider: {
      name: 'Luxe AI Assistant',
      role: 'Available 24/7',
    },
    lastMessage: {
      id: 'ai1',
      text: 'Hi! I can help you with booking, product questions, and post-care instructions.',
      sender: 'ai',
      timestamp: new Date(),
      read: true,
      aiSuggested: true,
    },
    unreadCount: 0,
  },
];

const MOCK_THREAD_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hi Dr. Chen! I had my Botox treatment 2 days ago and wanted to check if the slight bruising is normal?',
    sender: 'patient',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '2',
    text: 'Hi! Yes, minor bruising at injection sites is completely normal and should resolve within 3-5 days. Apply gentle cold compresses if needed. Avoid rubbing the area.',
    sender: 'provider',
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '3',
    text: 'That\'s a relief! When should I expect to see the full results?',
    sender: 'patient',
    timestamp: new Date(Date.now() - 2.2 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '4',
    text: 'Your Botox results are looking great! Let me know if you have any questions. Full effects typically appear 10-14 days after treatment. We\'ll schedule a follow-up at the 2-week mark to assess.',
    sender: 'provider',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
];

type ViewMode = 'conversations' | 'thread';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>(MOCK_THREAD_MESSAGES);
  const flatListRef = useRef<FlatList>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const openThread = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setViewMode('thread');
  };

  const goBack = () => {
    setViewMode('conversations');
    setSelectedConversation(null);
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText.trim(),
      sender: 'patient',
      timestamp: new Date(),
      read: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Conversations List View
  if (viewMode === 'conversations') {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        <FlatList
          data={MOCK_CONVERSATIONS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(400).delay(index * 100)}>
              <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => openThread(item)}
              >
                {/* Avatar */}
                <View style={[
                  styles.avatar,
                  item.id === 'ai' && styles.aiAvatar
                ]}>
                  {item.id === 'ai' ? (
                    <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.avatarText}>
                      {item.provider.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  )}
                </View>

                {/* Content */}
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.providerName}>{item.provider.name}</Text>
                    <Text style={styles.timestamp}>{formatTime(item.lastMessage.timestamp)}</Text>
                  </View>
                  <Text style={styles.providerRole}>{item.provider.role}</Text>
                  <Text
                    style={[
                      styles.lastMessage,
                      !item.lastMessage.read && styles.unreadMessage
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage.sender === 'patient' ? 'You: ' : ''}
                    {item.lastMessage.text}
                  </Text>
                </View>

                {/* Unread Badge */}
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
          ListHeaderComponent={() => (
            <Animated.View entering={FadeIn.duration(400)}>
              {/* AI Assistant Banner */}
              <TouchableOpacity
                style={styles.aiBanner}
                onPress={() => openThread(MOCK_CONVERSATIONS.find(c => c.id === 'ai')!)}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.aiBannerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.aiBannerIcon}>
                    <Ionicons name="sparkles" size={24} color="#8B5CF6" />
                  </View>
                  <View style={styles.aiBannerContent}>
                    <Text style={styles.aiBannerTitle}>Need Quick Help?</Text>
                    <Text style={styles.aiBannerText}>
                      Our AI assistant is available 24/7
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      </View>
    );
  }

  // Thread View
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Thread Header */}
      <View style={[styles.threadHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.threadHeaderContent}>
          <Text style={styles.threadHeaderName}>{selectedConversation?.provider.name}</Text>
          <Text style={styles.threadHeaderRole}>{selectedConversation?.provider.role}</Text>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === 'patient' ? styles.patientBubble : styles.providerBubble
            ]}
          >
            <Text style={[
              styles.messageText,
              item.sender === 'patient' && styles.patientMessageText
            ]}>
              {item.text}
            </Text>
            <Text style={[
              styles.messageTime,
              item.sender === 'patient' && styles.patientMessageTime
            ]}>
              {formatMessageTime(item.timestamp)}
            </Text>
          </View>
        )}
      />

      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle-outline" size={28} color="#8B5CF6" />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!messageText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={messageText.trim() ? '#FFFFFF' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  listContent: {
    paddingBottom: 100,
  },
  aiBanner: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  aiBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerContent: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiBannerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatar: {
    backgroundColor: '#10B981',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  providerRole: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  unreadMessage: {
    color: '#1F2937',
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Thread styles
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadHeaderContent: {
    flex: 1,
  },
  threadHeaderName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  threadHeaderRole: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoButton: {
    padding: 8,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  patientBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  providerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  patientMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  patientMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  attachButton: {
    padding: 4,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  textInput: {
    fontSize: 15,
    color: '#1F2937',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
