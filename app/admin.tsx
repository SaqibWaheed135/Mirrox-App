import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/navigation/bottom-nav';
import { Poppins } from '@/constants/theme';
import { AuthService } from '@/lib/auth';
import { apiService } from '@/services/api.service';
import { authService } from '@/services/auth.service';
import { ChevronLeft, LogOut } from 'lucide-react-native';

interface AdminStats {
  users: {
    total: number;
    customers: number;
    barbers: number;
    admins: number;
    recent: number;
  };
  haircuts: {
    total: number;
    active: number;
  };
}

// Skeleton Loader Component
const SkeletonLoader = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonContainer}>
      {/* Stats Cards Skeleton */}
      <View style={styles.statsSection}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        
        {/* First Stats Card */}
        <Animated.View style={[styles.skeletonStatsCard, { opacity }]}>
          <View style={styles.skeletonCardTitle} />
          <View style={styles.skeletonStatsRow}>
            <View style={styles.skeletonStatItem}>
              <View style={styles.skeletonStatValue} />
              <View style={styles.skeletonStatLabel} />
            </View>
            <View style={styles.skeletonStatItem}>
              <View style={styles.skeletonStatValue} />
              <View style={styles.skeletonStatLabel} />
            </View>
          </View>
          <View style={styles.skeletonStatsRow}>
            <View style={styles.skeletonStatItem}>
              <View style={styles.skeletonStatValue} />
              <View style={styles.skeletonStatLabel} />
            </View>
            <View style={styles.skeletonStatItem}>
              <View style={styles.skeletonStatValue} />
              <View style={styles.skeletonStatLabel} />
            </View>
          </View>
          <View style={[styles.skeletonStatsRow, { justifyContent: 'center' }]}>
            <View style={styles.skeletonStatItem}>
              <View style={styles.skeletonStatValue} />
              <View style={styles.skeletonStatLabel} />
            </View>
          </View>
        </Animated.View>

        {/* Second Stats Card */}
        <Animated.View style={[styles.skeletonStatsCard, { opacity }]}>
          <View style={styles.skeletonCardTitle} />
          <View style={styles.skeletonStatsRow}>
            <View style={styles.skeletonStatItem}>
              <View style={styles.skeletonStatValue} />
              <View style={styles.skeletonStatLabel} />
            </View>
            <View style={styles.skeletonStatItem}>
              <View style={styles.skeletonStatValue} />
              <View style={styles.skeletonStatLabel} />
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Management Cards Skeleton */}
      <View style={styles.managementSection}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        
        <Animated.View style={[styles.skeletonManagementCard, { opacity }]}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonManagementText}>
            <View style={styles.skeletonManagementTitle} />
            <View style={styles.skeletonManagementSubtitle} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.skeletonManagementCard, { opacity }]}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonManagementText}>
            <View style={styles.skeletonManagementTitle} />
            <View style={styles.skeletonManagementSubtitle} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

// Custom Snackbar Component
const Snackbar = ({ 
  visible, 
  message, 
  type = 'error', 
  onHide 
}: { 
  visible: boolean; 
  message: string; 
  type?: 'error' | 'success' | 'info'; 
  onHide: () => void;
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.delay(3000),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  if (!visible) return null;

  const backgroundColor = 
    type === 'error' ? '#FF4444' : 
    type === 'success' ? '#00C851' : 
    '#33B5E5';

  return (
    <Animated.View
      style={[
        styles.snackbar,
        { backgroundColor, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.snackbarText}>{message}</Text>
    </Animated.View>
  );
};

export default function AdminScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'error' as 'error' | 'success' | 'info',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  const showSnackbar = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setSnackbar({ visible: true, message, type });
  };

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  const loadData = async () => {
    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      if (!isAuthenticated) {
        showSnackbar('Not authenticated. Please login.', 'error');
        setTimeout(() => router.replace('/login'), 1500);
        return;
      }

      const response = await apiService.get<{ success: boolean; stats: AdminStats }>('/api/admin/stats');

      if (response.success) {
        setStats(response.stats);
        // Fade in animation when data loads
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } else {
        throw new Error('Failed to load stats');
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        showSnackbar('Access Denied: Admin privileges required', 'error');
        setTimeout(() => router.back(), 2000);
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        showSnackbar('Network error. Please check your connection.', 'error');
      } else {
        showSnackbar('Failed to load admin data. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      showSnackbar('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showSnackbar('Logout failed. Please try again.', 'error');
    }
  };

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1A1A4A" />
      
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={hideSnackbar}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color="#fff" size={36} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={22} color="#d32f2f" strokeWidth={2.5}/>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <SkeletonLoader />
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Stats Section */}
              {stats && (
                <View style={styles.statsSection}>
                  <Text style={styles.sectionTitle}>Dashboard Stats</Text>

                  {/* User Stats */}
                  <LinearGradient
                    colors={['#1C1C84', '#4B4BC2']}
                    style={styles.statsCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.statsCardTitle}>Users</Text>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.users.total}</Text>
                        <Text style={styles.statLabel}>Total Users</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.users.customers}</Text>
                        <Text style={styles.statLabel}>Customers</Text>
                      </View>
                    </View>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.users.barbers}</Text>
                        <Text style={styles.statLabel}>Barbers</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.users.admins}</Text>
                        <Text style={styles.statLabel}>Admins</Text>
                      </View>
                    </View>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.users.recent}</Text>
                        <Text style={styles.statLabel}>New (7 days)</Text>
                      </View>
                    </View>
                  </LinearGradient>

                  {/* Haircut Stats */}
                  <LinearGradient
                    colors={['#4B4BC2', '#1C1C84']}
                    style={styles.statsCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.statsCardTitle}>Haircuts</Text>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.haircuts.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.haircuts.active}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* Management Section */}
              <View style={styles.managementSection}>
                <Text style={styles.sectionTitle}>Management</Text>

                <TouchableOpacity
                  style={[styles.managementCard, styles.cardShadow]}
                  onPress={() => router.push('/user-management')}
                >
                  <Text style={styles.managementCardIcon}>👥</Text>
                  <View style={styles.managementCardText}>
                    <Text style={styles.managementCardTitle}>User Management</Text>
                    <Text style={styles.managementCardSubtitle}>
                      View, edit, and manage users
                    </Text>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.managementCard, styles.cardShadow]}
                  onPress={() => router.push('/haircut-management')}
                >
                  <Text style={styles.managementCardIcon}>✂️</Text>
                  <View style={styles.managementCardText}>
                    <Text style={styles.managementCardTitle}>Haircut Management</Text>
                    <Text style={styles.managementCardSubtitle}>
                      Manage hairstyle data
                    </Text>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSpacing} />
            </Animated.View>
          )}
        </ScrollView>

        <BottomNav isAdmin={true}/>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 15 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'flex-start' 
  },
  headerTitle: { 
    fontSize: 24, 
    color: '#fff', 
    fontFamily: Poppins.Bold, 
    flex: 1, 
    textAlign: 'center' 
  },
  logoutButton: { 
    flexDirection:'row', 
    alignItems:'center',
    gap:4 
  },
  logoutText: { 
    color: '#d32f2f', 
    fontSize: 14, 
    fontFamily: Poppins.Medium 
  },
  scrollView: { flex: 1 },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 100 
  },
  statsSection: { 
    marginTop: 10, 
    marginBottom: 30 
  },
  sectionTitle: { 
    fontSize: 20, 
    color: '#fff', 
    fontFamily: Poppins.SemiBold, 
    marginBottom: 15 
  },
  statsCard: { 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#1C1C84', 
    shadowColor: '#000', 
    shadowOpacity: 0.4, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 5 } 
  },
  statsCardTitle: { 
    fontSize: 18, 
    color: '#fff', 
    fontFamily: Poppins.SemiBold, 
    marginBottom: 15 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 10 
  },
  statItem: { 
    alignItems: 'center', 
    flex: 1 
  },
  statValue: { 
    fontSize: 34, 
    color: '#FFD700', 
    fontFamily: Poppins.Bold, 
    marginBottom: 5 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#ddd', 
    fontFamily: Poppins.Regular 
  },
  managementSection: { 
    marginTop: 10 
  },
  managementCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 20, 
    marginBottom: 15, 
    borderWidth: 1.5, 
    borderColor: '#1C1C84', 
    padding: 20 
  },
  managementCardIcon: { 
    fontSize: 36, 
    marginRight: 15 
  },
  managementCardText: { 
    flex: 1 
  },
  managementCardTitle: { 
    fontSize: 18, 
    color: '#fff', 
    fontFamily: Poppins.SemiBold, 
    marginBottom: 5 
  },
  managementCardSubtitle: { 
    fontSize: 14, 
    color: '#aaa', 
    fontFamily: Poppins.Regular 
  },
  arrowIcon: { 
    fontSize: 24, 
    color: '#1C1C84', 
    fontFamily: Poppins.Light 
  },
  bottomSpacing: { 
    height: 20 
  },
  cardShadow: { 
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 5 }, 
    elevation: 6 
  },
  snackbar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  snackbarText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Poppins.Medium,
    textAlign: 'center',
  },
  // Skeleton Styles
  skeletonContainer: {
    flex: 1,
  },
  skeletonTitle: {
    width: 180,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 15,
  },
  skeletonStatsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1C1C84',
  },
  skeletonCardTitle: {
    width: 100,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    marginBottom: 15,
  },
  skeletonStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  skeletonStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  skeletonStatValue: {
    width: 60,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonStatLabel: {
    width: 80,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  skeletonManagementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#1C1C84',
    padding: 20,
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    marginRight: 15,
  },
  skeletonManagementText: {
    flex: 1,
  },
  skeletonManagementTitle: {
    width: 150,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonManagementSubtitle: {
    width: 180,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
});