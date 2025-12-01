/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { getApiUrl } from '@/config/api';
import { AuthService as AuthStorage } from '@/lib/auth';
import { router } from 'expo-router';
import { apiService } from './api.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    role?: string;
    [key: string]: any;
  };
}

class AuthApiService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      getApiUrl('/api/auth/login'),
      credentials
    );
    await AuthStorage.setAuth(response.token, response.user);
    return response;
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      getApiUrl('/api/auth/register'), // backend endpoint
      {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        password: data.password,
      }
    );
    await AuthStorage.setAuth(response.token, response.user);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(getApiUrl('/api/auth/logout'));
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await AuthStorage.clearAuth();
      router.replace('/login');
    }
  }
}

export const authService = new AuthApiService();
