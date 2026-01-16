/**
 * Mock Storage Service
 *
 * Simulates S3-like storage for development.
 * Replace with real S3 implementation in production.
 */

import crypto from 'crypto';

// ===================
// Types
// ===================

export interface PhotoUploadData {
  patientId: string;
  filename: string;
  contentType: string;
  size: number;
  content?: Buffer; // For testing
}

export interface StorageResult {
  storageKey: string;
  thumbnailKey: string;
  url: string;
}

export interface StorageService {
  uploadPhoto(data: PhotoUploadData): Promise<StorageResult>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deletePhoto(key: string): Promise<void>;
  generateThumbnailKey(key: string): string;
}

// ===================
// Mock Storage Implementation
// ===================

// In-memory storage for mock files
const mockStorage = new Map<string, {
  content: Buffer;
  contentType: string;
  size: number;
  uploadedAt: Date;
}>();

/**
 * Generate a storage key in format: patients/{patientId}/photos/{year}/{month}/{uuid}_{filename}
 */
function generateStorageKey(patientId: string, filename: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uuid = crypto.randomUUID();

  // Sanitize filename (remove special characters except dots and underscores)
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  return `patients/${patientId}/photos/${year}/${month}/${uuid}_${sanitizedFilename}`;
}

/**
 * Generate a thumbnail key from an original key
 */
function generateThumbnailKey(key: string): string {
  const parts = key.split('/');
  const filename = parts.pop() || '';
  const ext = filename.substring(filename.lastIndexOf('.'));
  const basename = filename.substring(0, filename.lastIndexOf('.'));
  parts.push(`${basename}_thumb${ext}`);
  return parts.join('/');
}

/**
 * Generate a mock signed URL with expiration
 */
function generateSignedUrl(key: string, expiresInSeconds: number): string {
  const expiresAt = Date.now() + (expiresInSeconds * 1000);
  const signature = crypto
    .createHmac('sha256', 'mock-secret-key')
    .update(`${key}:${expiresAt}`)
    .digest('hex')
    .substring(0, 16);

  // In production, this would be a real S3 pre-signed URL
  return `https://mock-storage.example.com/${key}?expires=${expiresAt}&sig=${signature}`;
}

/**
 * Validate signed URL (for testing)
 */
export function validateSignedUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const expires = urlObj.searchParams.get('expires');
    const sig = urlObj.searchParams.get('sig');

    if (!expires || !sig) {
      return false;
    }

    const expiresAt = parseInt(expires, 10);
    if (Date.now() > expiresAt) {
      return false;
    }

    // Extract key from pathname
    const key = urlObj.pathname.substring(1); // Remove leading /
    const expectedSig = crypto
      .createHmac('sha256', 'mock-secret-key')
      .update(`${key}:${expiresAt}`)
      .digest('hex')
      .substring(0, 16);

    return sig === expectedSig;
  } catch {
    return false;
  }
}

// ===================
// Mock Storage Service
// ===================

export const mockStorageService: StorageService = {
  async uploadPhoto(data: PhotoUploadData): Promise<StorageResult> {
    const storageKey = generateStorageKey(data.patientId, data.filename);
    const thumbnailKey = generateThumbnailKey(storageKey);

    // Store in mock storage
    mockStorage.set(storageKey, {
      content: data.content || Buffer.alloc(data.size),
      contentType: data.contentType,
      size: data.size,
      uploadedAt: new Date(),
    });

    // In real implementation, would also generate and store thumbnail
    mockStorage.set(thumbnailKey, {
      content: Buffer.alloc(Math.floor(data.size / 10)), // Mock thumbnail is 1/10 size
      contentType: data.contentType,
      size: Math.floor(data.size / 10),
      uploadedAt: new Date(),
    });

    return {
      storageKey,
      thumbnailKey,
      url: generateSignedUrl(storageKey, 3600), // 1 hour default
    };
  },

  async getSignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    // Verify file exists in mock storage
    if (!mockStorage.has(key)) {
      throw new Error(`File not found: ${key}`);
    }

    return generateSignedUrl(key, expiresInSeconds);
  },

  async deletePhoto(key: string): Promise<void> {
    mockStorage.delete(key);

    // Also delete thumbnail if exists
    const thumbnailKey = generateThumbnailKey(key);
    mockStorage.delete(thumbnailKey);
  },

  generateThumbnailKey,
};

// ===================
// Helper Functions for Testing
// ===================

/**
 * Clear all mock storage (for tests)
 */
export function clearMockStorage(): void {
  mockStorage.clear();
}

/**
 * Get mock storage map (for tests)
 */
export function getMockStorage(): Map<string, {
  content: Buffer;
  contentType: string;
  size: number;
  uploadedAt: Date;
}> {
  return mockStorage;
}

/**
 * Add a file directly to mock storage (for tests)
 */
export function addToMockStorage(
  key: string,
  content: Buffer,
  contentType: string
): void {
  mockStorage.set(key, {
    content,
    contentType,
    size: content.length,
    uploadedAt: new Date(),
  });
}

/**
 * Check if a file exists in mock storage
 */
export function existsInMockStorage(key: string): boolean {
  return mockStorage.has(key);
}

// Default export
export default mockStorageService;
