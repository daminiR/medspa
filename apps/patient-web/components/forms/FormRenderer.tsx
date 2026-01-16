'use client';

/**
 * FormRenderer Component (Web)
 * Dynamic form rendering engine for the web patient portal.
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
import type {
  FormSchema,
  FormFieldResponse,
  SignatureData,
  PatientPrefillData,
  FormField as FormFieldType,
} from '@medical-spa/types';
import { FormField } from './FormField';
import { FormProgress, FormSectionProgress } from './FormProgress';
import { SignaturePad, SignaturePadRef } from './SignaturePad';

export interface FormRendererRef {
  validate: () => { isValid: boolean; progress: number };
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
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number;
  readOnly?: boolean;
  showProgress?: boolean;
  showNavigation?: boolean;
}

export const FormRenderer = forwardRef<FormRendererRef, FormRendererProps>(
  (props, ref) => {
    const {
      schema,
      initialResponses = [],
      initialSignatures = [],
      prefillData,
      onSubmit,
      onSaveDraft,
      onProgressChange,
      autoSaveEnabled = true,
      autoSaveInterval = 30000,
      readOnly = false,
      showProgress = true,
      showNavigation = true,
    } = props;

    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, unknown>>(() => {
      const initial: Record<string, unknown> = {};
      initialResponses.forEach((r) => { initial[r.fieldId] = r.value; });
      return initial;
    });
    const [signatures, setSignatures] = useState<SignatureData[]>(initialSignatures);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set());

    const signatureRef = useRef<SignaturePadRef>(null);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Get prefill value
    const getPrefillValue = useCallback((field: FormFieldType): unknown => {
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
    }, [prefillData]);

    // Evaluate conditional logic
    useEffect(() => {
      const newHidden = new Set<string>();
      schema.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.conditionalLogic) {
            const { rules, logic } = field.conditionalLogic;
            const results = rules.map((rule) => {
              const sourceValue = responses[rule.sourceFieldId];
              switch (rule.operator) {
                case 'equals': return sourceValue === rule.value;
                case 'notEquals': return sourceValue !== rule.value;
                case 'isEmpty': return !sourceValue || sourceValue === '';
                case 'isNotEmpty': return !!sourceValue && sourceValue !== '';
                default: return true;
              }
            });
            const conditionMet = logic === 'and' ? results.every(Boolean) : results.some(Boolean);
            rules.forEach((rule) => {
              if (conditionMet && rule.action === 'hide') {
                newHidden.add(rule.targetFieldId || field.id);
              } else if (!conditionMet && rule.action === 'show') {
                newHidden.add(rule.targetFieldId || field.id);
              }
            });
          }
        });
      });
      setHiddenFields(newHidden);
    }, [responses, schema]);

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
      if (schema.signature?.required) {
        totalFields++;
        if (signatures.length > 0) completedFields++;
      }
      return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    }, [responses, signatures, schema, hiddenFields]);

    // Section progress
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

    useEffect(() => {
      onProgressChange?.(progress);
    }, [progress, onProgressChange]);

    // Auto-save
    useEffect(() => {
      if (!autoSaveEnabled || readOnly || !isDirty) return;
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        const formResponses = getFormResponses();
        onSaveDraft?.(formResponses, signatures, progress);
        setIsDirty(false);
      }, autoSaveInterval);
      return () => {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      };
    }, [responses, isDirty, autoSaveEnabled, autoSaveInterval, readOnly, onSaveDraft, progress, signatures]);

    const getFormResponses = useCallback((): FormFieldResponse[] => {
      return Object.entries(responses).map(([fieldId, value]) => ({
        fieldId,
        value,
        timestamp: new Date().toISOString(),
      }));
    }, [responses]);

    const validateField = useCallback((field: FormFieldType, value: unknown): string | undefined => {
      if (field.required) {
        if (value === undefined || value === null || value === '') {
          return 'This field is required';
        }
        if (Array.isArray(value) && value.length === 0) {
          return 'Please select at least one option';
        }
      }
      return undefined;
    }, []);

    const validateForm = useCallback(() => {
      const newErrors: Record<string, string> = {};
      schema.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (hiddenFields.has(field.id)) return;
          if (['header', 'paragraph', 'divider', 'spacer'].includes(field.type)) return;
          const value = responses[field.id];
          const error = validateField(field, value);
          if (error) newErrors[field.id] = error;
        });
      });
      const signatureRequired = schema.signature?.required || false;
      const signatureComplete = signatures.length > 0;
      setErrors(newErrors);
      return {
        isValid: Object.keys(newErrors).length === 0 && (!signatureRequired || signatureComplete),
        progress,
      };
    }, [schema, responses, signatures, hiddenFields, validateField, progress]);

    const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
      setResponses((prev) => ({ ...prev, [fieldId]: value }));
      setIsDirty(true);
      if (errors[fieldId]) {
        setErrors((prev) => { const next = { ...prev }; delete next[fieldId]; return next; });
      }
    }, [errors]);

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

    const goToSection = useCallback((index: number) => {
      setCurrentSectionIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const handleSubmit = useCallback(() => {
      const validation = validateForm();
      if (!validation.isValid) {
        alert('Please complete all required fields before submitting.');
        return;
      }
      setIsSubmitting(true);
      const formResponses = getFormResponses();
      onSubmit?.(formResponses, signatures);
      setIsSubmitting(false);
    }, [validateForm, getFormResponses, signatures, onSubmit]);

    const handleSaveDraft = useCallback(() => {
      const formResponses = getFormResponses();
      onSaveDraft?.(formResponses, signatures, progress);
      setIsDirty(false);
      alert('Draft saved successfully!');
    }, [getFormResponses, signatures, progress, onSaveDraft]);

    useImperativeHandle(ref, () => ({
      validate: validateForm,
      getResponses: getFormResponses,
      getSignatures: () => signatures,
      saveDraft: handleSaveDraft,
      submit: handleSubmit,
      goToSection,
    }));

    const currentSection = schema.sections[currentSectionIndex];
    const isLastSection = currentSectionIndex === schema.sections.length - 1;
    const isFirstSection = currentSectionIndex === 0;
    const showSignature = isLastSection && schema.signature;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Progress Bar */}
        {showProgress && (
          <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
            <div className="max-w-2xl mx-auto">
              <FormProgress
                sections={sectionsProgress}
                currentSectionIndex={currentSectionIndex}
                overallProgress={progress}
                onSectionPress={showNavigation ? goToSection : undefined}
                variant="compact"
                estimatedMinutes={schema.metadata.estimatedMinutes}
              />
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Section Header */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-1">
              Section {currentSectionIndex + 1} of {schema.sections.length}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentSection.title}</h1>
            {currentSection.description && (
              <p className="text-gray-600">{currentSection.description}</p>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-1">
            {currentSection.fields.map((field) => {
              if (hiddenFields.has(field.id)) return null;
              return (
                <FormField
                  key={field.id}
                  field={field}
                  value={responses[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={errors[field.id]}
                  disabled={readOnly}
                  prefillValue={getPrefillValue(field)}
                />
              );
            })}
          </div>

          {/* Signature Section */}
          {showSignature && schema.signature && (
            <div className="mt-8 pt-8 border-t">
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
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        {!readOnly && (
          <div className="sticky bottom-0 bg-white border-t px-4 py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              {/* Previous Button */}
              {!isFirstSection ? (
                <button
                  onClick={goToPreviousSection}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
              ) : <div />}

              <div className="flex items-center gap-3">
                {/* Save Draft */}
                {schema.settings.allowDraft && (
                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center gap-1.5 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save
                  </button>
                )}

                {/* Next/Submit Button */}
                {isLastSection ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : schema.settings.submitButtonLabel || 'Submit'}
                    {!isSubmitting && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={goToNextSection}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Next
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

FormRenderer.displayName = 'FormRenderer';
export default FormRenderer;
