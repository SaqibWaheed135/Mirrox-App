/**
 * API Configuration
 * Centralized API endpoints and configuration
 */

export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.16:8000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

