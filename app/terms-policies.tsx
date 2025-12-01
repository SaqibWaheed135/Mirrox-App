import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    ChevronLeft,
    Cookie,
    FileText,
    Lock,
    Shield,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Poppins } from '@/constants/theme';

export default function TermsPoliciesScreen() {
  const [activeSection, setActiveSection] = useState<'terms' | 'privacy' | 'cookies'>('terms');

  const sections = [
    { id: 'terms', label: 'Terms of Service', Icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', Icon: Shield },
    { id: 'cookies', label: 'Cookie Policy', Icon: Cookie },
  ];

  const termsContent = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
    },
    {
      title: '2. Use License',
      content:
        'Permission is granted to temporarily download one copy of the materials on our application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.',
    },
    {
      title: '3. User Account',
      content:
        'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.',
    },
    {
      title: '4. Service Modifications',
      content:
        'We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. You agree that we shall not be liable to you or to any third party for any modification, suspension or discontinuance of the service.',
    },
    {
      title: '5. User Conduct',
      content:
        'You agree not to use the service to: upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.',
    },
    {
      title: '6. Intellectual Property',
      content:
        'All content included on this application, such as text, graphics, logos, images, and software, is the property of our company or its content suppliers and protected by international copyright laws.',
    },
    {
      title: '7. Limitation of Liability',
      content:
        'In no event shall our company or its suppliers be liable for any damages arising out of the use or inability to use the materials on our application, even if authorized representative has been notified.',
    },
    {
      title: '8. Governing Law',
      content:
        'These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.',
    },
  ];

  const privacyContent = [
    {
      title: '1. Information We Collect',
      content:
        'We collect information you provide directly to us, including your name, email address, phone number, and profile information. We also collect information about your use of our services.',
    },
    {
      title: '2. How We Use Your Information',
      content:
        'We use the information we collect to provide, maintain, and improve our services, to develop new services, and to protect our company and our users.',
    },
    {
      title: '3. Information Sharing',
      content:
        'We do not share personal information with companies, organizations, or individuals outside of our company except in limited circumstances outlined in this policy.',
    },
    {
      title: '4. Data Security',
      content:
        'We work hard to protect our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold using encryption and other security measures.',
    },
    {
      title: '5. Data Retention',
      content:
        'We retain collected information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.',
    },
    {
      title: '6. Your Rights',
      content:
        'You have the right to access, update, or delete your personal information at any time. You can also object to processing of your personal information and request data portability.',
    },
    {
      title: '7. Children\'s Privacy',
      content:
        'Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.',
    },
    {
      title: '8. Changes to Privacy Policy',
      content:
        'We may change this privacy policy from time to time. We will post any privacy policy changes on this page and, if the changes are significant, we will provide a more prominent notice.',
    },
  ];

  const cookiesContent = [
    {
      title: '1. What Are Cookies',
      content:
        'Cookies are small text files that are placed on your device when you visit our application. They help us provide you with a better experience by remembering your preferences and settings.',
    },
    {
      title: '2. Types of Cookies We Use',
      content:
        'We use essential cookies for basic functionality, performance cookies to analyze usage, and functionality cookies to remember your preferences and settings.',
    },
    {
      title: '3. Third-Party Cookies',
      content:
        'We may use third-party services that use cookies for analytics, advertising, and other purposes. These third parties have their own privacy policies.',
    },
    {
      title: '4. Managing Cookies',
      content:
        'You can control and manage cookies in various ways. Most browsers allow you to refuse to accept cookies and to delete cookies. Please note that if you choose to block cookies, you may not be able to use the full functionality of our application.',
    },
    {
      title: '5. Cookie Consent',
      content:
        'By using our application, you consent to the use of cookies in accordance with this cookie policy. If you do not agree to our use of cookies, you should disable them or refrain from using our application.',
    },
  ];

  const getContent = () => {
    switch (activeSection) {
      case 'terms':
        return termsContent;
      case 'privacy':
        return privacyContent;
      case 'cookies':
        return cookiesContent;
      default:
        return termsContent;
    }
  };

  const currentContent = getContent();

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
          <Text style={styles.headerTitle}>Terms & Policies</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Section Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
          style={styles.tabScrollView}
        >
          {sections.map((section) => {
            const IconComponent = section.Icon;
            return (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.sectionTab,
                  activeSection === section.id && styles.activeSectionTab,
                ]}
                onPress={() => setActiveSection(section.id as any)}
              >
                <IconComponent
                  color={activeSection === section.id ? '#fff' : '#DFDFDF'}
                  size={20}
                  style={styles.tabIcon}
                />
                <Text
                  style={[
                    styles.sectionTabText,
                    activeSection === section.id && styles.activeSectionTabText,
                  ]}
                >
                  {section.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.contentContainer}>
            {/* Last Updated */}
            <Text style={styles.lastUpdated}>Last updated: December 1, 2024</Text>

            {/* Content Sections */}
            {currentContent.map((item, index) => (
              <View key={index} style={styles.contentSection}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                <Text style={styles.sectionContent}>{item.content}</Text>
              </View>
            ))}

            {/* Contact Section */}
            <View style={styles.contactSection}>
              <Lock color="#0084FF" size={24} style={styles.contactIcon} />
              <Text style={styles.contactTitle}>Questions or Concerns?</Text>
              <Text style={styles.contactText}>
                If you have any questions about our {activeSection === 'terms' ? 'Terms of Service' : activeSection === 'privacy' ? 'Privacy Policy' : 'Cookie Policy'}, please contact us at:
              </Text>
              <Text style={styles.contactEmail}>support@haircut.app</Text>
            </View>

            <View style={styles.bottomSpacing} />
          </View>
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
  headerTitle: {
    fontSize: 20,
    fontFamily: Poppins.SemiBold,
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  tabScrollView: {
    maxHeight: 60,
  },
  tabScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#575D69',
    gap: 8,
  },
  activeSectionTab: {
    backgroundColor: '#000059',
    shadowColor: '#000059',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    borderColor: '#575D69',
    borderWidth: 1,
  },
  tabIcon: {
    marginRight: 4,
  },
  sectionTabText: {
    fontSize: 13,
    fontFamily: Poppins.Medium,
    color: '#DFDFDF',
  },
  activeSectionTabText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: Poppins.Regular,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  contentSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Poppins.SemiBold,
    color: '#fff',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: Poppins.Regular,
    color: '#D9D9D9',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: 'rgba(0, 132, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 132, 255, 0.3)',
    alignItems: 'center',
  },
  contactIcon: {
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: Poppins.SemiBold,
    color: '#fff',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 13,
    fontFamily: Poppins.Regular,
    color: '#D9D9D9',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  contactEmail: {
    fontSize: 14,
    fontFamily: Poppins.SemiBold,
    color: '#0084FF',
  },
  bottomSpacing: {
    height: 40,
  },
});