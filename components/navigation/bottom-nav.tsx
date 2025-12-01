/**
 * Bottom Navigation Component
 * Reusable bottom navigation bar for app screens
 */

import { router, usePathname } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BottomNavProps {
  activeScreen?: 'home' | 'camera' | 'profile';
}

export function BottomNav({ activeScreen }: BottomNavProps) {
  const pathname = usePathname();

  // Determine active screen from pathname if not provided
  const getActiveScreen = (): 'home' | 'camera' | 'profile' => {
    if (activeScreen) return activeScreen;
    if (pathname?.includes('/home')) return 'home';
    if (pathname?.includes('/profile')) return 'profile';
    if (pathname?.includes('/ai-mirror') || pathname?.includes('/camera')) return 'camera';
    return 'home';
  };

  const currentActive = getActiveScreen();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/(tabs)/home')}
      >
        {currentActive === 'home' ? (
          <View style={styles.navIconActive}>
            <Image
              source={require('@/assets/icons/home.png')}
              style={styles.navIconImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <Image
            source={require('@/assets/icons/home.png')}
            style={styles.navIconImageInactive}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => {
          // Camera screen is hidden, can be enabled later
          router.push('/(tabs)/ai-mirror');
        }}
      >
        <Sparkles
          size={28}
          color="#000"
          style={{ opacity: currentActive === 'camera' ? 1 : 0.3 }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/(tabs)/profile')}
      >
        {currentActive === 'profile' ? (
          <View style={styles.navIconActive}>
            <Image
              source={require('@/assets/icons/profile.png')}
              style={styles.navIconImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <Image
            source={require('@/assets/icons/profile.png')}
            style={styles.navIconImageInactive}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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

