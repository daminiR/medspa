/**
 * Form Service (Web)
 * API integration and mock data for forms.
 */

import type {
  FormSchema,
  FormSubmission,
  FormAssignment,
  PatientFormRequirements,
  PatientPrefillData,
  FormFieldResponse,
  SignatureData,
  GetFormResponse,
  SaveDraftResponse,
  SubmitFormResponse,
  GetFormHistoryResponse,
  FormTemplate,
} from '@medical-spa/types';
import { FORM_TEMPLATES } from './formTemplates';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.luxemedspa.com';
const USE_MOCK_DATA = true;

const MOCK_PATIENT_PREFILL: PatientPrefillData = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  fullName: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '(555) 123-4567',
  dateOfBirth: '1985-06-15',
  address: {
    street1: '123 Main Street',
    street2: 'Apt 4B',
    city: 'Beverly Hills',
    state: 'CA',
    zipCode: '90210',
    country: 'USA',
  },
  emergencyContact: {
    name: 'Michael Johnson',
    relationship: 'Spouse',
    phone: '(555) 987-6543',
  },
};

const MOCK_FORM_ASSIGNMENTS: FormAssignment[] = [
  {
    id: 'assign-1',
    formId: 'medical-intake-v1',
    patientId: 'current-patient-id',
    appointmentId: 'apt-123',
    status: 'pending',
    priority: 'critical',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignedAt: new Date().toISOString(),
    remindersSent: 0,
  },
  {
    id: 'assign-2',
    formId: 'hipaa-authorization-v1',
    patientId: 'current-patient-id',
    status: 'pending',
    priority: 'critical',
    assignedAt: new Date().toISOString(),
    remindersSent: 0,
  },
  {
    id: 'assign-3',
    formId: 'photo-release-v1',
    patientId: 'current-patient-id',
    status: 'in_progress',
    priority: 'high',
    assignedAt: new Date().toISOString(),
    remindersSent: 1,
  },
  {
    id: 'assign-4',
    formId: 'consent-botox-v1',
    patientId: 'current-patient-id',
    status: 'pending',
    priority: 'high',
    assignedAt: new Date().toISOString(),
    remindersSent: 0,
  },
];

const MOCK_COMPLETED_SUBMISSIONS: FormSubmission[] = [
  {
    id: 'sub-001',
    formId: 'medical-intake-v1',
    formVersion: '1.0',
    patientId: 'current-patient-id',
    status: 'completed',
    responses: [],
    signatures: [{
      id: 'sig-001',
      signatureImage: 'data:image/png;base64,mock',
      signedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }],
    progress: 100,
    startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    pdfUrl: 'https://example.com/forms/sub-001.pdf',
    auditLog: [],
  },
];

class FormService {
  private drafts: Map<string, FormSubmission> = new Map();

  async getPatientFormRequirements(patientId: string): Promise<PatientFormRequirements> {
    if (USE_MOCK_DATA) {
      await this.delay();
      const requiredForms = MOCK_FORM_ASSIGNMENTS.filter(f => f.priority === 'critical' && f.status !== 'completed');
      const optionalForms = MOCK_FORM_ASSIGNMENTS.filter(f => f.priority !== 'critical' && f.status !== 'completed');
      const completedForms = MOCK_FORM_ASSIGNMENTS.filter(f => f.status === 'completed');
      const totalRequired = requiredForms.length + optionalForms.length;
      const totalCompleted = completedForms.length;
      return {
        patientId,
        upcomingAppointment: {
          id: 'apt-123',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          serviceName: 'Botox Treatment',
        },
        requiredForms,
        optionalForms,
        completedForms,
        totalRequired,
        totalCompleted,
        completionPercentage: totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 100,
        allRequiredComplete: requiredForms.length === 0,
      };
    }
    const response = await fetch(API_BASE_URL + '/patients/' + patientId + '/form-requirements');
    if (!response.ok) throw new Error('Failed to fetch form requirements');
    return response.json();
  }

  async getForm(formId: string): Promise<GetFormResponse> {
    if (USE_MOCK_DATA) {
      await this.delay();
      const template = FORM_TEMPLATES.find(t => t.id === formId);
      if (!template) throw new Error('Form not found');
      const form: FormSchema = {
        ...template.schema,
        id: formId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
      };
      const existingDraft = this.drafts.get(formId);
      return {
        form,
        submission: existingDraft || undefined,
        prefillData: MOCK_PATIENT_PREFILL,
      };
    }
    const response = await fetch(API_BASE_URL + '/forms/' + formId);
    if (!response.ok) throw new Error('Failed to fetch form');
    return response.json();
  }

  async saveDraft(
    formId: string,
    submissionId: string | undefined,
    responses: FormFieldResponse[],
    signatures: SignatureData[],
    progress: number
  ): Promise<SaveDraftResponse> {
    if (USE_MOCK_DATA) {
      await this.delay(500);
      const submission: FormSubmission = {
        id: submissionId || 'draft-' + Date.now(),
        formId,
        formVersion: '1.0',
        patientId: 'current-patient-id',
        status: 'draft',
        responses,
        signatures,
        progress,
        startedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        auditLog: [{ id: 'audit-' + Date.now(), action: 'draft_saved', timestamp: new Date().toISOString() }],
      };
      this.drafts.set(formId, submission);
      return { submissionId: submission.id, savedAt: submission.lastSavedAt!, success: true };
    }
    const response = await fetch(API_BASE_URL + '/forms/' + formId + '/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, responses, signatures, progress }),
    });
    if (!response.ok) throw new Error('Failed to save draft');
    return response.json();
  }

  async submitForm(
    formId: string,
    submissionId: string,
    responses: FormFieldResponse[],
    signatures: SignatureData[]
  ): Promise<SubmitFormResponse> {
    if (USE_MOCK_DATA) {
      await this.delay(1000);
      this.drafts.delete(formId);
      return {
        submissionId: 'sub-' + Date.now(),
        submittedAt: new Date().toISOString(),
        success: true,
        pdfUrl: 'https://example.com/forms/submission.pdf',
        message: 'Form submitted successfully!',
      };
    }
    const response = await fetch(API_BASE_URL + '/forms/' + formId + '/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, responses, signatures }),
    });
    if (!response.ok) throw new Error('Failed to submit form');
    return response.json();
  }

  async getFormHistory(patientId: string, limit: number = 50): Promise<GetFormHistoryResponse> {
    if (USE_MOCK_DATA) {
      await this.delay();
      return {
        submissions: MOCK_COMPLETED_SUBMISSIONS,
        total: MOCK_COMPLETED_SUBMISSIONS.length,
        hasMore: false,
      };
    }
    const response = await fetch(API_BASE_URL + '/patients/' + patientId + '/form-history?limit=' + limit);
    if (!response.ok) throw new Error('Failed to fetch form history');
    return response.json();
  }

  getFormDetailsSync(formId: string): FormTemplate | undefined {
    return FORM_TEMPLATES.find(t => t.id === formId);
  }

  private delay(ms: number = 800): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const formService = new FormService();
export default formService;
