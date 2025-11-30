/**
 * Speech-to-Text Service
 * Handles communication with backend API for speech recognition
 */

import { getApiUrl } from '@/config/api';
import { apiService } from './api.service';

export interface SpeechToTextRequest {
  audio: string; // Base64 encoded audio
  language?: string;
  encoding?: string;
  sampleRateHertz?: number;
}

export interface SpeechToTextResponse {
  transcript: string;
  confidence: number;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

class SpeechService {
  /**
   * Convert audio file to text using backend API
   */
  async speechToText(
    audioBase64: string,
    language: string = 'en-US'
  ): Promise<SpeechToTextResponse> {
    try {
      const response = await apiService.post<SpeechToTextResponse>(
        getApiUrl('/api/voice/speech-to-text'),
        {
          audio: audioBase64,
          language: language,
          encoding: 'LINEAR16',
          sampleRateHertz: 44100,
        }
      );

      return response;
    } catch (error: any) {
      console.error('Speech-to-text API error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to process speech'
      );
    }
  }
}

export const speechService = new SpeechService();

