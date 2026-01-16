/**
 * Pre-built Form Templates for Patient Portal
 */

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  schema: {
    slug: string;
    title: string;
    description: string;
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
      tags?: string[];
      requiredForAppointment?: boolean;
      reminderEnabled?: boolean;
      reminderHoursBefore?: number;
      estimatedMinutes?: number;
      hipaaCompliant?: boolean;
      encryptionRequired?: boolean;
      [key: string]: unknown;
    };
  };
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'medical-intake-v1',
    name: 'Medical Intake Questionnaire',
    description: 'Comprehensive medical history and health information form',
    category: 'medical-intake',
    schema: {
      slug: 'medical-intake',
      title: 'Medical Intake Questionnaire',
      description: 'Please complete this form to help us understand your medical history and provide the best care possible.',
      version: '1.0',
      category: 'medical-intake',
      status: 'published',
      sections: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          description: 'Please verify your personal details',
          fields: [
            { id: 'full_name', type: 'text', label: 'Full Legal Name', required: true, prefillKey: 'fullName', placeholder: 'Enter your full legal name' },
            { id: 'date_of_birth', type: 'date', label: 'Date of Birth', required: true, prefillKey: 'dateOfBirth' },
            { id: 'email', type: 'email', label: 'Email Address', required: true, prefillKey: 'email', placeholder: 'your.email@example.com' },
            { id: 'phone', type: 'phone', label: 'Phone Number', required: true, prefillKey: 'phone', placeholder: '(555) 123-4567' },
            { id: 'address', type: 'address', label: 'Home Address', required: true, prefillKey: 'address' },
          ],
        },
        {
          id: 'emergency-contact',
          title: 'Emergency Contact',
          description: 'Please provide an emergency contact who can be reached if needed',
          fields: [
            { id: 'emergency_name', type: 'text', label: 'Emergency Contact Name', required: true, prefillKey: 'emergencyContact.name', placeholder: 'Full name' },
            { id: 'emergency_relationship', type: 'select', label: 'Relationship', required: true, options: [
              { value: 'spouse', label: 'Spouse' }, { value: 'parent', label: 'Parent' }, { value: 'sibling', label: 'Sibling' },
              { value: 'child', label: 'Child' }, { value: 'friend', label: 'Friend' }, { value: 'other', label: 'Other' },
            ]},
            { id: 'emergency_phone', type: 'phone', label: 'Emergency Contact Phone', required: true, prefillKey: 'emergencyContact.phone', placeholder: '(555) 123-4567' },
          ],
        },
        {
          id: 'medical-history',
          title: 'Medical History',
          description: 'Please provide information about your medical history',
          fields: [
            { id: 'current_medications', type: 'multiline', label: 'Current Medications', description: 'List all medications, vitamins, and supplements you are currently taking', required: true, placeholder: 'Enter medications, dosages, and frequency...', rows: 4 },
            { id: 'allergies', type: 'multiline', label: 'Known Allergies', description: 'Include drug allergies, food allergies, and any other sensitivities', required: true, placeholder: 'List all known allergies and reactions...', rows: 3 },
            { id: 'medical_conditions', type: 'checkboxGroup', label: 'Do you have any of the following conditions?', required: false, options: [
              { value: 'diabetes', label: 'Diabetes' }, { value: 'hypertension', label: 'High Blood Pressure' }, { value: 'heart_disease', label: 'Heart Disease' },
              { value: 'thyroid', label: 'Thyroid Disorder' }, { value: 'autoimmune', label: 'Autoimmune Disease' }, { value: 'bleeding_disorder', label: 'Bleeding Disorder' },
              { value: 'seizures', label: 'Seizures/Epilepsy' }, { value: 'cancer', label: 'Cancer (current or history)' }, { value: 'keloids', label: 'Keloid Scarring' },
              { value: 'herpes', label: 'Herpes (cold sores)' },
            ]},
            { id: 'previous_surgeries', type: 'yesNo', label: 'Have you had any previous surgeries?', required: true },
            { id: 'surgery_details', type: 'multiline', label: 'Surgery Details', description: 'Please describe your previous surgeries and approximate dates', required: false, placeholder: 'Type, date, and any complications...', rows: 3,
              conditionalLogic: { rules: [{ id: 'show-surgery', sourceFieldId: 'previous_surgeries', operator: 'equals', value: true, action: 'show' }], logic: 'and' }},
          ],
        },
        {
          id: 'aesthetic-history',
          title: 'Aesthetic Treatment History',
          description: 'Tell us about your previous aesthetic treatments',
          fields: [
            { id: 'previous_treatments', type: 'checkboxGroup', label: 'Have you had any of the following treatments?', required: false, options: [
              { value: 'botox', label: 'Botox/Dysport' }, { value: 'filler', label: 'Dermal Fillers' }, { value: 'laser', label: 'Laser Treatments' },
              { value: 'chemical_peel', label: 'Chemical Peels' }, { value: 'microneedling', label: 'Microneedling' }, { value: 'prf', label: 'PRF/PRP' },
              { value: 'facial_surgery', label: 'Facial Surgery' }, { value: 'other', label: 'Other' },
            ]},
            { id: 'treatment_complications', type: 'yesNo', label: 'Have you experienced any complications from previous treatments?', required: true },
            { id: 'skin_concerns', type: 'multiline', label: 'What are your primary skin concerns?', required: true, placeholder: 'Describe your aesthetic goals and concerns...', rows: 4 },
          ],
        },
        {
          id: 'lifestyle',
          title: 'Lifestyle Information',
          fields: [
            { id: 'pregnant', type: 'yesNo', label: 'Are you pregnant or trying to become pregnant?', required: true },
            { id: 'breastfeeding', type: 'yesNo', label: 'Are you currently breastfeeding?', required: true },
            { id: 'smoking', type: 'radio', label: 'Do you smoke or use tobacco products?', required: true, options: [
              { value: 'never', label: 'Never' }, { value: 'former', label: 'Former smoker' }, { value: 'current', label: 'Current smoker' },
            ]},
            { id: 'alcohol', type: 'radio', label: 'How often do you consume alcohol?', required: true, options: [
              { value: 'never', label: 'Never' }, { value: 'occasionally', label: 'Occasionally (1-2 drinks/week)' },
              { value: 'moderate', label: 'Moderate (3-7 drinks/week)' }, { value: 'frequent', label: 'Frequent (daily)' },
            ]},
            { id: 'sun_exposure', type: 'radio', label: 'How would you describe your sun exposure?', required: true, options: [
              { value: 'minimal', label: 'Minimal (mostly indoors)' }, { value: 'moderate', label: 'Moderate (some outdoor activities)' },
              { value: 'frequent', label: 'Frequent (outdoor work/activities)' },
            ]},
          ],
        },
      ],
      signature: {
        required: true,
        label: 'Patient Signature',
        disclaimer: 'By signing below, I certify that the information provided above is accurate and complete to the best of my knowledge.',
        dateTimestamp: true,
        ipCapture: true,
      },
      settings: {
        allowDraft: true,
        autoSaveInterval: 30,
        showProgressBar: true,
        showSectionNavigation: true,
        submitButtonLabel: 'Submit Intake Form',
        successMessage: 'Thank you! Your medical intake form has been submitted successfully.',
        requireAuthentication: true,
        notifyOnSubmission: true,
        offlineSupport: true,
      },
      metadata: {
        tags: ['intake', 'medical', 'history'],
        requiredForAppointment: true,
        reminderEnabled: true,
        reminderHoursBefore: 24,
        estimatedMinutes: 15,
        hipaaCompliant: true,
        encryptionRequired: true,
      },
    },
  },
  {
    id: 'hipaa-authorization-v1',
    name: 'HIPAA Authorization Form',
    description: 'Authorization for use and disclosure of protected health information',
    category: 'hipaa',
    schema: {
      slug: 'hipaa-authorization',
      title: 'HIPAA Authorization Form',
      description: 'Authorization for the Use and Disclosure of Protected Health Information (PHI)',
      version: '1.0',
      category: 'hipaa',
      status: 'published',
      sections: [
        {
          id: 'patient-info',
          title: 'Patient Information',
          fields: [
            { id: 'patient_name', type: 'text', label: 'Patient Name', required: true, prefillKey: 'fullName' },
            { id: 'date_of_birth', type: 'date', label: 'Date of Birth', required: true, prefillKey: 'dateOfBirth' },
          ],
        },
        {
          id: 'authorization-details',
          title: 'Authorization Details',
          fields: [
            { id: 'hipaa_notice', type: 'paragraph', label: '', content: 'The Health Insurance Portability and Accountability Act of 1996 (HIPAA) provides safeguards to protect your privacy. This authorization form is meant to ensure that you understand your rights under HIPAA.' },
            { id: 'authorization_type', type: 'checkboxGroup', label: 'I authorize Luxe Medical Spa to:', required: true, options: [
              { value: 'treatment', label: 'Use and disclose my health information for treatment purposes' },
              { value: 'payment', label: 'Use and disclose my health information for payment purposes' },
              { value: 'operations', label: 'Use and disclose my health information for healthcare operations' },
              { value: 'marketing', label: 'Contact me for appointment reminders and health-related information' },
            ]},
            { id: 'third_party_disclosure', type: 'yesNo', label: 'Do you authorize disclosure of your health information to a third party (family member, caregiver)?', required: true },
            { id: 'third_party_name', type: 'text', label: 'Third Party Name', required: false,
              conditionalLogic: { rules: [{ id: 'show-third-party', sourceFieldId: 'third_party_disclosure', operator: 'equals', value: true, action: 'show' }], logic: 'and' }},
            { id: 'third_party_relationship', type: 'text', label: 'Relationship to Patient', required: false,
              conditionalLogic: { rules: [{ id: 'show-third-party-rel', sourceFieldId: 'third_party_disclosure', operator: 'equals', value: true, action: 'show' }], logic: 'and' }},
          ],
        },
        {
          id: 'patient-rights',
          title: 'Patient Rights',
          fields: [
            { id: 'rights_notice', type: 'paragraph', label: '', content: 'You have the right to:\n\n- Revoke this authorization at any time\n- Request restrictions on uses and disclosures\n- Request access to and copies of your health records\n- Request amendments to your health records\n- Receive an accounting of disclosures' },
            { id: 'acknowledge_rights', type: 'consent', label: 'Acknowledgment of Rights', consentText: 'I acknowledge that I have been informed of my rights under HIPAA and have received or been offered a copy of the Notice of Privacy Practices.', required: true },
          ],
        },
      ],
      signature: {
        required: true,
        label: 'Patient/Legal Representative Signature',
        disclaimer: 'By signing below, I authorize Luxe Medical Spa to use and disclose my protected health information as described above.',
        dateTimestamp: true,
        ipCapture: true,
      },
      settings: {
        allowDraft: true,
        autoSaveInterval: 30,
        showProgressBar: true,
        showSectionNavigation: true,
        submitButtonLabel: 'Submit Authorization',
        successMessage: 'Your HIPAA authorization has been submitted successfully.',
        requireAuthentication: true,
        notifyOnSubmission: true,
        offlineSupport: true,
      },
      metadata: {
        tags: ['hipaa', 'privacy', 'authorization', 'legal'],
        requiredForAppointment: true,
        reminderEnabled: true,
        reminderHoursBefore: 24,
        estimatedMinutes: 5,
        hipaaCompliant: true,
        encryptionRequired: true,
      },
    },
  },
  {
    id: 'photo-release-v1',
    name: 'Photography Release Form',
    description: 'Consent for before/after photography and potential marketing use',
    category: 'photography-release',
    schema: {
      slug: 'photo-release',
      title: 'Photography Release Form',
      description: 'Consent for clinical photography and potential use in marketing materials',
      version: '1.0',
      category: 'photography-release',
      status: 'published',
      sections: [
        {
          id: 'patient-info',
          title: 'Patient Information',
          fields: [
            { id: 'patient_name', type: 'text', label: 'Patient Name', required: true, prefillKey: 'fullName' },
            { id: 'date_of_birth', type: 'date', label: 'Date of Birth', required: true, prefillKey: 'dateOfBirth' },
          ],
        },
        {
          id: 'photo-consent',
          title: 'Photography Consent',
          fields: [
            { id: 'photo_purpose', type: 'paragraph', label: '', content: 'Before and after photographs are an important part of documenting your treatment progress and results. These photographs become part of your confidential medical record.' },
            { id: 'clinical_photos', type: 'consent', label: 'Clinical Photography', consentText: 'I consent to having photographs taken of the treatment area(s) before, during, and after my procedures for my medical record.', required: true },
            { id: 'marketing_consent', type: 'radio', label: 'Marketing and Educational Use', description: 'May we use your photographs (without identifying information) for educational and marketing purposes?', required: true, options: [
              { value: 'yes_all', label: 'Yes - You may use my photos for all marketing and educational purposes' },
              { value: 'yes_limited', label: 'Yes - But only for in-office educational displays (not social media or website)' },
              { value: 'no', label: 'No - Please only use my photos for my medical record' },
            ]},
            { id: 'social_media_platforms', type: 'checkboxGroup', label: 'If you consent to marketing use, which platforms may we use?', required: false, options: [
              { value: 'website', label: 'Practice Website' }, { value: 'instagram', label: 'Instagram' }, { value: 'facebook', label: 'Facebook' },
              { value: 'before_after_gallery', label: 'Before/After Gallery (in-office)' }, { value: 'print_materials', label: 'Print Marketing Materials' },
            ], conditionalLogic: { rules: [{ id: 'show-platforms', sourceFieldId: 'marketing_consent', operator: 'equals', value: 'yes_all', action: 'show' }], logic: 'and' }},
          ],
        },
        {
          id: 'acknowledgments',
          title: 'Acknowledgments',
          fields: [
            { id: 'understand_no_compensation', type: 'consent', label: 'Compensation', consentText: 'I understand that I will not receive any compensation for the use of my photographs.', required: true },
            { id: 'understand_withdrawal', type: 'consent', label: 'Right to Withdraw', consentText: 'I understand that I may withdraw my consent for marketing use at any time by submitting a written request.', required: true },
            { id: 'understand_privacy', type: 'consent', label: 'Privacy Protection', consentText: 'I understand that my name and identifying information will not be used in connection with any marketing photographs.', required: true },
          ],
        },
      ],
      signature: {
        required: true,
        label: 'Patient Signature',
        disclaimer: 'By signing below, I grant Luxe Medical Spa permission to use my photographs as indicated above.',
        dateTimestamp: true,
        ipCapture: true,
      },
      settings: {
        allowDraft: true,
        autoSaveInterval: 30,
        showProgressBar: true,
        showSectionNavigation: true,
        submitButtonLabel: 'Submit Photo Release',
        successMessage: 'Your photography release form has been submitted successfully.',
        requireAuthentication: true,
        notifyOnSubmission: true,
        offlineSupport: true,
      },
      metadata: {
        tags: ['photography', 'release', 'consent', 'marketing'],
        requiredForAppointment: false,
        reminderEnabled: false,
        estimatedMinutes: 5,
        hipaaCompliant: true,
      },
    },
  },
  {
    id: 'consent-botox-v1',
    name: 'Botox/Neurotoxin Consent Form',
    description: 'Informed consent for botulinum toxin treatments',
    category: 'consent',
    schema: {
      slug: 'consent-botox',
      title: 'Informed Consent for Botulinum Toxin Treatment',
      description: 'Please read this entire document carefully before signing',
      version: '1.0',
      category: 'consent',
      status: 'published',
      sections: [
        {
          id: 'treatment-info',
          title: 'Treatment Information',
          fields: [
            { id: 'treatment_explanation', type: 'paragraph', label: '', content: 'Botulinum toxin (Botox, Dysport, Xeomin, Jeuveau) is a purified protein used to temporarily improve the appearance of moderate to severe frown lines, crow\'s feet, and forehead lines.' },
            { id: 'treatment_areas', type: 'checkboxGroup', label: 'Areas to be treated (to be discussed with your provider):', required: false, options: [
              { value: 'forehead', label: 'Forehead Lines' }, { value: 'glabella', label: 'Glabellar Lines (between eyebrows)' },
              { value: 'crows_feet', label: 'Crow\'s Feet' }, { value: 'bunny_lines', label: 'Bunny Lines (nose)' },
              { value: 'lip_lines', label: 'Lip Lines' }, { value: 'chin', label: 'Chin' },
              { value: 'masseter', label: 'Masseter (jawline slimming)' }, { value: 'neck', label: 'Neck Bands' },
            ]},
          ],
        },
        {
          id: 'risks-benefits',
          title: 'Risks and Benefits',
          fields: [
            { id: 'benefits_header', type: 'header', label: 'Expected Benefits', level: 3 },
            { id: 'benefits_text', type: 'paragraph', label: '', content: '- Temporary reduction in wrinkles and fine lines\n- Results typically last 3-4 months\n- Minimal downtime\n- Quick procedure (10-20 minutes)' },
            { id: 'risks_header', type: 'header', label: 'Potential Risks and Side Effects', level: 3 },
            { id: 'risks_text', type: 'paragraph', label: '', content: 'Common: Temporary redness, swelling, or bruising, headache\n\nLess common: Drooping eyelid or eyebrow (temporary), asymmetry, muscle weakness' },
            { id: 'acknowledge_risks', type: 'consent', label: 'Risk Acknowledgment', consentText: 'I understand the potential risks and side effects of botulinum toxin treatment as described above.', required: true },
          ],
        },
        {
          id: 'contraindications',
          title: 'Contraindications',
          fields: [
            { id: 'contraindications_notice', type: 'paragraph', label: '', content: 'You should NOT receive this treatment if you:\n- Are pregnant or breastfeeding\n- Have a neuromuscular disease\n- Have an infection at the injection site\n- Are allergic to any botulinum toxin product' },
            { id: 'confirm_no_contraindications', type: 'consent', label: 'Contraindication Confirmation', consentText: 'I confirm that I do not have any of the contraindications listed above, or I have disclosed them to my provider.', required: true },
          ],
        },
        {
          id: 'final-consent',
          title: 'Consent and Agreement',
          fields: [
            { id: 'questions_answered', type: 'consent', label: 'Questions Answered', consentText: 'I have had the opportunity to ask questions about this procedure, and all my questions have been answered to my satisfaction.', required: true },
            { id: 'voluntary_consent', type: 'consent', label: 'Voluntary Consent', consentText: 'I voluntarily consent to this procedure and understand that results may vary.', required: true },
            { id: 'financial_responsibility', type: 'consent', label: 'Financial Responsibility', consentText: 'I understand that cosmetic procedures are not covered by insurance and I am financially responsible for the full cost of treatment.', required: true },
          ],
        },
      ],
      signature: {
        required: true,
        label: 'Patient Signature',
        disclaimer: 'By signing below, I acknowledge that I have read this informed consent form in its entirety and voluntarily consent to the proposed treatment.',
        dateTimestamp: true,
        ipCapture: true,
      },
      settings: {
        allowDraft: true,
        autoSaveInterval: 30,
        showProgressBar: true,
        showSectionNavigation: true,
        submitButtonLabel: 'Submit Consent',
        successMessage: 'Your consent form has been submitted successfully.',
        requireAuthentication: true,
        notifyOnSubmission: true,
        offlineSupport: true,
      },
      metadata: {
        tags: ['consent', 'botox', 'neurotoxin', 'injectable'],
        treatmentTypes: ['botox', 'dysport', 'xeomin', 'jeuveau'],
        requiredForAppointment: true,
        reminderEnabled: true,
        reminderHoursBefore: 24,
        estimatedMinutes: 10,
        hipaaCompliant: true,
        encryptionRequired: true,
      },
    },
  },
  {
    id: 'payment-auth-v1',
    name: 'Payment Authorization Form',
    description: 'Authorization to charge payment method for services',
    category: 'payment-authorization',
    schema: {
      slug: 'payment-authorization',
      title: 'Payment Authorization Form',
      description: 'Authorization for payment of services rendered',
      version: '1.0',
      category: 'payment-authorization',
      status: 'published',
      sections: [
        {
          id: 'patient-info',
          title: 'Patient Information',
          fields: [
            { id: 'patient_name', type: 'text', label: 'Patient Name', required: true, prefillKey: 'fullName' },
            { id: 'email', type: 'email', label: 'Email Address', required: true, prefillKey: 'email' },
            { id: 'phone', type: 'phone', label: 'Phone Number', required: true, prefillKey: 'phone' },
          ],
        },
        {
          id: 'payment-policies',
          title: 'Payment Policies',
          fields: [
            { id: 'policies_notice', type: 'paragraph', label: '', content: 'Payment Policies:\n\n1. Payment is due at the time of service.\n2. We accept cash, credit cards, and CareCredit.\n3. Refunds are not provided for services already rendered.' },
            { id: 'acknowledge_policies', type: 'consent', label: 'Payment Policy Acknowledgment', consentText: 'I have read and understand the payment policies outlined above.', required: true },
          ],
        },
        {
          id: 'cancellation-policy',
          title: 'Cancellation Policy',
          fields: [
            { id: 'cancellation_notice', type: 'paragraph', label: '', content: 'Cancellation Policy:\n\n- We require at least 24 hours notice for cancellations.\n- Late cancellations or no-shows may be subject to a cancellation fee.' },
            { id: 'acknowledge_cancellation', type: 'consent', label: 'Cancellation Policy Acknowledgment', consentText: 'I understand and agree to the cancellation policy.', required: true },
          ],
        },
        {
          id: 'authorization',
          title: 'Payment Authorization',
          fields: [
            { id: 'card_on_file', type: 'yesNo', label: 'Do you authorize us to keep a payment method on file for future services?', required: true },
            { id: 'auto_charge_auth', type: 'consent', label: 'Treatment Day Authorization', consentText: 'I authorize Luxe Medical Spa to charge my payment method on file for services rendered on the day of my appointment.', required: true },
          ],
        },
      ],
      signature: {
        required: true,
        label: 'Cardholder/Patient Signature',
        disclaimer: 'By signing below, I authorize Luxe Medical Spa to charge my payment method as outlined in this authorization form.',
        dateTimestamp: true,
        ipCapture: true,
      },
      settings: {
        allowDraft: false,
        showProgressBar: true,
        showSectionNavigation: true,
        submitButtonLabel: 'Authorize Payment',
        successMessage: 'Your payment authorization has been submitted successfully.',
        requireAuthentication: true,
        notifyOnSubmission: true,
        offlineSupport: false,
      },
      metadata: {
        tags: ['payment', 'authorization', 'billing'],
        requiredForAppointment: false,
        reminderEnabled: false,
        estimatedMinutes: 5,
        hipaaCompliant: true,
        encryptionRequired: true,
      },
    },
  },
];

export default FORM_TEMPLATES;
