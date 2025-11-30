import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Poppins } from '@/constants/theme';

export default function HaircutDetailsScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    description: string;
  }>();

  // Map image based on haircut name or use default
  const getImageSource = () => {
    const name = params.name?.toLowerCase() || '';
    if (name.includes('fade')) {
      return require('@/assets/images/fade.png');
    } else if (name.includes('taper')) {
      return require('@/assets/images/taper-fade.png');
    } else if (name.includes('crop') || name.includes('crew')) {
      return require('@/assets/images/crop.png');
    } else if (name.includes('buzz')) {
      return require('@/assets/images/buzz.png');
    } else if (name.includes('bun') || name.includes('long')) {
      return require('@/assets/images/long.png');
    }
    return require('@/assets/images/haircut.png');
  };

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1A1A4A" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Haircut Image */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource()}
            style={styles.haircutImage}
            resizeMode="cover"
          />
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          {/* Progress Indicator */}
          <View style={styles.progressIndicator}>
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotInactive]} />
            <View style={[styles.progressDot, styles.progressDotInactive]} />
          </View>

          {/* Haircut Name */}
          <Text style={styles.haircutName}>{params.name}</Text>

          {/* Description */}
          <Text style={styles.description}>{params.description}</Text>

          {/* Open in AR Button */}
          <TouchableOpacity style={styles.arButton}>
            <Text style={styles.arButtonText}>Open in AR</Text>
            <Image
              source={require('@/assets/icons/ar.png')}
              style={styles.arIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Go Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(tabs)/home')}
        >
          <View style={styles.navIconActive}>
            <Image
              source={require('@/assets/icons/home.png')}
              style={styles.navIconImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(tabs)/index')}
        >
          <Image
            source={require('@/assets/icons/ai.png')}
            style={styles.navIconImageInactive}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Image
            source={require('@/assets/icons/profile.png')}
            style={styles.navIconImageInactive}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 500,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  haircutImage: {
    width: '100%',
    height: '100%',
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 120,
    minHeight: 400,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    gap: 8,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000059',
  },
  progressDotInactive: {
    backgroundColor: '#E0E0E0',
  },
  haircutName: {
    fontSize: 36,
    fontFamily: Poppins.Bold,
    color: '#000059',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 12,
    fontFamily: Poppins.Light,
    color: '#1C1C84',
    marginBottom: 50,
    marginTop: -10,
    textAlign: 'justify',
  },
  arButton: {
    backgroundColor: '#1C1C84',
    width: 300,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 40,
    marginBottom: 15,
    gap: 8,
    shadowColor: '#1C1C84',
    shadowOffset: { width: 0, height: -1.57 },
    shadowOpacity: 1,
    shadowRadius: 22.57,
    elevation: 20,
  },
  arIconImage: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  arButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Poppins.Medium,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000059',
    borderRadius: 40,
    alignItems: 'center',
    width: '40%',
    height: 35,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#1C1C84',
    fontSize: 12,
    fontFamily: Poppins.Medium,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 35,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIconActive: {
    backgroundColor: '#000059',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000059',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  navIconImage: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  navIconImageInactive: {
    width: 26,
    height: 26,
    tintColor: '#000',
    opacity: 0.3,
  },
});

