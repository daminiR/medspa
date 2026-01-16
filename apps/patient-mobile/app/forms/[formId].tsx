/**
 * Form View Screen
 *
 * Displays and allows completion of a specific form.
 * Handles form submission, draft saving, and navigation.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FormRenderer, FormRendererRef } from '@/components/forms';
import { formService } from '@/services/forms/formService';
import type {
  FormSchema,
  FormSubmission,
  PatientPrefillData,
  FormFieldResponse,
  SignatureData,
} from '@medical-spa/types';

export default function FormViewScreen() {
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const router = useRouter();
  const formRef = useRef<FormRendererRef>(null);

  const [form, setForm] = useState<FormSchema | null>(null);
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [prefillData, setPrefillData] = useState<PatientPrefillData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load form data
  useEffect(() => {
    const loadForm = async () => {
      if (!formId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await formService.getForm(formId);
        setForm(response.form);
        setSubmission(response.submission || null);
        setPrefillData(response.prefillData || null);
      } catch (err) {
        setError('Failed to load form. Please try again.');
        console.error('Error loading form:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  // Handle back navigation with unsaved changes
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Would you like to save before leaving?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
          { text: 'Save Draft', onPress: () => formRef.current?.saveDraft() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      router.back();
    }
  }, [hasUnsavedChanges, router]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (responses: FormFieldResponse[], signatures: SignatureData[]) => {
      if (!formId) return;

      try {
        const result = await formService.submitForm(
          formId,
          submission?.id || 'new',
          responses,
          signatures
        );

        if (result.success) {
          setHasUnsavedChanges(false);
          Alert.alert(
            'Form Submitted',
            form?.settings.successMessage || 'Thank you! Your form has been submitted successfully.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } else {
          Alert.alert('Submission Failed', result.message || 'Please try again.');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to submit form. Please try again.');
        console.error('Error submitting form:', err);
      }
    },
    [formId, submission, form, router]
  );

  // Handle draft save
  const handleSaveDraft = useCallback(
    async (responses: FormFieldResponse[], signatures: SignatureData[], progress: number) => {
      if (!formId) return;

      try {
        await formService.saveDraft(formId, submission?.id, responses, signatures, progress);
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error('Error saving draft:', err);
      }
    },
    [formId, submission]
  );

  // Handle progress change
  const handleProgressChange = useCallback((progress: number) => {
    setHasUnsavedChanges(true);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Loading...',
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            ),
          }}
        />
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading form...</Text>
      </SafeAreaView>
    );
  }

  if (error || !form) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Error',
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            ),
          }}
        />
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Unable to Load Form</Text>
        <Text style={styles.errorText}>{error || 'Form not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: form.title,
          headerBackTitle: 'Forms',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              {hasUnsavedChanges && (
                <View style={styles.unsavedIndicator}>
                  <Text style={styles.unsavedText}>Unsaved</Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <FormRenderer
        ref={formRef}
        schema={form}
        initialResponses={submission?.responses || []}
        initialSignatures={submission?.signatures || []}
        prefillData={prefillData || undefined}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onProgressChange={handleProgressChange}
        autoSaveEnabled={form.settings.allowDraft}
        autoSaveInterval={(form.settings.autoSaveInterval || 30) * 1000}
        showProgress={form.settings.showProgressBar}
        showNavigation={form.settings.showSectionNavigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  errorText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unsavedIndicator: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unsavedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D97706',
  },
});
