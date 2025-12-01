import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Poppins } from '@/constants/theme';
import { authService } from '@/services/auth.service';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please provide email and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      // Check if user has admin role
      const user = response?.user || response?.data?.user;
      
      if (user?.role !== 'admin') {
        await authService.logout();
        Alert.alert('Access Denied', 'You do not have admin privileges.');
        return;
      }

      // Navigate to admin panel
      router.replace('/admin');
    } catch (err: any) {
      console.error('Admin login error:', err);

      let errorMessage = 'Invalid credentials. Please try again.';

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your internet connection.';
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.response?.status === 403 || err.response?.status === 401) {
        errorMessage = 'Access denied. Admin credentials required.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          {/* Logo & Title */}
          <View style={styles.logoSection}>
            <View style={styles.adminBadge}>
              <Text style={styles.shieldIcon}>🛡️</Text>
            </View>
            <Text style={styles.adminTitle}>Admin Login</Text>
            <Text style={styles.adminSubtitle}>
              Secure access for administrators only
            </Text>
          </View>

          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              This area is restricted. Unauthorized access attempts are logged.
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Admin Email</Text>
              <TextInput
                style={styles.input}
                placeholder="admin@example.com"
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#777"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleAdminLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Access Admin Panel</Text>
                  <Text style={styles.lockIcon}>🔐</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Text style={styles.securityText}>
              🔒 This connection is secured with end-to-end encryption
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 50,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backIcon: {
    fontSize: 36,
    color: '#8B9BFF',
    fontWeight: '300',
    marginRight: 5,
  },
  backText: {
    color: '#8B9BFF',
    fontSize: 16,
    fontFamily: Poppins.Medium,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  adminBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(28, 28, 132, 0.2)',
    borderWidth: 3,
    borderColor: '#1C1C84',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  shieldIcon: {
    fontSize: 50,
  },
  adminTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: Poppins.Bold,
    marginBottom: 10,
  },
  adminSubtitle: {
    fontSize: 14,
    color: '#aaa',
    fontFamily: Poppins.Regular,
    textAlign: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    color: '#FFC107',
    fontSize: 13,
    fontFamily: Poppins.Medium,
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontFamily: Poppins.Medium,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor: '#1C1C84',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: '#fff',
    fontFamily: Poppins.Regular,
  },
  loginButton: {
    backgroundColor: '#1C1C84',
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Poppins.Bold,
    marginRight: 10,
  },
  lockIcon: {
    fontSize: 20,
  },
  securityNotice: {
    alignItems: 'center',
    paddingTop: 20,
  },
  securityText: {
    color: '#666',
    fontSize: 12,
    fontFamily: Poppins.Regular,
    textAlign: 'center',
  },
});