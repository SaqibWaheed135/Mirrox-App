// // import { Tabs } from 'expo-router';
// // import React from 'react';
// // import { Platform } from 'react-native';

// // import { HapticTab } from '@/components/navigation/haptic-tab';
// // import { IconSymbol } from '@/components/ui/icon-symbol';
// // import { Colors } from '@/constants/theme';
// // import { useColorScheme } from '@/hooks/use-color-scheme';

// // export default function TabLayout() {
// //   const colorScheme = useColorScheme();

// //   return (
// //     <Tabs
// //       initialRouteName="home"
// //       screenOptions={{
// //         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
// //         tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
// //         headerShown: true,
// //         headerStyle: {
// //           backgroundColor: Colors[colorScheme ?? 'light'].background,
// //         },
// //         headerTintColor: Colors[colorScheme ?? 'light'].text,
// //         headerTitleStyle: {
// //           fontWeight: '600',
// //         },
// //         headerShadowVisible: Platform.OS !== 'android',
// //         tabBarStyle: {
// //           display: 'none', // Hide default tab bar, using custom bottom nav
// //         },
// //         tabBarLabelStyle: {
// //           fontSize: 12,
// //           fontWeight: '500',
// //         },
// //         tabBarButton: HapticTab,
// //       }}>
// //       <Tabs.Screen
// //         name="home"
// //         options={{
// //           title: 'Home',
// //           headerShown: false,
// //           tabBarIcon: ({ color, focused }) => (
// //             <IconSymbol 
// //               size={focused ? 28 : 24} 
// //               name="house.fill" 
// //               color={color} 
// //             />
// //           ),
// //         }}
// //       />
// //       {/* Camera screen hidden for now */}
// //       <Tabs.Screen
// //         name="index"
// //         options={{
// //           title: 'Camera',
// //           headerShown: false,
// //           tabBarIcon: ({ color, focused }) => (
// //             <IconSymbol 
// //               size={focused ? 28 : 24} 
// //               name="camera.fill" 
// //               color={color} 
// //             />
// //           ),
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="profile"
// //         options={{
// //           title: 'Profile',
// //           headerShown: false,
// //           tabBarIcon: ({ color, focused }) => (
// //             <IconSymbol 
// //               size={focused ? 28 : 24} 
// //               name="person.fill" 
// //               color={color} 
// //             />
// //           ),
// //         }}
// //       />
// //     </Tabs>
// //   );
// // }

// import { Tabs } from 'expo-router';
// import React from 'react';
// import { Platform } from 'react-native';

// import { HapticTab } from '@/components/navigation/haptic-tab';
// import { IconSymbol } from '@/components/ui/icon-symbol';
// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       initialRouteName="home"
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
//         headerShown: true,
//         headerStyle: {
//           backgroundColor: Colors[colorScheme ?? 'light'].background,
//         },
//         headerTintColor: Colors[colorScheme ?? 'light'].text,
//         headerTitleStyle: {
//           fontWeight: '600',
//         },
//         headerShadowVisible: Platform.OS !== 'android',
//         tabBarStyle: {
//           display: 'none', // Hide default tab bar, using custom bottom nav
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           fontWeight: '500',
//         },
//         tabBarButton: HapticTab,
//       }}
//     >
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: 'Home',
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <IconSymbol 
//               size={focused ? 28 : 24} 
//               name="house.fill" 
//               color={color} 
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="ai-mirror"
//         options={{
//           title: 'AI Mirror',
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <IconSymbol 
//               size={focused ? 28 : 24} 
//               name="camera.fill" 
//               color={color} 
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'Profile',
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <IconSymbol 
//               size={focused ? 28 : 24} 
//               name="person.fill" 
//               color={color} 
//             />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="admin"
//         options={{
//           title: 'Admin',
//           headerShown: false,
//           tabBarIcon: ({ color, focused }) => (
//             <IconSymbol 
//               size={focused ? 28 : 24} 
//               name="house.fill" 
//               color={color} 
//             />
//           ),
//         }}
//       />

      
//     </Tabs>
//   );
// }


import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/navigation/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthService } from '@/lib/auth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await AuthService.isAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Wait for admin status check before rendering
  if (loading) {
    return null;
  }

  return (
    <Tabs
      initialRouteName={isAdmin ? "admin" : "home"}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
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
      }}
    >
      {/* Regular User Tabs */}
      {!isAdmin && (
        <>
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
          <Tabs.Screen
            name="ai-mirror"
            options={{
              title: 'AI Mirror',
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
        </>
      )}

      {/* Admin Tab - Only for admin users */}
      {isAdmin && (
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol 
                size={focused ? 28 : 24} 
                name="shield.fill" 
                color={color} 
              />
            ),
          }}
        />
      )}

      {/* Hidden screens - need to exist but won't show in tab bar */}
      {/* {isAdmin && (
        <>
          <Tabs.Screen
            name="home"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="ai-mirror"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              href: null,
            }}
          />
        </>
      )} */}
      
      {!isAdmin && (
        <Tabs.Screen
          name="admin"
          options={{
            href: null,
          }}
        />
      )}
    </Tabs>
  );
}