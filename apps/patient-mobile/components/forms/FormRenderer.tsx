/**
 * FormRenderer Component
 *
 * Dynamic form rendering engine that processes JSON form schemas
 * and renders complete interactive forms with validation,
 * conditional logic, progress tracking, and auto-save.
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  FormSchema,
  FormSection,
  FormField as FormFieldType,
  FormFieldResponse,
  SignatureData,
  PatientPrefillData,
  ConditionalLogic,
  ConditionalRule,
  FormValidationResult,
  FieldValidationResult,
} from '@medical-spa/types';
import { FormField } from './FormField';
import { FormProgress, FormSectionProgress } from './FormProgress';
import { SignaturePad, SignaturePadRef } from './SignaturePad';

export interface FormRendererRef {
  validate: () => FormValidationResult;
  getResponses: () => FormFieldResponse[];
  getSignatures: () => SignatureData[];
  saveDraft: () => void;
  submit: () => void;
  goToSection: (index: number) => void;
}

export interface FormRendererProps {
  schema: FormSchema;
  initialResponses?: FormFieldResponse[];
  initialSignatures?: SignatureData[];
  prefillData?: PatientPrefillData;
  onSubmit?: (responses: FormFieldResponse[], signatures: SignatureData[]) => void;
  onSaveDraft?: (responses: FormFieldResponse[], signatures: SignatureData[], progress: number) => void;
  onProgressChange?: (progress: number) => void;
  onValidationError?: (errors: FieldValidationResult[]) => void;
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number;
  readOnly?: boolean;
  showProgress?: boolean;
  showNavigation?: boolean;
  testID?: string;
}

export const FormRenderer = forwardRef<FormRendererRef, FormRendererProps>(
  (
    {
      schema,
      initialResponses = [],
      initialSignatures = [],
      prefillData,
      onSubmit,
      onSaveDraft,
      onProgressChange,
      onValidationError,
      autoSaveEnabled = true,
      autoSaveInterval = 30000,
      readOnly = false,
      showProgress = true,
      showNavigation = true,
      testID,
    },
    ref
  ) => {
    // State
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, unknown>>(() => {
      const initial: Record<string, unknown> = {};
      initialResponses.forEach((r) => {
        initial[r.fieldId] = r.value;
      });
      return initial;
    });
    const [signatures, setSignatures] = useState<SignatureData[]>(initialSignatures);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());
    const [disabledFields, setDisabledFields] = useState<Set<string>>(new Set());

    // Refs
    const signatureRef = useRef<SignaturePadRef>(null);
    const scrollRef = useRef<ScrollView>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Get prefill value for a field
    const getPrefillValue = useCallback(
      (field: FormFieldType): unknown => {
        if (!prefillData || !field.prefillKey) return undefined;
        const keys = field.prefillKey.split('.');
        let value: unknown = prefillData;
        for (const key of keys) {
          if (value && typeof value === 'object' && key in value) {
            value = (value as Record<string, unknown>)[key];
          } else {
            return undefined;
          }
        }
        return value;
      },
      [prefillData]
    );

    // Evaluate conditional logic
    const evaluateCondition = useCallback(
      (rule: ConditionalRule): boolean => {
        const sourceValue = responses[rule.sourceFieldId];

        switch (rule.operator) {
          case 'equals':
            return sourceValue === rule.value;
          case 'notEquals':
            return sourceValue !== rule.value;
          case 'contains':
            return String(sourceValue).includes(String(rule.value));
          case 'notContains':
            return !String(sourceValue).includes(String(rule.value));
          case 'greaterThan':
            return Number(sourceValue) > Number(rule.value);
          case 'lessThan':
            return Number(sourceValue) < Number(rule.value);
          case 'greaterThanOrEqual':
            return Number(sourceValue) >= Number(rule.value);
          case 'lessThanOrEqual':
            return Number(sourceValue) <= Number(rule.value);
          case 'isEmpty':
            return !sourceValue || sourceValue === '' || (Array.isArray(sourceValue) && sourceValue.length === 0);
          case 'isNotEmpty':
            return !!sourceValue && sourceValue !== '' && (!Array.isArray(sourceValue) || sourceValue.length > 0);
          case 'includes':
            return Array.isArray(sourceValue) && sourceValue.includes(rule.value);
          case 'notIncludes':
            return !Array.isArray(sourceValue) || !sourceValue.includes(rule.value);
          default:
            return true;
        }
      },
      [responses]
    );

    // Apply conditional logic to determine field visibility/state
    useEffect(() => {
      const newHidden = new Set<string>();
      const newDisabled = new Set<string>();

      schema.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.conditionalLogic) {
            const { rules, logic } = field.conditionalLogic;
            const results = rules.map((rule) => evaluateCondition(rule));
            const conditionMet = logic === 'and' ? results.every(Boolean) : results.some(Boolean);

            rules.forEach((rule) => {
              if (conditionMet) {
                if (rule.action === 'hide') {
                  newHidden.add(rule.targetFieldId || field.id);
                } else if (rule.action === 'show') {
                  // Field is visible by default, do nothing
                } else if (rule.action === 'disable') {
                  newDisabled.add(rule.targetFieldId || field.id);
                }
              } else {
                if (rule.action === 'show') {
                  newHidden.add(rule.targetFieldId || field.id);
                }
              }
            });
          }
        });
      });

      setHiddenFields(newHidden);
      setDisabledFields(newDisabled);
    }, [responses, schema, evaluateCondition]);

    // Calculate progress
    const progress = useMemo(() => {
      let totalFields = 0;
      let completedFields = 0;

      schema.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (hiddenFields.has(field.id)) return;
          if (['header', 'paragraph', 'divider', 'spacer'].includes(field.type)) return;

          totalFields++;
          const value = responses[field.id];
          if (value !== undefined && value !== null && value !== '') {
            completedFields++;
          }
        });
      });

      // Include signature in progress if required
      if (schema.signature?.required) {
        totalFields++;
        if (signatures.length > 0) {
          completedFields++;
        }
      }

      return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    }, [responses, signatures, schema, hiddenFields]);

    // Section progress for FormProgress component
    const sectionsProgress: FormSectionProgress[] = useMemo(() => {
      return schema.sections.map((section, index) => {
        const visibleFields = section.fields.filter(
          (f) => !hiddenFields.has(f.id) && !['header', 'paragraph', 'divider', 'spacer'].includes(f.type)
        );
        const completedFields = visibleFields.filter((f) => {
          const value = responses[f.id];
          return value !== undefined && value !== null && value !== '';
        });
        const fieldErrors = visibleFields.filter((f) => errors[f.id]);

        return {
          id: section.id,
          title: section.title,
          totalFields: visibleFields.length,
          completedFields: completedFields.length,
          hasErrors: fieldErrors.length > 0,
          isActive: index === currentSectionIndex,
        };
      });
    }, [schema.sections, responses, errors, currentSectionIndex, hiddenFields]);

    // Notify parent of progress changes
    useEffect(() => {
      onProgressChange?.(progress);
    }, [progress, onProgressChange]);

    // Auto-save functionality
    useEffect(() => {
      if (!autoSaveEnabled || readOnly || !isDirty) return;

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        const formResponses = getFormResponses();
        onSaveDraft?.(formResponses, signatures, progress);
        setIsDirty(false);
      }, autoSaveInterval);

      return () => {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
      };
    }, [responses, isDirty, autoSaveEnabled, autoSaveInterval, readOnly, onSaveDraft, progress, signatures]);

    // Convert responses to FormFieldResponse array
    const getFormResponses = useCallback((): FormFieldResponse[] => {
      return Object.entries(responses).map(([fieldId, value]) => ({
        fieldId,
        value,
        timestamp: new Date().toISOString(),
      }));
    }, [responses]);

    // Validate a single field
    const validateField = useCallback(
      (field: FormFieldType, value: unknown): string | undefined => {
        if (field.required) {
          if (value === undefined || value === null || value === '') {
            return 'This field is required';
          }
          if (Array.isArray(value) && value.length === 0) {
            return 'Please select at least one option';
          }
        }

        if (field.validation?.rules) {
          for (const rule of field.validation.rules) {
            switch (rule.type) {
              case 'minLength':
                if (typeof value === 'string' && value.length < Number(rule.value)) {
                  return rule.message;
                }
                break;
              case 'maxLength':
                if (typeof value === 'string' && value.length > Number(rule.value)) {
                  return rule.message;
                }
                break;
              case 'pattern':
                if (typeof value === 'string' && !new RegExp(String(rule.value)).test(value)) {
                  return rule.message;
                }
                break;
              case 'email':
                if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return rule.message;
                }
                break;
              case 'phone':
                if (typeof value === 'string' && !/^\+?[\d\s-()]+$/.test(value)) {
                  return rule.message;
                }
                break;
              case 'min':
                if (typeof value === 'number' && value < Number(rule.value)) {
                  return rule.message;
                }
                break;
              case 'max':
                if (typeof value === 'number' && value > Number(rule.value)) {
                  return rule.message;
                }
                break;
            }
          }
        }

        return undefined;
      },
      []
    );

    // Validate entire form
    const validateForm = useCallback((): FormValidationResult => {
      const fieldResults: FieldValidationResult[] = [];
      const newErrors: Record<string, string> = {};
      const sectionsComplete: Record<string, boolean> = {};
      const missingRequired: string[] = [];

      schema.sections.forEach((section) => {
        let sectionComplete = true;

        section.fields.forEach((field) => {
          if (hiddenFields.has(field.id)) return;
          if (['header', 'paragraph', 'divider', 'spacer'].includes(field.type)) return;

          const value = responses[field.id];
          const error = validateField(field, value);

          fieldResults.push({
            fieldId: field.id,
            isValid: !error,
            errors: error ? [error] : [],
          });

          if (error) {
            newErrors[field.id] = error;
            sectionComplete = false;
            if (field.required) {
              missingRequired.push(field.id);
            }
          }
        });

        sectionsComplete[section.id] = sectionComplete;
      });

      // Check signature
      const signatureRequired = schema.signature?.required || false;
      const signatureComplete = signatures.length > 0;

      setErrors(newErrors);

      const result: FormValidationResult = {
        isValid: Object.keys(newErrors).length === 0 && (!signatureRequired || signatureComplete),
        fieldResults,
        sectionsComplete,
        progress,
        missingRequired,
        signatureRequired,
        signatureComplete,
      };

      if (!result.isValid) {
        onValidationError?.(fieldResults.filter((r) => !r.isValid));
      }

      return result;
    }, [schema, responses, signatures, hiddenFields, validateField, progress, onValidationError]);

    // Handle field change
    const handleFieldChange = useCallback(
      (fieldId: string, value: unknown) => {
        setResponses((prev) => ({
          ...prev,
          [fieldId]: value,
        }));
        setIsDirty(true);

        // Clear error when field is changed
        if (errors[fieldId]) {
          setErrors((prev) => {
            const next = { ...prev };
            delete next[fieldId];
            return next;
          });
        }
      },
      [errors]
    );

    // Handle signature capture
    const handleSignatureCapture = useCallback((signatureImage: string) => {
      const newSignature: SignatureData = {
        id: 'primary-signature',
        signatureImage,
        signedAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };
      setSignatures([newSignature]);
      setIsDirty(true);
    }, []);

    // Navigation
    const goToSection = useCallback((index: number) => {
      setCurrentSectionIndex(index);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, []);

    const goToNextSection = useCallback(() => {
      if (currentSectionIndex < schema.sections.length - 1) {
        goToSection(currentSectionIndex + 1);
      }
    }, [currentSectionIndex, schema.sections.length, goToSection]);

    const goToPreviousSection = useCallback(() => {
      if (currentSectionIndex > 0) {
        goToSection(currentSectionIndex - 1);
      }
    }, [currentSectionIndex, goToSection]);

    // Submit form
    const handleSubmit = useCallback(() => {
      const validation = validateForm();

      if (!validation.isValid) {
        Alert.alert(
          'Incomplete Form',
          'Please complete all required fields before submitting.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsSubmitting(true);
      const formResponses = getFormResponses();
      onSubmit?.(formResponses, signatures);
      setIsSubmitting(false);
    }, [validateForm, getFormResponses, signatures, onSubmit]);

    // Save draft
    const handleSaveDraft = useCallback(() => {
      const formResponses = getFormResponses();
      onSaveDraft?.(formResponses, signatures, progress);
      setIsDirty(false);
      Alert.alert('Draft Saved', 'Your progress has been saved.');
    }, [getFormResponses, signatures, progress, onSaveDraft]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      validate: validateForm,
      getResponses: getFormResponses,
      getSignatures: () => signatures,
      saveDraft: handleSaveDraft,
      submit: handleSubmit,
      goToSection,
    }));

    // Current section
    const currentSection = schema.sections[currentSectionIndex];
    const isLastSection = currentSectionIndex === schema.sections.length - 1;
    const isFirstSection = currentSectionIndex === 0;
    const showSignature = isLastSection && schema.signature;

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        testID={testID}
      >
        {/* Progress Bar */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <FormProgress
              sections={sectionsProgress}
              currentSectionIndex={currentSectionIndex}
              overallProgress={progress}
              onSectionPress={showNavigation ? goToSection : undefined}
              variant="compact"
              estimatedMinutes={schema.metadata.estimatedMinutes}
            />
          </View>
        )}

        {/* Form Content */}
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>
              Section {currentSectionIndex + 1} of {schema.sections.length}
            </Text>
            <Text style={styles.sectionTitle}>{currentSection.title}</Text>
            {currentSection.description && (
              <Text style={styles.sectionDescription}>{currentSection.description}</Text>
            )}
          </View>

          {/* Fields */}
          <View style={styles.fieldsContainer}>
            {currentSection.fields.map((field) => {
              if (hiddenFields.has(field.id)) return null;

              return (
                <FormField
                  key={field.id}
                  field={field}
                  value={responses[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={errors[field.id]}
                  disabled={readOnly || disabledFields.has(field.id)}
                  prefillValue={getPrefillValue(field)}
                  testID={'field-' + field.id}
                />
              );
            })}
          </View>

          {/* Signature Section */}
          {showSignature && schema.signature && (
            <View style={styles.signatureSection}>
              <View style={styles.signatureDivider} />
              <SignaturePad
                ref={signatureRef}
                label={schema.signature.label}
                disclaimer={schema.signature.disclaimer}
                required={schema.signature.required}
                disabled={readOnly}
                onSignatureEnd={handleSignatureCapture}
                error={
                  schema.signature.required && signatures.length === 0 && Object.keys(errors).length > 0
                    ? 'Signature is required'
                    : undefined
                }
              />
            </View>
          )}
        </ScrollView>

        {/* Navigation Footer */}
        {!readOnly && (
          <View style={styles.footer}>
            <View style={styles.footerButtons}>
              {/* Previous Button */}
              {!isFirstSection && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={goToPreviousSection}
                  accessibilityLabel="Previous section"
                >
                  <Ionicons name="chevron-back" size={20} color="#6B7280" />
                  <Text style={styles.secondaryButtonText}>Previous</Text>
                </TouchableOpacity>
              )}

              {/* Spacer */}
              <View style={styles.footerSpacer} />

              {/* Save Draft */}
              {schema.settings.allowDraft && (
                <TouchableOpacity
                  style={styles.draftButton}
                  onPress={handleSaveDraft}
                  accessibilityLabel="Save draft"
                >
                  <Ionicons name="bookmark-outline" size={18} color="#6B7280" />
                  <Text style={styles.draftButtonText}>Save</Text>
                </TouchableOpacity>
              )}

              {/* Next/Submit Button */}
              {isLastSection ? (
                <TouchableOpacity
                  style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  accessibilityLabel="Submit form"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>
                        {schema.settings.submitButtonLabel || 'Submit'}
                      </Text>
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={goToNextSection}
                  accessibilityLabel="Next section"
                >
                  <Text style={styles.primaryButtonText}>Next</Text>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    );
  }
);

FormRenderer.displayName = 'FormRenderer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  fieldsContainer: {
    gap: 4,
  },
  signatureSection: {
    marginTop: 32,
  },
  signatureDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerSpacer: {
    flex: 1,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  draftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
    gap: 4,
  },
  draftButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default FormRenderer;
