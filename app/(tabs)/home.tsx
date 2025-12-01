import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import AsyncStorage from '@react-native-async-storage/async-storage';


interface HaircutItem {
  id: number;
  name: string;
  image: any;
  description: string;
}

// Add this SkeletonCard component inside your file (before the main component)
const SkeletonCard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.haircutCard}>
      <View style={[styles.haircutImageContainer, { backgroundColor: '#2A2A5A' }]}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(255,255,255,0.1)',
            transform: [{ translateX }],
          }}
        />
      </View>
      <View style={[styles.haircutLabelContainer, { backgroundColor: '#2A2A5A' }]}>
        <View style={{ width: 70, height: 10, backgroundColor: '#444', borderRadius: 5 }} />
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'HairCuts' | 'HairStyles' | 'Saved Looks'>('HairCuts');
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState(''); // 👈 NEW STATE
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadedCount = useRef(0);
  const totalImages = useRef(0);
  // Load User Data from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user'); // 👈 expects JSON with { firstName }
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserName(parsed.firstName || 'User');
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, []);

  // Reset & prefetch images when tab changes
  useEffect(() => {
    const currentData = getCurrentData();
    totalImages.current = currentData.length;
    loadedCount.current = 0;
    setImagesLoaded(false);

    // Prefetch all images in current tab
    const imageUris = currentData.map(item => Image.resolveAssetSource(item.image).uri);

    Promise.all(imageUris.map(uri => Image.prefetch(uri)))
      .then(() => {
        // Optional: extra safety
        setImagesLoaded(true);
      })
      .catch(() => setImagesLoaded(true));
  }, [activeTab]);

  const handleImageLoad = () => {
    loadedCount.current += 1;
    if (loadedCount.current >= totalImages.current) {
      setImagesLoaded(true);
    }
  };

  // Sample haircut data using local images from assets
  const haircuts: HaircutItem[] = [
    {
      id: 1,
      name: 'Low fade',
      image: require('@/assets/images/low-fade.png'),
      description: 'Tapered fade starting just above ears. Smooth gradient blend. Visible skin reflection near bottom. Clean, subtle contour.',
    },
    {
      id: 2,
      name: 'Mid fade',
      image: require('@/assets/images/mid-fade.png'),
      description: 'Balanced fade at temple level. Professional gradient blend. Modern versatile style.',
    },
    {
      id: 3,
      name: 'High fade',
      image: require('@/assets/images/high-fade.png'),
      description: 'Bold fade starting high on sides. Sharp contrast. Contemporary edge.',
    },
    {
      id: 4,
      name: 'Drop fade',
      image: require('@/assets/images/drop-fade.png'),
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
      image: require('@/assets/images/burst-fade.png'),
      description: 'Semi-circular fade around ears. Dynamic burst pattern. Bold statement style.',
    },
  ];

  // HairStyles data
  const hairStyles: HaircutItem[] = [
    {
      id: 7,
      name: 'Buzz Cut',
      image: require('@/assets/images/buzz-cut.png'),
      description: 'Ultra-short, uniform texture. Add scalp detail, slight stubble gradient. Micro surface variation for realistic light reflection',
    },
    {
      id: 8,
      name: 'Messy Fringe',
      image: require('@/assets/images/messy-fringe.png'),
      description: 'Medium top with natural irregular fringe. Randomize strand direction. Matte finish for natural texture.',
    },
    {
      id: 9,
      name: 'Crop Top',
      image: require('@/assets/images/crop-top.png'),
      description: 'Choppy, thick texture on top. Deep shadow clumps between strands. Slight unevenness for realism.',
    },
    {
      id: 10,
      name: 'Pompadour',
      image: require('@/assets/images/pompadaur.png'),
      description: 'Voluminous front swept back. Use strand layering with smooth curve. Add natural light reflection and fade blending.',
    },
    {
      id: 11,
      name: 'Modern Mullet',
      image: require('@/assets/images/modern-mullet.png'),
      description: 'Medium top, faded sides, long back. Flowy layered texture. Add bounce physics to simulate movement.',
    },
    {
      id: 12,
      name: 'Edgar Cut',
      image: require('@/assets/images/edgar-cut.png'),
      description: 'Straight blunt front line, high faded sides. Sharp geometry with dense front fringe. Matte coarse finish.',
    },
    {
      id: 13,
      name: 'Middle Part',
      image: require('@/assets/images/middle-part.png'),
      description: 'Clean center part with outward flow. Light root lift. Maintain natural symmetrical strands and soft highlight sheen.',
    },
    {
      id: 14,
      name: 'Messy Middle Part',
      image: require('@/assets/images/messy-middle-part.png'),
      description: 'Looser variation of middle part. Strands slightly crossing center. Light flyaways for imperfection.',
    },
    {
      id: 15,
      name: 'Slick Back',
      image: require('@/assets/images/slick-back.png'),
      description: 'Tightly combed backward. Include comb-line texture. Slight shine gradient. Optional “wet” variant toggle.',
    },
    {
      id: 16,
      name: 'Messy Slick Back',
      image: require('@/assets/images/messy-slick-back.png'),
      description: 'Textured and looser, with lift and flow. Random strand direction. Soft reflective surface with frizz detailing.',
    },

    {
      id: 17,
      name: 'Warrior Cut',
      image: require('@/assets/images/warrior-cut.png'),
      description: 'Long center strip or tied-back bun. Model tied strand geometry and scalp stretch detail. Light movement physics.',
    },

    {
      id: 18,
      name: 'Mod Cut',
      image: require('@/assets/images/mod-cut.png'),
      description: ' Rounded bowl-style fringe. Thick, low-shine hair texture. Visible layering with soft direction.',
    },

    {
      id: 19,
      name: 'Wolf Cut',
      image: require('@/assets/images/wolf-cut.png'),
      description: 'Long layered top with feathered ends. Variable strand thickness. Face-framing flow and random strand variation.',
    },


    {
      id: 20,
      name: 'Waves',
      image: require('@/assets/images/waves.png'),
      description: 'Ripple-textured curl pattern around scalp. Micro curl detail and reflective wave pattern. Smooth continuity of ridges.',
    },


    {
      id: 21,
      name: 'Cornrows',
      image: require('@/assets/images/cornrows.png'),
      description: 'Braided lines along scalp curvature. Sharp clean edges and visible scalp indentation. Alternating light bands for realism.',
    },

    {
      id: 22,
      name: 'Twists/Braids',
      image: require('@/assets/images/twists.png'),
      description: 'Rope-style twists with visible root separation and organic curve. Slightly varying thickness. Add highlight reflections and twist shine.',
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
        // Pass a unique identifier for the image (we'll use the name as key)
        imageKey: haircut.name.toLowerCase().replace(/\s+/g, '-'), // e.g., "low-fade", "mid-fade"
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        {/* Fixed Header Section */}
        <View style={styles.fixedHeader}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Hi {userName}!</Text>
            <Text style={styles.welcomeSubtitle}>Find The Perfect Cut</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Search size={14} color="#878787" strokeWidth={2} style={{ marginRight: 2 }} />
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
        {/* Grid with Skeleton */}
        <ScrollView style={styles.gridScrollView}>
          <View style={styles.haircutsGrid}>
            {!imagesLoaded ? (
              // Show 12 skeleton cards while loading
              Array(12).fill(0).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)
            ) : (
              filteredData.map((haircut) => (
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
                      onLoadEnd={handleImageLoad} // Track when each image finishes
                    />
                  </View>
                  <View style={styles.haircutLabelContainer}>
                    <Text style={styles.haircutLabel}>{haircut.name}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav activeScreen="home" />
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
  fixedHeader: {
    paddingTop: 10,
  },
  welcomeSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  welcomeTitle: {
    fontSize: 42,
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
    justifyContent: 'center',
    height: 45,
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
    height: 45,
    paddingVertical: 0,         // IMPORTANT: remove top/bottom padding
    textAlignVertical: 'center' // Android vertical alignment

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
    resizeMode: 'contain',
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  haircutImage: {
    width: '100%',
    height: '100%',
  },
  haircutLabelContainer: {
    marginTop: 5,
    backgroundColor: '#1C1C84',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,                     // optional – prevents super-narrow pills
  },
  haircutLabel: {
    fontSize: 10,
    fontFamily: Poppins.SemiBold,
    color: '#fff',
    lineHeight: 13,
    textAlign: 'center',             // ← THIS IS THE KEY LINE
  },
});