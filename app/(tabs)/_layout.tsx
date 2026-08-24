import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Compass, CalendarCheck, User, Languages } from 'lucide-react-native';
import { useThemeStore } from '../../src/store/useThemeStore';
import { useUserSocket } from '../../src/hooks/useUserSocket';

export default function TabsLayout() {
  const { colors } = useThemeStore();

  // Keep a live connection for booking status pushes and notifications while signed in
  useUserSocket();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryAccent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
  
  {/* If explore is in explore/index.tsx */}
      <Tabs.Screen
    name="explore/index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />

  {/* If bookings is in bookings/index.tsx */}
      <Tabs.Screen
    name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} />,
        }}
      />

  {/* If profile is in profile/index.tsx */}
      <Tabs.Screen
    name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
    name="profile/language"
        options={{
          title: 'Language',
          tabBarIcon: ({ color, size }) => <Languages size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
