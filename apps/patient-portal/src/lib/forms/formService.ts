/**
 * Form Service for Patient Portal
 */

import { FORM_TEMPLATES, FormTemplate } from './formTemplates';

interface FormFieldResponse { fieldId: string; value: unknown; timestamp: string; }
interface SignatureData { id: string; signatureImage: string; signedAt: string; timestamp: string; }

interface FormSubmission {
  id: string;
  formId: string;
  formVersion: string;
  patientId: string;
  status: 'not_started' | 'in_progress' | 'draft' | 'submitted' | 'completed';
  responses: FormFieldResponse[];
  signatures: SignatureData[];
  progress: number;
  startedAt: string;
  lastSavedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  pdfUrl?: string;
}

interface FormAssignment {
  id: string;
  formId: string;
  patientId: string;
  appointmentId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  assignedAt: string;
  remindersSent: number;
}

interface PatientFormRequirements {
  patientId: string;
  upcomingAppointment?: { id: string; date: string; serviceName: string; };
  requiredForms: FormAssignment[];
  optionalForms: FormAssignment[];
  completedForms: FormAssignment[];
  totalRequired: number;
  totalCompleted: number;
  completionPercentage: number;
  allRequiredComplete: boolean;
}

interface PatientPrefillData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: { street1?: string; street2?: string; city?: string; state?: string; zipCode?: string; country?: string; };
  emergencyContact?: { name?: string; relationship?: string; phone?: string; };
}

interface GetFormResponse {
  form: FormTemplate['schema'] & { id: string; createdAt: string; updatedAt: string; createdBy: string; };
  submission?: FormSubmission;
  prefillData?: PatientPrefillData;
}

interface SaveDraftResponse { submissionId: string; savedAt: string; success: boolean; }
interface SubmitFormResponse { submissionId: string; submittedAt: string; success: boolean; pdfUrl?: string; message?: string; }
interface GetFormHistoryResponse { submissions: FormSubmission[]; total: number; hasMore: boolean; }

const MOCK_PATIENT_PREFILL: PatientPrefillData = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  fullName: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '(555) 123-4567',
  dateOfBirth: '1985-06-15',
  address: { street1: '123 Main Street', street2: 'Apt 4B', city: 'Beverly Hills', state: 'CA', zipCode: '90210', country: 'USA' },
  emergencyContact: { name: 'Michael Johnson', relationship: 'Spouse', phone: '(555) 987-6543' },
};

const MOCK_FORM_ASSIGNMENTS: FormAssignment[] = [
  { id: 'assign-1', formId: 'medical-intake-v1', patientId: 'current-patient-id', appointmentId: 'apt-123', status: 'pending', priority: 'critical', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), assignedAt: new Date().toISOString(), remindersSent: 0 },
  { id: 'assign-2', formId: 'hipaa-authorization-v1', patientId: 'current-patient-id', appointmentId: 'apt-123', status: 'pending', priority: 'critical', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), assignedAt: new Date().toISOString(), remindersSent: 0 },
  { id: 'assign-3', formId: 'photo-release-v1', patientId: 'current-patient-id', status: 'in_progress', priority: 'high', assignedAt: new Date().toISOString(), remindersSent: 1 },
  { id: 'assign-4', formId: 'consent-botox-v1', patientId: 'current-patient-id', appointmentId: 'apt-123', status: 'pending', priority: 'high', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), assignedAt: new Date().toISOString(), remindersSent: 0 },
];

const MOCK_COMPLETED_SUBMISSIONS: FormSubmission[] = [
  { id: 'sub-001', formId: 'medical-intake-v1', formVersion: '1.0', patientId: 'current-patient-id', status: 'completed', responses: [], signatures: [{ id: 'sig-001', signatureImage: 'data:image/png;base64,mock', signedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }], progress: 100, startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), pdfUrl: 'https://example.com/forms/sub-001.pdf' },
  { id: 'sub-002', formId: 'hipaa-authorization-v1', formVersion: '1.0', patientId: 'current-patient-id', status: 'completed', responses: [], signatures: [{ id: 'sig-002', signatureImage: 'data:image/png;base64,mock', signedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }], progress: 100, startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), pdfUrl: 'https://example.com/forms/sub-002.pdf' },
];

class FormService {
  private drafts: Map<string, FormSubmission> = new Map();

  private simulateNetworkDelay(ms: number = 800): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getPatientFormRequirements(patientId: string): Promise<PatientFormRequirements> {
    await this.simulateNetworkDelay();
    const requiredForms = MOCK_FORM_ASSIGNMENTS.filter((f) => f.priority === 'critical' && f.status !== 'completed');
    const optionalForms = MOCK_FORM_ASSIGNMENTS.filter((f) => f.priority !== 'critical' && f.status !== 'completed');
    const completedForms = MOCK_FORM_ASSIGNMENTS.filter((f) => f.status === 'completed');
    const totalRequired = requiredForms.length + optionalForms.length;
    const totalCompleted = completedForms.length;

    return {
      patientId,
      upcomingAppointment: { id: 'apt-123', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), serviceName: 'Botox Treatment' },
      requiredForms,
      optionalForms,
      completedForms,
      totalRequired,
      totalCompleted,
      completionPercentage: totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 100,
      allRequiredComplete: requiredForms.length === 0,
    };
  }

  async getForm(formId: string, submissionId?: string): Promise<GetFormResponse> {
    await this.simulateNetworkDelay();
    const template = FORM_TEMPLATES.find((t) => t.id === formId);
    if (!template) throw new Error('Form not found');

    const form = {
      ...template.schema,
      id: formId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
    };

    const existingDraft = this.drafts.get(formId);

    return { form, submission: existingDraft || undefined, prefillData: MOCK_PATIENT_PREFILL };
  }

  async saveDraft(formId: string, submissionId: string | undefined, responses: FormFieldResponse[], signatures: SignatureData[], progress: number): Promise<SaveDraftResponse> {
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
    };
    this.drafts.set(formId, submission);
    return { submissionId: submission.id, savedAt: submission.lastSavedAt!, success: true };
  }

  async submitForm(formId: string, submissionId: string, responses: FormFieldResponse[], signatures: SignatureData[]): Promise<SubmitFormResponse> {
    await this.simulateNetworkDelay(1000);
    this.drafts.delete(formId);
    return { submissionId: 'sub-' + Date.now(), submittedAt: new Date().toISOString(), success: true, pdfUrl: 'https://example.com/forms/submission.pdf', message: 'Form submitted successfully!' };
  }

  async getFormHistory(patientId: string, formId?: string, limit: number = 50, offset: number = 0): Promise<GetFormHistoryResponse> {
    await this.simulateNetworkDelay();
    let submissions = [...MOCK_COMPLETED_SUBMISSIONS];
    if (formId) submissions = submissions.filter((s) => s.formId === formId);
    return { submissions: submissions.slice(offset, offset + limit), total: submissions.length, hasMore: offset + limit < submissions.length };
  }

  getFormDetailsSync(formId: string): FormTemplate | undefined {
    return FORM_TEMPLATES.find((t) => t.id === formId);
  }

  async getFormTemplates(): Promise<FormTemplate[]> {
    await this.simulateNetworkDelay();
    return FORM_TEMPLATES;
  }

  async getSubmittedForm(submissionId: string): Promise<FormSubmission | null> {
    await this.simulateNetworkDelay();
    const submission = MOCK_COMPLETED_SUBMISSIONS.find((s) => s.id === submissionId);
    return submission || null;
  }

  async getPatientFormHistory(patientId: string): Promise<FormSubmission[]> {
    await this.simulateNetworkDelay();
    return MOCK_COMPLETED_SUBMISSIONS.filter((s) => s.patientId === patientId);
  }

  async clearFormProgress(formId: string): Promise<{ success: boolean }> {
    await this.simulateNetworkDelay(300);
    this.drafts.delete(formId);
    return { success: true };
  }

  async downloadFormPdf(submissionId: string): Promise<{ url: string; filename: string }> {
    await this.simulateNetworkDelay(500);
    const submission = MOCK_COMPLETED_SUBMISSIONS.find((s) => s.id === submissionId);
    return {
      url: submission?.pdfUrl || `https://example.com/forms/${submissionId}.pdf`,
      filename: `form-${submissionId}.pdf`,
    };
  }

  async uploadSignature(signatureData: string): Promise<{ signatureId: string; url: string }> {
    await this.simulateNetworkDelay(500);
    const signatureId = `sig-${Date.now()}`;
    return {
      signatureId,
      url: `https://example.com/signatures/${signatureId}.png`,
    };
  }
}

export const formService = new FormService();
export default formService;
