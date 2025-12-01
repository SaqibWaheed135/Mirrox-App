import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { apiService } from '@/services/api.service';
import { authService } from '@/services/auth.service';

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

export default function AdminScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const isAuthenticated = await AuthService.isAuthenticated();
      if (!isAuthenticated) {
        Alert.alert('Error', 'Not authenticated');
        router.replace('/login');
        return;
      }

      const response = await apiService.get<{ success: boolean; stats: AdminStats }>('/api/admin/stats');

      if (response.success) {
        setStats(response.stats);
      } else {
        throw new Error('Failed to load stats');
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert('Access Denied', 'You do not have admin privileges');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#1A1A4A', '#0A0A1A', '#000000']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1C1C84" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1A1A4A" />
      <SafeAreaView style={styles.safeArea} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        {stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Dashboard Statistics</Text>

            {/* User Stats */}
            <View style={styles.statsCard}>
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
            </View>

            {/* Haircut Stats */}
            <View style={styles.statsCard}>
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
            </View>
          </View>
        )}

        {/* Management Section */}
        <View style={styles.managementSection}>
          <Text style={styles.sectionTitle}>Management</Text>

          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => {
              router.push('/user-management'); // Instead of Alert

              // Navigate to user management (to be implemented)
            }}
          >
            <View style={styles.managementCardContent}>
              <Text style={styles.managementCardIcon}>👥</Text>
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>User Management</Text>
                <Text style={styles.managementCardSubtitle}>
                  View, edit, and manage users
                </Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.managementCard}
            onPress={() => {
              // Navigate to haircut management (to be implemented)
              router.push('/haircut-management'); // Instead of Alert
            }}
          >
            <View style={styles.managementCardContent}>
              <Text style={styles.managementCardIcon}>✂️</Text>
              <View style={styles.managementCardText}>
                <Text style={styles.managementCardTitle}>Haircut Management</Text>
                <Text style={styles.managementCardSubtitle}>
                  Manage hairstyle data
                </Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
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
  safeArea: {
    flex: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontFamily: Poppins.Regular,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
    fontFamily: Poppins.Light,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: Poppins.Bold,
    flex: 1,
    textAlign: 'center',
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#8B9BFF',
    fontSize: 14,
    fontFamily: Poppins.Medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: Poppins.SemiBold,
    marginBottom: 15,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#1C1C84',
  },
  statsCardTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: Poppins.SemiBold,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    color: '#1C1C84',
    fontFamily: Poppins.Bold,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#ddd',
    fontFamily: Poppins.Regular,
  },
  managementSection: {
    marginTop: 10,
  },
  managementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#1C1C84',
    overflow: 'hidden',
  },
  managementCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  managementCardIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  managementCardText: {
    flex: 1,
  },
  managementCardTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: Poppins.SemiBold,
    marginBottom: 5,
  },
  managementCardSubtitle: {
    fontSize: 14,
    color: '#aaa',
    fontFamily: Poppins.Regular,
  },
  arrowIcon: {
    fontSize: 24,
    color: '#1C1C84',
    fontFamily: Poppins.Light,
  },
  bottomSpacing: {
    height: 20,
  },
});

