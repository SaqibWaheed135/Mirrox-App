import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    Camera,
    ChevronLeft,
    Mail,
    MapPin,
    Phone,
    User,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Poppins } from '@/constants/theme';
import { AuthService } from '@/lib/auth';
import { profileService } from '@/services/profile.service';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  role?: string;
  profileImage?: string | null;
  address?: string;
}

const Snackbar = ({ visible, message, onDismiss }: { visible: boolean; message: string; onDismiss: () => void }) => {
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.delay(2000),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.snackbar,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.snackbarText}>{message}</Text>
    </Animated.View>
  );
};

export default function EditProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AuthService.getUser();
      if (userData) {
        setUser(userData as User);
        
        // Handle firstName/lastName from the login response
        if (userData.firstName && userData.lastName) {
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
        } else if (userData.name) {
          // If we only have 'name', split it
          const nameParts = userData.name.split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
        }
        
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        setAddress(userData.address || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      showSnackbar('Error loading profile data');
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const hideSnackbar = () => {
    setSnackbarVisible(false);
  };

  const handleSave = async () => {
    // Validate fields
    if (!firstName.trim() || !lastName.trim()) {
      showSnackbar('First name and last name are required');
      return;
    }

    if (!email.trim()) {
      showSnackbar('Email is required');
      return;
    }

    try {
      setLoading(true);
      
      // Combine firstName and lastName to create the name field
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      
      // Call the update profile API
      const response = await profileService.updateProfile({
        name: fullName,
        phone: phone.trim(),
        // Add other fields as needed (profileImage, faceScanData, etc.)
      });

      // Update local user data with the response
      const updatedUser = {
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        ...response.user, // Merge with server response
      };
      
      const token = await AuthService.getToken();
      if (token) {
        await AuthService.setAuth(token, updatedUser as any);
      }

      showSnackbar('Profile updated successfully!');
      
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = () => {
    showSnackbar('Change Photo - Coming Soon!');
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a2a" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Snackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          onDismiss={hideSnackbar}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color="#fff" size={36} strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageInitials}>{getInitials()}</Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={handleChangePhoto}
              >
                <Camera color="#fff" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <User color="#fff" size={20} style={styles.inputIcon} />
                <Text style={styles.labelText}>First Name</Text>
              </View>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                editable={!loading}
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <User color="#fff" size={20} style={styles.inputIcon} />
                <Text style={styles.labelText}>Last Name</Text>
              </View>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Mail color="#fff" size={20} style={styles.inputIcon} />
                <Text style={styles.labelText}>Email</Text>
              </View>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Phone color="#fff" size={20} style={styles.inputIcon} />
                <Text style={styles.labelText}>Phone Number</Text>
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MapPin color="#fff" size={20} style={styles.inputIcon} />
                <Text style={styles.labelText}>Address</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                multiline
                numberOfLines={3}
                editable={!loading}
              />
              <Text style={styles.helperText}>Address is not saved to server yet</Text>
            </View>
          </View>

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
  headerTitle: {
    fontSize: 20,
    fontFamily: Poppins.SemiBold,
    color: '#fff',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0084FF',
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: Poppins.SemiBold,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1C1C84',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImageInitials: {
    fontSize: 40,
    fontFamily: Poppins.Bold,
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A1A4A',
  },
  changePhotoText: {
    fontSize: 14,
    fontFamily: Poppins.Regular,
    color: '#0084FF',
  },
  formSection: {
    paddingHorizontal: 30,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  labelText: {
    fontSize: 14,
    fontFamily: Poppins.Medium,
    color: '#fff',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: Poppins.Regular,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  disabledInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.6,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: Poppins.Regular,
    marginTop: 6,
    marginLeft: 4,
  },
  bottomSpacing: {
    height: 40,
  },
  snackbar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#323232',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  snackbarText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Poppins.Regular,
    textAlign: 'center',
  },
});