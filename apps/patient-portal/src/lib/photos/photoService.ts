/**
 * Photo Service - Mock data and utility functions for photo management
 */

import type { TreatmentPhoto, PhotoSet, PhotoType, PhotoUploadRequest } from '@/../../packages/types/src/photo';

// Treatment types available for photos
export const TREATMENT_TYPES = [
  'Botox',
  'Dermal Fillers',
  'Chemical Peel',
  'Microneedling',
  'Laser Treatment',
  'HydraFacial',
  'IPL Photofacial',
  'Lip Augmentation',
  'Skin Tightening',
  'Body Contouring',
] as const;

// Body areas for categorization
export const BODY_AREAS = [
  'Face',
  'Forehead',
  'Eyes',
  'Cheeks',
  'Lips',
  'Chin',
  'Jawline',
  'Neck',
  'Hands',
  'Body',
] as const;

// Generate mock photos
const generateMockPhotos = (): TreatmentPhoto[] => {
  const photos: TreatmentPhoto[] = [];
  const patientId = 'patient-001';

  // Create sets of before/after/progress photos
  const photoData = [
    {
      treatmentType: 'Botox',
      bodyArea: 'Forehead',
      dates: ['2024-01-15', '2024-01-15', '2024-02-15'],
      types: ['before', 'after', 'progress'] as PhotoType[],
    },
    {
      treatmentType: 'Dermal Fillers',
      bodyArea: 'Lips',
      dates: ['2024-02-20', '2024-02-20'],
      types: ['before', 'after'] as PhotoType[],
    },
    {
      treatmentType: 'Chemical Peel',
      bodyArea: 'Face',
      dates: ['2024-03-10', '2024-03-10', '2024-03-17', '2024-03-24'],
      types: ['before', 'after', 'progress', 'progress'] as PhotoType[],
    },
    {
      treatmentType: 'Microneedling',
      bodyArea: 'Cheeks',
      dates: ['2024-04-05', '2024-04-05'],
      types: ['before', 'after'] as PhotoType[],
    },
    {
      treatmentType: 'HydraFacial',
      bodyArea: 'Face',
      dates: ['2024-05-12', '2024-05-12'],
      types: ['before', 'after'] as PhotoType[],
    },
    {
      treatmentType: 'Laser Treatment',
      bodyArea: 'Face',
      dates: ['2024-06-01', '2024-06-01', '2024-07-01', '2024-08-01'],
      types: ['before', 'after', 'progress', 'progress'] as PhotoType[],
    },
    {
      treatmentType: 'Lip Augmentation',
      bodyArea: 'Lips',
      dates: ['2024-07-20', '2024-07-20'],
      types: ['before', 'after'] as PhotoType[],
    },
    {
      treatmentType: 'Skin Tightening',
      bodyArea: 'Neck',
      dates: ['2024-08-15', '2024-08-15', '2024-09-15'],
      types: ['before', 'after', 'progress'] as PhotoType[],
    },
  ];

  let photoIndex = 1;
  photoData.forEach((data, setIndex) => {
    data.dates.forEach((date, i) => {
      const type = data.types[i];
      const paddedIndex = String(photoIndex).padStart(3, '0');
      photos.push({
        id: 'photo-' + paddedIndex,
        patientId,
        appointmentId: 'appt-' + (setIndex + 1),
        treatmentId: 'treatment-' + (setIndex + 1),
        type,
        url: 'https://picsum.photos/seed/' + (photoIndex + 100) + '/800/600',
        thumbnailUrl: 'https://picsum.photos/seed/' + (photoIndex + 100) + '/200/150',
        originalFilename: data.treatmentType.toLowerCase().replace(/\s+/g, '-') + '-' + type + '-' + (i + 1) + '.jpg',
        mimeType: 'image/jpeg',
        fileSize: Math.floor(Math.random() * 2000000) + 500000,
        takenAt: date + 'T10:00:00Z',
        uploadedAt: date + 'T12:00:00Z',
        uploadedBy: i % 3 === 0 ? 'patient' : 'staff',
        treatmentType: data.treatmentType,
        bodyArea: data.bodyArea,
        notes: type === 'before'
          ? 'Pre-treatment photo for ' + data.treatmentType
          : type === 'after'
          ? 'Post-treatment results - ' + data.treatmentType
          : 'Progress check - Day ' + ((i - 1) * 7),
        status: 'approved',
        consentedForMarketing: Math.random() > 0.5,
        visibleToPatient: true,
        qualityScore: Math.floor(Math.random() * 20) + 80,
        flaggedForReview: false,
        createdAt: date + 'T12:00:00Z',
        updatedAt: date + 'T12:00:00Z',
      });
      photoIndex++;
    });
  });

  return photos;
};

// Generate photo sets from individual photos
const generatePhotoSets = (photos: TreatmentPhoto[]): PhotoSet[] => {
  const setMap = new Map<string, PhotoSet>();

  photos.forEach((photo) => {
    const key = photo.treatmentType + '-' + photo.appointmentId;

    if (!setMap.has(key)) {
      setMap.set(key, {
        id: 'set-' + (setMap.size + 1),
        patientId: photo.patientId,
        treatmentType: photo.treatmentType || 'Unknown',
        treatmentDate: photo.takenAt.split('T')[0],
        providerId: 'provider-001',
        providerName: 'Dr. Sarah Chen',
        progressPhotos: [],
        notes: photo.treatmentType + ' treatment session',
        results: 'Excellent results achieved',
        patientVisible: true,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
      });
    }

    const set = setMap.get(key)!;
    if (photo.type === 'before') {
      set.beforePhoto = photo;
    } else if (photo.type === 'after') {
      set.afterPhoto = photo;
    } else if (photo.type === 'progress') {
      set.progressPhotos = set.progressPhotos || [];
      set.progressPhotos.push(photo);
    }
  });

  return Array.from(setMap.values());
};

// Mock data store
let mockPhotos = generateMockPhotos();
let mockPhotoSets = generatePhotoSets(mockPhotos);

// Service functions
export const photoService = {
  // Get all photos for the current patient
  getAllPhotos: (): TreatmentPhoto[] => {
    return [...mockPhotos].sort((a, b) =>
      new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
    );
  },

  // Get a single photo by ID
  getPhotoById: (id: string): TreatmentPhoto | undefined => {
    return mockPhotos.find((p) => p.id === id);
  },

  // Get photos filtered by type
  getPhotosByType: (type: PhotoType): TreatmentPhoto[] => {
    return mockPhotos.filter((p) => p.type === type);
  },

  // Get photos filtered by treatment type
  getPhotosByTreatment: (treatmentType: string): TreatmentPhoto[] => {
    return mockPhotos.filter((p) => p.treatmentType === treatmentType);
  },

  // Get photos filtered by date range
  getPhotosByDateRange: (startDate: string, endDate: string): TreatmentPhoto[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return mockPhotos.filter((p) => {
      const photoDate = new Date(p.takenAt);
      return photoDate >= start && photoDate <= end;
    });
  },

  // Get all photo sets
  getAllPhotoSets: (): PhotoSet[] => {
    return [...mockPhotoSets].sort((a, b) =>
      new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime()
    );
  },

  // Get photo set by ID
  getPhotoSetById: (id: string): PhotoSet | undefined => {
    return mockPhotoSets.find((s) => s.id === id);
  },

  // Get before/after pairs for comparison
  getBeforeAfterPairs: (): { before: TreatmentPhoto; after: TreatmentPhoto; treatmentType: string; daysBetween: number }[] => {
    const pairs: { before: TreatmentPhoto; after: TreatmentPhoto; treatmentType: string; daysBetween: number }[] = [];

    mockPhotoSets.forEach((set) => {
      if (set.beforePhoto && set.afterPhoto) {
        const beforeDate = new Date(set.beforePhoto.takenAt);
        const afterDate = new Date(set.afterPhoto.takenAt);
        const daysBetween = Math.ceil((afterDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24));

        pairs.push({
          before: set.beforePhoto,
          after: set.afterPhoto,
          treatmentType: set.treatmentType,
          daysBetween,
        });
      }
    });

    return pairs;
  },

  // Upload a new photo (mock implementation)
  uploadPhoto: async (
    file: File,
    request: PhotoUploadRequest
  ): Promise<TreatmentPhoto> => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newPhoto: TreatmentPhoto = {
      id: 'photo-' + Date.now(),
      patientId: 'patient-001',
      appointmentId: request.appointmentId,
      type: request.type,
      url: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      originalFilename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      takenAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'patient',
      treatmentType: request.treatmentType,
      bodyArea: request.bodyArea,
      notes: request.notes,
      status: 'pending',
      consentedForMarketing: request.consentForMarketing || false,
      visibleToPatient: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPhotos = [newPhoto, ...mockPhotos];
    mockPhotoSets = generatePhotoSets(mockPhotos);

    return newPhoto;
  },

  // Delete a photo (mock implementation)
  deletePhoto: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const initialLength = mockPhotos.length;
    mockPhotos = mockPhotos.filter((p) => p.id !== id);
    mockPhotoSets = generatePhotoSets(mockPhotos);
    return mockPhotos.length < initialLength;
  },

  // Get photos grouped by month for timeline
  getPhotosGroupedByMonth: (): Map<string, TreatmentPhoto[]> => {
    const grouped = new Map<string, TreatmentPhoto[]>();

    mockPhotos.forEach((photo) => {
      const date = new Date(photo.takenAt);
      const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(photo);
    });

    // Sort each group by date
    grouped.forEach((photos, key) => {
      grouped.set(key, photos.sort((a, b) =>
        new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
      ));
    });

    return new Map([...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0])));
  },

  // Get photos grouped by treatment for timeline
  getPhotosGroupedByTreatment: (): Map<string, TreatmentPhoto[]> => {
    const grouped = new Map<string, TreatmentPhoto[]>();

    mockPhotos.forEach((photo) => {
      const key = photo.treatmentType || 'Other';

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(photo);
    });

    // Sort each group by date
    grouped.forEach((photos, key) => {
      grouped.set(key, photos.sort((a, b) =>
        new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
      ));
    });

    return grouped;
  },

  // Get unique treatment types from photos
  getUniqueTreatmentTypes: (): string[] => {
    const types = new Set<string>();
    mockPhotos.forEach((p) => {
      if (p.treatmentType) types.add(p.treatmentType);
    });
    return Array.from(types).sort();
  },

  // Format file size for display
  formatFileSize: (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  // Get photo type label
  getPhotoTypeLabel: (type: PhotoType): string => {
    switch (type) {
      case 'before':
        return 'Before';
      case 'after':
        return 'After';
      case 'progress':
        return 'Progress';
      default:
        return type;
    }
  },

  // Get photo type color
  getPhotoTypeColor: (type: PhotoType): string => {
    switch (type) {
      case 'before':
        return 'bg-blue-100 text-blue-800';
      case 'after':
        return 'bg-green-100 text-green-800';
      case 'progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },
};

export type { TreatmentPhoto, PhotoSet, PhotoType, PhotoUploadRequest };
