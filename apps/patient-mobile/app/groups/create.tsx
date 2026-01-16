import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { groupService } from '@/services/groupService';

type EventType = 'bridal' | 'corporate' | 'friends' | 'family' | 'other';
type PaymentMode = 'individual' | 'coordinator' | 'split';
type SchedulingMode = 'simultaneous' | 'staggered_15' | 'staggered_30';

const EVENT_TYPES: { id: EventType; label: string; icon: string }[] = [
  { id: 'bridal', label: 'Bridal Party', icon: 'flower' },
  { id: 'corporate', label: 'Corporate Event', icon: 'briefcase' },
  { id: 'friends', label: 'Friends', icon: 'people' },
  { id: 'family', label: 'Family', icon: 'home' },
  { id: 'other', label: 'Other', icon: 'ellipse' },
];

const PAYMENT_MODES: { id: PaymentMode; label: string; description: string }[] = [
  { id: 'individual', label: 'Individual', description: 'Each person pays separately' },
  { id: 'coordinator', label: 'Coordinator', description: 'You pay for everyone' },
  { id: 'split', label: 'Split', description: 'Cost divided equally' },
];

const SCHEDULING_MODES: { id: SchedulingMode; label: string; description: string }[] = [
  { id: 'simultaneous', label: 'Simultaneous', description: 'All at the same time' },
  { id: 'staggered_15', label: 'Staggered (15 min)', description: '15 minutes apart' },
  { id: 'staggered_30', label: 'Staggered (30 min)', description: '30 minutes apart' },
];

export default function CreateGroupScreen() {
  const insets = useSafeAreaInsets();
  const [groupName, setGroupName] = useState('');
  const [eventType, setEventType] = useState<EventType>('friends');
  const [date, setDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 1 week from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState('8');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('individual');
  const [schedulingMode, setSchedulingMode] = useState<SchedulingMode>('staggered_30');
  const [depositRequired, setDepositRequired] = useState(false);
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);

  // Mock current user
  const currentUser = {
    patientId: 'p1',
    patientName: 'Current User',
    patientEmail: 'user@email.com',
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (parseInt(maxParticipants) < 2) {
      Alert.alert('Error', 'Minimum 2 participants required');
      return;
    }

    setCreating(true);

    try {
      const result = await groupService.createGroupBooking({
        name: groupName.trim(),
        eventType,
        date,
        eventDate: date,
        schedulingMode,
        maxParticipants: parseInt(maxParticipants),
        paymentMode,
        depositRequired,
        notes: notes.trim() || undefined,
        coordinatorPatientId: currentUser.patientId,
        participants: [
          {
            patientId: currentUser.patientId,
            serviceId: 's1',
            practitionerId: 'pr1',
          },
        ],
      });

      if (result) {
        Alert.alert(
          'Success!',
          `Group "${groupName}" created! Your booking code is ${result.bookingCode}`,
          [
            {
              text: 'View Group',
              onPress: () => router.replace(`/groups/${result.id}` as any),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Create Group</Text>
          <Text style={styles.headerSubtitle}>Organize a spa day with friends</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Group Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Sarah's Bridal Party"
            placeholderTextColor="#9CA3AF"
            value={groupName}
            onChangeText={setGroupName}
            maxLength={50}
          />
        </View>

        {/* Event Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Type</Text>
          <View style={styles.eventTypeGrid}>
            {EVENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.eventTypeCard,
                  eventType === type.id && styles.eventTypeCardSelected,
                ]}
                onPress={() => setEventType(type.id)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={eventType === type.id ? '#8B5CF6' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.eventTypeLabel,
                    eventType === type.id && styles.eventTypeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.dateButtonText}>
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Max Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum Participants</Text>
          <TextInput
            style={styles.textInput}
            placeholder="8"
            placeholderTextColor="#9CA3AF"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.helpText}>
            Unlock group discounts: 2 guests = 5% off, 3-4 = 10% off, 5-9 = 15% off, 10+ = 20% off
          </Text>
        </View>

        {/* Scheduling Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduling</Text>
          <View style={styles.radioGroup}>
            {SCHEDULING_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.radioOption,
                  schedulingMode === mode.id && styles.radioOptionSelected,
                ]}
                onPress={() => setSchedulingMode(mode.id)}
              >
                <View style={styles.radio}>
                  {schedulingMode === mode.id && <View style={styles.radioInner} />}
                </View>
                <View style={styles.radioContent}>
                  <Text
                    style={[
                      styles.radioLabel,
                      schedulingMode === mode.id && styles.radioLabelSelected,
                    ]}
                  >
                    {mode.label}
                  </Text>
                  <Text style={styles.radioDescription}>{mode.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.radioGroup}>
            {PAYMENT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.radioOption,
                  paymentMode === mode.id && styles.radioOptionSelected,
                ]}
                onPress={() => setPaymentMode(mode.id)}
              >
                <View style={styles.radio}>
                  {paymentMode === mode.id && <View style={styles.radioInner} />}
                </View>
                <View style={styles.radioContent}>
                  <Text
                    style={[
                      styles.radioLabel,
                      paymentMode === mode.id && styles.radioLabelSelected,
                    ]}
                  >
                    {mode.label}
                  </Text>
                  <Text style={styles.radioDescription}>{mode.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Deposit */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setDepositRequired(!depositRequired)}
          >
            <View style={[styles.checkbox, depositRequired && styles.checkboxChecked]}>
              {depositRequired && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>Require deposit</Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any special requirements or preferences..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={styles.charCount}>{notes.length}/200</Text>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={creating}
        >
          <Text style={styles.createButtonText}>
            {creating ? 'Creating...' : 'Create Group'}
          </Text>
          {!creating && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 16,
  },
  eventTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  eventTypeCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  eventTypeCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  eventTypeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  eventTypeLabelSelected: {
    color: '#8B5CF6',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  radioGroup: {
    gap: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
  },
  radioOptionSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  radioLabelSelected: {
    color: '#8B5CF6',
  },
  radioDescription: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
