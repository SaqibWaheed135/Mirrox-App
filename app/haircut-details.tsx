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

import { BottomNav } from '@/components/navigation/bottom-nav';
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
      <BottomNav />
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
});

