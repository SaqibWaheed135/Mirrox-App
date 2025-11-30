import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function GalleryScreen() {
  const colorScheme = useColorScheme();
  const [assets, setAssets] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionResponse, requestMediaPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    loadMediaAssets();
  }, []);

  const loadMediaAssets = async () => {
    try {
      if (!permissionResponse?.granted) {
        await requestMediaPermission();
      }

      if (permissionResponse?.granted) {
        // Load videos from the ObjectDetectionRecordings album
        const albums = await MediaLibrary.getAlbumsAsync();
        const recordingsAlbum = albums.find(
          (album) => album.title === 'ObjectDetectionRecordings'
        );

        if (recordingsAlbum) {
          const mediaAssets = await MediaLibrary.getAssetsAsync({
            album: recordingsAlbum,
            mediaType: MediaLibrary.MediaType.video,
            sortBy: MediaLibrary.SortBy.creationTime,
            first: 50,
          });
          setAssets(mediaAssets.assets);
        } else {
          // If album doesn't exist yet, show empty state
          setAssets([]);
        }
      }
    } catch (error) {
      console.error('Error loading media assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: MediaLibrary.Asset }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailContainer,
        { backgroundColor: Colors[colorScheme ?? 'light'].background },
      ]}
      onPress={() => {
        // TODO: Navigate to video player screen
        console.log('Video selected:', item.uri);
      }}>
      <View style={styles.thumbnail}>
        <IconSymbol name="play.circle.fill" size={40} color="#fff" />
        <ThemedText style={styles.duration}>
          {formatDuration(item.duration)}
        </ThemedText>
      </View>
      <ThemedText style={styles.filename} numberOfLines={1}>
        {item.filename}
      </ThemedText>
      <ThemedText style={styles.date}>
        {new Date(item.creationTime * 1000).toLocaleDateString()}
      </ThemedText>
    </TouchableOpacity>
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText style={styles.loadingText}>Loading gallery...</ThemedText>
      </ThemedView>
    );
  }

  if (!permissionResponse?.granted) {
    return (
      <ThemedView style={styles.container}>
        <IconSymbol name="photo.fill" size={64} color={Colors[colorScheme ?? 'light'].icon} />
        <ThemedText type="title" style={styles.emptyTitle}>
          Permission Required
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          We need access to your media library to show your recordings.
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={requestMediaPermission}>
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (assets.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <IconSymbol name="photo.fill" size={64} color={Colors[colorScheme ?? 'light'].icon} />
        <ThemedText type="title" style={styles.emptyTitle}>
          No Recordings Yet
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Your recorded videos will appear here. Start recording from the Camera tab.
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={() => router.push('/(tabs)')}>
          <ThemedText style={styles.buttonText}>Go to Camera</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={assets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        refreshing={loading}
        onRefresh={loadMediaAssets}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  filename: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
