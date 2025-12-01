import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const appIconScale = useRef(new Animated.Value(0.5)).current;
  const appIconOpacity = useRef(new Animated.Value(0)).current;
  const appIconX = useRef(new Animated.Value(0)).current;
  const mainLogoScale = useRef(new Animated.Value(0.7)).current;
  const mainLogoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade in app icon while scaling
      Animated.parallel([
        Animated.timing(appIconOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.spring(appIconScale, {
          toValue: 1.3,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      // Settle icon to normal size
      Animated.spring(appIconScale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
      // Slide left & fade out smoothly
      Animated.parallel([
        Animated.timing(appIconX, {
          toValue: -width * 0.7,
          duration: 700,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(appIconOpacity, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Fade in main logo with smooth scale
      Animated.parallel([
        Animated.timing(mainLogoOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.spring(mainLogoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    });
  }, []);

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <Animated.Image
        source={require('@/assets/images/app-icon.png')}
        style={[
          styles.icon,
          {
            opacity: appIconOpacity,
            transform: [
              { scale: appIconScale },
              { translateX: appIconX },
            ],
          },
        ]}
        resizeMode="contain"
      />

      <Animated.Image
        source={require('@/assets/images/main-logo.png')}
        style={[
          styles.mainLogo,
          {
            opacity: mainLogoOpacity,
            transform: [{ scale: mainLogoScale }],
          },
        ]}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A28',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 160,
    height: 160,
    position: 'absolute',
  },
  mainLogo: {
    width: 250,
    height: 90,
    position: 'absolute',
  },
});
