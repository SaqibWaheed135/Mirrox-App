// app/about.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, ExternalLink, Globe, Heart, Mail, Shield, Zap } from 'lucide-react-native';
import React from 'react';
import {
    Linking,
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

export default function AboutScreen() {
  const appVersion = '1.4.2';
  const year = new Date().getFullYear();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const InfoRow = ({ icon: Icon, label, value, onPress, isLink = false }) => (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.infoLeft}>
        <View style={styles.iconWrapper}>
          <Icon color="#8B9BFF" size={22} />
        </View>
        <View>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
      {isLink && <ExternalLink color="#666" size={18} />}
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>About mirrox</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* App Logo & Name */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <Text style={styles.logoText}>M</Text>
              </View>
            </View>
            <Text style={styles.appName}>mirrox</Text>
            <Text style={styles.tagline}>See Yourself Differently</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>Version {appVersion}</Text>
            </View>
          </View>

          {/* About Text */}
          <View style={styles.section}>
            <Text style={styles.aboutText}>
              mirrox is your personal AR try-on companion. Discover jewelry, glasses, 
              hairstyles, and makeup in real-time with cutting-edge augmented reality — 
              all from the comfort of your phone.
            </Text>
            <Text style={styles.aboutText}>
              Built with passion for the future of shopping and self-expression.
            </Text>
          </View>

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connect With Us</Text>
            
            <InfoRow
              icon={Mail}
              label="Email"
              value="hello@mirrox.app"
              onPress={() => openLink('mailto:hello@mirrox.app')}
              isLink
            />
            <InfoRow
              icon={Globe}
              label="Website"
              value="www.mirrox.app"
              onPress={() => openLink('https://www.mirrox.app')}
              isLink
            />
            <InfoRow
              icon={Heart}
              label="Rate mirrox"
              value="Leave us a review"
              onPress={() => openLink('https://apps.apple.com/app/...')} // Replace with real link
              isLink
            />
          </View>

          {/* Legal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            
            <InfoRow
              icon={Shield}
              label="Privacy Policy"
              value="How we protect your data"
              onPress={() => router.push('/terms-policies')}
              isLink
            />
            <InfoRow
              icon={Zap}
              label="Terms of Service"
              value="Our agreement with you"
              onPress={() => router.push('/terms-policies')}
              isLink
            />
          </View>

          {/* Made With Love */}
          <View style={styles.footer}>
            <Text style={styles.madeWith}>Made with</Text>
            <Heart color="#FF6B6B" fill="#FF6B6B" size={18} style={{ marginHorizontal: 6 }} />
            <Text style={styles.madeWith}>in the Future</Text>
          </View>

          <Text style={styles.copyright}>
            © {year} mirrox. All rights reserved.
          </Text>

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
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 26,
    fontFamily: Poppins.Bold,
    color: '#fff',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1C1C84',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#8B9BFF',
    shadowColor: '#8B9BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0F0F3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 42,
    fontFamily: Poppins.Bold,
    color: '#8B9BFF',
  },
  appName: {
    fontSize: 36,
    fontFamily: Poppins.ExtraBold,
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    fontFamily: Poppins.Light,
    color: '#8B9BFF',
    marginTop: 8,
  },
  versionBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#1C1C84',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  versionText: {
    fontSize: 13,
    fontFamily: Poppins.Medium,
    color: '#8B9BFF',
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
  aboutText: {
    fontSize: 15,
    fontFamily: Poppins.Regular,
    color: '#ccc',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  infoLeft: {
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
  infoLabel: {
    fontSize: 14,
    fontFamily: Poppins.Medium,
    color: '#999',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: Poppins.Medium,
    color: '#fff',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  madeWith: {
    fontSize: 15,
    fontFamily: Poppins.Italic,
    color: '#aaa',
  },
  copyright: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    fontFamily: Poppins.Light,
    color: '#666',
  },
});