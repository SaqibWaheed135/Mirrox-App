import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/navigation/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: Platform.OS !== 'android',
        tabBarStyle: {
          display: 'none', // Hide default tab bar, using custom bottom nav
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 24} 
              name="house.fill" 
              color={color} 
            />
          ),
        }}
      />
      {/* Camera screen hidden for now */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Camera',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 24} 
              name="camera.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 28 : 24} 
              name="person.fill" 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
