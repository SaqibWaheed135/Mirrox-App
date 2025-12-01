/**
 * Profile Service
 * Handles all profile-related API calls
 */

import { getApiUrl } from '@/config/api';
import { apiService } from './api.service';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  profileImage?: string;
  faceScanData?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    profileImage?: string;
    faceScanData?: string;
    [key: string]: any;
  };
}

class ProfileApiService {
  async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
    const response = await apiService.put<ProfileResponse>(
      getApiUrl('/api/auth/profile'),
      data
    );
    return response;
  }

  async getProfile(): Promise<ProfileResponse> {
    const response = await apiService.get<ProfileResponse>(
      getApiUrl('/api/auth/me')
    );
    return response;
  }
}

export const profileService = new ProfileApiService();