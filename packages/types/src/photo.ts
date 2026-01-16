/**
 * Photo Types (Before/After Gallery - Key Differentiator!)
 */

export type PhotoType = 'before' | 'after' | 'progress';
export type PhotoStatus = 'pending' | 'approved' | 'rejected';

export interface TreatmentPhoto {
  id: string;
  patientId: string;
  appointmentId?: string;
  treatmentId?: string;

  // Photo details
  type: PhotoType;
  url: string;
  thumbnailUrl?: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;

  // Metadata
  takenAt: string;
  uploadedAt: string;
  uploadedBy: 'patient' | 'staff';

  // Treatment context
  treatmentType?: string;
  bodyArea?: string;
  notes?: string;

  // Privacy
  status: PhotoStatus;
  consentedForMarketing: boolean;
  visibleToPatient: boolean;

  // Quality
  qualityScore?: number;
  flaggedForReview?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface PhotoSet {
  id: string;
  patientId: string;
  treatmentType: string;
  treatmentDate: string;
  providerId?: string;
  providerName?: string;

  // Photos
  beforePhoto?: TreatmentPhoto;
  afterPhoto?: TreatmentPhoto;
  progressPhotos?: TreatmentPhoto[];

  // Notes
  notes?: string;
  results?: string;

  // Privacy
  patientVisible: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface PhotoUploadRequest {
  type: PhotoType;
  treatmentType?: string;
  bodyArea?: string;
  appointmentId?: string;
  notes?: string;
  consentForMarketing?: boolean;
}

export interface PhotoCompareView {
  beforeUrl: string;
  afterUrl: string;
  treatmentType: string;
  treatmentDate: string;
  daysBetween: number;
}
