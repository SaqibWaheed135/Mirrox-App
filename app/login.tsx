import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Poppins } from '@/constants/theme';
import { authService } from '@/services/auth.service';

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login fields 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // if (!email || !password) {
    //   Alert.alert('Error', 'Please enter email and password.');
    //   return;
    // }

    router.replace('/(tabs)');

    // try {
    //   setLoading(true);
    //   await authService.login({
    //     email: email.trim(),
    //     password,
    //   });
    //   router.replace('/(tabs)/home');
    // } catch (err: any) {
    //   console.error('Login error:', err);
      
    //   let errorMessage = 'Invalid credentials. Please try again.';
      
    //   if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    //     errorMessage = 'Request timed out. Please check your internet connection and try again.';
    //   } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
    //     errorMessage = 'Network error. Please check your internet connection.';
    //   } else if (err.response?.data?.message) {
    //     errorMessage = err.response.data.message;
    //   } else if (err.message) {
    //     errorMessage = err.message;
    //   }
      
    //   Alert.alert('Login Failed', errorMessage);
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleSignup = async () => {
    if (!firstName || !lastName || !signupEmail || !signupPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (signupPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await authService.signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
      });
      router.replace('/(tabs)/home');
    } catch (err: any) {
      console.error('Signup error:', err);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    activeTab === 'login' ? handleLogin() : handleSignup();
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Coming Soon', 'Google Sign-In will be available soon!');
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
          {/* Logo & Tagline */}
          <View style={styles.logoSection}>
            <Image
              source={require('@/assets/images/main-logo.png')}
              style={styles.mainLogo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>REFLECT THE FUTURE OF STYLE</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>
            {activeTab === 'login' ? 'Welcome Back!' : 'Create Your Account'}
          </Text>

          {/* === SIGN UP FIELDS === */}
          {activeTab === 'signup' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  placeholderTextColor="#777"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Doe"
                  placeholderTextColor="#777"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </>
          )}

          {/* === COMMON FIELDS === */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#777"
              value={activeTab === 'login' ? email : signupEmail}
              onChangeText={activeTab === 'login' ? setEmail : setSignupEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#777"
              value={activeTab === 'login' ? password : signupPassword}
              onChangeText={activeTab === 'login' ? setPassword : setSignupPassword}
              secureTextEntry
            />
          </View>

          {/* Login Only: Remember Me + Forgot */}
          {activeTab === 'login' && (
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>
                {activeTab === 'login' ? 'Login' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <View style={styles.googleIcon}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 70,
    paddingBottom: 50,
  },
  logoSection: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  mainLogo: { 
    width: 140, 
    height: 140 
  },
  tagline: {
    fontSize: 12,
    color: '#ddd',
    marginTop: 8,
    letterSpacing: 1.5,
    fontFamily: Poppins.Light,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    padding: 5,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 26,
  },
  activeTab: { 
    backgroundColor: '#fff' 
  },
  tabText: { 
    fontSize: 16, 
    color: '#ccc', 
    fontFamily: Poppins.Medium,
  },
  activeTabText: { 
    color: '#0A0A2A', 
    fontFamily: Poppins.SemiBold,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: Poppins.SemiBold,
  },
  inputContainer: { 
    marginBottom: 18 
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  rememberMeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1C1C84',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { 
    backgroundColor: '#1C1C84' 
  },
  checkmark: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  rememberMeText: { 
    color: '#ddd',
    fontFamily: Poppins.Regular,
  },
  forgotPassword: { 
    color: '#8B9BFF', 
    fontFamily: Poppins.Medium,
  },
  loginButton: {
    backgroundColor: '#1C1C84',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 25,
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
  },
  dividerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 20 
  },
  divider: { 
    flex: 1, 
    height: 1, 
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },
  dividerText: { 
    color: '#999', 
    marginHorizontal: 15, 
    fontFamily: Poppins.Medium,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  googleIconText: { 
    color: '#fff', 
    fontSize: 18, 
    fontFamily: Poppins.Bold,
  },
  googleButtonText: { 
    color: '#333', 
    fontSize: 16, 
    fontFamily: Poppins.Medium,
  },
});

