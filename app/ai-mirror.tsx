import { Ionicons } from '@expo/vector-icons';
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Dimensions,
  LogBox,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Canvas, { CanvasRenderingContext2D } from 'react-native-canvas';

const TensorCamera = cameraWithTensors(CameraView);

LogBox.ignoreAllLogs(true);
const { width, height } = Dimensions.get('window');

// Type for face detection predictions
interface FacePrediction {
  topLeft: [number, number];
  bottomRight: [number, number];
  probability: number[];
  landmarks?: number[][];
}

export default function FaceDetectionApp() {
  // Camera and permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permissionResponse, requestMediaPermission] = MediaLibrary.usePermissions();
  
  // Model and TensorFlow state
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [isTfReady, setIsTfReady] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  
  // Detection state
  const [faceCount, setFaceCount] = useState(0);
  
  // Refs
  const cameraRef = useRef<CameraView>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const canvas = useRef<Canvas | null>(null);
  
  // Configuration constants
  const RECORDING_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const FACE_DETECTION_THRESHOLD = 0.7; // Confidence threshold for face detection

  /**
   * Initialize TensorFlow and load BlazeFace model
   */
  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        await requestMediaPermission();
        
        // Initialize TensorFlow
        await tf.ready();
        console.log("✓ TensorFlow Ready");
        
        // Load BlazeFace model for face detection
        const loadedModel = await blazeface.load();
        setModel(loadedModel);
        console.log("✓ BlazeFace model loaded successfully");
        
        setIsTfReady(true);
        setIsModelLoading(false);
      } catch (error) {
        console.error("✗ Error loading TensorFlow or Model:", error);
        setIsModelLoading(false);
      }
    };

    initializeTensorFlow();
  }, []);

  /**
   * Toggle between front and back camera
   */
  const toggleCameraFacing = useCallback(() => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  /**
   * Start video recording
   */
  const startRecording = async () => {
    if (!cameraRef.current?.recordAsync) {
      console.error("Recording not available");
      return;
    }

    try {
      setIsRecording(true);
      setRecordingStartTime(new Date());
      
      const video = await cameraRef.current.recordAsync({
        maxDuration: RECORDING_DURATION / 1000, // Convert to seconds
      });

      // Save the recorded video to media library
      if (video?.uri) {
        const asset = await MediaLibrary.createAssetAsync(video.uri);
        await MediaLibrary.createAlbumAsync("FaceDetectionRecordings", asset, false);
        setRecordedVideoUri(video.uri);
        console.log('✓ Video saved successfully:', video.uri);
      }
    } catch (error) {
      console.error('✗ Recording error:', error);
    } finally {
      setIsRecording(false);
      setRecordingStartTime(null);
    }
  };

  /**
   * Stop video recording
   */
  const stopRecording = useCallback(() => {
    if (cameraRef.current?.stopRecording) {
      try {
        cameraRef.current.stopRecording();
        setIsRecording(false);
        setRecordingStartTime(null);
      } catch (error) {
        console.error('✗ Stop recording error:', error);
      }
    }
  }, []);

  /**
   * Handle camera stream and perform face detection
   */
  const handleCameraStream = useCallback((images: any, updatePreview: () => void, gl: any) => {
    const loop = async () => {
      try {
        const nextImageTensor = images.next().value;
        
        if (!nextImageTensor) {
          requestAnimationFrame(loop);
          return;
        }

        // Validate tensor shape
        if (nextImageTensor.shape[0] === 0 || nextImageTensor.shape[1] === 0) {
          console.error('Invalid tensor shape');
          requestAnimationFrame(loop);
          return;
        }

        // Perform face detection
        if (model) {
          try {
            const predictions: FacePrediction[] = await model.estimateFaces(
              nextImageTensor, 
              false // returnTensors
            );

            // Update face count
            const detectedFaces = predictions.filter(
              pred => pred.probability[0] > FACE_DETECTION_THRESHOLD
            );
            setFaceCount(detectedFaces.length);

            // Draw bounding boxes for detected faces
            drawFaceBoxes(predictions, nextImageTensor);

            // Update preview and end frame
            updatePreview();
            gl.endFrameEXP();
          } catch (error) {
            console.error('✗ Error in face detection:', error);
          }
        }

        // Continue loop
        requestAnimationFrame(loop);
      } catch (error) {
        console.error('✗ Error in camera stream loop:', error);
        requestAnimationFrame(loop);
      }
    };

    loop();
  }, [model]);

  /**
   * Draw bounding boxes around detected faces
   */
  const drawFaceBoxes = useCallback((predictions: FacePrediction[], nextImageTensor: any) => {
    if (!context.current || !canvas.current) {
      return;
    }

    const scaleWidth = width / nextImageTensor.shape[1];
    const scaleHeight = height / nextImageTensor.shape[0];
    const flipHorizontal = facing === 'front';

    // Clear canvas
    context.current.clearRect(0, 0, width, height);

    // Draw each detected face
    predictions.forEach((prediction) => {
      if (prediction.probability[0] > FACE_DETECTION_THRESHOLD) {
        const [x1, y1] = prediction.topLeft;
        const [x2, y2] = prediction.bottomRight;

        const boxWidth = (x2 - x1) * scaleWidth;
        const boxHeight = (y2 - y1) * scaleHeight;

        const boundingBoxX = flipHorizontal
          ? width - x1 * scaleWidth - boxWidth
          : x1 * scaleWidth;
        const boundingBoxY = y1 * scaleHeight;

        // Draw rectangle
        if (context.current) {
          context.current.strokeRect(
            boundingBoxX,
            boundingBoxY,
            boxWidth,
            boxHeight
          );

          // Draw confidence score
          const confidence = Math.round(prediction.probability[0] * 100);
          context.current.fillText(
            `Face ${confidence}%`,
            boundingBoxX + 5,
            boundingBoxY > 20 ? boundingBoxY - 5 : boundingBoxY + 15
          );
        }
      }
    });
  }, [facing]);

  /**
   * Initialize canvas
   */
  const handleCanvas = useCallback((can: Canvas | null) => {
    if (can) {
      console.log("✓ Canvas initialized");
      can.width = width;
      can.height = height;
      
      const ctx = can.getContext("2d") as CanvasRenderingContext2D;
      if (ctx) {
        context.current = ctx;
        ctx.strokeStyle = "#00FF00"; // Green for face detection
        ctx.fillStyle = "#00FF00";
        ctx.lineWidth = 3;
        ctx.font = "16px Arial";
        canvas.current = can;
      } else {
        console.error("✗ Failed to get canvas context");
      }
    }
  }, []);

  // Texture dimensions based on platform
  const textureDims = Platform.OS === "ios"
    ? { height: 1920, width: 1080 }
    : { height: 1200, width: 1600 };

  // Permission check
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera access is required for face detection</Text>
        <Button title="Grant Camera Permission" onPress={requestPermission} />
      </View>
    );
  }

  // Loading state
  if (!isTfReady || !model || isModelLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00FF00" />
        <Text style={styles.loadingText}>Initializing Face Detection...</Text>
      </View>
    );
  }

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
      
      <Canvas style={styles.canvas} ref={handleCanvas} />

      {/* Face count indicator */}
      <View style={styles.faceCountIndicator}>
        <Text style={styles.faceCountText}>
          {faceCount === 0 ? 'No faces detected' : `${faceCount} face${faceCount > 1 ? 's' : ''} detected`}
        </Text>
      </View>

      {/* Camera toggle button */}
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={toggleCameraFacing}
      >
        <Ionicons 
          name="camera-reverse" 
          size={32} 
          color="white" 
        />
      </TouchableOpacity>

      {/* Recording controls */}
      <View style={styles.recordingControls}>
        {!isRecording ? (
          <TouchableOpacity 
            style={styles.recordButton} 
            onPress={startRecording}
          >
            <View style={styles.recordButtonInner} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.recordButton} 
            onPress={stopRecording}
          >
            <View style={styles.stopButtonInner} />
          </TouchableOpacity>
        )}
      </View>

      {/* Recording indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording</Text>
        </View>
      )}

      {/* Video saved notice */}
      {recordedVideoUri && !isRecording && (
        <View style={styles.videoSavedNotice}>
          <Text style={styles.videoSavedText}>✓ Video Saved</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    zIndex: 1,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 16,
  },
  faceCountIndicator: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  faceCountText: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 30,
    zIndex: 10,
  },
  recordingControls: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  recordButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF0000',
  },
  stopButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  videoSavedNotice: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  videoSavedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});