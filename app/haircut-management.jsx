import { BottomNav } from '@/components/navigation/bottom-nav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
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

const HaircutManagementScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [haircuts, setHaircuts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedHaircut, setSelectedHaircut] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        image: '',
        category: 'other',
        tags: '',
    });
    const [token, setToken] = useState(null);

    useEffect(() => {
        loadHaircuts();
    }, [page, searchQuery, categoryFilter]);

    const loadHaircuts = async () => {
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
                ...(categoryFilter && { category: categoryFilter }),
            };

            const response = await axios.get(`${API_URL}/admin/haircuts`, {
                params,
                headers: {
                    Authorization: `Bearer ${storedToken}`,
                },
            });

            if (response.data.success) {
                setHaircuts(response.data.haircuts);
                setTotalPages(response.data.pages);
            }
        } catch (error) {
            console.error('Error loading haircuts:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                Alert.alert('Access Denied', 'You do not have admin privileges');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to load haircuts');
            }
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Permission to access gallery is required!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 4],
                quality: 0.7,
                base64: true,
            });

            if (!result.cancelled) {
                setForm({ ...form, image: result.uri });
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const handleEdit = (haircut) => {
        setSelectedHaircut(haircut);
        setForm({
            name: haircut.name || '',
            description: haircut.description || '',
            image: haircut.image || '',
            category: haircut.category || 'other',
            tags: haircut.tags?.join(', ') || '',
        });
        setEditModalVisible(true);
    };

    const handleCreate = () => {
        setSelectedHaircut(null);
        setForm({
            name: '',
            description: '',
            image: '',
            category: 'other',
            tags: '',
        });
        setCreateModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...form,
                tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
            };

            if (selectedHaircut) {
                const response = await axios.put(
                    `${API_URL}/admin/haircuts/${selectedHaircut._id}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    Alert.alert('Success', 'Haircut updated successfully');
                    setEditModalVisible(false);
                    loadHaircuts();
                }
            } else {
                const response = await axios.post(
                    `${API_URL}/admin/haircuts`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    Alert.alert('Success', 'Haircut created successfully');
                    setCreateModalVisible(false);
                    loadHaircuts();
                }
            }
        } catch (error) {
            console.error('Error saving haircut:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to save haircut'
            );
        }
    };

    const handleDelete = (haircut) => {
        Alert.alert(
            'Delete Haircut',
            `Are you sure you want to delete ${haircut.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await axios.delete(
                                `${API_URL}/admin/haircuts/${haircut._id}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            if (response.data.success) {
                                Alert.alert('Success', 'Haircut deleted successfully');
                                loadHaircuts();
                            }
                        } catch (error) {
                            console.error('Error deleting haircut:', error);
                            Alert.alert(
                                'Error',
                                error.response?.data?.message || 'Failed to delete haircut'
                            );
                        }
                    },
                },
            ]
        );
    };

   if (loading && haircuts.length === 0) {
  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1A1A4A" />
      <SafeAreaView style={styles.safeArea} />

      {/* Header Skeleton */}
      <View style={styles.header}>
        <View style={styles.backButton}>
          <View style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18 }} />
        </View>
        <View style={styles.skeletonHeaderTitle} />
        <View style={styles.addButton}>
          <View style={{ width: 40, height: 40, backgroundColor: '#1C1C84', borderRadius: 20 }} />
        </View>
      </View>

      {/* Search & Filter Skeleton */}
      <View style={styles.searchContainer}>
        <View style={styles.skeletonInput} />
        <View style={styles.filterContainer}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.skeletonFilterButton} />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Skeleton Haircut Cards */}
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.haircutCard}>
            <View style={styles.haircutInfo}>
              {/* Name */}
              <View style={styles.skeletonLineLong} />
              {/* Description */}
              <View style={styles.skeletonLineMedium} />
              <View style={[styles.skeletonLineMedium, { width: '70%' }]} />

              {/* Meta: Category + Tags */}
              <View style={styles.haircutMeta}>
                <View style={styles.skeletonCategoryBadge} />
                <View style={styles.skeletonLineShort} />
              </View>
            </View>

            <View style={styles.haircutActions}>
              <View style={styles.skeletonButton} />
              <View style={styles.skeletonButton} />
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BottomNav activeScreen="haircut" />
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
                <Text style={styles.headerTitle}>Haircut Management</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
                    <Plus size={24} color="#fff" strokeWidth={2.5} />
                </TouchableOpacity>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search haircuts..."
                    placeholderTextColor="#777"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            categoryFilter === '' && styles.filterButtonActive,
                        ]}
                        onPress={() => setCategoryFilter('')}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                categoryFilter === '' && styles.filterButtonTextActive,
                            ]}
                        >
                            All
                        </Text>
                    </TouchableOpacity>
                    {['short', 'medium', 'long', 'fade', 'taper', 'buzz', 'crop'].map(
                        (category) => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.filterButton,
                                    categoryFilter === category && styles.filterButtonActive,
                                ]}
                                onPress={() => setCategoryFilter(category)}
                            >
                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        categoryFilter === category && styles.filterButtonTextActive,
                                    ]}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {haircuts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No haircuts found</Text>
                    </View>
                ) : (
                    haircuts.map((haircut) => (
                        <View key={haircut._id} style={styles.haircutCard}>
                            <View style={styles.haircutInfo}>
                                <Text style={styles.haircutName}>{haircut.name}</Text>
                                {haircut.description && (
                                    <Text style={styles.haircutDescription} numberOfLines={2}>
                                        {haircut.description}
                                    </Text>
                                )}
                                <View style={styles.haircutMeta}>
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryText}>{haircut.category}</Text>
                                    </View>
                                    {haircut.tags && haircut.tags.length > 0 && (
                                        <Text style={styles.tagsText}>
                                            Tags: {haircut.tags.join(', ')}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <View style={styles.haircutActions}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => handleEdit(haircut)}
                                >
                                    <Text style={styles.editButtonText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(haircut)}
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
                            style={[
                                styles.paginationButton,
                                page === 1 && styles.paginationButtonDisabled,
                            ]}
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
            <BottomNav activeScreen="haircut" />

            {/* Edit/Create Modal */}
            <Modal
                visible={editModalVisible || createModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setEditModalVisible(false);
                    setCreateModalVisible(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView
                        contentContainerStyle={styles.modalScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {selectedHaircut ? 'Edit Haircut' : 'Create Haircut'}
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Haircut name"
                                    placeholderTextColor="#777"
                                    value={form.name}
                                    onChangeText={(text) => setForm({ ...form, name: text })}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Description"
                                    placeholderTextColor="#777"
                                    value={form.description}
                                    onChangeText={(text) =>
                                        setForm({ ...form, description: text })
                                    }
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Haircut Image *</Text>
                                {form.image ? (
                                    <TouchableOpacity onPress={pickImage}>
                                        <Image
                                            source={{ uri: form.image }}
                                            style={{ width: 150, height: 150, borderRadius: 15, marginBottom: 10 }}
                                        />
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.pickImageButton}
                                        onPress={pickImage}
                                    >
                                        <Text style={styles.pickImageButtonText}>Pick from Gallery</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Category</Text>
                                <View style={styles.categorySelector}>
                                    {[
                                        'short',
                                        'medium',
                                        'long',
                                        'fade',
                                        'taper',
                                        'buzz',
                                        'crop',
                                        'other',
                                    ].map((category) => (
                                        <TouchableOpacity
                                            key={category}
                                            style={[
                                                styles.categoryOption,
                                                form.category === category && styles.categoryOptionActive,
                                            ]}
                                            onPress={() => setForm({ ...form, category })}
                                        >
                                            <Text
                                                style={[
                                                    styles.categoryOptionText,
                                                    form.category === category &&
                                                    styles.categoryOptionTextActive,
                                                ]}
                                            >
                                                {category}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Tags (comma separated)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="tag1, tag2, tag3"
                                    placeholderTextColor="#777"
                                    value={form.tags}
                                    onChangeText={(text) => setForm({ ...form, tags: text })}
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setEditModalVisible(false);
                                        setCreateModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </LinearGradient>
    );
};

// [Keep all the existing styles - they remain the same]
const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 0 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 10, fontFamily: 'Poppins-Regular' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    backIcon: { fontSize: 36, color: '#fff', fontWeight: '300', fontFamily: 'Poppins-Light' },
    headerTitle: { fontSize: 24, color: '#fff', fontFamily: 'Poppins-Bold', flex: 1, textAlign: 'center' },
    addButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1C1C84', borderRadius: 20 },
    addButtonText: { fontSize: 24, color: '#fff', fontFamily: 'Poppins-Light' },
    searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
    searchInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: '#1C1C84', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, fontSize: 15, color: '#fff', fontFamily: 'Poppins-Regular', marginBottom: 15 },
    filterContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    filterButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#1C1C84' },
    filterButtonActive: { backgroundColor: '#1C1C84' },
    filterButtonText: { color: '#ccc', fontSize: 12, fontFamily: 'Poppins-Medium', textTransform: 'capitalize' },
    filterButtonTextActive: { color: '#fff' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
    emptyText: { color: '#aaa', fontSize: 16, fontFamily: 'Poppins-Regular' },
    haircutCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1.5, borderColor: '#1C1C84' },
    haircutInfo: { marginBottom: 15 },
    haircutName: { fontSize: 18, color: '#fff', fontFamily: 'Poppins-SemiBold', marginBottom: 5 },
    haircutDescription: { fontSize: 14, color: '#ddd', fontFamily: 'Poppins-Regular', marginBottom: 10 },
    haircutMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
    categoryBadge: { backgroundColor: '#1C1C84', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    categoryText: { color: '#fff', fontSize: 12, fontFamily: 'Poppins-Medium', textTransform: 'capitalize' },
    tagsText: { fontSize: 12, color: '#aaa', fontFamily: 'Poppins-Regular' },
    haircutActions: { flexDirection: 'row', gap: 10 },
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
    modalScrollContent: { paddingVertical: 20 },
    modalContent: { backgroundColor: '#1A1A4A', borderRadius: 25, padding: 25, width: '90%', maxWidth: 400, borderWidth: 1.5, borderColor: '#1C1C84' },
    modalTitle: { fontSize: 24, color: '#fff', fontFamily: 'Poppins-Bold', marginBottom: 20, textAlign: 'center' },
    inputContainer: { marginBottom: 18 },
    label: { fontSize: 14, color: '#fff', marginBottom: 8, fontFamily: 'Poppins-Medium' },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: '#1C1C84', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 16, fontSize: 15, color: '#fff', fontFamily: 'Poppins-Regular' },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    categorySelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    categoryOption: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#1C1C84' },
    categoryOptionActive: { backgroundColor: '#1C1C84' },
    categoryOptionText: { color: '#ccc', fontSize: 12, fontFamily: 'Poppins-Medium', textTransform: 'capitalize' },
    categoryOptionTextActive: { color: '#fff' },
    modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
    cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
    cancelButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Medium' },
    saveButton: { flex: 1, paddingVertical: 14, borderRadius: 20, backgroundColor: '#1C1C84', alignItems: 'center' },
    saveButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Medium' },
    pickImageButton: { backgroundColor: '#1C1C84', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 15, alignItems: 'center' },
    pickImageButtonText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-Medium' },
      // Skeleton Loader Styles
  skeletonHeaderTitle: {
    width: 200,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
  },
  skeletonInput: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#1C1C84',
    marginBottom: 15,
  },
  skeletonFilterButton: {
    width: 75,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1C1C84',
  },
  skeletonLineLong: {
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 11,
    width: '85%',
    marginBottom: 10,
  },
  skeletonLineMedium: {
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 9,
    width: '70%',
    marginBottom: 8,
  },
  skeletonLineShort: {
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    width: '50%',
  },
  skeletonCategoryBadge: {
    width: 80,
    height: 28,
    backgroundColor: '#1C1C84',
    borderRadius: 14,
  },
  skeletonButton: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1C1C84',
  },
});

export default HaircutManagementScreen;