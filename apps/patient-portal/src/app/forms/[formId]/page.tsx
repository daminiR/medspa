'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { FormRenderer, FormRendererRef } from '@/components/forms/FormRenderer';
import { formService } from '@/lib/forms/formService';

interface FormFieldResponse { fieldId: string; value: unknown; timestamp: string; }
interface SignatureData { id: string; signatureImage: string; signedAt: string; timestamp: string; }

interface FormSchemaFromAPI {
  id: string;
  slug: string;
  title: string;
  description?: string;
  version: string;
  category: string;
  status: string;
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    fields: Array<Record<string, unknown>>;
  }>;
  signature?: {
    required: boolean;
    label: string;
    disclaimer: string;
    dateTimestamp?: boolean;
    ipCapture?: boolean;
  };
  settings: {
    allowDraft: boolean;
    autoSaveInterval?: number;
    showProgressBar: boolean;
    showSectionNavigation: boolean;
    submitButtonLabel?: string;
    successMessage?: string;
    requireAuthentication?: boolean;
    notifyOnSubmission?: boolean;
    offlineSupport?: boolean;
  };
  metadata: {
    estimatedMinutes?: number;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface PatientPrefillData {
  [key: string]: unknown;
}

// Convert API form schema to FormRenderer schema format
const convertToRendererSchema = (apiSchema: FormSchemaFromAPI) => {
  return {
    id: apiSchema.id,
    title: apiSchema.title,
    description: apiSchema.description,
    sections: apiSchema.sections.map(section => ({
      id: section.id,
      title: section.title,
      description: section.description,
      fields: section.fields as any[], // Fields are already in the correct format from the API
    })),
    signature: apiSchema.signature,
    settings: {
      allowDraft: apiSchema.settings.allowDraft,
      autoSaveInterval: apiSchema.settings.autoSaveInterval,
      showProgressBar: apiSchema.settings.showProgressBar,
      showSectionNavigation: apiSchema.settings.showSectionNavigation,
      submitButtonLabel: apiSchema.settings.submitButtonLabel,
      successMessage: apiSchema.settings.successMessage,
    },
    metadata: apiSchema.metadata,
  };
};

export default function FormViewerPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const formRef = useRef<FormRendererRef>(null);
  const [form, setForm] = useState<FormSchemaFromAPI | null>(null);
  const [prefillData, setPrefillData] = useState<PatientPrefillData | undefined>();
  const [initialResponses, setInitialResponses] = useState<FormFieldResponse[]>([]);
  const [initialSignatures, setInitialSignatures] = useState<SignatureData[]>([]);
  const [submissionId, setSubmissionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadForm = async () => {
      try {
        const response = await formService.getForm(formId);
        setForm(response.form as FormSchemaFromAPI);
        if (response.prefillData) {
          setPrefillData(response.prefillData as PatientPrefillData);
        }
        if (response.submission) {
          setInitialResponses(response.submission.responses);
          setInitialSignatures(response.submission.signatures);
          setSubmissionId(response.submission.id);
        }
      } catch (err) {
        console.error('Failed to load form:', err);
        setError('Failed to load form. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [formId]);

  const handleSubmit = async (responses: FormFieldResponse[], signatures: SignatureData[]) => {
    try {
      const result = await formService.submitForm(
        formId,
        submissionId || 'new-submission',
        responses,
        signatures
      );
      if (result.success) {
        setSubmitSuccess(true);
        setSuccessMessage(form?.settings.successMessage || 'Form submitted successfully!');
      }
    } catch (err) {
      console.error('Failed to submit form:', err);
      alert('Failed to submit form. Please try again.');
    }
  };

  const handleSaveDraft = async (responses: FormFieldResponse[], signatures: SignatureData[], progress: number) => {
    try {
      const result = await formService.saveDraft(
        formId,
        submissionId,
        responses,
        signatures,
        progress
      );
      setSubmissionId(result.submissionId);
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">{error || 'Form not found'}</h2>
          <Link href="/forms">
            <Button className="mt-4">Back to Forms</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Form Submitted!</h2>
          <p className="text-gray-600 mb-8">{successMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/forms">
              <Button variant="outline">Back to Forms</Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/forms">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-900 truncate">{form.title}</h1>
            {form.metadata.estimatedMinutes && (
              <p className="text-xs text-gray-500">About {form.metadata.estimatedMinutes} min</p>
            )}
          </div>
        </div>
      </div>

      <FormRenderer
        ref={formRef}
        schema={convertToRendererSchema(form)}
        initialResponses={initialResponses}
        initialSignatures={initialSignatures}
        prefillData={prefillData}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        autoSaveEnabled={form.settings.allowDraft}
        autoSaveInterval={(form.settings.autoSaveInterval || 30) * 1000}
        showProgress={form.settings.showProgressBar}
        showNavigation={form.settings.showSectionNavigation}
      />
    </div>
  );
}
