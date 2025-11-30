import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Thin': require('@/assets/fonts/Poppins-Thin.ttf'),
    'Poppins-ThinItalic': require('@/assets/fonts/Poppins-ThinItalic.ttf'),
    'Poppins-ExtraLight': require('@/assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-ExtraLightItalic': require('@/assets/fonts/Poppins-ExtraLightItalic.ttf'),
    'Poppins-Light': require('@/assets/fonts/Poppins-Light.ttf'),
    'Poppins-LightItalic': require('@/assets/fonts/Poppins-LightItalic.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Italic': require('@/assets/fonts/Poppins-Italic.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-MediumItalic': require('@/assets/fonts/Poppins-MediumItalic.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-SemiBoldItalic': require('@/assets/fonts/Poppins-SemiBoldItalic.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
    'Poppins-BoldItalic': require('@/assets/fonts/Poppins-BoldItalic.ttf'),
    'Poppins-ExtraBold': require('@/assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraBoldItalic': require('@/assets/fonts/Poppins-ExtraBoldItalic.ttf'),
    'Poppins-Black': require('@/assets/fonts/Poppins-Black.ttf'),
    'Poppins-BlackItalic': require('@/assets/fonts/Poppins-BlackItalic.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  // Customize theme colors
  const customTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      primary: Colors[colorScheme ?? 'light'].tint,
      background: Colors[colorScheme ?? 'light'].background,
      card: Colors[colorScheme ?? 'light'].background,
      text: Colors[colorScheme ?? 'light'].text,
      border: colorScheme === 'dark' ? '#2C2C2E' : '#E5E5EA',
    },
  };

  return (
    <ThemeProvider value={customTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: Platform.OS !== 'android',
          contentStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
        }}>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            animation: 'none',
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="haircut-details" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="admin" 
          options={{ 
            headerShown: false,
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            title: 'Settings',
            headerBackTitle: 'Back',
          }} 
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
