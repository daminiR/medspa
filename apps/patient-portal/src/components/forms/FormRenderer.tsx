'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Save, Loader2 } from 'lucide-react';
import { FormField } from './FormField';
import { FormProgress, FormSectionProgress } from './FormProgress';
import { SignaturePad, SignaturePadRef } from './SignaturePad';

interface FormFieldResponse { fieldId: string; value: unknown; timestamp: string; }
interface SignatureData { id: string; signatureImage: string; signedAt: string; timestamp: string; }
interface PatientPrefillData { [key: string]: unknown; }

interface ValidationRule { type: string; value?: string | number | boolean | string[]; message: string; }
interface FieldValidation { rules: ValidationRule[]; }
interface ConditionalRule { id: string; sourceFieldId: string; operator: string; value?: string | number | boolean | string[]; action: string; targetFieldId?: string; }
interface ConditionalLogic { rules: ConditionalRule[]; logic: 'and' | 'or'; }

interface FormFieldDef {
  id: string;
  type: string;
  label: string;
  description?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: unknown;
  validation?: FieldValidation;
  conditionalLogic?: ConditionalLogic;
  prefillKey?: string;
  [key: string]: unknown;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldDef[];
}

interface FormSignatureConfig {
  required: boolean;
  label: string;
  disclaimer: string;
  dateTimestamp?: boolean;
  ipCapture?: boolean;
}

interface FormSettings {
  allowDraft: boolean;
  autoSaveInterval?: number;
  showProgressBar: boolean;
  showSectionNavigation: boolean;
  submitButtonLabel?: string;
  successMessage?: string;
}

interface FormMetadata {
  estimatedMinutes?: number;
  [key: string]: unknown;
}

interface FormSchema {
  id?: string;
  title: string;
  description?: string;
  sections: FormSection[];
  signature?: FormSignatureConfig;
  settings: FormSettings;
  metadata: FormMetadata;
}

interface FieldValidationResult { fieldId: string; isValid: boolean; errors: string[]; }
interface FormValidationResult {
  isValid: boolean;
  fieldResults: FieldValidationResult[];
  sectionsComplete: Record<string, boolean>;
  progress: number;
  missingRequired: string[];
  signatureRequired: boolean;
  signatureComplete: boolean;
}

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
    },
    ref
  ) => {
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
    const [disabledFields, setDisabledFields] = useState<Set<string>>(new Set());

    const signatureRef = useRef<SignaturePadRef>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    const getPrefillValue = useCallback((field: FormFieldDef): unknown => {
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

    const evaluateCondition = useCallback((rule: ConditionalRule): boolean => {
      const sourceValue = responses[rule.sourceFieldId];
      switch (rule.operator) {
        case 'equals': return sourceValue === rule.value;
        case 'notEquals': return sourceValue !== rule.value;
        case 'contains': return String(sourceValue).includes(String(rule.value));
        case 'notContains': return !String(sourceValue).includes(String(rule.value));
        case 'greaterThan': return Number(sourceValue) > Number(rule.value);
        case 'lessThan': return Number(sourceValue) < Number(rule.value);
        case 'isEmpty': return !sourceValue || sourceValue === '' || (Array.isArray(sourceValue) && sourceValue.length === 0);
        case 'isNotEmpty': return !!sourceValue && sourceValue !== '' && (!Array.isArray(sourceValue) || sourceValue.length > 0);
        case 'includes': return Array.isArray(sourceValue) && sourceValue.includes(rule.value);
        case 'notIncludes': return !Array.isArray(sourceValue) || !sourceValue.includes(rule.value);
        default: return true;
      }
    }, [responses]);

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
                if (rule.action === 'hide') newHidden.add(rule.targetFieldId || field.id);
                else if (rule.action === 'disable') newDisabled.add(rule.targetFieldId || field.id);
              } else {
                if (rule.action === 'show') newHidden.add(rule.targetFieldId || field.id);
              }
            });
          }
        });
      });

      setHiddenFields(newHidden);
      setDisabledFields(newDisabled);
    }, [responses, schema, evaluateCondition]);

    const progress = useMemo(() => {
      let totalFields = 0;
      let completedFields = 0;

      schema.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (hiddenFields.has(field.id)) return;
          if (['header', 'paragraph', 'divider', 'spacer'].includes(field.type)) return;
          totalFields++;
          const value = responses[field.id];
          if (value !== undefined && value !== null && value !== '') completedFields++;
        });
      });

      if (schema.signature?.required) {
        totalFields++;
        if (signatures.length > 0) completedFields++;
      }

      return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    }, [responses, signatures, schema, hiddenFields]);

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

    const getFormResponses = useCallback((): FormFieldResponse[] => {
      return Object.entries(responses).map(([fieldId, value]) => ({
        fieldId,
        value,
        timestamp: new Date().toISOString(),
      }));
    }, [responses]);

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
    }, [responses, isDirty, autoSaveEnabled, autoSaveInterval, readOnly, signatures, progress, getFormResponses, onSaveDraft]);

    const validateField = useCallback((field: FormFieldDef, value: unknown): string | undefined => {
      if (field.required) {
        if (value === undefined || value === null || value === '') return 'This field is required';
        if (Array.isArray(value) && value.length === 0) return 'Please select at least one option';
      }

      if (field.validation?.rules) {
        for (const rule of field.validation.rules) {
          switch (rule.type) {
            case 'minLength':
              if (typeof value === 'string' && value.length < Number(rule.value)) return rule.message;
              break;
            case 'maxLength':
              if (typeof value === 'string' && value.length > Number(rule.value)) return rule.message;
              break;
            case 'pattern':
              if (typeof value === 'string' && !new RegExp(String(rule.value)).test(value)) return rule.message;
              break;
            case 'email':
              if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return rule.message;
              break;
            case 'phone':
              if (typeof value === 'string' && !/^\+?[\d\s-()]+$/.test(value)) return rule.message;
              break;
            case 'min':
              if (typeof value === 'number' && value < Number(rule.value)) return rule.message;
              break;
            case 'max':
              if (typeof value === 'number' && value > Number(rule.value)) return rule.message;
              break;
          }
        }
      }
      return undefined;
    }, []);

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

          fieldResults.push({ fieldId: field.id, isValid: !error, errors: error ? [error] : [] });

          if (error) {
            newErrors[field.id] = error;
            sectionComplete = false;
            if (field.required) missingRequired.push(field.id);
          }
        });

        sectionsComplete[section.id] = sectionComplete;
      });

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

      if (!result.isValid) onValidationError?.(fieldResults.filter((r) => !r.isValid));
      return result;
    }, [schema, responses, signatures, hiddenFields, validateField, progress, onValidationError]);

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
      if (currentSectionIndex < schema.sections.length - 1) goToSection(currentSectionIndex + 1);
    }, [currentSectionIndex, schema.sections.length, goToSection]);

    const goToPreviousSection = useCallback(() => {
      if (currentSectionIndex > 0) goToSection(currentSectionIndex - 1);
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
      <div className="flex flex-col min-h-full bg-gray-50">
        {showProgress && (
          <div className="px-4 py-3 bg-white border-b">
            <FormProgress
              sections={sectionsProgress}
              currentSectionIndex={currentSectionIndex}
              overallProgress={progress}
              onSectionPress={showNavigation ? goToSection : undefined}
              variant="compact"
              estimatedMinutes={schema.metadata.estimatedMinutes}
            />
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 pb-32">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                Section {currentSectionIndex + 1} of {schema.sections.length}
              </p>
              <h2 className="text-2xl font-bold text-gray-900">{currentSection.title}</h2>
              {currentSection.description && (
                <p className="text-gray-600 mt-2">{currentSection.description}</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
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
                  />
                );
              })}

              {showSignature && schema.signature && (
                <div className="mt-8 pt-6 border-t">
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
          </div>
        </div>

        {!readOnly && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 md:px-6 md:py-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isFirstSection && (
                  <Button variant="outline" onClick={goToPreviousSection} className="gap-1">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {schema.settings.allowDraft && (
                  <Button variant="ghost" onClick={handleSaveDraft} className="gap-1">
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                )}

                {isLastSection ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {schema.settings.submitButtonLabel || 'Submit'}
                  </Button>
                ) : (
                  <Button onClick={goToNextSection} className="gap-1">
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
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
