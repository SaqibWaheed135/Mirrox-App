import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet
} from 'react-native';

import { AuthService } from '@/lib/auth';
import { OnboardingService } from '@/services/onboarding.service';

const { width } = Dimensions.get('window');

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const appIconScale = useRef(new Animated.Value(0.3)).current;
  const appIconOpacity = useRef(new Animated.Value(0)).current;
  const appIconX = useRef(new Animated.Value(0)).current;
  const mainLogoScale = useRef(new Animated.Value(0.5)).current;
  const mainLogoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      // Check authentication status
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      // If not authenticated, check onboarding status
      if (!authenticated) {
        const completedOnboarding = await OnboardingService.hasCompletedOnboarding();
        setHasCompletedOnboarding(completedOnboarding);
      }
    } catch (error) {
      console.error('Error checking app status:', error);
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
    }
  };

  useEffect(() => {
    if (!showSplash) return;

    Animated.sequence([
      // 1. Start tiny + fade in
      Animated.parallel([
        Animated.timing(appIconOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(appIconScale, {
          toValue: 0.1, // Very tiny start
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      // 2. Grow BIG (overshoot)
      Animated.spring(appIconScale, {
        toValue: 1.4,   // huge size first
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      // 3. Settle to NORMAL size
      Animated.spring(appIconScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      // (Optional) Slide left & fade out
      Animated.parallel([
        Animated.timing(appIconX, {
          toValue: -width * 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(appIconOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      // Show main logo
      Animated.parallel([
        Animated.timing(mainLogoOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(mainLogoScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        setShowSplash(false);
      }, 800);
    });
  }, [showSplash]);

  // Wait for animation and status checks
  if (showSplash || isAuthenticated === null) {
    return (
      <LinearGradient
        colors={['#1A1A4A', '#0A0A1A', '#000000']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >
        {/* APP ICON FIRST */}
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

        {/* MAIN LOGO AFTER TRANSITION */}
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

  // Route based on authentication and onboarding status
  if (isAuthenticated) {
    // User is logged in, go to home
    return <Redirect href="/(tabs)/home" />;
  } else if (hasCompletedOnboarding) {
    // User has seen onboarding, go to login
    return <Redirect href="/login" />;
  } else {
    // First time user, show onboarding
    return <Redirect href="/onboarding" />;
  }
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