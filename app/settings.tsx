// app/settings.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    Bell,
    ChevronLeft,
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
    Volume2
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

  // Updated parts only

const SettingItem = ({ icon: Icon, title, subtitle, rightComponent, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingLeft}>
      <View style={styles.iconWrapper}>
        <Icon color="#8B9BFF" size={22} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.settingRight}>
      {rightComponent || <ChevronLeft color="#666" size={20} style={{ transform: [{ rotate: '180deg' }] }} />}
    </View>
  </TouchableOpacity>
);

const ToggleSetting = ({ icon: Icon, title, value, onToggle }) => (
  <View style={styles.settingItem}>
    <View style={styles.settingLeft}>
      <View style={styles.iconWrapper}>
        <Icon color="#8B9BFF" size={22} />
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
    </View>
    <View style={styles.settingRight}>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#444', true: '#1C1C84' }}
        thumbColor={value ? '#8B9BFF' : '#888'}
        ios_backgroundColor="#444"
      />
    </View>
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

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#fff" size={32} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} /> {/* Spacer */}
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
              rightComponent={<Text style={styles.clearText}>Clear</Text>}
            />
            <SettingItem
              icon={LogOut}
              title="Delete Account"
              rightComponent={<Text style={styles.deleteText}>Delete</Text>}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        <BottomNav activeScreen="profile" />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Poppins.Bold,
    color: '#fff',
  },
  scrollContent: {
    paddingTop: 10,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Poppins.SemiBold,
    color: '#8B9BFF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 15,
    marginLeft: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 18,
    flexShrink: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: Poppins.Medium,
    color: '#fff',
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: Poppins.Light,
    color: '#999',
    marginTop: 2,
  },
  settingRight: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  clearText: {
    color: '#FF6B6B',
    fontFamily: Poppins.Medium,
    fontSize: 14,
  },
  deleteText: {
    color: '#FF4444',
    fontFamily: Poppins.SemiBold,
    fontSize: 14,
  },
  iconWrapper: {
    width: 32, // fixed width for all icons
    alignItems: 'center',
  },
  
});