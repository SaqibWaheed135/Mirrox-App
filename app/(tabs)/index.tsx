import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useRef, useState } from 'react';
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

export default function LiveStreaming() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [model, setModel] = useState<cocoSsd.ObjectDetection>();
  const [isTfReady, setIsTfReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
const [recordingEndTime, setRecordingEndTime] = useState<Date | null>(null);
  const [permissionResponse, requestMediaPermission] = MediaLibrary.usePermissions();

  
  const cameraRef = useRef<CameraView>(null);
 
  let context = useRef<CanvasRenderingContext2D>();
  const canvas = useRef<Canvas>();

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

  const startRecording = async () => {
    if (cameraRef.current && cameraRef.current.recordAsync) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: RECORDING_DURATION / 1000, // Convert to seconds
          //quality: '720p'
        });

        // Save the recorded video to media library
        if (video && video.uri) {
          const asset = await MediaLibrary.createAssetAsync(video.uri);
          await MediaLibrary.createAlbumAsync("ObjectDetectionRecordings", asset, false);
          setRecordedVideoUri(video.uri);
          console.log('Video saved successfully');
        }

        // setIsRecording(false);
        // setRecordingEndTime(new Date());
      } catch (error) {
        console.error('Recording error:', error);
      }finally{
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

  const handleCameraStream = (images: any, updatePreview: () => void, gl: any) => {
    const loop = async () => {
      try {
        const nextImageTensor = images.next().value;
        if (!nextImageTensor) {
          console.error('No image tensor available');
          return;
        }

        console.log('Received image tensor:', nextImageTensor);

        // Check if tensor is valid
        if (nextImageTensor.shape[0] === 0 || nextImageTensor.shape[1] === 0) {
          console.error('Invalid tensor shape');
          return;
        }

        if (model && model.detect) {
          try {
            // Run predictions asynchronously (fix for UI blocking)
            const predictions = await model.detect(nextImageTensor);

          //   // Count number of persons
          // const personCount = predictions.filter(
          //   pred => pred.class === 'person' && pred.score > 0.5
          // ).length;

          // // Logic for starting and stopping recording
          // if (personCount >= PERSON_DETECTION_THRESHOLD && !isRecording) {
          //   // Start recording
          //   setRecordingStartTime(new Date());
          //   setIsRecording(true);
          //   startRecording();
          // }

          // if (isRecording && recordingStartTime) {
          //   const currentTime = new Date();
          //   const elapsedTime = currentTime.getTime() - recordingStartTime.getTime();
            
          //   if (elapsedTime >= RECORDING_DURATION) {
          //     if (cameraRef.current) {
          //       cameraRef.current.stopRecording();
          //     }
          //   }
          // }

            if (!predictions || predictions.length === 0) {
              console.warn('No objects detected');
            }

            console.log('Predictions:', predictions);

            // Draw bounding boxes and labels
            drawRectangle(predictions, nextImageTensor);

            // Update preview and end frame
            updatePreview();
            gl.endFrameEXP();
          } catch (error) {
            console.error('Error in detection:', error);
          }
        } else {
          console.error('Model not loaded');
        }

        // Continue looping
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

    context.current.clearRect(0, 0, width, height); // Clear canvas before drawing

    predictions.forEach((prediction) => {
      // Safe check to prevent undefined errors
      if (prediction && prediction.bbox) {
        const [x, y, bboxWidth, bboxHeight] = prediction.bbox;

        // Ensure proper scaling and horizontal flipping
        if(canvas.current&&context.current){
          
        
        const boundingBoxX = flipHorizontal
          ? canvas.current.width - x * scaleWidth - bboxWidth * scaleWidth
          : x * scaleWidth;
        const boundingBoxY = y * scaleHeight;

        console.log(`Drawing box at: [${boundingBoxX}, ${boundingBoxY}, ${bboxWidth * scaleWidth}, ${bboxHeight * scaleHeight}]`);

        // Draw rectangle and label
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

  const handleCanvas = (can: Canvas) => {
    if (can) {
      console.log("Canvas initialized");
      can.width = width;
      can.height = height;
      const ctx:  CanvasRenderingContext2D = can.getContext("2d");
      if (ctx) {
        context.current = ctx;
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
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

  console.log("Camera Permission Granted:", permission?.granted);

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
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading TensorFlow or Waiting for Permissions....</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TensorCamera
        style={styles.camera}
        ref={cameraRef as React.Ref<any>}
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={300}
        resizeWidth={352}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={false}  // Set to false if you need custom rendering
        useCustomShadersToResize={false}
        facing="back"
      />
      <Canvas style={styles.canvas} ref={handleCanvas} />

      <View style={styles.recordingControls}>
        {!isRecording ? (
          <TouchableOpacity 
            style={styles.recordButton} 
            onPress={startRecording}
          >
            <Text style={styles.recordButtonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.stopRecordButton} 
            onPress={stopRecording}
          >
            <Text style={styles.recordButtonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}
      </View>

      {recordedVideoUri && (
        <View style={styles.videoSavedNotice}>
          <Text>Video Saved: {recordedVideoUri}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    width: '100%',
    height: '100%',
   
  },

  message: {
    textAlign: 'center',
    fontSize: 16,
    paddingBottom: 10,
  },

  canvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex:1000000,
    
  },

  recordingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  recordingText: {
    color: 'white',
    fontWeight: 'bold',
  },

  recordingControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
  },
  stopRecordButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
  },
  recordButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  videoSavedNotice: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});