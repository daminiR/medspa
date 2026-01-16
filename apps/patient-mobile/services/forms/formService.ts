/**
 * Form Service
 *
 * API integration service for forms functionality.
 * Includes mock data for development and testing.
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

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.luxemedspa.com';
const USE_MOCK_DATA = true; // Toggle for development

// ============================================================================
// Mock Data
// ============================================================================

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
    appointmentId: 'apt-123',
    status: 'pending',
    priority: 'critical',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
    appointmentId: 'apt-123',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
    signatures: [
      {
        id: 'sig-001',
        signatureImage: 'data:image/png;base64,mock',
        signedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    progress: 100,
    startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    pdfUrl: 'https://example.com/forms/sub-001.pdf',
    auditLog: [],
  },
  {
    id: 'sub-002',
    formId: 'hipaa-authorization-v1',
    formVersion: '1.0',
    patientId: 'current-patient-id',
    status: 'completed',
    responses: [],
    signatures: [
      {
        id: 'sig-002',
        signatureImage: 'data:image/png;base64,mock',
        signedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    progress: 100,
    startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    pdfUrl: 'https://example.com/forms/sub-002.pdf',
    auditLog: [],
  },
];

// ============================================================================
// Form Service Class
// ============================================================================

class FormService {
  private drafts: Map<string, FormSubmission> = new Map();

  /**
   * Get patient form requirements (pending + completed forms)
   */
  async getPatientFormRequirements(patientId: string): Promise<PatientFormRequirements> {
    if (USE_MOCK_DATA) {
      await this.simulateNetworkDelay();

      const requiredForms = MOCK_FORM_ASSIGNMENTS.filter(
        (f) => f.priority === 'critical' && f.status !== 'completed'
      );
      const optionalForms = MOCK_FORM_ASSIGNMENTS.filter(
        (f) => f.priority !== 'critical' && f.status !== 'completed'
      );
      const completedForms = MOCK_FORM_ASSIGNMENTS.filter(
        (f) => f.status === 'completed'
      );

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

    // Real API call
    const response = await fetch(
      API_BASE_URL + '/patients/' + patientId + '/form-requirements',
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch form requirements');
    }

    return response.json();
  }

  /**
   * Get a specific form with optional existing submission data
   */
  async getForm(formId: string, submissionId?: string): Promise<GetFormResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateNetworkDelay();

      const template = FORM_TEMPLATES.find((t) => t.id === formId);
      if (!template) {
        throw new Error('Form not found');
      }

      const form: FormSchema = {
        ...template.schema,
        id: formId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
      };

      // Check for existing draft
      const existingDraft = this.drafts.get(formId);

      return {
        form,
        submission: existingDraft || undefined,
        prefillData: MOCK_PATIENT_PREFILL,
      };
    }

    // Real API call
    const url = submissionId
      ? API_BASE_URL + '/forms/' + formId + '/submissions/' + submissionId
      : API_BASE_URL + '/forms/' + formId;

    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch form');
    }

    return response.json();
  }

  /**
   * Save form draft
   */
  async saveDraft(
    formId: string,
    submissionId: string | undefined,
    responses: FormFieldResponse[],
    signatures: SignatureData[],
    progress: number
  ): Promise<SaveDraftResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateNetworkDelay(500);

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
        auditLog: [
          {
            id: 'audit-' + Date.now(),
            action: 'draft_saved',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      this.drafts.set(formId, submission);

      return {
        submissionId: submission.id,
        savedAt: submission.lastSavedAt!,
        success: true,
      };
    }

    // Real API call
    const response = await fetch(
      API_BASE_URL + '/forms/' + formId + '/draft',
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          submissionId,
          responses,
          signatures,
          progress,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to save draft');
    }

    return response.json();
  }

  /**
   * Submit completed form
   */
  async submitForm(
    formId: string,
    submissionId: string,
    responses: FormFieldResponse[],
    signatures: SignatureData[]
  ): Promise<SubmitFormResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateNetworkDelay(1000);

      // Remove draft
      this.drafts.delete(formId);

      return {
        submissionId: 'sub-' + Date.now(),
        submittedAt: new Date().toISOString(),
        success: true,
        pdfUrl: 'https://example.com/forms/submission.pdf',
        message: 'Form submitted successfully!',
      };
    }

    // Real API call
    const response = await fetch(
      API_BASE_URL + '/forms/' + formId + '/submit',
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          submissionId,
          responses,
          signatures,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }

    return response.json();
  }

  /**
   * Get form submission history
   */
  async getFormHistory(
    patientId: string,
    formId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<GetFormHistoryResponse> {
    if (USE_MOCK_DATA) {
      await this.simulateNetworkDelay();

      let submissions = [...MOCK_COMPLETED_SUBMISSIONS];
      
      if (formId) {
        submissions = submissions.filter((s) => s.formId === formId);
      }

      return {
        submissions: submissions.slice(offset, offset + limit),
        total: submissions.length,
        hasMore: offset + limit < submissions.length,
      };
    }

    // Real API call
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (formId) params.append('formId', formId);

    const response = await fetch(
      API_BASE_URL + '/patients/' + patientId + '/form-history?' + params,
      {
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch form history');
    }

    return response.json();
  }

  /**
   * Get form details synchronously (for UI display)
   */
  getFormDetailsSync(formId: string): FormTemplate | undefined {
    return FORM_TEMPLATES.find((t) => t.id === formId);
  }

  /**
   * Get all available form templates
   */
  async getFormTemplates(): Promise<FormTemplate[]> {
    if (USE_MOCK_DATA) {
      await this.simulateNetworkDelay();
      return FORM_TEMPLATES;
    }

    const response = await fetch(API_BASE_URL + '/forms/templates', {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch form templates');
    }

    return response.json();
  }

  // Helper methods
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      // In a real app, include auth token
      // 'Authorization': 'Bearer ' + getAuthToken(),
    };
  }

  private simulateNetworkDelay(ms: number = 800): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const formService = new FormService();
export default formService;
