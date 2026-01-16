import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  sender: 'patient' | 'provider' | 'ai';
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  provider: { name: string; role: string };
  messages: Message[];
}

const getConversationById = (id: string): Conversation | null => {
  const mockConversations: Record<string, Conversation> = {
    '1': {
      id: '1',
      provider: { name: 'Dr. Sarah Chen', role: 'Medical Director' },
      messages: [
        { id: 'm1', text: 'Hi! How are you feeling after your Botox treatment?', sender: 'provider', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), read: true },
        { id: 'm2', text: 'Feeling great, thank you!', sender: 'patient', timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000), read: true },
        { id: 'm3', text: 'Your results are looking great! Let me know if you have questions.', sender: 'provider', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), read: true },
      ],
    },
    '2': {
      id: '2',
      provider: { name: 'Emma Wilson', role: 'Aesthetician' },
      messages: [
        { id: 'm1', text: 'Reminder about your Hydrafacial next week!', sender: 'provider', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), read: true },
        { id: 'm2', text: 'Thanks for the reminder!', sender: 'patient', timestamp: new Date(Date.now() - 47 * 60 * 60 * 1000), read: true },
      ],
    },
  };
  return mockConversations[id] || null;
};

export default function MessageThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const conversation = getConversationById(id || '1');

  useEffect(() => {
    if (conversation) setMessages(conversation.messages);
  }, [id]);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  if (!conversation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#6b21a8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not Found</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
    );
  }

  const formatTime = (date: Date) => {
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = { id: 'm' + Date.now(), text: newMessage.trim(), sender: 'patient', timestamp: new Date(), read: true };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: 'm' + (Date.now() + 1), text: 'Thanks for your message!', sender: 'ai', timestamp: new Date(), read: false }]);
    }, 1500);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isPatient = item.sender === 'patient';
    return (
      <Animated.View entering={FadeInUp.delay(index * 50)} style={[styles.messageContainer, isPatient ? styles.patientMessage : styles.providerMessage]}>
        {item.sender === 'ai' && <View style={styles.aiIndicator}><Ionicons name="sparkles" size={12} color="#8b5cf6" /><Text style={styles.aiText}>AI</Text></View>}
        <View style={[styles.messageBubble, isPatient ? styles.patientBubble : styles.providerBubble]}>
          <Text style={[styles.messageText, isPatient && { color: 'white' }]}>{item.text}</Text>
        </View>
        <Text style={[styles.timestamp, isPatient && { textAlign: 'right' }]}>{formatTime(item.timestamp)}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#6b21a8" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.providerAvatar}>
            <Text style={styles.providerInitials}>{conversation.provider.name.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          <View>
            <Text style={styles.providerName}>{conversation.provider.name}</Text>
            <Text style={styles.providerRole}>{conversation.provider.role}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callButton}><Ionicons name="call-outline" size={22} color="#6b21a8" /></TouchableOpacity>
      </View>

      <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={item => item.id} contentContainerStyle={styles.messagesList} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.textInput} placeholder="Type a message..." value={newMessage} onChangeText={setNewMessage} multiline />
            <TouchableOpacity style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]} onPress={handleSend} disabled={!newMessage.trim()}>
              <Ionicons name="send" size={20} color={newMessage.trim() ? 'white' : '#9ca3af'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 4 },
  providerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  providerInitials: { color: 'white', fontSize: 14, fontWeight: '600' },
  providerName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  providerRole: { fontSize: 12, color: '#6b7280' },
  callButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: '#1f2937', textAlign: 'center' },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageContainer: { marginBottom: 16, maxWidth: '80%' },
  patientMessage: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  providerMessage: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  aiIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  aiText: { fontSize: 11, color: '#8b5cf6', fontWeight: '500' },
  messageBubble: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
  patientBubble: { backgroundColor: '#7c3aed', borderBottomRightRadius: 4 },
  providerBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  messageText: { fontSize: 15, color: '#1f2937', lineHeight: 20 },
  timestamp: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  inputContainer: { backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingHorizontal: 16, paddingTop: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#f3f4f6', borderRadius: 24, paddingLeft: 16, paddingRight: 4, paddingVertical: 4 },
  textInput: { flex: 1, fontSize: 16, color: '#1f2937', maxHeight: 100, paddingVertical: 8 },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendButtonDisabled: { backgroundColor: '#e5e7eb' },
});
