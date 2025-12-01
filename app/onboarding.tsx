import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Poppins } from '@/constants/theme';
import { OnboardingService } from '@/services/onboarding.service';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Experience\nLive Cut Now',
    subtitle: 'Reflect the Future of Style',
    description: 'Discover your perfect hairstyle with AI-powered recommendations',
  },
  {
    id: 2,
    title: 'Virtual Try-On\nYour Style',
    subtitle: 'See Before You Cut',
    description: 'Try different hairstyles virtually before visiting the barber',
  },
  {
    id: 3,
    title: 'Book Your\nPerfect Cut',
    subtitle: 'Connect with Expert Barbers',
    description: 'Find and book appointments with top barbers in your area',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<any>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    // Mark onboarding as completed
    await OnboardingService.completeOnboarding();
    router.replace('/login');
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.slide}>
      <View style={styles.contentContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/main-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoTagline}>REFLECT THE FUTURE OF STYLE</Text>
        </View>

        {/* Main Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          {item.id > 1 && (
            <Text style={styles.description}>{item.description}</Text>
          )}
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={scrollTo}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(28, 28, 132, 0.9)', 'rgba(28, 28, 132, 0.7)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIconLeft}>›</Text>
                <Text style={styles.buttonText}>
                  {currentIndex === onboardingData.length - 1
                    ? 'Get Started'
                    : 'Get Started'}
                </Text>
                <Text style={styles.buttonIconRight}>»</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip Button */}
          {currentIndex < onboardingData.length - 1 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1F1F4D', '#14142E', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <View style={styles.wrapper}>
        <Animated.FlatList
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 30, 10],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 10,
  },
  logoTagline: {
    fontSize: 9,
    color: '#8B9BFF',
    letterSpacing: 2,
    fontFamily: Poppins.Light,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 40,
  },
  title: {
    fontSize: 48,
    color: '#FFFFFF',
    fontFamily: Poppins.Bold,
    lineHeight: 56,
    marginBottom: 15,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Poppins.Regular,
    marginBottom: 20,
    opacity: 0.9,
  },
  description: {
    fontSize: 14,
    color: '#8B9BFF',
    fontFamily: Poppins.Regular,
    lineHeight: 22,
    marginTop: 10,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#1C1C84',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonGradient: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 155, 255, 0.3)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconLeft: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: Poppins.Light,
    marginRight: 12,
    marginTop: -2,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: Poppins.SemiBold,
    letterSpacing: 0.5,
  },
  buttonIconRight: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: Poppins.Light,
    marginLeft: 12,
    marginTop: -2,
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#8B9BFF',
    fontFamily: Poppins.Medium,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B9BFF',
    marginHorizontal: 5,
  },
});