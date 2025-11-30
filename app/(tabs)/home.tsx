import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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

import { BottomNav } from '@/components/navigation/bottom-nav';
import { Poppins } from '@/constants/theme';

interface HaircutItem {
  id: number;
  name: string;
  image: any;
  description: string;
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'HairCuts' | 'HairStyles' | 'Saved Looks'>('HairCuts');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample haircut data using local images from assets
  const haircuts: HaircutItem[] = [
    {
      id: 1,
      name: 'Low fade',
      image: require('@/assets/images/fade.png'),
      description: 'Tapered fade starting just above ears. Smooth gradient blend. Visible skin reflection near bottom. Clean, subtle contour.',
    },
    {
      id: 2,
      name: 'Mid fade',
      image: require('@/assets/images/fade.png'),
      description: 'Balanced fade at temple level. Professional gradient blend. Modern versatile style.',
    },
    {
      id: 3,
      name: 'High fade',
      image: require('@/assets/images/fade.png'),
      description: 'Bold fade starting high on sides. Sharp contrast. Contemporary edge.',
    },
    {
      id: 4,
      name: 'Drop fade',
      image: require('@/assets/images/fade.png'),
      description: 'Curved fade following head contour. Artistic gradient. Unique flowing style.',
    },
    {
      id: 5,
      name: 'Taper fade',
      image: require('@/assets/images/taper-fade.png'),
      description: 'Gradual length reduction. Classic refined look. Timeless professional style.',
    },
    {
      id: 6,
      name: 'Burst fade',
      image: require('@/assets/images/fade.png'),
      description: 'Semi-circular fade around ears. Dynamic burst pattern. Bold statement style.',
    },
  ];

  // HairStyles data
  const hairStyles: HaircutItem[] = [
    {
      id: 7,
      name: 'Pompadour',
      image: require('@/assets/images/haircut.png'),
      description: 'Classic vintage style with volume on top. Swept back elegantly.',
    },
    {
      id: 8,
      name: 'Quiff',
      image: require('@/assets/images/haircut.png'),
      description: 'Modern textured style with height and volume. Versatile and trendy.',
    },
    {
      id: 9,
      name: 'Slick Back',
      image: require('@/assets/images/haircut.png'),
      description: 'Sophisticated look with hair combed back. Professional and polished.',
    },
    {
      id: 10,
      name: 'Side Part',
      image: require('@/assets/images/haircut.png'),
      description: 'Timeless classic with defined parting. Clean and professional.',
    },
    {
      id: 11,
      name: 'Textured Crop',
      image: require('@/assets/images/crop.png'),
      description: 'Modern short style with texture. Low maintenance and stylish.',
    },
    {
      id: 12,
      name: 'Messy Fringe',
      image: require('@/assets/images/haircut.png'),
      description: 'Casual textured look with forward fringe. Youthful and relaxed.',
    },
    {
      id: 13,
      name: 'Undercut',
      image: require('@/assets/images/haircut.png'),
      description: 'Bold style with shaved sides and longer top. Edgy and contemporary.',
    },
    {
      id: 14,
      name: 'Man Bun',
      image: require('@/assets/images/long.png'),
      description: 'Long hair tied up in a bun. Trendy and practical.',
    },
    {
      id: 15,
      name: 'Buzz Cut',
      image: require('@/assets/images/buzz.png'),
      description: 'Ultra-short all-over cut. Minimal maintenance and clean.',
    },
    {
      id: 16,
      name: 'Crew Cut',
      image: require('@/assets/images/crop.png'),
      description: 'Short military-inspired style. Classic and practical.',
    },
  ];

  // Saved Looks data
  const savedLooks: HaircutItem[] = [
    {
      id: 17,
      name: 'My Favorite',
      image: require('@/assets/images/haircut.png'),
      description: 'Your saved favorite hairstyle.',
    },
    {
      id: 18,
      name: 'Summer Look',
      image: require('@/assets/images/haircut.png'),
      description: 'Perfect style for summer season.',
    },
    {
      id: 19,
      name: 'Office Style',
      image: require('@/assets/images/haircut.png'),
      description: 'Professional look for work.',
    },
    {
      id: 20,
      name: 'Weekend Vibe',
      image: require('@/assets/images/haircut.png'),
      description: 'Casual style for weekends.',
    },
  ];

  // Get current data based on active tab
  const getCurrentData = (): HaircutItem[] => {
    switch (activeTab) {
      case 'HairCuts':
        return haircuts;
      case 'HairStyles':
        return hairStyles;
      case 'Saved Looks':
        return savedLooks;
      default:
        return haircuts;
    }
  };

  const currentData = getCurrentData();

  const handleHaircutPress = (haircut: HaircutItem) => {
    router.push({
      pathname: '/haircut-details',
      params: {
        id: haircut.id.toString(),
        name: haircut.name,
        description: haircut.description,
      },
    });
  };

  const filteredData = searchQuery
    ? currentData.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentData;

  return (
    <LinearGradient
      colors={['#1A1A4A', '#0A0A1A', '#000000']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1A1A4A" />
      <SafeAreaView edges={['top']} />

      {/* Fixed Header Section */}
      <View style={styles.fixedHeader}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Hi Nour!</Text>
          <Text style={styles.welcomeSubtitle}>Find The Perfect Cut</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Your Haircut"
              placeholderTextColor="#878787"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation with Horizontal Scroll */}
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'HairCuts' && styles.activeTab]}
              onPress={() => setActiveTab('HairCuts')}
            >
              <Text style={[styles.tabText, activeTab === 'HairCuts' && styles.activeTabText]}>
                HairCuts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'HairStyles' && styles.activeTab]}
              onPress={() => setActiveTab('HairStyles')}
            >
              <Text style={[styles.tabText, activeTab === 'HairStyles' && styles.activeTabText]}>
                HairStyles
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Saved Looks' && styles.activeTab]}
              onPress={() => setActiveTab('Saved Looks')}
            >
              <Text style={[styles.tabText, activeTab === 'Saved Looks' && styles.activeTabText]}>
                Saved Looks
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Scrollable Grid Section */}
      <ScrollView
        style={styles.gridScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.haircutsGrid}>
          {filteredData.map((haircut) => (
            <TouchableOpacity
              key={haircut.id}
              style={styles.haircutCard}
              onPress={() => handleHaircutPress(haircut)}
              activeOpacity={0.8}
            >
              <View style={styles.haircutImageContainer}>
                <Image
                  source={haircut.image}
                  style={styles.haircutImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.haircutLabelContainer}>
                <Text style={styles.haircutLabel}>{haircut.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeScreen="home" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    paddingTop: 10,
  },
  welcomeSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  welcomeTitle: {
    fontSize: 46,
    color: '#fff',
    fontFamily: Poppins.Bold,
    lineHeight: 58,
    paddingTop: 10,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#F9F9F9',
    fontFamily: Poppins.Light,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    height: 40,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
    overflow: 'hidden',
    marginBottom: 25,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 4,
    color: '#000',
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#878787',
    fontFamily: Poppins.Light,
  },
  searchButton: {
    backgroundColor: '#000059',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1C1C84',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    width: 86,
    height: 30,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Poppins.Regular,
  },
  tabScrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    borderRadius: 10,
    backgroundColor: '#575D69',
    width: 133,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#000059',
    shadowColor: '#000059',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    borderColor: '#575D69',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    color: '#DFDFDF',
    fontFamily: Poppins.Medium,
  },
  activeTabText: {
    color: '#D9D9D9',
    fontFamily: Poppins.Medium,
  },
  gridScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  haircutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    gap: 10,
    justifyContent: 'space-between',
  },
  haircutCard: {
    width: '31%',
    marginBottom: 15,
  },
  haircutImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#575D69',
  },
  haircutImage: {
    width: '100%',
    height: '100%',
  },
  haircutLabelContainer: {
    marginTop: 5,
    backgroundColor: '#1C1C84',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  haircutLabel: {
    fontSize: 10,
    fontFamily: Poppins.SemiBold,
    color: '#fff',
    lineHeight: 13,
  },
});

