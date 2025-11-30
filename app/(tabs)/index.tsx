import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { BlurView } from 'expo-blur';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Button,
  Dimensions,
  Image,
  LogBox,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CanvasComponent, { CanvasRenderingContext2D } from 'react-native-canvas';

import { Poppins } from '@/constants/theme';
import { voiceService } from '@/services/voice.service';

const TensorCamera = cameraWithTensors(CameraView);

LogBox.ignoreAllLogs(true);
const { width, height } = Dimensions.get('window');

export default function LiveStreaming() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [model, setModel] = useState<cocoSsd.ObjectDetection>();
  const [isTfReady, setIsTfReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [recordingEndTime, setRecordingEndTime] = useState<Date | null>(null);
  const [permissionResponse, requestMediaPermission] = MediaLibrary.usePermissions({
    writeOnly: true,
  });
  
  // Voice to text states
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  let context = useRef<CanvasRenderingContext2D | undefined>(undefined);
  const canvas = useRef<any>(undefined);

  // Animation for microphone button
  const micScale = useRef(new Animated.Value(1)).current;
  const micPulse = useRef(new Animated.Value(0)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;

  // Configurations for recording
  const RECORDING_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const PERSON_DETECTION_THRESHOLD = 1; // Number of persons to start recording

  useEffect(() => {
    (async () => {
      try {
        await requestMediaPermission();

        await tf.ready();
        console.log("TensorFlow Ready");
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log("Cocossd model is loaded", loadedModel);
        setIsTfReady(true);
      } catch (error) {
        console.error("Error loading TensorFlow or Model:", error);
      }
    })();
  }, []);

  // Animation for listening state
  useEffect(() => {
    if (isListening) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(micPulse, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Waveform animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      micPulse.setValue(0);
      waveformAnim.setValue(0);
    }
  }, [isListening]);

  const startRecording = async () => {
    if (cameraRef.current && cameraRef.current.recordAsync) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: RECORDING_DURATION / 1000,
        });

        if (video && video.uri) {
          const asset = await MediaLibrary.createAssetAsync(video.uri);
          await MediaLibrary.createAlbumAsync("ObjectDetectionRecordings", asset, false);
          setRecordedVideoUri(video.uri);
          console.log('Video saved successfully');
        }
      } catch (error) {
        console.error('Recording error:', error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && cameraRef.current.stopRecording) {
      try {
        cameraRef.current.stopRecording();
      } catch (error) {
        console.error('Stop recording error:', error);
      }
      setIsRecording(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      // Stop listening
      await voiceService.stopListening();
      setIsListening(false);
      setIsProcessing(true);
      
      // Process the recorded audio
      setTimeout(() => {
        setTranscribedText('Voice command processed');
        setIsProcessing(false);
      }, 1000);
    } else {
      // Start listening
      setIsListening(true);
      setTranscribedText('');
      
      await voiceService.startListening(
        (result) => {
          setTranscribedText(result.text);
          setIsListening(false);
        },
        (error) => {
          console.error('Voice recognition error:', error);
          setIsListening(false);
          setTranscribedText('Error processing voice input');
        }
      );
    }
  };

  const handleCameraStream = (images: any, updatePreview: () => void, gl: any) => {
    const loop = async () => {
      try {
        const nextImageTensor = images.next().value;
        if (!nextImageTensor) {
          console.error('No image tensor available');
          return;
        }

        if (model && model.detect) {
          try {
            const predictions = await model.detect(nextImageTensor);

            if (!predictions || predictions.length === 0) {
              console.warn('No objects detected');
            }

            // Draw bounding boxes and labels
            drawRectangle(predictions, nextImageTensor);

            updatePreview();
            gl.endFrameEXP();
          } catch (error) {
            console.error('Error in detection:', error);
          }
        } else {
          console.error('Model not loaded');
        }

        requestAnimationFrame(loop);
      } catch (error) {
        console.error('Error in camera stream loop:', error);
      }
    };

    loop();
  };

  function drawRectangle(predictions: cocoSsd.DetectedObject[], nextImageTensor: any) {
    if (!context.current || !canvas.current) {
      console.log('No context or canvas');
      return;
    }

    const scaleWidth = width / nextImageTensor.shape[1];
    const scaleHeight = height / nextImageTensor.shape[0];

    const flipHorizontal = Platform.OS === 'ios' ? false : true;

    context.current.clearRect(0, 0, width, height);

    predictions.forEach((prediction) => {
      if (prediction && prediction.bbox) {
        const [x, y, bboxWidth, bboxHeight] = prediction.bbox;

        if (canvas.current && context.current) {
          const boundingBoxX = flipHorizontal
            ? canvas.current.width - x * scaleWidth - bboxWidth * scaleWidth
            : x * scaleWidth;
          const boundingBoxY = y * scaleHeight;

          context.current.strokeRect(
            boundingBoxX,
            boundingBoxY,
            bboxWidth * scaleWidth,
            bboxHeight * scaleHeight
          );
          context.current.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            boundingBoxX + 5,
            boundingBoxY + 5
          );
        }
      } else {
        console.warn('Invalid prediction data:', prediction);
      }
    });
  }

  const handleCanvas = (can: any) => {
    if (can) {
      console.log("Canvas initialized");
      can.width = width;
      can.height = height;
      const ctx: CanvasRenderingContext2D = can.getContext("2d");
      if (ctx) {
        context.current = ctx;
        ctx.strokeStyle = "#1C1C84";
        ctx.fillStyle = "#1C1C84";
        ctx.lineWidth = 3;
        canvas.current = can;
      } else {
        console.error("Failed to get canvas context");
      }
    }
  };

  useEffect(() => {
    if (!canvas.current || !context.current) {
      console.log('Canvas or Context not initialized');
    }
  }, [canvas, context]);

  const textureDims =
    Platform.OS === "ios"
      ? { height: 1920, width: 1080 }
      : { height: 1200, width: 1600 };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  if (!isTfReady || !model || !permission.granted) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1C1C84" />
        <Text style={styles.loadingText}>Loading TensorFlow or Waiting for Permissions....</Text>
      </View>
    );
  }

  const pulseOpacity = micPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const pulseScale = micPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View style={styles.container}>
      <TensorCamera
        style={styles.camera}
        ref={cameraRef as React.Ref<any>}
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={300}
        resizeWidth={352}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={false}
        useCustomShadersToResize={false}
        facing={facing}
      />
      <CanvasComponent style={styles.canvas} ref={handleCanvas} />

      {/* Top Badge - AI Mirror Active */}
      <View style={styles.topBadgeContainer}>
        <BlurView intensity={20} style={styles.topBadge}>
          <Text style={styles.badgeText}>AI Mirror Active</Text>
        </BlurView>
      </View>

      {/* Home Button - Top Left */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push('/(tabs)/home')}
      >
        <BlurView intensity={20} style={styles.homeButtonBlur}>
          <Image
            source={require('@/assets/icons/home.png')}
            style={styles.homeIcon}
            resizeMode="contain"
          />
        </BlurView>
      </TouchableOpacity>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Microphone Button */}
        <View style={styles.micContainer}>
          {isListening && (
            <Text style={styles.listeningText}>Listening...</Text>
          )}
          {!isListening && !isProcessing && (
            <Text style={styles.tapToSpeakText}>Tap To Speak</Text>
          )}
          {isProcessing && (
            <Text style={styles.processingText}>Processing...</Text>
          )}

          <TouchableOpacity
            style={styles.micButtonContainer}
            onPress={handleVoiceInput}
            activeOpacity={0.8}
          >
            {/* Outer ring */}
            <Animated.View
              style={[
                styles.micOuterRing,
                {
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />
            {/* Middle ring */}
            <View style={styles.micMiddleRing} />
            {/* Inner circle */}
            <View style={styles.micInnerCircle}>
              {isListening ? (
                <View style={styles.waveformContainer}>
                  {[0, 1, 2, 3].map((index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.waveformBar,
                        {
                          height: waveformAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [
                              8 + index * 4,
                              16 + index * 8,
                            ],
                          }),
                        },
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <Image
                  source={require('@/assets/icons/ai.png')}
                  style={styles.micIcon}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transcribed Text Display */}
      {transcribedText ? (
        <View style={styles.transcribedContainer}>
          <BlurView intensity={20} style={styles.transcribedBox}>
            <Text style={styles.transcribedText}>{transcribedText}</Text>
          </BlurView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  canvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1000,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    paddingBottom: 10,
    color: '#fff',
    fontFamily: Poppins.Regular,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontFamily: Poppins.Regular,
  },
  // Top Badge
  topBadgeContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2000,
  },
  topBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Poppins.Medium,
  },
  // Home Button
  homeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 2000,
  },
  homeButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  homeIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  // Bottom Controls
  bottomControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2000,
  },
  micContainer: {
    alignItems: 'center',
  },
  listeningText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Poppins.Medium,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tapToSpeakText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: Poppins.Regular,
    marginBottom: 12,
  },
  processingText: {
    color: '#1C1C84',
    fontSize: 14,
    fontFamily: Poppins.Medium,
    marginBottom: 12,
  },
  micButtonContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  micOuterRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  micMiddleRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  micInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1C1C84',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C1C84',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginHorizontal: 1,
  },
  // Transcribed Text
  transcribedContainer: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 20,
    zIndex: 2000,
  },
  transcribedBox: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  transcribedText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Poppins.Regular,
    textAlign: 'center',
  },
});
