import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
import { AuthService } from '@/lib/auth';
import { authService } from '@/services/auth.service';

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

  React.useEffect(() => {
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'error' as 'error' | 'success' | 'info',
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showSnackbar = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setSnackbar({ visible: true, message, type });
  };

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength validation
  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
  };

  // Name validation
  const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
  };

  const handleLogin = async () => {
    // Input validation
    if (!email.trim() || !password) {
      shakeAnimation();
      showSnackbar('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      shakeAnimation();
      showSnackbar('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      shakeAnimation();
      showSnackbar('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await authService.login({
        email: email.trim().toLowerCase(),
        password,
      });

      showSnackbar('Login successful! Redirecting...', 'success');

      // Check user role and route accordingly
      setTimeout(async () => {
        const isAdmin = await AuthService.isAdmin();
        if (isAdmin) {
          router.replace('/(tabs)/admin');
        } else {
          router.replace('/(tabs)/home');
        }
      }, 1000);

    } catch (err: any) {
      console.error('Login error:', err);
      shakeAnimation();

      let errorMessage = 'Invalid credentials. Please try again.';

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection.';
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      showSnackbar(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    // Input validation
    if (!firstName.trim() || !lastName.trim() || !signupEmail.trim() || !signupPassword || !confirmPassword) {
      shakeAnimation();
      showSnackbar('Please fill in all fields');
      return;
    }

    // Name validation
    if (!validateName(firstName)) {
      shakeAnimation();
      showSnackbar('First name must be at least 2 letters and contain only letters');
      return;
    }

    if (!validateName(lastName)) {
      shakeAnimation();
      showSnackbar('Last name must be at least 2 letters and contain only letters');
      return;
    }

    // Email validation
    if (!validateEmail(signupEmail)) {
      shakeAnimation();
      showSnackbar('Please enter a valid email address');
      return;
    }

    // Password validation
    const passwordValidation = validatePassword(signupPassword);
    if (!passwordValidation.isValid) {
      shakeAnimation();
      showSnackbar(passwordValidation.message || 'Invalid password');
      return;
    }

    // Confirm password match
    if (signupPassword !== confirmPassword) {
      shakeAnimation();
      showSnackbar('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authService.signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
      });

      showSnackbar('Account created successfully!', 'success');

      // Check user role and route accordingly
      setTimeout(async () => {
        const isAdmin = await AuthService.isAdmin();
        if (isAdmin) {
          router.replace('/(tabs)/admin');
        } else {
          router.replace('/(tabs)/home');
        }
      }, 1000);

    } catch (err: any) {
      console.error('Signup error:', err);
      shakeAnimation();

      let errorMessage = 'Something went wrong. Please try again.';

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection.';
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Email already exists. Please login instead.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid input. Please check your details.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      showSnackbar(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    activeTab === 'login' ? handleLogin() : handleSignup();
  };

  const handleGoogleSignIn = () => {
    showSnackbar('Google Sign-In coming soon!', 'info');
  };

  const handleAdminLogin = () => {
    router.push('/admin-login');
  };

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={hideSnackbar}
      />

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
          <Animated.View 
            style={[
              styles.logoSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Image
              source={require('@/assets/images/main-logo.png')}
              style={styles.mainLogo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>REFLECT THE FUTURE OF STYLE</Text>
          </Animated.View>

          {/* Tabs */}
          <Animated.View 
            style={[
              styles.tabContainer,
              { opacity: fadeAnim }
            ]}
          >
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
          </Animated.View>

          <Animated.Text 
            style={[
              styles.title,
              { opacity: fadeAnim }
            ]}
          >
            {activeTab === 'login' ? 'Welcome Back!' : 'Create Your Account'}
          </Animated.Text>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
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
                autoCorrect={false}
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

            {/* Confirm Password for Signup */}
            {activeTab === 'signup' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#777"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            )}

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
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
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
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <View style={styles.googleIcon}>
              <Image
                source={require('@/assets/images/google-logo-icon.png')}
                style={styles.googleLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Admin Login Link */}
          <TouchableOpacity
            style={styles.adminLinkContainer}
            onPress={handleAdminLogin}
          >
            <Text style={styles.adminLinkText}>
              🔐 Admin Access
            </Text>
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
  loginButtonDisabled: {
    opacity: 0.7,
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
  adminLinkContainer: {
    marginTop: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  adminLinkText: {
    color: '#8B9BFF',
    fontSize: 14,
    fontFamily: Poppins.Medium,
    textDecorationLine: 'underline',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 10,
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleLogo: {
    width: 24,
    height: 24,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: Poppins.Medium,
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
});