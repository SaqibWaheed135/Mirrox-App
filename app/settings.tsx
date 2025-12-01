// app/settings.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  ChevronRight, // ← added for consistency
  Globe,
  Lock,
  LogOut,
  Mail,
  Moon,
  Palette,
  Save,
  Shield,
  Smartphone,
  Trash2,
  User,
  Volume2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/navigation/bottom-nav';
import { Poppins } from '@/constants/theme';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);

  // Reusable Setting Item (with navigation arrow)
  const SettingItem = ({ icon: Icon, title, subtitle, rightComponent, onPress }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconWrapper}>
          <Icon color="#8B9BFF" size={22} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.settingRight}>
        {rightComponent || (
          <ChevronRight color="#666" size={22} />
        )}
      </View>
    </TouchableOpacity>
  );

  // Toggle Setting (Switch on the right)
  const ToggleSetting = ({ icon: Icon, title, value, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconWrapper}>
          <Icon color="#8B9BFF" size={22} />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#333', true: '#1C1C84' }}
        thumbColor={value ? '#8B9BFF' : '#aaa'}
        ios_backgroundColor="#333"
      />
    </View>
  );

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1A1A4A" />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#fff" size={32} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Appearance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>

            <ToggleSetting
              icon={Moon}
              title="Dark Mode"
              value={darkMode}
              onToggle={setDarkMode}
            />

            <SettingItem
              icon={Palette}
              title="Theme Color"
              subtitle="Navy Blue"
              rightComponent={
                <View style={[styles.colorPreview, { backgroundColor: '#1C1C84' }]} />
              }
            />
          </View>

          {/* Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <SettingItem
              icon={User}
              title="Personal Information"
              onPress={() => router.push('/edit-profile')}
            />
            <SettingItem
              icon={Smartphone}
              title="Phone Number"
              subtitle="+1 (555) 123-4567"
            />
            <SettingItem icon={Lock} title="Change Password" />
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>

            <ToggleSetting
              icon={Bell}
              title="Push Notifications"
              value={pushNotifications}
              onToggle={setPushNotifications}
            />
            <ToggleSetting
              icon={Mail}
              title="Email Notifications"
              value={emailNotifications}
              onToggle={setEmailNotifications}
            />
            <ToggleSetting
              icon={Volume2}
              title="Sound"
              value={notifications}
              onToggle={setNotifications}
            />
          </View>

          {/* Privacy & Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Security</Text>

            <ToggleSetting
              icon={Shield}
              title="Face ID / Biometric Login"
              value={biometricAuth}
              onToggle={setBiometricAuth}
            />
            <ToggleSetting
              icon={Save}
              title="Save AR Try-On History"
              value={saveHistory}
              onToggle={setSaveHistory}
            />
            <SettingItem icon={Globe} title="Data & Storage" />
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#FF6B6B' }]}>Danger Zone</Text>

            <SettingItem
              icon={Trash2}
              title="Clear Cache"
              subtitle="12.4 MB"
              rightComponent={<Text style={styles.dangerActionText}>Clear</Text>}
            />

            <SettingItem
              icon={LogOut}
              title="Delete Account"
              rightComponent={<Text style={styles.dangerActionTextDelete}>Delete</Text>}
            />
          </View>

          {/* Bottom padding for BottomNav */}
          <View style={{ height: 100 }} />
        </ScrollView>

        <BottomNav activeScreen="profile" />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: Poppins.Bold,
    color: '#fff',
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Poppins.SemiBold,
    color: '#8B9BFF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    minHeight: 56,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: Poppins.Medium,
    color: '#fff',
    lineHeight: 22,
  },
  settingSubtitle: {
    fontSize: 13,
    fontFamily: Poppins.Regular,
    color: '#999',
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 16,
    minWidth: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  colorPreview: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#333',
  },
  dangerActionText: {
    color: '#FF6B6B',
    fontFamily: Poppins.Medium,
    fontSize: 15,
  },
  dangerActionTextDelete: {
    color: '#FF4444',
    fontFamily: Poppins.SemiBold,
    fontSize: 15,
  },
});