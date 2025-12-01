import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    Bell,
    Calendar,
    CheckCheck,
    ChevronLeft,
    Gift,
    Scissors,
    Star,
    Trash2,
    TrendingUp,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Poppins } from '@/constants/theme';

interface Notification {
  id: number;
  type: 'booking' | 'promo' | 'reminder' | 'update' | 'favorite';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: any;
}

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'booking',
      title: 'Appointment Confirmed',
      message: 'Your haircut appointment is confirmed for tomorrow at 3:00 PM with John Barber.',
      time: '2 hours ago',
      isRead: false,
      icon: Calendar,
    },
    {
      id: 2,
      type: 'promo',
      title: '20% Off Special',
      message: 'Get 20% off on your next haircut! Valid until end of month. Book now!',
      time: '5 hours ago',
      isRead: false,
      icon: Gift,
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Time for a Trim?',
      message: 'It\'s been 3 weeks since your last haircut. Schedule your next appointment today!',
      time: '1 day ago',
      isRead: true,
      icon: Scissors,
    },
    {
      id: 4,
      type: 'update',
      title: 'New Hairstyles Added',
      message: '10 new trending hairstyles have been added to our collection. Check them out!',
      time: '2 days ago',
      isRead: true,
      icon: TrendingUp,
    },
    {
      id: 5,
      type: 'favorite',
      title: 'Favorite Barber Available',
      message: 'Your favorite barber Mike has slots available this weekend. Book early!',
      time: '2 days ago',
      isRead: false,
      icon: Star,
    },
    {
      id: 6,
      type: 'booking',
      title: 'Appointment Reminder',
      message: 'Don\'t forget your appointment tomorrow at 10:00 AM. See you there!',
      time: '3 days ago',
      isRead: true,
      icon: Calendar,
    },
    {
      id: 7,
      type: 'promo',
      title: 'Loyalty Rewards',
      message: 'You\'ve earned 50 points! Redeem them for discounts on your next visit.',
      time: '4 days ago',
      isRead: true,
      icon: Gift,
    },
    {
      id: 8,
      type: 'update',
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      time: '5 days ago',
      isRead: true,
      icon: CheckCheck,
    },
  ]);

  const getIconComponent = (notification: Notification) => {
    return notification.icon;
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking':
        return '#0084FF';
      case 'promo':
        return '#FF6B35';
      case 'reminder':
        return '#FFB800';
      case 'update':
        return '#00D9B5';
      case 'favorite':
        return '#FF3B9A';
      default:
        return '#0084FF';
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a2a" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color="#fff" size={36} strokeWidth={1.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={handleMarkAllRead}
          >
            <CheckCheck color="#0084FF" size={24} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
            onPress={() => setActiveTab('unread')}
          >
            <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell color="rgba(255, 255, 255, 0.3)" size={60} />
              <Text style={styles.emptyStateTitle}>No Notifications</Text>
              <Text style={styles.emptyStateText}>
                {activeTab === 'unread'
                  ? 'You\'re all caught up! No unread notifications.'
                  : 'You don\'t have any notifications yet.'}
              </Text>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {filteredNotifications.map((notification) => {
                const IconComponent = getIconComponent(notification);
                const iconColor = getIconColor(notification.type);
                
                return (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      !notification.isRead && styles.unreadCard,
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.notificationContent}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: `${iconColor}20` },
                        ]}
                      >
                        <IconComponent color={iconColor} size={24} />
                      </View>
                      
                      <View style={styles.textContainer}>
                        <View style={styles.titleRow}>
                          <Text style={styles.notificationTitle}>
                            {notification.title}
                          </Text>
                          {!notification.isRead && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>{notification.time}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteNotification(notification.id)}
                    >
                      <Trash2 color="rgba(255, 255, 255, 0.4)" size={18} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
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
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Poppins.SemiBold,
    color: '#fff',
  },
  badge: {
    backgroundColor: '#FF3B9A',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Poppins.Bold,
    color: '#fff',
  },
  markAllButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#575D69',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#000059',
    shadowColor: '#000059',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    borderColor: '#575D69',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: Poppins.Medium,
    color: '#DFDFDF',
  },
  activeTabText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  notificationsList: {
    paddingHorizontal: 20,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadCard: {
    backgroundColor: 'rgba(0, 132, 255, 0.08)',
    borderColor: 'rgba(0, 132, 255, 0.2)',
  },
  notificationContent: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontFamily: Poppins.SemiBold,
    color: '#fff',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0084FF',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    fontFamily: Poppins.Regular,
    color: '#D9D9D9',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    fontFamily: Poppins.Regular,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: Poppins.SemiBold,
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: Poppins.Regular,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});