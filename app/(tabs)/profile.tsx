import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  Cog,
  Edit,
  FileText,
  Heart,
  Info,
  Mail,
  Settings,
  Sparkles,
  Tag
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/navigation/bottom-nav';
import { Poppins } from '@/constants/theme';
import { AuthService } from '@/lib/auth';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  role?: string;
  profileImage?: string | null;
}

const Snackbar = ({ visible, message, onDismiss }) => {
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.delay(2000),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.snackbar,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.snackbarText}>{message}</Text>
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load user data on initial mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Reload user data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userData = await AuthService.getUser();
      if (userData) {
        setUser(userData as User);
        setIsAdmin(userData.role === 'admin');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    showSnackbar('Logging out...');
    await AuthService.clearAuth();
    setTimeout(() => {
      router.replace('/login');
    }, 500);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const hideSnackbar = () => {
    setSnackbarVisible(false);
  };

  const menuItems = [
    { id: 1, Icon: Info, title: 'About', onPress: () => showSnackbar('About - Coming Soon!') },
    {
      id: 2,
      Icon: Settings,
      title: 'Settings',
      onPress: () => router.push('/settings')   // ← Real navigation!
    }, { id: 3, Icon: Tag, title: 'Promotions', onPress: () => showSnackbar('Promotions - Coming Soon!') },
    { id: 4, Icon: Bell, title: 'Notifications', onPress: () => router.push('/notifications') },
    { id: 5, Icon: Heart, title: 'Your Favorites', onPress: () => showSnackbar('Favorites - Coming Soon!') },
    { id: 6, Icon: FileText, title: 'Terms & Policies', onPress: () => router.push('/terms-policies') },
    { id: 7, Icon: Sparkles, title: 'Meta AI', onPress: () => showSnackbar('Meta AI - Coming Soon!') },
  ];

  const getUserName = () => {
    // Prioritize firstName + lastName
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    // Fall back to firstName only
    if (user?.firstName) {
      return user.firstName;
    }
    // Fall back to name field
    if (user?.name) {
      return user.name;
    }
    // Default
    return 'User';
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a2a" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        <Snackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          onDismiss={hideSnackbar}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color="#fff" size={36} strokeWidth={1.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Edit color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageInitials}>{getInitials()}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{getUserName()}</Text>
              {user?.phone && (
                <Text style={styles.profilePhone}>{user.phone}</Text>
              )}
              {user?.role && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Email Section */}
          <View style={styles.emailSection}>
            <Mail color="#fff" size={20} style={styles.emailIcon} />
            <Text style={styles.emailText}>{user?.email || 'user@example.com'}</Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => {
              const IconComponent = item.Icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <IconComponent color="#fff" size={24} style={styles.menuIcon} />
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </TouchableOpacity>
              );
            })}
            {isAdmin && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/admin')}
              >
                <Cog color="#FFD700" size={24} style={styles.menuIcon} />
                <Text style={[styles.menuTitle, styles.adminTitle]}>Admin Panel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Account Actions */}
          <View style={styles.accountActions}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => showSnackbar('Switch Account - Coming Soon!')}
            >
              <Text style={styles.actionText}>Switch account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => showSnackbar('Add Account - Coming Soon!')}
            >
              <Text style={styles.actionText}>Add account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleLogout}
            >
              <Text style={styles.actionTextLogout}>Log out</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav activeScreen="profile" />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
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
  profileImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1C1C84',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInitials: {
    fontSize: 32,
    fontFamily: Poppins.Bold,
    color: '#fff',
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
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: 'rgba(28, 28, 132, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1C1C84',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleText: {
    fontSize: 11,
    fontFamily: Poppins.SemiBold,
    color: '#8B9BFF',
    letterSpacing: 0.5,
  },
  emailSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 35,
  },
  emailIcon: {
    marginRight: 12,
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
    marginRight: 18,
  },
  menuTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: Poppins.Regular,
  },
  adminTitle: {
    color: '#FFD700',
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
    color: '#FF4444',
    fontFamily: Poppins.SemiBold,
  },
  bottomSpacing: {
    height: 100,
  },
  snackbar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#323232',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  snackbarText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Poppins.Regular,
    textAlign: 'center',
  },
});