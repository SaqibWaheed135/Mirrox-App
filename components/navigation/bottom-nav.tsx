import { AuthService } from '@/lib/auth';
import { router, usePathname } from 'expo-router';
import { LayoutDashboard, Scissors, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BottomNavProps {
  activeScreen?: 'home' | 'haircut' | 'users' | 'camera' | 'profile';
}

export function BottomNav({ activeScreen }: BottomNavProps) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const adminStatus = await AuthService.isAdmin();
    setIsAdmin(adminStatus);
  };

  // Determine active screen
  const getActiveScreen = (): 'home' | 'haircut' | 'users' | 'camera' | 'profile' => {
    if (activeScreen) return activeScreen;
    if (pathname?.includes('/admin')) return 'home';
    if (pathname?.includes('/haircut-management')) return 'haircut';
    if (pathname?.includes('/user-management')) return 'users';
    if (pathname?.includes('/home')) return 'home';
    if (pathname?.includes('/ai-mirror')) return 'camera';
    if (pathname?.includes('/profile')) return 'profile';
    return 'home';
  };

  const currentActive = getActiveScreen();

  // Navigation handlers
  const handlePressHome = () => {
    if (isAdmin) router.push('/admin');
    else router.push('/(tabs)/home');
  };

  const handlePressMiddle = () => {
    if (isAdmin) router.push('/haircut-management');
    else router.push('/(tabs)/ai-mirror');
  };

  const handlePressRight = () => {
    if (isAdmin) router.push('/user-management');
    else router.push('/(tabs)/profile');
  };

  if (isAdmin) {
    // Admin Bottom Navigation with Lucide Icons
    return (
      <View style={styles.bottomNav}>
        {/* Admin Dashboard */}
        <TouchableOpacity style={styles.navItem} onPress={handlePressHome}>
          {currentActive === 'home' ? (
            <View style={styles.navIconActive}>
              <LayoutDashboard size={24} color="#fff" strokeWidth={2.5} />
            </View>
          ) : (
            <LayoutDashboard size={26} color="#000" strokeWidth={2} opacity={0.3} />
          )}
        </TouchableOpacity>

        {/* Haircut Management */}
        <TouchableOpacity style={styles.navItem} onPress={handlePressMiddle}>
          {currentActive === 'haircut' ? (
            <View style={styles.navIconActive}>
              <Scissors size={28} color="#fff" strokeWidth={2.5} />
            </View>
          ) : (
            <Scissors size={34} color="#000" strokeWidth={2} opacity={0.3} />
          )}
        </TouchableOpacity>

        {/* User Management */}
        <TouchableOpacity style={styles.navItem} onPress={handlePressRight}>
          {currentActive === 'users' ? (
            <View style={styles.navIconActive}>
              <Users size={24} color="#fff" strokeWidth={2.5} />
            </View>
          ) : (
            <Users size={26} color="#000" strokeWidth={2} opacity={0.3} />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Regular User Bottom Navigation with Image Icons
  return (
    <View style={styles.bottomNav}>
      {/* Home */}
      <TouchableOpacity style={styles.navItem} onPress={handlePressHome}>
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

      {/* AI Mirror */}
      <TouchableOpacity style={styles.navItem} onPress={handlePressMiddle}>
        <Image
          source={require('@/assets/icons/ai.png')}
          style={styles.navIconAICamera}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity style={styles.navItem} onPress={handlePressRight}>
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
  navIconAICamera: {
    width: 34,
    height: 34,
    tintColor: '#000',
    opacity: 0.3,
  },
});