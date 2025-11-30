import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system/legacy'; // ← Add /legacy
import { speechService } from "./speech.service";

export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
}

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isListening = false;

  // Supported formats we can detect
  private audioEncoding: "WEBM_OPUS" | "OGG_OPUS" | "MP4_AAC" = "WEBM_OPUS";

  /**
   * Configure audio mode
   */
  private async setupAudioMode() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    });
  }

  /**
   * Ask mic permissions
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync();
    return status === "granted";
  }

  /**
   * Detect encoding based on file extension
   */
  private detectEncoding(uri: string) {
    if (uri.endsWith(".m4a")) {
      this.audioEncoding = "MP4_AAC";
    } else if (uri.endsWith(".webm")) {
      this.audioEncoding = "WEBM_OPUS";
    } else if (uri.endsWith(".ogg")) {
      this.audioEncoding = "OGG_OPUS";
    } else {
      this.audioEncoding = "WEBM_OPUS"; // safe fallback
    }
  }

  /**
   * Start recording
   */
  async startListening(): Promise<void> {
    if (this.isListening) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) throw new Error("Microphone permission denied");

    await this.setupAudioMode();

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    this.recording = recording;
    this.isListening = true;

    console.log("🎤 Voice recording started");
  }

  /**
   * Stop recording and process audio
   */
  async stopListening(): Promise<VoiceRecognitionResult | null> {
    if (!this.isListening || !this.recording) return null;

    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();

    this.isListening = false;
    this.recording = null;

    if (!uri) throw new Error("No audio file recorded");

    console.log("🎤 Recording stopped:", uri);

    this.detectEncoding(uri);

    const result = await this.processAudioFile(uri);

    // cleanup temp file
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {}

    return result;
  }

  /**
   * Converts audio → base64 → sends to backend STT
   */
  private async processAudioFile(uri: string): Promise<VoiceRecognitionResult> {
    const base64Audio = await FileSystem.readAsStringAsync(uri, {
  encoding: 'base64',  // ← Use string literal instead of FileSystem.EncodingType.Base64
});

    try {
      // Send encoding to backend
      const result = await speechService.speechToText(
        base64Audio,
        "en-US",
        this.audioEncoding
      );

      return {
        text: result.transcript,
        confidence: result.confidence,
      };
    } catch (error) {
      console.warn("❗ Backend failed. Switching to Google STT fallback…");
      return await this.googleFallback(uri);
    }
  }

  /**
   * Google Speech-to-Text fallback
   */
  private async googleFallback(uri: string): Promise<VoiceRecognitionResult> {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY;

    if (!apiKey) {
      return {
        text: "Audio recorded but no STT configured.",
        confidence: 0.5,
      };
    }

   const base64Audio = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',  // ← Fixed
  });

    // Google supported encoding map
    const encodingMap: any = {
      WEBM_OPUS: "WEBM_OPUS",
      OGG_OPUS: "OGG_OPUS",
      MP4_AAC: "ENCODING_UNSUPPORTED",
    };

    const encoding = encodingMap[this.audioEncoding];

    if (encoding === "ENCODING_UNSUPPORTED") {
      return { text: "Unsupported audio format for Google STT.", confidence: 0 };
    }

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding,
            languageCode: "en-US",
            enableAutomaticPunctuation: true,
          },
          audio: { content: base64Audio },
        }),
      }
    );

    const data = await response.json();

    if (!data.results) return { text: "", confidence: 0 };

    return {
      text: data.results[0].alternatives[0].transcript,
      confidence: data.results[0].alternatives[0].confidence || 0.9,
    };
  }

  /**
   * Get listening state
   */
  getListeningState() {
    return this.isListening;
  }

  /**
   * Cancel ongoing recording
   */
  async cancelRecording() {
    if (!this.recording) return;

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {}

    this.recording = null;
    this.isListening = false;
  }
}

export const voiceService = new VoiceService();
