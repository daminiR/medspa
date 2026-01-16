'use client';

/**
 * Form View Page (Web)
 * Displays and allows completion of a specific form.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FormRenderer } from '@/components/forms';
import { formService } from '@/lib/forms';
import type { FormSchema, FormSubmission, PatientPrefillData, FormFieldResponse, SignatureData } from '@medical-spa/types';

interface FormViewPageProps {
  params: { formId: string };
}

export default function FormViewPage({ params }: FormViewPageProps) {
  const { formId } = params;
  const router = useRouter();

  const [form, setForm] = useState<FormSchema | null>(null);
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [prefillData, setPrefillData] = useState<PatientPrefillData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      } finally {
        setIsLoading(false);
      }
    };
    loadForm();
  }, [formId]);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    router.push('/forms');
  }, [hasUnsavedChanges, router]);

  const handleSubmit = useCallback(async (responses: FormFieldResponse[], signatures: SignatureData[]) => {
    if (!formId) return;
    try {
      const result = await formService.submitForm(formId, submission?.id || 'new', responses, signatures);
      if (result.success) {
        setHasUnsavedChanges(false);
        alert(form?.settings.successMessage || 'Thank you! Your form has been submitted successfully.');
        router.push('/forms');
      } else {
        alert(result.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      alert('Failed to submit form. Please try again.');
    }
  }, [formId, submission, form, router]);

  const handleSaveDraft = useCallback(async (responses: FormFieldResponse[], signatures: SignatureData[], progress: number) => {
    if (!formId) return;
    try {
      await formService.saveDraft(formId, submission?.id, responses, signatures, progress);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  }, [formId, submission]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Form</h2>
          <p className="text-gray-600 mb-4">{error || 'Form not found'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Close</span>
          </button>
          <h1 className="font-semibold text-gray-900 truncate mx-4">{form.title}</h1>
          {hasUnsavedChanges && (
            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded">Unsaved</span>
          )}
        </div>
      </header>

      {/* Form */}
      <FormRenderer
        schema={form}
        initialResponses={submission?.responses || []}
        initialSignatures={submission?.signatures || []}
        prefillData={prefillData || undefined}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onProgressChange={() => setHasUnsavedChanges(true)}
        autoSaveEnabled={form.settings.allowDraft}
        autoSaveInterval={(form.settings.autoSaveInterval || 30) * 1000}
        showProgress={form.settings.showProgressBar}
        showNavigation={form.settings.showSectionNavigation}
      />
    </div>
  );
}
