/**
 * Digital Forms & E-Signature Types
 *
 * Comprehensive type definitions for the form builder system,
 * form rendering, e-signatures, and HIPAA compliance.
 */

// ============================================================================
// Field Types
// ============================================================================

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'checkboxGroup'
  | 'textarea'
  | 'multiline'
  | 'signature'
  | 'file'
  | 'image'
  | 'address'
  | 'ssn'
  | 'creditCard'
  | 'slider'
  | 'rating'
  | 'yesNo'
  | 'consent'
  | 'header'
  | 'paragraph'
  | 'divider'
  | 'spacer';

export type ValidationRuleType =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'email'
  | 'phone'
  | 'min'
  | 'max'
  | 'date'
  | 'dateRange'
  | 'fileSize'
  | 'fileType'
  | 'custom';

// ============================================================================
// Validation Rules
// ============================================================================

export interface ValidationRule {
  type: ValidationRuleType;
  value?: string | number | boolean | string[];
  message: string;
  params?: Record<string, unknown>;
}

export interface FieldValidation {
  rules: ValidationRule[];
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  debounceMs?: number;
}

// ============================================================================
// Conditional Logic
// ============================================================================

export type ConditionalOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'includes'
  | 'notIncludes';

export type ConditionalAction = 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'setOptions';

export interface ConditionalRule {
  id: string;
  sourceFieldId: string;
  operator: ConditionalOperator;
  value?: string | number | boolean | string[];
  action: ConditionalAction;
  targetFieldId?: string;
  newOptions?: SelectOption[];
}

export interface ConditionalLogic {
  rules: ConditionalRule[];
  logic: 'and' | 'or';
}

// ============================================================================
// Field Options
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  helpText?: string;
  icon?: string;
}

export interface FileUploadOptions {
  maxSizeBytes: number;
  allowedTypes: string[];
  maxFiles: number;
  compress?: boolean;
}

export interface SliderOptions {
  min: number;
  max: number;
  step: number;
  showValue?: boolean;
  showLabels?: boolean;
  leftLabel?: string;
  rightLabel?: string;
}

export interface RatingOptions {
  maxRating: number;
  icon?: 'star' | 'heart' | 'circle';
  allowHalf?: boolean;
}

// ============================================================================
// Form Fields
// ============================================================================

export interface BaseFormField {
  id: string;
  type: FormFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  defaultValue?: unknown;
  validation?: FieldValidation;
  conditionalLogic?: ConditionalLogic;
  prefillKey?: string; // Key to use for pre-filling from patient profile
  width?: 'full' | 'half' | 'third' | 'quarter';
  className?: string;
  ariaLabel?: string;
  testId?: string;
}

export interface TextFormField extends BaseFormField {
  type: 'text' | 'email' | 'phone' | 'ssn';
  mask?: string;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
}

export interface NumberFormField extends BaseFormField {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

export interface DateFormField extends BaseFormField {
  type: 'date' | 'time' | 'datetime';
  minDate?: string;
  maxDate?: string;
  format?: string;
  showCalendar?: boolean;
}

export interface SelectFormField extends BaseFormField {
  type: 'select' | 'multiselect' | 'radio' | 'checkboxGroup';
  options: SelectOption[];
  allowOther?: boolean;
  otherLabel?: string;
  searchable?: boolean;
  maxSelections?: number;
}

export interface TextareaFormField extends BaseFormField {
  type: 'textarea' | 'multiline';
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  autoGrow?: boolean;
}

export interface CheckboxFormField extends BaseFormField {
  type: 'checkbox';
  checkboxLabel?: string;
}

export interface SignatureFormField extends BaseFormField {
  type: 'signature';
  signatureLabel?: string;
  disclaimer?: string;
  clearButtonLabel?: string;
  dateTimestamp?: boolean;
  ipCapture?: boolean;
}

export interface FileFormField extends BaseFormField {
  type: 'file' | 'image';
  uploadOptions: FileUploadOptions;
  showPreview?: boolean;
}

export interface SliderFormField extends BaseFormField {
  type: 'slider';
  sliderOptions: SliderOptions;
}

export interface RatingFormField extends BaseFormField {
  type: 'rating';
  ratingOptions: RatingOptions;
}

export interface YesNoFormField extends BaseFormField {
  type: 'yesNo';
  yesLabel?: string;
  noLabel?: string;
  followUpFieldId?: string;
}

export interface ConsentFormField extends BaseFormField {
  type: 'consent';
  consentText: string;
  detailedText?: string;
  showDetailLink?: boolean;
  detailLinkLabel?: string;
}

export interface AddressFormField extends BaseFormField {
  type: 'address';
  includeCountry?: boolean;
  countryOptions?: SelectOption[];
  autoComplete?: boolean;
}

export interface HeaderFormField extends BaseFormField {
  type: 'header';
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ParagraphFormField extends BaseFormField {
  type: 'paragraph';
  content: string;
  htmlContent?: boolean;
}

export interface DividerFormField extends BaseFormField {
  type: 'divider';
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface SpacerFormField extends BaseFormField {
  type: 'spacer';
  height?: number;
}

export type FormField =
  | TextFormField
  | NumberFormField
  | DateFormField
  | SelectFormField
  | TextareaFormField
  | CheckboxFormField
  | SignatureFormField
  | FileFormField
  | SliderFormField
  | RatingFormField
  | YesNoFormField
  | ConsentFormField
  | AddressFormField
  | HeaderFormField
  | ParagraphFormField
  | DividerFormField
  | SpacerFormField;

// ============================================================================
// Form Sections
// ============================================================================

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  conditionalLogic?: ConditionalLogic;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  icon?: string;
}

// ============================================================================
// Signature Configuration
// ============================================================================

export interface FormSignatureConfig {
  required: boolean;
  label: string;
  disclaimer: string;
  dateTimestamp?: boolean;
  ipCapture?: boolean;
  witnessRequired?: boolean;
  witnessLabel?: string;
  additionalSignatures?: {
    id: string;
    label: string;
    required: boolean;
    disclaimer?: string;
  }[];
}

// ============================================================================
// Form Schema (Complete Form Definition)
// ============================================================================

export interface FormSchema {
  id: string;
  slug: string;
  title: string;
  description?: string;
  version: string;
  category: FormCategory;
  status: 'draft' | 'published' | 'archived';
  sections: FormSection[];
  signature?: FormSignatureConfig;
  settings: FormSettings;
  metadata: FormMetadata;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}

export type FormCategory =
  | 'medical-intake'
  | 'consent'
  | 'hipaa'
  | 'photography-release'
  | 'payment-authorization'
  | 'emergency-contact'
  | 'treatment-specific'
  | 'follow-up'
  | 'satisfaction'
  | 'custom';

export interface FormSettings {
  allowDraft: boolean;
  autoSaveInterval?: number; // in seconds
  showProgressBar: boolean;
  showSectionNavigation: boolean;
  submitButtonLabel?: string;
  successMessage?: string;
  redirectUrl?: string;
  requireAuthentication: boolean;
  notifyOnSubmission: boolean;
  notificationEmails?: string[];
  expiresAt?: string;
  validForDays?: number;
  maxSubmissions?: number;
  offlineSupport: boolean;
}

export interface FormMetadata {
  tags?: string[];
  treatmentTypes?: string[];
  requiredForAppointment?: boolean;
  reminderEnabled?: boolean;
  reminderHoursBefore?: number;
  estimatedMinutes?: number;
  legalReferences?: string[];
  hipaaCompliant?: boolean;
  encryptionRequired?: boolean;
}

// ============================================================================
// Form Submission & Response
// ============================================================================

export interface FormFieldResponse {
  fieldId: string;
  value: unknown;
  displayValue?: string;
  timestamp: string;
}

export interface SignatureData {
  id: string;
  signatureImage: string; // Base64 encoded PNG
  signedAt: string;
  signedByName?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  verified?: boolean;
}

export interface FormSubmission {
  id: string;
  formId: string;
  formVersion: string;
  patientId: string;
  appointmentId?: string;
  status: FormSubmissionStatus;
  responses: FormFieldResponse[];
  signatures: SignatureData[];
  progress: number; // 0-100
  startedAt: string;
  lastSavedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  pdfUrl?: string;
  encryptedData?: string;
  auditLog: FormAuditEntry[];
  metadata?: Record<string, unknown>;
}

export type FormSubmissionStatus =
  | 'not_started'
  | 'in_progress'
  | 'draft'
  | 'submitted'
  | 'completed'
  | 'expired'
  | 'cancelled';

// ============================================================================
// Audit Trail
// ============================================================================

export interface FormAuditEntry {
  id: string;
  action: FormAuditAction;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  fieldId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
}

export type FormAuditAction =
  | 'form_opened'
  | 'form_started'
  | 'field_changed'
  | 'section_completed'
  | 'draft_saved'
  | 'auto_saved'
  | 'signature_captured'
  | 'form_submitted'
  | 'form_completed'
  | 'form_expired'
  | 'form_cancelled'
  | 'pdf_generated'
  | 'pdf_downloaded'
  | 'form_viewed';

// ============================================================================
// Form Assignment & Requirements
// ============================================================================

export interface FormAssignment {
  id: string;
  formId: string;
  patientId: string;
  appointmentId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired' | 'waived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  assignedAt: string;
  assignedBy?: string;
  completedAt?: string;
  submissionId?: string;
  remindersSent: number;
  lastReminderAt?: string;
  notes?: string;
}

export interface PatientFormRequirements {
  patientId: string;
  upcomingAppointment?: {
    id: string;
    date: string;
    serviceName: string;
  };
  requiredForms: FormAssignment[];
  optionalForms: FormAssignment[];
  completedForms: FormAssignment[];
  totalRequired: number;
  totalCompleted: number;
  completionPercentage: number;
  allRequiredComplete: boolean;
}

// ============================================================================
// Form Templates & Pre-built Forms
// ============================================================================

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: FormCategory;
  thumbnail?: string;
  schema: Omit<FormSchema, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
  isDefault?: boolean;
  popularity?: number;
}

// ============================================================================
// Pre-fill Data
// ============================================================================

export interface PatientPrefillData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  insurance?: {
    provider?: string;
    policyNumber?: string;
    groupNumber?: string;
  };
  medicalHistory?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
  };
}

// ============================================================================
// Form Validation Results
// ============================================================================

export interface FieldValidationResult {
  fieldId: string;
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FormValidationResult {
  isValid: boolean;
  fieldResults: FieldValidationResult[];
  sectionsComplete: Record<string, boolean>;
  progress: number;
  missingRequired: string[];
  signatureRequired: boolean;
  signatureComplete: boolean;
}

// ============================================================================
// API Types
// ============================================================================

export interface GetFormsRequest {
  patientId: string;
  appointmentId?: string;
  status?: FormSubmissionStatus[];
  category?: FormCategory[];
  includeCompleted?: boolean;
}

export interface GetFormsResponse {
  forms: FormAssignment[];
  total: number;
  completedCount: number;
  pendingCount: number;
}

export interface GetFormRequest {
  formId: string;
  submissionId?: string;
}

export interface GetFormResponse {
  form: FormSchema;
  submission?: FormSubmission;
  prefillData?: PatientPrefillData;
}

export interface SaveDraftRequest {
  formId: string;
  submissionId?: string;
  responses: FormFieldResponse[];
  signatures?: SignatureData[];
  progress: number;
}

export interface SaveDraftResponse {
  submissionId: string;
  savedAt: string;
  success: boolean;
}

export interface SubmitFormRequest {
  formId: string;
  submissionId: string;
  responses: FormFieldResponse[];
  signatures: SignatureData[];
}

export interface SubmitFormResponse {
  submissionId: string;
  submittedAt: string;
  success: boolean;
  pdfUrl?: string;
  message?: string;
}

export interface GetFormHistoryRequest {
  patientId: string;
  formId?: string;
  category?: FormCategory[];
  limit?: number;
  offset?: number;
}

export interface GetFormHistoryResponse {
  submissions: FormSubmission[];
  total: number;
  hasMore: boolean;
}
