import { BottomNav } from '@/components/navigation/bottom-nav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'https://mirrox-dev.vercel.app/api'; // Change in production

const UserManagementScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
  });
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [page, searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        Alert.alert('Error', 'Not authenticated');
        navigation.replace('LoginScreen');
        return;
      }
      setToken(storedToken);

      const params = {
        page,
        limit: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter && { role: roleFilter }),
      };

      const response = await axios.get(`${API_URL}/admin/users`, {
        params,
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pages);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        Alert.alert('Access Denied', 'You do not have admin privileges');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const response = await axios.put(
        `${API_URL}/admin/users/${selectedUser._id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'User updated successfully');
        setEditModalVisible(false);
        loadUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update user'
      );
    }
  };

  const handleDelete = (user) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${API_URL}/admin/users/${user._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.data.success) {
                Alert.alert('Success', 'User deleted successfully');
                loadUsers();
              }
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to delete user'
              );
            }
          },
        },
      ]
    );
  };

  if (loading && users.length === 0) {
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
        <TouchableOpacity style={styles.backButton}>
          <ChevronLeft size={36} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search and Filter Skeleton */}
      <View style={styles.searchContainer}>
        <View style={styles.skeletonInput} />
        <View style={styles.filterContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonFilterButton} />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Skeleton User Cards */}
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.skeletonLineLong} />
              <View style={styles.skeletonLineMedium} />
              <View style={styles.skeletonLineShort} />
              <View style={styles.skeletonRoleBadge} />
            </View>
            <View style={styles.userActions}>
              <View style={styles.skeletonButton} />
              <View style={styles.skeletonButton} />
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BottomNav activeScreen="users" />
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
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={36} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              roleFilter === '' && styles.filterButtonActive,
            ]}
            onPress={() => setRoleFilter('')}
          >
            <Text
              style={[
                styles.filterButtonText,
                roleFilter === '' && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              roleFilter === 'customer' && styles.filterButtonActive,
            ]}
            onPress={() => setRoleFilter('customer')}
          >
            <Text
              style={[
                styles.filterButtonText,
                roleFilter === 'customer' && styles.filterButtonTextActive,
              ]}
            >
              Customers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              roleFilter === 'barber' && styles.filterButtonActive,
            ]}
            onPress={() => setRoleFilter('barber')}
          >
            <Text
              style={[
                styles.filterButtonText,
                roleFilter === 'barber' && styles.filterButtonTextActive,
              ]}
            >
              Barbers
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : (
          users.map((user) => (
            <View key={user._id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.phone && (
                  <Text style={styles.userPhone}>{user.phone}</Text>
                )}
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{user.role}</Text>
                </View>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(user)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(user)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
              onPress={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <Text style={styles.paginationButtonText}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.paginationText}>
              Page {page} of {totalPages}
            </Text>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                page === totalPages && styles.paginationButtonDisabled,
              ]}
              onPress={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <Text style={styles.paginationButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeScreen="users" />

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#777"
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#777"
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor="#777"
                value={editForm.phone}
                onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleSelector}>
                {['customer', 'barber', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleOption,
                      editForm.role === role && styles.roleOptionActive,
                    ]}
                    onPress={() => setEditForm({ ...editForm, role })}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        editForm.role === role && styles.roleOptionTextActive,
                      ]}
                    >
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

// [Keep all existing styles - they remain the same]
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 0 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontFamily: 'Poppins-Regular' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  backIcon: { fontSize: 36, color: '#fff', fontWeight: '300', fontFamily: 'Poppins-Light' },
  headerTitle: { fontSize: 24, color: '#fff', fontFamily: 'Poppins-Bold', flex: 1, textAlign: 'center' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: '#1C1C84', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, fontSize: 15, color: '#fff', fontFamily: 'Poppins-Regular', marginBottom: 15 },
  filterContainer: { flexDirection: 'row', gap: 10 },
  filterButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#1C1C84' },
  filterButtonActive: { backgroundColor: '#1C1C84' },
  filterButtonText: { color: '#ccc', fontSize: 12, fontFamily: 'Poppins-Medium' },
  filterButtonTextActive: { color: '#fff' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { color: '#aaa', fontSize: 16, fontFamily: 'Poppins-Regular' },
  userCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1.5, borderColor: '#1C1C84' },
  userInfo: { marginBottom: 15 },
  userName: { fontSize: 18, color: '#fff', fontFamily: 'Poppins-SemiBold', marginBottom: 5 },
  userEmail: { fontSize: 14, color: '#ddd', fontFamily: 'Poppins-Regular', marginBottom: 3 },
  userPhone: { fontSize: 14, color: '#aaa', fontFamily: 'Poppins-Regular', marginBottom: 10 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#1C1C84', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { color: '#fff', fontSize: 12, fontFamily: 'Poppins-Medium', textTransform: 'capitalize' },
  userActions: { flexDirection: 'row', gap: 10 },
  editButton: { flex: 1, backgroundColor: '#1C1C84', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  editButtonText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-Medium' },
  deleteButton: { flex: 1, backgroundColor: 'rgba(255, 0, 0, 0.2)', borderWidth: 1, borderColor: '#ff4444', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  deleteButtonText: { color: '#ff4444', fontSize: 14, fontFamily: 'Poppins-Medium' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingHorizontal: 10 },
  paginationButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1C1C84', borderRadius: 20 },
  paginationButtonDisabled: { opacity: 0.5 },
  paginationButtonText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-Medium' },
  paginationText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-Regular' },
  bottomSpacing: { height: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1A1A4A', borderRadius: 25, padding: 25, width: '90%', maxWidth: 400, borderWidth: 1.5, borderColor: '#1C1C84' },
  modalTitle: { fontSize: 24, color: '#fff', fontFamily: 'Poppins-Bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { marginBottom: 18 },
  label: { fontSize: 14, color: '#fff', marginBottom: 8, fontFamily: 'Poppins-Medium' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: '#1C1C84', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 16, fontSize: 15, color: '#fff', fontFamily: 'Poppins-Regular' },
  roleSelector: { flexDirection: 'row', gap: 10 },
  roleOption: { flex: 1, paddingVertical: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#1C1C84', alignItems: 'center' },
  roleOptionActive: { backgroundColor: '#1C1C84' },
  roleOptionText: { color: '#ccc', fontSize: 14, fontFamily: 'Poppins-Medium', textTransform: 'capitalize' },
  roleOptionTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Medium' },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 20, backgroundColor: '#1C1C84', alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Medium' },
    // Skeleton Loader Styles
  skeletonInput: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#1C1C84',
    marginBottom: 15,
  },
  skeletonFilterButton: {
    width: 80,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1C1C84',
  },
  skeletonLineLong: {
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    width: '80%',
    marginBottom: 10,
  },
  skeletonLineMedium: {
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    width: '65%',
    marginBottom: 8,
  },
  skeletonLineShort: {
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    width: '50%',
    marginBottom: 15,
  },
  skeletonRoleBadge: {
    width: 70,
    height: 28,
    backgroundColor: '#1C1C84',
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  skeletonButton: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1C1C84',
  },
});

export default UserManagementScreen;