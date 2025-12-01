// import * as cocoSsd from '@tensorflow-models/coco-ssd';
// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native';
// import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
// import { BlurView } from 'expo-blur';
// import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
// import * as MediaLibrary from 'expo-media-library';
// import { router } from 'expo-router';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Animated,
//   Button,
//   Dimensions,
//   Image,
//   LogBox,
//   Platform,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import CanvasComponent, { CanvasRenderingContext2D } from 'react-native-canvas';

// import { Poppins } from '@/constants/theme';
// import { voiceService } from '@/services/voice.service';

// const TensorCamera = cameraWithTensors(CameraView);

// LogBox.ignoreAllLogs(true);
// const { width, height } = Dimensions.get('window');

// export default function LiveStreaming() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [facing, setFacing] = useState<CameraType>('front');
//   const [model, setModel] = useState<cocoSsd.ObjectDetection>();
//   const [isTfReady, setIsTfReady] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
//   const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
//   const [recordingEndTime, setRecordingEndTime] = useState<Date | null>(null);
//   const [permissionResponse, requestMediaPermission] = MediaLibrary.usePermissions({
//     writeOnly: true,
//   });
  
//   // Voice to text states
//   const [isListening, setIsListening] = useState(false);
//   const [transcribedText, setTranscribedText] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);

//   const cameraRef = useRef<CameraView>(null);
//   let context = useRef<CanvasRenderingContext2D | undefined>(undefined);
//   const canvas = useRef<any>(undefined);

//   // Animation for microphone button
//   const micScale = useRef(new Animated.Value(1)).current;
//   const micPulse = useRef(new Animated.Value(0)).current;
//   const waveformAnim = useRef(new Animated.Value(0)).current;

//   // Configurations for recording
//   const RECORDING_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
//   const PERSON_DETECTION_THRESHOLD = 1; // Number of persons to start recording

//   useEffect(() => {
//     (async () => {
//       try {
//         await requestMediaPermission();

//         await tf.ready();
//         console.log("TensorFlow Ready");
//         const loadedModel = await cocoSsd.load();
//         setModel(loadedModel);
//         console.log("Cocossd model is loaded", loadedModel);
//         setIsTfReady(true);
//       } catch (error) {
//         console.error("Error loading TensorFlow or Model:", error);
//       }
//     })();
//   }, []);

//   // Animation for listening state
//   useEffect(() => {
//     if (isListening) {
//       // Pulse animation
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(micPulse, {
//             toValue: 1,
//             duration: 1000,
//             useNativeDriver: true,
//           }),
//           Animated.timing(micPulse, {
//             toValue: 0,
//             duration: 1000,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();

//       // Waveform animation
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(waveformAnim, {
//             toValue: 1,
//             duration: 500,
//             useNativeDriver: false,
//           }),
//           Animated.timing(waveformAnim, {
//             toValue: 0,
//             duration: 500,
//             useNativeDriver: false,
//           }),
//         ])
//       ).start();
//     } else {
//       micPulse.setValue(0);
//       waveformAnim.setValue(0);
//     }
//   }, [isListening]);

//     // Add this animation for skeleton pulse
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(micPulse, {
//           toValue: 1,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(micPulse, {
//           toValue: 0,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);
  
//   const startRecording = async () => {
//     if (cameraRef.current && cameraRef.current.recordAsync) {
//       try {
//         setIsRecording(true);
//         const video = await cameraRef.current.recordAsync({
//           maxDuration: RECORDING_DURATION / 1000,
//         });

//         if (video && video.uri) {
//           const asset = await MediaLibrary.createAssetAsync(video.uri);
//           await MediaLibrary.createAlbumAsync("ObjectDetectionRecordings", asset, false);
//           setRecordedVideoUri(video.uri);
//           console.log('Video saved successfully');
//         }
//       } catch (error) {
//         console.error('Recording error:', error);
//       } finally {
//         setIsRecording(false);
//       }
//     }
//   };

//   const stopRecording = async () => {
//     if (cameraRef.current && cameraRef.current.stopRecording) {
//       try {
//         cameraRef.current.stopRecording();
//       } catch (error) {
//         console.error('Stop recording error:', error);
//       }
//       setIsRecording(false);
//     }
//   };

//   const handleVoiceInput = async () => {
//     if (isListening) {
//       // Stop listening and process audio
//       setIsListening(false);
//       setIsProcessing(true);
      
//       try {
//         const result = await voiceService.stopListening();
//         if (result) {
//           setTranscribedText(result.text);
//         } else {
//           setTranscribedText('No speech detected');
//         }
//       } catch (error: any) {
//         console.error('Voice recognition error:', error);
//         setTranscribedText(error.message || 'Error processing voice input');
//       } finally {
//         setIsProcessing(false);
//       }
//     } else {
//       // Start listening
//       setIsListening(true);
//       setTranscribedText('');
      
//       try {
//         await voiceService.startListening(
//           (result) => {
//             // This callback is for real-time results (if implemented)
//             setTranscribedText(result.text);
//           },
//           (error) => {
//             console.error('Voice recognition error:', error);
//             setIsListening(false);
//             setTranscribedText(`Error: ${error.message}`);
//           }
//         );
//       } catch (error: any) {
//         console.error('Error starting voice recognition:', error);
//         setIsListening(false);
//         setTranscribedText(`Error: ${error.message || 'Failed to start listening'}`);
//       }
//     }
//   };

//   const handleCameraStream = (images: any, updatePreview: () => void, gl: any) => {
//     const loop = async () => {
//       try {
//         const nextImageTensor = images.next().value;
//         if (!nextImageTensor) {
//           console.error('No image tensor available');
//           return;
//         }

//         if (model && model.detect) {
//           try {
//             const predictions = await model.detect(nextImageTensor);

//             if (!predictions || predictions.length === 0) {
//               console.warn('No objects detected');
//             }

//             // Draw bounding boxes and labels
//             drawRectangle(predictions, nextImageTensor);

//             updatePreview();
//             gl.endFrameEXP();
//           } catch (error) {
//             console.error('Error in detection:', error);
//           }
//         } else {
//           console.error('Model not loaded');
//         }

//         requestAnimationFrame(loop);
//       } catch (error) {
//         console.error('Error in camera stream loop:', error);
//       }
//     };

//     loop();
//   };

//   function drawRectangle(predictions: cocoSsd.DetectedObject[], nextImageTensor: any) {
//     if (!context.current || !canvas.current) {
//       console.log('No context or canvas');
//       return;
//     }

//     const scaleWidth = width / nextImageTensor.shape[1];
//     const scaleHeight = height / nextImageTensor.shape[0];

//     const flipHorizontal = Platform.OS === 'ios' ? false : true;

//     context.current.clearRect(0, 0, width, height);

//     predictions.forEach((prediction) => {
//       if (prediction && prediction.bbox) {
//         const [x, y, bboxWidth, bboxHeight] = prediction.bbox;

//         if (canvas.current && context.current) {
//           const boundingBoxX = flipHorizontal
//             ? canvas.current.width - x * scaleWidth - bboxWidth * scaleWidth
//             : x * scaleWidth;
//           const boundingBoxY = y * scaleHeight;

//           context.current.strokeRect(
//             boundingBoxX,
//             boundingBoxY,
//             bboxWidth * scaleWidth,
//             bboxHeight * scaleHeight
//           );
//           context.current.fillText(
//             `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
//             boundingBoxX + 5,
//             boundingBoxY + 5
//           );
//         }
//       } else {
//         console.warn('Invalid prediction data:', prediction);
//       }
//     });
//   }

//   const handleCanvas = (can: any) => {
//     if (can) {
//       console.log("Canvas initialized");
//       can.width = width;
//       can.height = height;
//       const ctx: CanvasRenderingContext2D = can.getContext("2d");
//       if (ctx) {
//         context.current = ctx;
//         ctx.strokeStyle = "#1C1C84";
//         ctx.fillStyle = "#1C1C84";
//         ctx.lineWidth = 3;
//         canvas.current = can;
//       } else {
//         console.error("Failed to get canvas context");
//       }
//     }
//   };

//   useEffect(() => {
//     if (!canvas.current || !context.current) {
//       console.log('Canvas or Context not initialized');
//     }
//   }, [canvas, context]);

//   const textureDims =
//     Platform.OS === "ios"
//       ? { height: 1920, width: 1080 }
//       : { height: 1200, width: 1600 };

//   if (!permission) {
//     return <View />;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>We need your permission to access the camera</Text>
//         <Button title="Grant Permission" onPress={requestPermission} />
//       </View>
//     );
//   }

//   // if (!isTfReady || !model || !permission.granted) {
//   //   return (
//   //     <View style={styles.container}>
//   //       <ActivityIndicator size="large" color="#1C1C84" />
//   //       <Text style={styles.loadingText}>Loading TensorFlow or Waiting for Permissions....</Text>
//   //     </View>
//   //   );
//   // }

//     if (!permission?.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>We need your permission to access the camera</Text>
//         <Button title="Grant Permission" onPress={requestPermission} />
//       </View>
//     );
//   }

//   if (!isTfReady || !model) {
//     return (
//       <View style={styles.container}>
//         {/* Background simulating camera feed with dark blur */}
//         <View style={styles.skeletonCamera} />

//         {/* Canvas overlay simulation */}
//         <View style={styles.skeletonCanvas} pointerEvents="none" />

//         {/* Top Badge Skeleton */}
//         <View style={styles.topBadgeContainer}>
//           <View style={styles.sBadgeSkeleton} />
//         </View>

//         {/* Home Button Skeleton */}
//         <View style={styles.homeButton}>
//           <View style={styles.skeletonHomeButton} />
//         </View>

//         {/* Bottom Mic Button Skeleton */}
//         <View style={styles.bottomControls}>
//           <View style={styles.micContainer}>
//             <View style={styles.skeletonTextLine} />
//             <View style={styles.skeletonTextLineShort} />

//             <View style={styles.skeletonMicButton}>
//               <View style={styles.skeletonMicOuter} />
//               <View style={styles.skeletonMicInner} />
//             </View>
//           </View>
//         </View>

//         {/* Optional: Pulsing overlay for premium feel */}
//         <View style={StyleSheet.absoluteFill} pointerEvents="none">
//           <Animated.View
//             style={[
//               styles.pulseOverlay,
//               {
//                 opacity: micPulse.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0.05, 0.15],
//                 }),
//               },
//             ]}
//           />
//         </View>

//         {/* Loading text at bottom */}
//         <View style={styles.loadingFooter}>
//           <ActivityIndicator size="small" color="#ffffff88" />
//           <Text style={styles.loadingFooterText}>
//             Initializing AI Vision Engine...
//           </Text>
//         </View>
//       </View>
//     );
//   }

//   const pulseOpacity = micPulse.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0.3, 0.8],
//   });

//   const pulseScale = micPulse.interpolate({
//     inputRange: [0, 1],
//     outputRange: [1, 1.2],
//   });

//   return (
//     <View style={styles.container}>
//       <TensorCamera
//         style={styles.camera}
//         ref={cameraRef as React.Ref<any>}
//         cameraTextureHeight={textureDims.height}
//         cameraTextureWidth={textureDims.width}
//         resizeHeight={300}
//         resizeWidth={352}
//         resizeDepth={3}
//         onReady={handleCameraStream}
//         autorender={false}
//         useCustomShadersToResize={false}
//         facing={facing}
//       />
//       <CanvasComponent style={styles.canvas} ref={handleCanvas} />

//       {/* Top Badge - AI Mirror Active */}
//       <View style={styles.topBadgeContainer}>
//         <BlurView intensity={20} style={styles.topBadge}>
//           <Text style={styles.badgeText}>AI Mirror Active</Text>
//         </BlurView>
//       </View>

//       {/* Home Button - Top Left */}
//       <TouchableOpacity
//         style={styles.homeButton}
//         onPress={() => router.push('/(tabs)/home')}
//       >
//         <BlurView intensity={20} style={styles.homeButtonBlur}>
//           <Image
//             source={require('@/assets/icons/home.png')}
//             style={styles.homeIcon}
//             resizeMode="contain"
//           />
//         </BlurView>
//       </TouchableOpacity>

//       {/* Bottom Controls */}
//       <View style={styles.bottomControls}>
//         {/* Microphone Button */}
//         <View style={styles.micContainer}>
//           {isListening && (
//             <Text style={styles.listeningText}>Listening...</Text>
//           )}
//           {!isListening && !isProcessing && (
//             <Text style={styles.tapToSpeakText}>Tap To Speak</Text>
//           )}
//           {isProcessing && (
//             <Text style={styles.processingText}>Processing...</Text>
//           )}

//           <TouchableOpacity
//             style={styles.micButtonContainer}
//             onPress={handleVoiceInput}
//             activeOpacity={0.8}
//           >
//             {/* Outer ring */}
//             <Animated.View
//               style={[
//                 styles.micOuterRing,
//                 {
//                   opacity: pulseOpacity,
//                   transform: [{ scale: pulseScale }],
//                 },
//               ]}
//             />
//             {/* Middle ring */}
//             <View style={styles.micMiddleRing} />
//             {/* Inner circle */}
//             <View style={styles.micInnerCircle}>
//               {isListening ? (
//                 <View style={styles.waveformContainer}>
//                   {[0, 1, 2, 3].map((index) => (
//                     <Animated.View
//                       key={index}
//                       style={[
//                         styles.waveformBar,
//                         {
//                           height: waveformAnim.interpolate({
//                             inputRange: [0, 1],
//                             outputRange: [
//                               8 + index * 4,
//                               16 + index * 8,
//                             ],
//                           }),
//                         },
//                       ]}
//                     />
//                   ))}
//                 </View>
//               ) : (
//                 <Image
//                   source={require('@/assets/icons/ai.png')}
//                   style={styles.micIcon}
//                   resizeMode="contain"
//                 />
//               )}
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Transcribed Text Display */}
//       {transcribedText ? (
//         <View style={styles.transcribedContainer}>
//           <BlurView intensity={20} style={styles.transcribedBox}>
//             <Text style={styles.transcribedText}>{transcribedText}</Text>
//           </BlurView>
//         </View>
//       ) : null}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   camera: {
//     width: '100%',
//     height: '100%',
//   },
//   canvas: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     zIndex: 1000,
//   },
//   message: {
//     textAlign: 'center',
//     fontSize: 16,
//     paddingBottom: 10,
//     color: '#fff',
//     fontFamily: Poppins.Regular,
//   },
//   loadingText: {
//     color: '#fff',
//     marginTop: 10,
//     fontFamily: Poppins.Regular,
//   },
//   // Top Badge
//   topBadgeContainer: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     zIndex: 2000,
//   },
//   topBadge: {
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     overflow: 'hidden',
//   },
//   badgeText: {
//     color: '#fff',
//     fontSize: 14,
//     fontFamily: Poppins.Medium,
//   },
//   // Home Button
//   homeButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 50 : 30,
//     left: 20,
//     zIndex: 2000,
//   },
//   homeButtonBlur: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },
//   homeIcon: {
//     width: 24,
//     height: 24,
//     tintColor: '#fff',
//   },
//   // Bottom Controls
//   bottomControls: {
//     position: 'absolute',
//     bottom: Platform.OS === 'ios' ? 50 : 30,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     zIndex: 2000,
//   },
//   micContainer: {
//     alignItems: 'center',
//   },
//   listeningText: {
//     color: '#fff',
//     fontSize: 16,
//     fontFamily: Poppins.Medium,
//     marginBottom: 12,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 3,
//   },
//   tapToSpeakText: {
//     color: 'rgba(255, 255, 255, 0.7)',
//     fontSize: 14,
//     fontFamily: Poppins.Regular,
//     marginBottom: 12,
//   },
//   processingText: {
//     color: '#1C1C84',
//     fontSize: 14,
//     fontFamily: Poppins.Medium,
//     marginBottom: 12,
//   },
//   micButtonContainer: {
//     width: 80,
//     height: 80,
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   micOuterRing: {
//     position: 'absolute',
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     borderWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.4)',
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//   },
//   micMiddleRing: {
//     position: 'absolute',
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     borderWidth: 2,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//     backgroundColor: 'rgba(255, 255, 255, 0.05)',
//   },
//   micInnerCircle: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#1C1C84',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#1C1C84',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   micIcon: {
//     width: 28,
//     height: 28,
//     tintColor: '#fff',
//   },
//   waveformContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 3,
//   },
//   waveformBar: {
//     width: 4,
//     backgroundColor: '#fff',
//     borderRadius: 2,
//     marginHorizontal: 1,
//   },
//   // Transcribed Text
//   transcribedContainer: {
//     position: 'absolute',
//     bottom: 150,
//     left: 20,
//     right: 20,
//     zIndex: 2000,
//   },
//   transcribedBox: {
//     padding: 15,
//     borderRadius: 15,
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//     overflow: 'hidden',
//   },
//   transcribedText: {
//     color: '#fff',
//     fontSize: 14,
//     fontFamily: Poppins.Regular,
//     textAlign: 'center',
//   },
//     // Skeleton Styles
//   skeletonCamera: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: '#0a0a2e',
//   },
//   skeletonCanvas: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(28, 28, 132, 0.1)',
//   },
//   sBadgeSkeleton: {
//     width: 140,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: 'rgba(255,255,255,0.15)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   skeletonHomeButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: 'rgba(255,255,255,0.15)',
//   },
//   skeletonTextLine: {
//     width: 120,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     marginBottom: 8,
//   },
//   skeletonTextLineShort: {
//     width: 80,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: 'rgba(255,255,255,0.15)',
//     marginBottom: 20,
//   },
//   skeletonMicButton: {
//     position: 'relative',
//     width: 80,
//     height: 80,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   skeletonMicOuter: {
//     position: 'absolute',
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: 'rgba(255,255,255,0.08)',
//     borderWidth: 2,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   skeletonMicInner: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#1C1C84',
//   },
//   pulseOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: '#1C1C84',
//   },
//   loadingFooter: {
//     position: 'absolute',
//     bottom: 80,
//     alignItems: 'center',
//   },
//   loadingFooterText: {
//     color: '#ffffff99',
//     fontSize: 14,
//     marginTop: 12,
//     fontFamily: Poppins.Regular,
//     textAlign: 'center',
//   },
// });

// import { Ionicons } from '@expo/vector-icons';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import {
//   ExpoSpeechRecognitionModule,
//   useSpeechRecognitionEvent,
// } from 'expo-speech-recognition';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';

// interface Message {
//   id: string;
//   type: 'user' | 'assistant';
//   text: string;
//   timestamp: Date;
// }

// interface Hairstyle {
//   name: string;
//   keywords: string[];
//   description: string;
//   variations?: string[];
// }

// // Comprehensive hairstyle database
// const HAIRSTYLES: Hairstyle[] = [
//   {
//     name: 'Buzz Cut',
//     keywords: ['buzz', 'buzzcut', 'military', 'short crop'],
//     description: 'Clean, uniform short cut all around. Very low maintenance.',
//     variations: ['Induction cut (0-1)', 'Burr cut (1-2)', 'Butch cut (2-4)']
//   },
//   {
//     name: 'Crew Cut',
//     keywords: ['crew', 'crew cut', 'classic short'],
//     description: 'Short on sides, slightly longer on top with tapered back.',
//     variations: ['Ivy League', 'Princeton', 'Harvard clip']
//   },
//   {
//     name: 'Fade',
//     keywords: ['fade', 'taper fade', 'skin fade'],
//     description: 'Gradual transition from short to long hair.',
//     variations: ['Low fade', 'Mid fade', 'High fade', 'Skin fade', 'Drop fade', 'Temp fade']
//   },
//   {
//     name: 'Undercut',
//     keywords: ['undercut', 'disconnect', 'disconnected'],
//     description: 'Longer hair on top with shaved or very short sides.',
//     variations: ['Classic undercut', 'Slicked back undercut', 'Textured undercut']
//   },
//   {
//     name: 'Pompadour',
//     keywords: ['pompadour', 'pomp', 'quiff'],
//     description: 'Hair swept upwards and back from the forehead, voluminous on top.',
//     variations: ['Classic pompadour', 'Modern pompadour', 'Side-swept pompadour']
//   },
//   {
//     name: 'Quiff',
//     keywords: ['quiff', 'modern quiff'],
//     description: 'Similar to pompadour but with a more casual, textured look.',
//     variations: ['Messy quiff', 'Textured quiff', 'Long quiff']
//   },
//   {
//     name: 'Side Part',
//     keywords: ['side part', 'parted', 'gentleman'],
//     description: 'Classic style with hair parted to one side.',
//     variations: ['Hard part', 'Soft part', 'Deep side part']
//   },
//   {
//     name: 'Slick Back',
//     keywords: ['slick', 'slicked', 'slick back'],
//     description: 'Hair combed backwards, often with product for shine.',
//     variations: ['Classic slick back', 'Modern slick back', 'Textured slick back']
//   },
//   {
//     name: 'Man Bun',
//     keywords: ['man bun', 'top knot', 'bun'],
//     description: 'Long hair tied up in a bun on top or back of head.',
//     variations: ['Full bun', 'Half bun', 'Top knot']
//   },
//   {
//     name: 'French Crop',
//     keywords: ['french crop', 'crop', 'textured crop'],
//     description: 'Short fringe with textured top and faded sides.',
//     variations: ['Textured crop', 'Disconnected crop', 'Caesar crop']
//   },
//   {
//     name: 'Caesar Cut',
//     keywords: ['caesar', 'caesar cut', 'roman'],
//     description: 'Short, horizontally straight cut fringe with short sides.',
//     variations: ['Classic Caesar', 'Modern Caesar', 'Dark Caesar']
//   },
//   {
//     name: 'Mohawk',
//     keywords: ['mohawk', 'faux hawk', 'fohawk'],
//     description: 'Strip of longer hair down center with short or shaved sides.',
//     variations: ['Classic mohawk', 'Faux hawk', 'Burst fade mohawk']
//   },
//   {
//     name: 'Dreadlocks',
//     keywords: ['dreads', 'dreadlocks', 'locs'],
//     description: 'Hair twisted and matted into rope-like strands.',
//     variations: ['Free form dreads', 'Sisterlocks', 'Faux locs']
//   },
//   {
//     name: 'Afro',
//     keywords: ['afro', 'natural', 'fro'],
//     description: 'Natural rounded shape with curly or kinky hair.',
//     variations: ['High top fade', 'Tapered afro', 'Afro taper']
//   },
//   {
//     name: 'Cornrows',
//     keywords: ['cornrows', 'braids', 'cornrow'],
//     description: 'Hair braided very close to the scalp in straight lines.',
//     variations: ['Straight back', 'Curved designs', 'Feed-in braids']
//   },
//   {
//     name: 'Bowl Cut',
//     keywords: ['bowl', 'bowl cut', 'mushroom'],
//     description: 'Hair cut in a straight line around the head, like a bowl.',
//     variations: ['Classic bowl', 'Textured bowl', 'Modern bowl']
//   },
//   {
//     name: 'Mullet',
//     keywords: ['mullet', 'business front party back'],
//     description: 'Short in front and sides, long in the back.',
//     variations: ['Classic mullet', 'Modern mullet', 'Burst fade mullet']
//   },
//   {
//     name: 'Shag',
//     keywords: ['shag', 'shaggy', 'layered'],
//     description: 'Choppy, layered cut with lots of texture.',
//     variations: ['Classic shag', 'Modern shag', 'Wolf cut']
//   },
//   {
//     name: 'Long Hair',
//     keywords: ['long', 'flowing', 'shoulder length'],
//     description: 'Hair grown past shoulders with various styling options.',
//     variations: ['Straight long', 'Wavy long', 'Layered long']
//   },
//   {
//     name: 'Textured',
//     keywords: ['textured', 'messy', 'tousled'],
//     description: 'Natural-looking style with varied lengths and movement.',
//     variations: ['Messy textured', 'Spiky textured', 'Wavy textured']
//   },
//   {
//     name: 'Spiky',
//     keywords: ['spiky', 'spikes', 'frosted tips'],
//     description: 'Hair styled upward into points or spikes.',
//     variations: ['Short spikes', 'Medium spikes', 'Frosted tips']
//   },
//   {
//     name: 'Comb Over',
//     keywords: ['comb over', 'combover', 'side sweep'],
//     description: 'Hair combed from one side to the other.',
//     variations: ['Classic comb over', 'Modern comb over', 'Comb over fade']
//   },
//   {
//     name: 'Ivy League',
//     keywords: ['ivy league', 'harvard', 'college cut'],
//     description: 'Similar to crew cut but slightly longer on top for styling.',
//     variations: ['Short Ivy League', 'Long Ivy League']
//   },
//   {
//     name: 'Taper',
//     keywords: ['taper', 'tapered', 'taper cut'],
//     description: 'Gradually decreasing hair length from top to bottom.',
//     variations: ['Low taper', 'Mid taper', 'High taper']
//   },
//   {
//     name: 'Bald/Shaved',
//     keywords: ['bald', 'shaved', 'clean shaven', 'no hair'],
//     description: 'Completely shaved head for a clean look.',
//     variations: ['Razor shave', 'Close clipper shave']
//   }
// ];

// export default function Index() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [isListening, setIsListening] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [currentHairstyle, setCurrentHairstyle] = useState<string | null>(null);
//   const scrollViewRef = useRef<ScrollView>(null);

//   useSpeechRecognitionEvent('start', () => {
//     console.log('Speech recognition started');
//   });

//   useSpeechRecognitionEvent('result', (event) => {
//     const transcript = event.results[0]?.transcript;
//     if (transcript) {
//       handleUserSpeech(transcript);
//     }
//   });

//   useSpeechRecognitionEvent('end', () => {
//     setIsListening(false);
//   });

//   useSpeechRecognitionEvent('error', (event) => {
//     console.error('Speech recognition error:', event.error);
//     setIsListening(false);
//   });

//   useEffect(() => {
//     const requestSpeechPermission = async () => {
//       const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
//       if (!result.granted) {
//         alert('Speech recognition permission is required');
//       }
//     };
//     requestSpeechPermission();
//   }, []);

//   const handleUserSpeech = async (transcript: string) => {
//     const userMessage: Message = {
//       id: Date.now().toString(),
//       type: 'user',
//       text: transcript,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMessage]);

//     if (isListening) {
//       ExpoSpeechRecognitionModule.stop();
//       setIsListening(false);
//     }

//     setIsProcessing(true);
//     const assistantResponse = await getAIResponse(transcript);
    
//     const assistantMessage: Message = {
//       id: (Date.now() + 1).toString(),
//       type: 'assistant',
//       text: assistantResponse,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, assistantMessage]);
//     setIsProcessing(false);

//     setTimeout(() => {
//       scrollViewRef.current?.scrollToEnd({ animated: true });
//     }, 100);
//   };

//   const findMatchingHairstyle = (input: string): Hairstyle | null => {
//     const lowerInput = input.toLowerCase();
    
//     for (const style of HAIRSTYLES) {
//       for (const keyword of style.keywords) {
//         if (lowerInput.includes(keyword)) {
//           return style;
//         }
//       }
//     }
//     return null;
//   };

//   const getAIResponse = async (userInput: string): Promise<string> => {
//     await new Promise((resolve) => setTimeout(resolve, 1000));

//     const lowerInput = userInput.toLowerCase();
//     const matchedStyle = findMatchingHairstyle(userInput);

//     // Handle specific hairstyle requests
//     if (matchedStyle) {
//       setCurrentHairstyle(matchedStyle.name);
//       let response = `Applying ${matchedStyle.name} to your preview! ${matchedStyle.description}`;
      
//       if (matchedStyle.variations && matchedStyle.variations.length > 0) {
//         response += `\n\nAvailable variations:\n${matchedStyle.variations.join('\n')}`;
//       }
      
//       return response;
//     }

//     // Handle modification requests
//     if (lowerInput.includes('longer') || lowerInput.includes('grow')) {
//       return "Adjusting to show longer hair. This will give you more styling versatility. How much longer would you like?";
//     }
    
//     if (lowerInput.includes('shorter') || lowerInput.includes('trim')) {
//       return "Showing a shorter version. A trim helps maintain shape and remove split ends. How short should we go?";
//     }
    
//     if (lowerInput.includes('color') || lowerInput.includes('dye') || lowerInput.includes('blonde') || 
//         lowerInput.includes('brown') || lowerInput.includes('black') || lowerInput.includes('red')) {
//       return "I can preview different hair colors! What color would you like to see? (blonde, brown, black, red, platinum, etc.)";
//     }

//     // Handle list requests
//     if (lowerInput.includes('show') && (lowerInput.includes('all') || lowerInput.includes('list') || 
//         lowerInput.includes('options') || lowerInput.includes('hairstyle'))) {
//       const styleList = HAIRSTYLES.map(s => s.name).join(', ');
//       return `Here are all available hairstyles:\n\n${styleList}\n\nJust say the name of any style you'd like to try!`;
//     }

//     // Handle help requests
//     if (lowerInput.includes('help') || lowerInput.includes('what can')) {
//       return "I can show you different hairstyles! Try saying things like:\n• 'Show me a fade'\n• 'Try a pompadour'\n• 'List all hairstyles'\n• 'Make it longer/shorter'\n• 'Show me different colors'";
//     }

//     // Default response
//     return `I heard: "${userInput}". I can show you hairstyles like fade, undercut, pompadour, buzz cut, and many more! Say "list all hairstyles" to see all options, or just say the name of a style you'd like to try.`;
//   };

//   const toggleListening = async () => {
//     if (isListening) {
//       ExpoSpeechRecognitionModule.stop();
//       setIsListening(false);
//     } else {
//       const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
//       if (result.granted) {
//         ExpoSpeechRecognitionModule.start({
//           lang: 'en-US',
//           interimResults: true,
//           maxAlternatives: 1,
//           continuous: false,
//         });
//         setIsListening(true);
//       }
//     }
//   };

//   if (!permission) {
//     return <View style={styles.container} />;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.permissionText}>We need camera permission</Text>
//         <TouchableOpacity style={styles.button} onPress={requestPermission}>
//           <Text style={styles.buttonText}>Grant Permission</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <CameraView style={styles.camera} facing="front">
//         <View style={styles.arOverlay}>
//           {currentHairstyle ? (
//             <View style={styles.styleIndicator}>
//               <Text style={styles.styleText}>{currentHairstyle}</Text>
//               <Text style={styles.arText}>AR Preview Active</Text>
//             </View>
//           ) : (
//             <Text style={styles.arText}>Say a hairstyle name to preview</Text>
//           )}
//         </View>
//       </CameraView>

//       <View style={styles.chatContainer}>
//         <ScrollView
//           ref={scrollViewRef}
//           style={styles.messagesScroll}
//           contentContainerStyle={styles.messagesContent}
//         >
//           {messages.map((message) => (
//             <View
//               key={message.id}
//               style={[
//                 styles.messageBubble,
//                 message.type === 'user'
//                   ? styles.userBubble
//                   : styles.assistantBubble,
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.messageText,
//                   message.type === 'user'
//                     ? styles.userText
//                     : styles.assistantText,
//                 ]}
//               >
//                 {message.text}
//               </Text>
//             </View>
//           ))}
//           {isProcessing && (
//             <View style={[styles.messageBubble, styles.assistantBubble]}>
//               <ActivityIndicator color="#fff" />
//               <Text style={styles.assistantText}>Processing...</Text>
//             </View>
//           )}
//         </ScrollView>
//       </View>

//       <View style={styles.controls}>
//         <TouchableOpacity
//           style={[
//             styles.voiceButton,
//             isListening && styles.voiceButtonActive,
//           ]}
//           onPress={toggleListening}
//           disabled={isProcessing}
//         >
//           <Ionicons
//             name={isListening ? 'mic' : 'mic-outline'}
//             size={32}
//             color="#fff"
//           />
//           <Text style={styles.voiceButtonText}>
//             {isListening ? 'Listening...' : 'Tap to Speak'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   camera: {
//     flex: 1,
//   },
//   arOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   styleIndicator: {
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     paddingHorizontal: 24,
//     paddingVertical: 16,
//     borderRadius: 12,
//   },
//   styleText: {
//     color: '#00FF00',
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   arText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   permissionText: {
//     color: '#fff',
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   chatContainer: {
//     position: 'absolute',
//     top: 60,
//     left: 16,
//     right: 16,
//     maxHeight: '40%',
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     borderRadius: 16,
//     overflow: 'hidden',
//   },
//   messagesScroll: {
//     flex: 1,
//   },
//   messagesContent: {
//     padding: 12,
//   },
//   messageBubble: {
//     maxWidth: '80%',
//     padding: 12,
//     borderRadius: 16,
//     marginBottom: 8,
//   },
//   userBubble: {
//     alignSelf: 'flex-end',
//     backgroundColor: '#007AFF',
//   },
//   assistantBubble: {
//     alignSelf: 'flex-start',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   messageText: {
//     fontSize: 15,
//     lineHeight: 20,
//   },
//   userText: {
//     color: '#fff',
//   },
//   assistantText: {
//     color: '#fff',
//   },
//   controls: {
//     position: 'absolute',
//     bottom: 40,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//   },
//   voiceButton: {
//     backgroundColor: 'rgba(0,122,255,0.9)',
//     paddingHorizontal: 32,
//     paddingVertical: 16,
//     borderRadius: 30,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   voiceButtonActive: {
//     backgroundColor: '#FF3B30',
//   },
//   voiceButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { BlurView } from 'expo-blur';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Button,
  Dimensions,
  Image,
  LogBox,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CanvasComponent, { CanvasRenderingContext2D } from 'react-native-canvas';

import { Poppins } from '@/constants/theme';

interface Hairstyle {
  name: string;
  keywords: string[];
  description: string;
  variations?: string[];
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

// Comprehensive hairstyle database
const HAIRSTYLES: Hairstyle[] = [
  {
    name: 'Buzz Cut',
    keywords: ['buzz', 'buzzcut', 'military', 'short crop'],
    description: 'Clean, uniform short cut all around. Very low maintenance.',
    variations: ['Induction cut (0-1)', 'Burr cut (1-2)', 'Butch cut (2-4)']
  },
  {
    name: 'Crew Cut',
    keywords: ['crew', 'crew cut', 'classic short'],
    description: 'Short on sides, slightly longer on top with tapered back.',
    variations: ['Ivy League', 'Princeton', 'Harvard clip']
  },
  {
    name: 'Fade',
    keywords: ['fade', 'taper fade', 'skin fade'],
    description: 'Gradual transition from short to long hair.',
    variations: ['Low fade', 'Mid fade', 'High fade', 'Skin fade', 'Drop fade', 'Temp fade']
  },
  {
    name: 'Undercut',
    keywords: ['undercut', 'disconnect', 'disconnected'],
    description: 'Longer hair on top with shaved or very short sides.',
    variations: ['Classic undercut', 'Slicked back undercut', 'Textured undercut']
  },
  {
    name: 'Pompadour',
    keywords: ['pompadour', 'pomp', 'quiff'],
    description: 'Hair swept upwards and back from the forehead, voluminous on top.',
    variations: ['Classic pompadour', 'Modern pompadour', 'Side-swept pompadour']
  },
  {
    name: 'Quiff',
    keywords: ['quiff', 'modern quiff'],
    description: 'Similar to pompadour but with a more casual, textured look.',
    variations: ['Messy quiff', 'Textured quiff', 'Long quiff']
  },
  {
    name: 'Side Part',
    keywords: ['side part', 'parted', 'gentleman'],
    description: 'Classic style with hair parted to one side.',
    variations: ['Hard part', 'Soft part', 'Deep side part']
  },
  {
    name: 'Slick Back',
    keywords: ['slick', 'slicked', 'slick back'],
    description: 'Hair combed backwards, often with product for shine.',
    variations: ['Classic slick back', 'Modern slick back', 'Textured slick back']
  },
  {
    name: 'Man Bun',
    keywords: ['man bun', 'top knot', 'bun'],
    description: 'Long hair tied up in a bun on top or back of head.',
    variations: ['Full bun', 'Half bun', 'Top knot']
  },
  {
    name: 'French Crop',
    keywords: ['french crop', 'crop', 'textured crop'],
    description: 'Short fringe with textured top and faded sides.',
    variations: ['Textured crop', 'Disconnected crop', 'Caesar crop']
  },
  {
    name: 'Caesar Cut',
    keywords: ['caesar', 'caesar cut', 'roman'],
    description: 'Short, horizontally straight cut fringe with short sides.',
    variations: ['Classic Caesar', 'Modern Caesar', 'Dark Caesar']
  },
  {
    name: 'Mohawk',
    keywords: ['mohawk', 'faux hawk', 'fohawk'],
    description: 'Strip of longer hair down center with short or shaved sides.',
    variations: ['Classic mohawk', 'Faux hawk', 'Burst fade mohawk']
  },
  {
    name: 'Dreadlocks',
    keywords: ['dreads', 'dreadlocks', 'locs'],
    description: 'Hair twisted and matted into rope-like strands.',
    variations: ['Free form dreads', 'Sisterlocks', 'Faux locs']
  },
  {
    name: 'Afro',
    keywords: ['afro', 'natural', 'fro'],
    description: 'Natural rounded shape with curly or kinky hair.',
    variations: ['High top fade', 'Tapered afro', 'Afro taper']
  },
  {
    name: 'Cornrows',
    keywords: ['cornrows', 'braids', 'cornrow'],
    description: 'Hair braided very close to the scalp in straight lines.',
    variations: ['Straight back', 'Curved designs', 'Feed-in braids']
  },
  {
    name: 'Bowl Cut',
    keywords: ['bowl', 'bowl cut', 'mushroom'],
    description: 'Hair cut in a straight line around the head, like a bowl.',
    variations: ['Classic bowl', 'Textured bowl', 'Modern bowl']
  },
  {
    name: 'Mullet',
    keywords: ['mullet', 'business front party back'],
    description: 'Short in front and sides, long in the back.',
    variations: ['Classic mullet', 'Modern mullet', 'Burst fade mullet']
  },
  {
    name: 'Shag',
    keywords: ['shag', 'shaggy', 'layered'],
    description: 'Choppy, layered cut with lots of texture.',
    variations: ['Classic shag', 'Modern shag', 'Wolf cut']
  },
  {
    name: 'Long Hair',
    keywords: ['long', 'flowing', 'shoulder length'],
    description: 'Hair grown past shoulders with various styling options.',
    variations: ['Straight long', 'Wavy long', 'Layered long']
  },
  {
    name: 'Textured',
    keywords: ['textured', 'messy', 'tousled'],
    description: 'Natural-looking style with varied lengths and movement.',
    variations: ['Messy textured', 'Spiky textured', 'Wavy textured']
  },
  {
    name: 'Spiky',
    keywords: ['spiky', 'spikes', 'frosted tips'],
    description: 'Hair styled upward into points or spikes.',
    variations: ['Short spikes', 'Medium spikes', 'Frosted tips']
  },
  {
    name: 'Comb Over',
    keywords: ['comb over', 'combover', 'side sweep'],
    description: 'Hair combed from one side to the other.',
    variations: ['Classic comb over', 'Modern comb over', 'Comb over fade']
  },
  {
    name: 'Ivy League',
    keywords: ['ivy league', 'harvard', 'college cut'],
    description: 'Similar to crew cut but slightly longer on top for styling.',
    variations: ['Short Ivy League', 'Long Ivy League']
  },
  {
    name: 'Taper',
    keywords: ['taper', 'tapered', 'taper cut'],
    description: 'Gradually decreasing hair length from top to bottom.',
    variations: ['Low taper', 'Mid taper', 'High taper']
  },
  {
    name: 'Bald/Shaved',
    keywords: ['bald', 'shaved', 'clean shaven', 'no hair'],
    description: 'Completely shaved head for a clean look.',
    variations: ['Razor shave', 'Close clipper shave']
  }
];

//const TensorCamera = cameraWithTensors(CameraView);
const TensorCamera = Platform.OS === 'ios' ? cameraWithTensors(CameraView) : null;

LogBox.ignoreAllLogs(true);
const { width, height } = Dimensions.get('window');

export default function LiveStreaming() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [model, setModel] = useState<blazeface.BlazeFaceModel>();
  const [isTfReady, setIsTfReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [recordingEndTime, setRecordingEndTime] = useState<Date | null>(null);
  const [permissionResponse, requestMediaPermission] = MediaLibrary.usePermissions({
    writeOnly: true,
  });
  const [faceCount, setFaceCount] = useState(0);
  
  // Voice to text states
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentHairstyle, setCurrentHairstyle] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const cameraRef = useRef<CameraView>(null);
  let context = useRef<CanvasRenderingContext2D | undefined>(undefined);
  const canvas = useRef<any>(undefined);

  // Animation for microphone button
  const micScale = useRef(new Animated.Value(1)).current;
  const micPulse = useRef(new Animated.Value(0)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;

  // Configurations for recording
  const RECORDING_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const FACE_DETECTION_THRESHOLD = 1; // Number of faces to start recording

  // Handle speech recognition events
  useSpeechRecognitionEvent('start', () => {
    console.log('Speech recognition started');
    setIsListening(true);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      handleUserSpeech(transcript);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    console.log('Speech recognition ended');
    setIsListening(false);
    setIsProcessing(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    setIsProcessing(false);
    setTranscribedText(`Error: ${event.error}`);
  });

  useEffect(() => {
    (async () => {
      try {
        await requestMediaPermission();

        // Request speech recognition permission
        const speechResult = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!speechResult.granted) {
          console.warn('Speech recognition permission denied');
        }

        await tf.ready();
        console.log("TensorFlow Ready");
        const loadedModel = await blazeface.load();
        setModel(loadedModel);
        console.log("BlazeFace model is loaded", loadedModel);
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

  // Add this animation for skeleton pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(micPulse, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
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

  const findMatchingHairstyle = (input: string): Hairstyle | null => {
    const lowerInput = input.toLowerCase();
    
    for (const style of HAIRSTYLES) {
      for (const keyword of style.keywords) {
        if (lowerInput.includes(keyword)) {
          return style;
        }
      }
    }
    return null;
  };

  const getAIResponse = async (userInput: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const lowerInput = userInput.toLowerCase();
    const matchedStyle = findMatchingHairstyle(userInput);

    // Handle specific hairstyle requests
    if (matchedStyle) {
      setCurrentHairstyle(matchedStyle.name);
      let response = `Applying ${matchedStyle.name} to your preview! ${matchedStyle.description}`;
      
      if (matchedStyle.variations && matchedStyle.variations.length > 0) {
        response += `\n\nAvailable variations:\n${matchedStyle.variations.join('\n')}`;
      }
      
      return response;
    }

    // Handle modification requests
    if (lowerInput.includes('longer') || lowerInput.includes('grow')) {
      return "Adjusting to show longer hair. This will give you more styling versatility. How much longer would you like?";
    }
    
    if (lowerInput.includes('shorter') || lowerInput.includes('trim')) {
      return "Showing a shorter version. A trim helps maintain shape and remove split ends. How short should we go?";
    }
    
    if (lowerInput.includes('color') || lowerInput.includes('dye') || lowerInput.includes('blonde') || 
        lowerInput.includes('brown') || lowerInput.includes('black') || lowerInput.includes('red')) {
      return "I can preview different hair colors! What color would you like to see? (blonde, brown, black, red, platinum, etc.)";
    }

    // Handle list requests
    if (lowerInput.includes('show') && (lowerInput.includes('all') || lowerInput.includes('list') || 
        lowerInput.includes('options') || lowerInput.includes('hairstyle'))) {
      const styleList = HAIRSTYLES.map(s => s.name).join(', ');
      return `Here are all available hairstyles:\n\n${styleList}\n\nJust say the name of any style you'd like to try!`;
    }

    // Handle help requests
    if (lowerInput.includes('help') || lowerInput.includes('what can')) {
      return "I can show you different hairstyles on your face! Try saying things like:\n• 'Show me a fade'\n• 'Try a pompadour'\n• 'List all hairstyles'\n• 'Make it longer/shorter'\n• 'Show me different colors'";
    }

    // Default response
    return `I heard: "${userInput}". I can show you hairstyles like fade, undercut, pompadour, buzz cut, and many more! Say "list all hairstyles" to see all options, or just say the name of a style you'd like to try.`;
  };

  const handleUserSpeech = async (transcript: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: transcript,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Stop listening
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    }

    // Process the command and get AI response
    setIsProcessing(true);
    const assistantResponse = await getAIResponse(transcript);
    
    // Add assistant message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      text: assistantResponse,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsProcessing(false);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      // Stop listening
      try {
        ExpoSpeechRecognitionModule.stop();
        setIsProcessing(true);
      } catch (error: any) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
        setIsProcessing(false);
      }
    } else {
      // Start listening
      setTranscribedText('');
      
      try {
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (result.granted) {
          ExpoSpeechRecognitionModule.start({
            lang: 'en-US',
            interimResults: true,
            maxAlternatives: 1,
            continuous: false,
            requiresOnDeviceRecognition: false,
            addsPunctuation: false,
            contextualStrings: [
              'object detection',
              'AI mirror',
              'tensorflow',
              'person',
              'car',
              'phone',
            ],
          });
        } else {
          setTranscribedText('Speech recognition permission denied');
        }
      } catch (error: any) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        setTranscribedText(`Error: ${error.message || 'Failed to start listening'}`);
      }
    }
  };

  const handleCameraStream = (images: any, updatePreview: () => void, gl: any) => {
    const loop = async () => {
      try {
        const nextImageTensor = images.next().value;
        if (!nextImageTensor) {
          requestAnimationFrame(loop);
          return;
        }

        if (model && model.estimateFaces) {
          try {
            const predictions = await model.estimateFaces(nextImageTensor, false);

            if (!predictions || predictions.length === 0) {
              setFaceCount(0);
            } else {
              setFaceCount(predictions.length);
              console.log(`Detected ${predictions.length} face(s)`);
            }

            // Draw face detection boxes and landmarks
            drawFaceDetection(predictions, nextImageTensor);

            // Clean up tensor
            tf.dispose(nextImageTensor);
          } catch (error) {
            console.error('Error in face detection:', error);
          }
        }

        if (updatePreview) {
          updatePreview();
        }
        if (gl) {
          gl.endFrameEXP();
        }

        requestAnimationFrame(loop);
      } catch (error) {
        console.error('Error in camera stream loop:', error);
        requestAnimationFrame(loop);
      }
    };

    loop();
  };

  function drawFaceDetection(predictions: any[], nextImageTensor: any) {
    if (!context.current || !canvas.current) {
      console.log('No context or canvas');
      return;
    }

    const scaleWidth = width / nextImageTensor.shape[1];
    const scaleHeight = height / nextImageTensor.shape[0];

    const flipHorizontal = Platform.OS === 'ios' ? false : true;

    context.current.clearRect(0, 0, width, height);

    predictions.forEach((prediction) => {
      if (prediction && prediction.topLeft && prediction.bottomRight) {
        const [x1, y1] = prediction.topLeft;
        const [x2, y2] = prediction.bottomRight;
        
        const bboxWidth = x2 - x1;
        const bboxHeight = y2 - y1;

        if (canvas.current && context.current) {
          const boundingBoxX = flipHorizontal
            ? canvas.current.width - x1 * scaleWidth - bboxWidth * scaleWidth
            : x1 * scaleWidth;
          const boundingBoxY = y1 * scaleHeight;

          // Draw face bounding box
          context.current.strokeStyle = "#00FF00";
          context.current.lineWidth = 3;
          context.current.strokeRect(
            boundingBoxX,
            boundingBoxY,
            bboxWidth * scaleWidth,
            bboxHeight * scaleHeight
          );

          // Draw label
          context.current.fillStyle = "#00FF00";
          context.current.font = "16px Arial";
          const probability = prediction.probability ? prediction.probability[0] : 1;
          context.current.fillText(
            `Face (${Math.round(probability * 100)}%)`,
            boundingBoxX + 5,
            boundingBoxY > 20 ? boundingBoxY - 5 : boundingBoxY + 20
          );

          // Draw facial landmarks (if available)
          if (prediction.landmarks) {
            context.current.fillStyle = "#FF0000";
            prediction.landmarks.forEach((landmark: number[]) => {
              const landmarkX = flipHorizontal
                ? canvas.current.width - landmark[0] * scaleWidth
                : landmark[0] * scaleWidth;
              const landmarkY = landmark[1] * scaleHeight;
              
              context.current.beginPath();
              context.current.arc(landmarkX, landmarkY, 3, 0, 2 * Math.PI);
              context.current.fill();
            });
          }
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
        ctx.strokeStyle = "#00FF00";
        ctx.fillStyle = "#00FF00";
        ctx.lineWidth = 3;
        
        // Make canvas background transparent
        ctx.clearRect(0, 0, width, height);
        
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

  const tensorDims = Platform.OS === "ios" 
    ? { height: 152, width: 200 }
    : { height: 152, width: 200 };

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

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  if (!isTfReady || !model) {
    return (
      <View style={styles.container}>
        {/* Background simulating camera feed with dark blur */}
        <View style={styles.skeletonCamera} />

        {/* Canvas overlay simulation */}
        <View style={styles.skeletonCanvas} pointerEvents="none" />

        {/* Top Badge Skeleton */}
        <View style={styles.topBadgeContainer}>
          <View style={styles.sBadgeSkeleton} />
        </View>

        {/* Home Button Skeleton */}
        <View style={styles.homeButton}>
          <View style={styles.skeletonHomeButton} />
        </View>

        {/* Bottom Mic Button Skeleton */}
        <View style={styles.bottomControls}>
          <View style={styles.micContainer}>
            <View style={styles.skeletonTextLine} />
            <View style={styles.skeletonTextLineShort} />

            <View style={styles.skeletonMicButton}>
              <View style={styles.skeletonMicOuter} />
              <View style={styles.skeletonMicInner} />
            </View>
          </View>
        </View>

        {/* Optional: Pulsing overlay for premium feel */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View
            style={[
              styles.pulseOverlay,
              {
                opacity: micPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.05, 0.15],
                }),
              },
            ]}
          />
        </View>

        {/* Loading text at bottom */}
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color="#ffffff88" />
          <Text style={styles.loadingFooterText}>
            Initializing Face Detection AI...
          </Text>
        </View>
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
      {Platform.OS === 'ios' ? (
      <TensorCamera
        style={styles.camera}
        ref={cameraRef as React.Ref<any>}
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={300}
        resizeWidth={352}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={true}
        useCustomShadersToResize={false}
        facing={facing}
      />
      ) : (
        // Android: Use CameraView (no black screen)
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        />
      )}
      <CanvasComponent 
        style={styles.canvas} 
        ref={handleCanvas}
        transparent={true}
      />
      

      {/* Top Badge - AI Face Detection Active */}
      <View style={styles.topBadgeContainer}>
        <BlurView intensity={20} style={styles.topBadge}>
          <Text style={styles.badgeText}>
            {currentHairstyle 
              ? `${currentHairstyle} Preview` 
              : faceCount > 0 
                ? `AI Face Detection - ${faceCount} Face${faceCount > 1 ? 's' : ''}` 
                : 'AI Face Detection'}
          </Text>
        </BlurView>
      </View>

      {/* Chat Messages */}
      {messages.length > 0 && (
        <View style={styles.chatContainer}>
          <BlurView intensity={20} style={styles.chatBlur}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.type === 'user'
                      ? styles.userBubble
                      : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.type === 'user'
                        ? styles.userText
                        : styles.assistantText,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              ))}
              {isProcessing && (
                <View style={[styles.messageBubble, styles.assistantBubble]}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.assistantText}>Processing...</Text>
                </View>
              )}
            </ScrollView>
          </BlurView>
        </View>
      )}

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

      {/* Transcribed Text Display - Only show when no messages */}
      {transcribedText && messages.length === 0 ? (
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
    zIndex: 0,
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
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
    top: Platform.OS === 'ios' ? 50 : 50,
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
    textAlign: 'center',
  },
  // Chat Container
  chatContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 16,
    right: 16,
    maxHeight: '40%',
    zIndex: 1500,
  },
  chatBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  messagesScroll: {
    maxHeight: 300,
  },
  messagesContent: {
    padding: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1C1C84',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Poppins.Regular,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#fff',
  },
  // Home Button
  homeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 50,
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
    bottom: Platform.OS === 'ios' ? 50 : 60,
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
  // Skeleton Styles
  skeletonCamera: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a2e',
  },
  skeletonCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 28, 132, 0.1)',
  },
  sBadgeSkeleton: {
    width: 140,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skeletonHomeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skeletonTextLine: {
    width: 120,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
  },
  skeletonTextLineShort: {
    width: 80,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 20,
  },
  skeletonMicButton: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonMicOuter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skeletonMicInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1C1C84',
  },
  pulseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1C1C84',
  },
  loadingFooter: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingFooterText: {
    color: '#ffffff99',
    fontSize: 14,
    marginTop: 12,
    fontFamily: Poppins.Regular,
    textAlign: 'center',
  },
});