import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Poppins } from '@/constants/theme';
import { AuthService, User } from '@/utils/auth';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AuthService.getUser();
      if (userData) {
        setUser(userData);
        setIsAdmin((userData as any).role === 'admin');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    await AuthService.clearAuth();
    router.replace('/login');
  };

  const menuItems = [
    { 
      id: 1, 
      icon: require('@/assets/icons/info.png'), 
      title: 'About', 
      onPress: () => console.log('About') 
    },
    { 
      id: 2, 
      icon: require('@/assets/icons/settings.png'), 
      title: 'Settings', 
      onPress: () => console.log('Settings') 
    },
    { 
      id: 3, 
      icon: require('@/assets/icons/promotions.png'), 
      title: 'Promotions', 
      onPress: () => console.log('Promotions') 
    },
    { 
      id: 4, 
      icon: require('@/assets/icons/notifications.png'), 
      title: 'Notifications', 
      onPress: () => console.log('Notifications') 
    },
    { 
      id: 5, 
      icon: require('@/assets/icons/heart.png'), 
      title: 'Your Favorites', 
      onPress: () => console.log('Favorites') 
    },
    { 
      id: 6, 
      icon: require('@/assets/icons/document.png'), 
      title: 'Terms & Policies', 
      onPress: () => console.log('Terms') 
    },
    { 
      id: 7, 
      icon: require('@/assets/icons/meta.png'), 
      title: 'Meta AI', 
      onPress: () => console.log('Meta AI') 
    },
  ];

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if ((user as any)?.name) {
      return (user as any).name;
    }
    return 'User';
  };

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a2a" />
      <SafeAreaView />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity style={styles.editButton}>
          <Image
            source={require('@/assets/icons/edit.png')}
            style={styles.editIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={require('@/assets/images/profile.png')}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{getUserName()}</Text>
            {(user as any)?.phone && (
              <Text style={styles.profilePhone}>{(user as any).phone}</Text>
            )}
          </View>
        </View>

        {/* Email Section */}
        <View style={styles.emailSection}>
          <Image
            source={require('@/assets/icons/email.png')}
            style={styles.emailIcon}
            resizeMode="contain"
          />
          <Text style={styles.emailText}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Image
                source={item.icon}
                style={styles.menuIcon}
                resizeMode="contain"
              />
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
          {isAdmin && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => console.log('Admin Panel')}
            >
              <Text style={styles.adminIcon}>⚙️</Text>
              <Text style={[styles.menuTitle, styles.adminTitle]}>Admin Panel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Account Actions */}
        <View style={styles.accountActions}>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionText}>Add account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <Text style={styles.actionTextLogout}>Log out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Image
            source={require('@/assets/icons/home.png')}
            style={styles.navIconImageInactive}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Image
            source={require('@/assets/icons/ai.png')}
            style={styles.navIconImageInactive}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconActive}>
            <Image
              source={require('@/assets/icons/profile.png')}
              style={styles.navIconImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  editIconImage: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 25,
    marginTop: 10,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontFamily: Poppins.Bold,
    color: '#fff',
    marginBottom: 3,
  },
  profilePhone: {
    fontSize: 14,
    color: '#D9D9D9',
    fontFamily: Poppins.Regular,
  },
  emailSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 35,
  },
  emailIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#fff',
  },
  emailText: {
    fontSize: 14,
    color: '#D9D9D9',
    fontFamily: Poppins.Regular,
  },
  menuContainer: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 18,
    tintColor: '#fff',
  },
  adminIcon: {
    fontSize: 24,
    marginRight: 18,
  },
  menuTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Poppins.Regular,
  },
  adminTitle: {
    color: '#1C1C84',
    fontFamily: Poppins.SemiBold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 30,
    marginBottom: 20,
  },
  accountActions: {
    paddingHorizontal: 30,
    paddingTop: 5,
  },
  actionItem: {
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 15,
    color: '#D9D9D9',
    fontFamily: Poppins.Regular,
  },
  actionTextLogout: {
    fontSize: 15,
    color: '#0084FF',
    fontFamily: Poppins.Regular,
  },
  bottomSpacing: {
    height: 100,
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


