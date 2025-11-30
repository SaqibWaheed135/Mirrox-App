# Voice Recognition Integration Guide

This app now includes real voice recognition functionality using `expo-av` for audio recording and cloud-based speech-to-text APIs.

## Architecture

The voice recognition system consists of:

1. **Voice Service** (`services/voice.service.ts`): Handles audio recording using `expo-av`
2. **Speech Service** (`services/speech.service.ts`): Communicates with backend API for speech-to-text
3. **Camera Screen** (`app/(tabs)/index.tsx`): UI for voice input with microphone button

## Setup Options

### Option 1: Backend API (Recommended)

The app is configured to use your backend API for speech recognition:

1. **Backend Endpoint**: `/api/voice/speech-to-text`
2. **Request Format**:
   ```json
   {
     "audio": "base64_encoded_audio",
     "language": "en-US",
     "encoding": "LINEAR16",
     "sampleRateHertz": 44100
   }
   ```
3. **Response Format**:
   ```json
   {
     "transcript": "recognized text",
     "confidence": 0.95,
     "alternatives": [...]
   }
   ```

### Option 2: Google Speech-to-Text API (Direct)

If you want to use Google Speech-to-Text API directly:

1. Get a Google Cloud API key
2. Add to your `.env` file:
   ```
   EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY=your_api_key_here
   ```
3. The app will automatically fall back to Google API if backend is unavailable

### Option 3: Other Cloud Services

You can modify `services/voice.service.ts` to use:
- AWS Transcribe
- Azure Speech Services
- IBM Watson Speech to Text
- Or any other speech recognition API

## Implementation Details

### Audio Recording

- Uses `expo-av` for high-quality audio recording
- Records in LINEAR16 format at 44.1kHz
- Automatically requests microphone permissions
- Handles audio mode configuration for iOS and Android

### Processing Flow

1. User taps microphone button
2. App requests microphone permission (if not granted)
3. Starts recording audio
4. User taps again to stop
5. Audio is converted to base64
6. Sent to backend API or Google API
7. Transcribed text is displayed

### Error Handling

- Permission denied: Shows error message
- API errors: Falls back gracefully
- Network errors: Displays user-friendly messages

## Testing

1. **On Physical Device**: Voice recognition works best on physical devices
2. **Permissions**: Ensure microphone permissions are granted
3. **Network**: Requires internet connection for API calls
4. **Audio Quality**: Speak clearly in a quiet environment

## Future Enhancements

- Real-time transcription (streaming)
- Multiple language support
- Voice commands processing
- Offline speech recognition
- Audio visualization during recording

## Troubleshooting

### Microphone Permission Denied
- Check app permissions in device settings
- Restart the app after granting permissions

### API Not Responding
- Check backend API endpoint is correct
- Verify network connection
- Check API key (if using Google API)

### No Transcription
- Ensure audio is being recorded (check device microphone)
- Verify API endpoint is working
- Check audio format compatibility

