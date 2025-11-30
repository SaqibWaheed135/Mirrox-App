/**
 * API Configuration
 * Centralized API endpoints and configuration
 */

export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.17:5000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
    },
    ADMIN: {
      STATS: '/api/admin/stats',
      USERS: '/api/admin/users',
      HAIRCUTS: '/api/admin/haircuts',
    },
    VOICE: {
      SPEECH_TO_TEXT: '/api/voice/speech-to-text',
    },
  },
  TIMEOUT: 10000, // 10 seconds
  // Google Speech-to-Text API Key (optional - for direct API calls)
  // Set this in your environment variables or config
  GOOGLE_SPEECH_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY || '',
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

