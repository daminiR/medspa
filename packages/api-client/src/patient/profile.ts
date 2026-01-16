/**
 * Profile API Functions
 */

import type { ApiClient } from '../client';
import type { User, PatientProfile, UpdateProfileRequest } from './types';
import { patientEndpoints } from './index';

export interface ProfileApi {
  /**
   * Get patient profile
   */
  get(): Promise<{
    user: User;
    patient: PatientProfile;
    referralProgram: any | null;
    notificationPreferences: any | null;
  }>;

  /**
   * Update patient profile
   */
  update(data: UpdateProfileRequest): Promise<{
    message: string;
    user: Partial<User>;
    patient: Partial<PatientProfile>;
  }>;

  /**
   * Upload profile photo
   */
  uploadPhoto(file: File): Promise<{
    message: string;
    avatarUrl: string;
    filename: string;
    size: number;
    type: string;
  }>;

  /**
   * Delete profile photo
   */
  deletePhoto(): Promise<{ message: string }>;
}

export function createProfileApi(client: ApiClient): ProfileApi {
  return {
    async get() {
      const response = await client.get<{
        data: {
          user: User;
          patient: PatientProfile;
          referralProgram: any | null;
          notificationPreferences: any | null;
        };
      }>(patientEndpoints.profile.get);
      return response.data;
    },

    async update(data: UpdateProfileRequest) {
      const response = await client.patch<{
        data: {
          message: string;
          user: Partial<User>;
          patient: Partial<PatientProfile>;
        };
      }>(patientEndpoints.profile.update, data);
      return response.data;
    },

    async uploadPhoto(file: File) {
      const formData = new FormData();
      formData.append('file', file);

      const response = await client.post<{
        data: {
          message: string;
          avatarUrl: string;
          filename: string;
          size: number;
          type: string;
        };
      }>(patientEndpoints.profile.uploadPhoto, formData);
      return response.data;
    },

    async deletePhoto() {
      const response = await client.delete<{ data: { message: string } }>(
        patientEndpoints.profile.uploadPhoto
      );
      return response.data;
    },
  };
}
